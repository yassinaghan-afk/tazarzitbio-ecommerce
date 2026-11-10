import json
import os
import re
import subprocess
from pathlib import Path
from typing import Callable

import cv2
import numpy as np

from . import audio as audio_mod
from .captions import build_ass, punch_times

FFMPEG = os.environ.get("FFMPEG_BIN", "ffmpeg")
FFPROBE = os.environ.get("FFPROBE_BIN", "ffprobe")
FONTS_DIR = Path(os.environ.get("FONTS_DIR", Path(__file__).resolve().parent.parent / "fonts"))
FPS = 30
FREEZE_SECONDS = 1.6


class RenderError(RuntimeError):
    pass


def probe(src: Path) -> dict:
    r = subprocess.run([FFPROBE, "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(src)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RenderError("This file is not a readable video")
    info = json.loads(r.stdout)
    video = next((s for s in info.get("streams", []) if s.get("codec_type") == "video"), None)
    if not video:
        raise RenderError("No video track found in this file")
    w, h = int(video["width"]), int(video["height"])
    rotation = 0
    for sd in video.get("side_data_list", []) or []:
        if "rotation" in sd:
            rotation = int(float(sd["rotation"]))
    rotation = int(video.get("tags", {}).get("rotate", rotation) or rotation)
    if abs(rotation) % 180 == 90:
        w, h = h, w
    duration = float(info.get("format", {}).get("duration") or video.get("duration") or 0)
    has_audio = any(s.get("codec_type") == "audio" for s in info.get("streams", []))
    return {"width": w, "height": h, "duration": duration, "has_audio": has_audio}


def output_size(w: int, h: int) -> tuple[int, int]:
    if h >= w:
        ow = 1080
        oh = int(round(1080 * h / w / 2) * 2)
    else:
        oh = 1080
        ow = int(round(1080 * w / h / 2) * 2)
    return ow, oh


def extract_speech(src: Path, out: Path) -> None:
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(src), "-map", "0:a:0", "-ac", "1", "-ar", "16000",
                    "-c:a", "libmp3lame", "-b:a", "64k", str(out)], check=True)


def detect_cuts(src: Path, duration: float) -> list[float]:
    r = subprocess.run([FFMPEG, "-hide_banner", "-i", str(src), "-map", "0:v:0",
                        "-vf", "fps=10,scale=270:-2,select='gt(scene,0.3)',showinfo", "-f", "null", "-"],
                       capture_output=True, text=True)
    cuts: list[float] = []
    for m in re.finditer(r"pts_time:([0-9.]+)", r.stderr):
        t = float(m.group(1))
        if 0.6 < t < duration - 0.6 and (not cuts or t - cuts[-1] > 0.8):
            cuts.append(round(t, 3))
    return cuts


_CASCADES: list[cv2.CascadeClassifier] | None = None


def _face_center(frame: np.ndarray) -> tuple[float, float]:
    global _CASCADES
    if _CASCADES is None:
        base = cv2.data.haarcascades
        _CASCADES = [cv2.CascadeClassifier(base + "haarcascade_frontalface_default.xml"),
                     cv2.CascadeClassifier(base + "haarcascade_profileface.xml")]
    h, w = frame.shape[:2]
    scale = 480 / max(h, w)
    small = cv2.cvtColor(cv2.resize(frame, (int(w * scale), int(h * scale))), cv2.COLOR_BGR2GRAY)
    best = None
    for flip in (False, True):
        img = cv2.flip(small, 1) if flip else small
        for cascade in _CASCADES:
            for (x, y, fw, fh) in cascade.detectMultiScale(img, 1.1, 5, minSize=(30, 30)):
                if flip:
                    x = img.shape[1] - x - fw
                if best is None or fw * fh > best[2] * best[3]:
                    best = (x, y, fw, fh)
    if best is None:
        return 0.5, 0.45
    x, y, fw, fh = best
    cx = (x + fw / 2) / small.shape[1]
    cy = (y + fh * 0.55) / small.shape[0]
    return float(np.clip(cx, 0.25, 0.75)), float(np.clip(cy, 0.25, 0.7))


def _grab(src: Path, t: float, w: int, h: int) -> np.ndarray | None:
    r = subprocess.run([FFMPEG, "-v", "error", "-ss", f"{t:.3f}", "-i", str(src), "-map", "0:v:0", "-frames:v", "1",
                        "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True)
    if len(r.stdout) < w * h * 3:
        return None
    return np.frombuffer(r.stdout[:w * h * 3], np.uint8).reshape(h, w, 3)


def _smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def render(job_dir: Path, src: Path, meta: dict, segments: list[dict], settings: dict, hook: str, cta: str,
           out: Path, progress: Callable[[float, str], None]) -> None:
    W, H = output_size(meta["width"], meta["height"])
    src_dur = meta["duration"]
    freeze = FREEZE_SECONDS if (settings["cta"] and cta) else 0.0
    src_frames = int(round(src_dur * FPS))
    total_frames = src_frames + int(freeze * FPS)
    total_dur = total_frames / FPS

    progress(0.0, "analyse")
    cuts = detect_cuts(src, src_dur) if settings["zooms"] else []
    shots = [0.0] + cuts + [src_dur]
    centers = []
    for i in range(len(shots) - 1):
        frame = _grab(src, (shots[i] + shots[i + 1]) / 2, 540, int(540 * H / W) // 2 * 2)
        centers.append(_face_center(frame) if frame is not None else (0.5, 0.45))
    punches = punch_times(segments, cuts, src_dur) if settings["zooms"] else []

    progress(0.05, "audio")
    mix = job_dir / "mix.wav"
    audio_mod.build_mix(mix, FFMPEG, src, meta["has_audio"], src_dur, total_dur, settings, cuts, punches,
                        hook=bool(settings["hook"] and hook), cta=bool(freeze))

    ass = job_dir / "captions.ass"
    build_ass(ass, segments, settings, W, H, src_dur, total_dur, hook if settings["hook"] else "", cta if freeze else "")

    x = np.arange(256) / 255.0
    curve = np.clip(0.5 + (x - 0.5) * 1.08 + (_smooth(x) - x) * 0.25, 0, 1)
    luts = [(np.clip(curve * 0.98 + 0.01, 0, 1) * 255).astype(np.uint8), (curve * 255).astype(np.uint8),
            (np.clip(curve * 1.02, 0, 1) * 255).astype(np.uint8)]
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    vig = (1 - 0.32 * _smooth((d - 0.55) / 0.85)).astype(np.float32)[..., None]
    del yy, xx, d
    bar_h = max(6, H // 190)
    accent_bgr = {"yellow": (0, 212, 255), "green": (107, 255, 60), "cyan": (255, 224, 0), "pink": (165, 62, 255),
                  "orange": (0, 122, 255), "red": (45, 45, 255)}[settings["accent"]]

    def shot_index(t: float) -> int:
        for i in range(len(shots) - 1):
            if t < shots[i + 1]:
                return i
        return len(shots) - 2

    def zoom(t: float) -> tuple[float, tuple[float, float]]:
        i = shot_index(t)
        s0, s1 = shots[i], shots[i + 1]
        if not settings["zooms"]:
            return 1.0, centers[i]
        z = 1.0 + 0.05 * (t - s0) / max(s1 - s0, 0.1)
        if i > 0 or settings["hook"]:
            z *= 1 + 0.18 * np.exp(-(t - s0) / 0.12)
        for p in punches:
            if t >= p - 0.1:
                z *= 1 + 0.07 * _smooth((t - p + 0.1) / 0.12) * (1 - _smooth((t - p - 0.55) / 0.3))
        return z, centers[i]

    def fx_flash(t: float) -> float:
        a = 0.0
        for c in (cuts if settings["zooms"] else []) + ([src_dur] if freeze else []):
            if t >= c:
                a = max(a, 0.6 * np.exp(-(t - c) / 0.07))
        return a

    def shake(t: float, k: int) -> tuple[float, float]:
        amp = 0.0
        for c in cuts:
            if t >= c:
                amp = max(amp, W * 0.013 * np.exp(-(t - c) / 0.1))
        return amp * np.sin(k * 2.7), amp * np.cos(k * 3.1)

    dec = subprocess.Popen([FFMPEG, "-v", "error", "-i", str(src), "-map", "0:v:0",
                            "-vf", f"fps={FPS},scale={W}:{H}:flags=lanczos,setsar=1",
                            "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    fonts = str(FONTS_DIR).replace("\\", "/").replace(":", "\\:")
    enc = subprocess.Popen([FFMPEG, "-v", "error", "-y",
                            "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            "-i", str(mix),
                            "-vf", f"ass={ass.name}:fontsdir={fonts}",
                            "-af", "loudnorm=I=-14:TP=-1.0:LRA=9",
                            "-c:v", "libx264", "-preset", os.environ.get("X264_PRESET", "medium"), "-crf", "18",
                            "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
                            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", str(out)],
                           stdin=subprocess.PIPE, cwd=str(job_dir), stderr=subprocess.PIPE)
    fsize = W * H * 3
    last = None
    k = 0
    try:
        while True:
            t = k / FPS
            frozen = False
            buf = dec.stdout.read(fsize) if dec.stdout else b""
            if len(buf) == fsize:
                last = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
                img = last
                z, (cx, cy) = zoom(t)
                dx, dy = shake(t, k) if settings["zooms"] else (0.0, 0.0)
            else:
                if last is None:
                    raise RenderError("Could not decode video frames")
                if k >= src_frames + int(freeze * FPS) or not freeze:
                    break
                frozen = True
                img = last
                ft = (k - src_frames) / max(freeze * FPS, 1)
                z, (cx, cy) = 1.05 + 0.06 * ft, centers[-1]
                dx = dy = 0.0
            if z != 1.0 or dx or dy:
                px, py = cx * W, cy * H
                M = np.float32([[z, 0, px - z * px + dx], [0, z, py - z * py + dy]])
                img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            if settings["grade"]:
                img = cv2.merge([cv2.LUT(c, l) for c, l in zip(cv2.split(img), luts)])
                f = img.astype(np.float32)
                lum = f.mean(2, keepdims=True)
                f = (lum + (f - lum) * 1.12) * vig
            else:
                f = img.astype(np.float32)
            if frozen:
                ft = (k - src_frames) / max(freeze * FPS, 1)
                f = cv2.GaussianBlur(f, (0, 0), 1 + 14 * _smooth(ft * 3)) * (1 - 0.45 * _smooth(ft * 3))
            fl = fx_flash(t)
            if fl > 0.01:
                f = f * (1 - fl) + 255 * fl
            if settings["progress_bar"]:
                f[:bar_h, :int(W * min(1.0, (k + 1) / total_frames))] = accent_bgr
            enc.stdin.write(np.clip(f, 0, 255).astype(np.uint8).tobytes())
            k += 1
            if k % 15 == 0:
                progress(0.1 + 0.9 * min(1.0, k / total_frames), "render")
        enc.stdin.close()
        err = enc.stderr.read().decode(errors="ignore") if enc.stderr else ""
        if enc.wait() != 0:
            raise RenderError(f"Encoding failed: {err[-400:]}")
    finally:
        if dec.poll() is None:
            dec.kill()
        if enc.poll() is None:
            enc.kill()
