import hmac
import json
import logging
import os
import queue
import shutil
import threading
import time
import uuid
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse

from . import render as render_mod
from .settings import default_cta, normalize
from .transcribe import TranscriptionError, apply_edits, transcribe

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("video")

DATA_DIR = Path(os.environ.get("DATA_DIR", "/data")) / "jobs"
DATA_DIR.mkdir(parents=True, exist_ok=True)
TOKEN = os.environ.get("VIDEO_SERVICE_TOKEN", "").strip()
MAX_UPLOAD_MB = int(os.environ.get("MAX_UPLOAD_MB", "500"))
MAX_DURATION = float(os.environ.get("MAX_DURATION_SECONDS", "180"))
JOB_TTL_HOURS = float(os.environ.get("JOB_TTL_HOURS", "48"))

PUBLIC_FIELDS = ("id", "status", "stage", "progress", "error", "settings", "duration", "width", "height",
                 "segments", "hook", "cta", "version", "created_at", "updated_at", "filename")

app = FastAPI(title="Tazarzit video studio")
_jobs: dict[str, dict[str, Any]] = {}
_lock = threading.Lock()
_queue: "queue.Queue[tuple[str, str]]" = queue.Queue()


def require_token(authorization: str = Header(default="")) -> None:
    if not TOKEN:
        return
    supplied = authorization.removeprefix("Bearer ").strip()
    if not hmac.compare_digest(supplied, TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized")


def _job_dir(job_id: str) -> Path:
    return DATA_DIR / job_id


def _save(job: dict) -> None:
    job["updated_at"] = time.time()
    path = _job_dir(job["id"]) / "job.json"
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(job, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


def _update(job_id: str, **fields: Any) -> None:
    with _lock:
        job = _jobs[job_id]
        job.update(fields)
        _save(job)


def _public(job: dict) -> dict:
    return {k: job.get(k) for k in PUBLIC_FIELDS}


def _get(job_id: str) -> dict:
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


def _cleanup() -> None:
    cutoff = time.time() - JOB_TTL_HOURS * 3600
    for d in DATA_DIR.iterdir():
        meta = d / "job.json"
        try:
            created = json.loads(meta.read_text())["created_at"] if meta.exists() else d.stat().st_mtime
        except Exception:
            created = d.stat().st_mtime
        if created < cutoff:
            with _lock:
                _jobs.pop(d.name, None)
            shutil.rmtree(d, ignore_errors=True)


def _load_existing() -> None:
    for meta in DATA_DIR.glob("*/job.json"):
        try:
            job = json.loads(meta.read_text(encoding="utf-8"))
        except Exception:
            continue
        if job.get("status") in ("queued", "transcribing", "rendering"):
            job.update(status="error", error="The service restarted while this video was processing. Generate again.")
        _jobs[job["id"]] = job


def _process(job_id: str, mode: str) -> None:
    job = _jobs[job_id]
    d = _job_dir(job_id)
    src = d / job["input"]
    settings = job["settings"]

    if mode == "full":
        _update(job_id, status="transcribing", stage="analyse", progress=2)
        meta = render_mod.probe(src)
        if meta["duration"] <= 0:
            raise render_mod.RenderError("Could not read the video duration")
        if meta["duration"] > MAX_DURATION:
            raise render_mod.RenderError(f"Video is longer than {int(MAX_DURATION)} seconds")
        _update(job_id, meta=meta, duration=round(meta["duration"], 2), width=meta["width"], height=meta["height"])
        result = {"segments": [], "hook": "", "cta": ""}
        if meta["has_audio"]:
            _update(job_id, stage="transcribe", progress=6)
            speech = d / "speech.mp3"
            render_mod.extract_speech(src, speech)
            result = transcribe(speech, settings["speech_language"], settings["caption_language"])
        hook = settings["hook_text"] or result["hook"]
        cta = settings["cta_text"] or result["cta"] or default_cta(settings["caption_language"], settings["speech_language"])
        _update(job_id, segments=result["segments"], hook=hook, cta=cta, progress=25)

    job = _jobs[job_id]
    _update(job_id, status="rendering", stage="render")
    version = int(job.get("version") or 0) + 1
    out = d / f"output_v{version}.mp4"

    def progress(frac: float, stage: str) -> None:
        base = 25 if mode == "full" else 3
        _update(job_id, progress=round(base + (99 - base) * frac, 1), stage=stage)

    render_mod.render(d, src, job["meta"], job["segments"] or [], job["settings"], job.get("hook") or "",
                      job.get("cta") or "", out, progress)
    old = d / f"output_v{version - 1}.mp4"
    if old.exists():
        old.unlink()
    _update(job_id, status="done", stage="done", progress=100, version=version, output=out.name, error=None)


def _worker() -> None:
    while True:
        job_id, mode = _queue.get()
        try:
            _process(job_id, mode)
        except (render_mod.RenderError, TranscriptionError) as exc:
            log.warning("job %s failed: %s", job_id, exc)
            _update(job_id, status="error", error=str(exc))
        except Exception as exc:
            log.exception("job %s crashed", job_id)
            _update(job_id, status="error", error=f"Unexpected error: {exc}")
        finally:
            _queue.task_done()


@app.on_event("startup")
def _startup() -> None:
    _load_existing()
    threading.Thread(target=_worker, daemon=True).start()


@app.get("/health")
def health() -> dict:
    return {"ok": True, "queue": _queue.qsize(), "openai": bool(os.environ.get("OPENAI_API_KEY"))}


@app.post("/jobs", dependencies=[Depends(require_token)])
async def create_job(file: UploadFile = File(...), settings: str = Form("{}")) -> dict:
    _cleanup()
    try:
        parsed = json.loads(settings or "{}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid settings")
    job_id = uuid.uuid4().hex
    d = _job_dir(job_id)
    d.mkdir(parents=True)
    ext = (Path(file.filename or "").suffix.lower() or ".mp4")[:6]
    name = f"input{ext}"
    size = 0
    with (d / name).open("wb") as out:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_MB * 1024 * 1024:
                out.close()
                shutil.rmtree(d, ignore_errors=True)
                raise HTTPException(status_code=413, detail=f"File is larger than {MAX_UPLOAD_MB} MB")
            out.write(chunk)
    now = time.time()
    job = {"id": job_id, "status": "queued", "stage": "queued", "progress": 0, "error": None,
           "settings": normalize(parsed if isinstance(parsed, dict) else {}), "input": name,
           "filename": (file.filename or "video")[:120], "segments": None, "hook": "", "cta": "",
           "version": 0, "created_at": now, "updated_at": now}
    with _lock:
        _jobs[job_id] = job
        _save(job)
    _queue.put((job_id, "full"))
    return _public(job)


@app.get("/jobs/{job_id}", dependencies=[Depends(require_token)])
def get_job(job_id: str) -> dict:
    data = _public(_get(job_id))
    data["queue_position"] = _queue.qsize()
    return data


@app.post("/jobs/{job_id}/render", dependencies=[Depends(require_token)])
def rerender(job_id: str, body: dict) -> dict:
    job = _get(job_id)
    if job["status"] in ("queued", "transcribing", "rendering"):
        raise HTTPException(status_code=409, detail="This video is still processing")
    if job.get("segments") is None or not job.get("meta"):
        raise HTTPException(status_code=409, detail="Generate the video first")
    fields: dict[str, Any] = {"status": "queued", "stage": "queued", "progress": 0, "error": None}
    if isinstance(body.get("settings"), dict):
        fields["settings"] = normalize(body["settings"], job["settings"])
    if isinstance(body.get("segments"), list):
        fields["segments"] = apply_edits(job["segments"], body["segments"])
    if isinstance(body.get("hook"), str):
        fields["hook"] = body["hook"].strip()[:120]
    if isinstance(body.get("cta"), str):
        fields["cta"] = body["cta"].strip()[:120]
    _update(job_id, **fields)
    _queue.put((job_id, "render"))
    return _public(_jobs[job_id])


@app.get("/jobs/{job_id}/video", dependencies=[Depends(require_token)])
def video(job_id: str) -> FileResponse:
    job = _get(job_id)
    if not job.get("output"):
        raise HTTPException(status_code=404, detail="Video not ready")
    path = _job_dir(job_id) / job["output"]
    if not path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    stem = Path(job.get("filename") or "video").stem
    return FileResponse(path, media_type="video/mp4", filename=f"{stem}-edited.mp4",
                        content_disposition_type="inline")
