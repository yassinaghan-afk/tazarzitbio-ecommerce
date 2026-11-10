import json
import logging
import os
import re
from pathlib import Path
from typing import Any

import httpx

log = logging.getLogger("video.transcribe")

OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
TRANSCRIBE_MODEL = os.environ.get("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-transcribe")
TEXT_MODEL = os.environ.get("OPENAI_TEXT_MODEL", "gpt-6-astra")

SPEECH = {
    "darija": ("ar", "الهضرة بالدارجة المغربية: بغيت، ديال، بزاف، دابا، واش، شنو، هادشي."),
    "ar": ("ar", None),
    "fr": ("fr", None),
    "en": ("en", None),
    "auto": (None, None),
}

CAPTION_RULES = {
    "same": "Write in the SAME language the speaker uses. If the speaker uses Moroccan Darija, write Darija in Arabic letters exactly as spoken "
            "(Moroccan spelling such as بغيت، ديال، بزاف، دابا، كيمشي، هادي) and NEVER convert it to Modern Standard Arabic. "
            "Keep French or English words the speaker says as they are said.",
    "darija_ar": "Write Moroccan Darija in Arabic letters (Moroccan spelling such as بغيت، ديال، بزاف). Translate to Darija if the speech is another language. Never use Modern Standard Arabic.",
    "darija_latin": "Write Moroccan Darija in Latin letters (Arabizi with digits like 3, 7, 9), e.g. 'bghit n9ad site dyal zwaj l7lal'. Translate to Darija if the speech is another language.",
    "ar": "Write Modern Standard Arabic (fusha). Translate if needed.",
    "fr": "Write natural French. Translate if needed.",
    "en": "Write natural English. Translate if needed.",
}


class TranscriptionError(RuntimeError):
    pass


def _api_key() -> str:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        raise TranscriptionError("OPENAI_API_KEY is not configured on the video service")
    return key


def _client() -> httpx.Client:
    return httpx.Client(
        base_url=OPENAI_BASE_URL,
        headers={"Authorization": f"Bearer {_api_key()}"},
        timeout=httpx.Timeout(600, connect=20),
    )


def whisper_words(audio: Path, speech: str) -> list[dict[str, Any]]:
    lang, _ = SPEECH.get(speech, (None, None))
    data: dict[str, Any] = {
        "model": "whisper-1",
        "response_format": "verbose_json",
        "timestamp_granularities[]": ["word", "segment"],
    }
    if lang:
        data["language"] = lang
    with _client() as c, audio.open("rb") as f:
        r = c.post("/audio/transcriptions", data=data, files={"file": (audio.name, f, "audio/mpeg")})
    if r.status_code >= 400:
        raise TranscriptionError(f"whisper-1 failed ({r.status_code}): {r.text[:300]}")
    words = []
    last = 0.0
    for w in r.json().get("words") or []:
        text = str(w.get("word", "")).strip()
        if not text:
            continue
        s = max(float(w.get("start", last)), last)
        e = max(float(w.get("end", s)), s + 0.06)
        words.append({"w": text, "s": round(s, 3), "e": round(e, 3)})
        last = s
    return words


def accurate_text(audio: Path, speech: str) -> str:
    lang, prompt = SPEECH.get(speech, (None, None))
    data: dict[str, Any] = {"model": TRANSCRIBE_MODEL, "response_format": "json"}
    if lang:
        data["language"] = lang
    if prompt:
        data["prompt"] = prompt
    try:
        with _client() as c, audio.open("rb") as f:
            r = c.post("/audio/transcriptions", data=data, files={"file": (audio.name, f, "audio/mpeg")})
        r.raise_for_status()
        return str(r.json().get("text", "")).strip()
    except Exception as exc:  # whisper words are still usable on their own
        log.warning("accurate transcript failed: %s", exc)
        return ""


SCHEMA = {
    "type": "object",
    "properties": {
        "segments": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "from": {"type": "integer"},
                    "to": {"type": "integer"},
                    "text": {"type": "string"},
                    "keywords": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["from", "to", "text", "keywords"],
                "additionalProperties": False,
            },
        },
        "hook": {"type": "string"},
        "cta": {"type": "string"},
    },
    "required": ["segments", "hook", "cta"],
    "additionalProperties": False,
}


def _llm_structure(words: list[dict], text: str, caption_language: str, speech: str) -> dict:
    indexed = "\n".join(f"{i}\t{w['s']:.2f}-{w['e']:.2f}\t{w['w']}" for i, w in enumerate(words))
    system = (
        "You are a professional subtitle editor for short social media videos (TikTok, Reels) made in Morocco.\n"
        "You receive (A) a high quality transcript whose TEXT is the most accurate, and (B) a numbered word list from "
        "another model whose TIMESTAMPS are reliable but whose words may be wrong (it often turns Moroccan Darija into "
        "Modern Standard Arabic).\n"
        "Produce caption segments in speaking order. Each segment is a short phrase (2 to 8 words) mapped to a "
        "contiguous index range [from, to] of list (B). Ranges must be increasing and must not overlap, and together "
        "should cover all the speech. When the segment text has the same number of words as its range, word timings "
        "are taken one to one, so prefer that when it reads naturally.\n"
        f"Language rules: {CAPTION_RULES[caption_language]}\n"
        "keywords: 0 to 2 of the most impactful words of each segment, copied exactly as they appear in its text.\n"
        "hook: a short catchy title (max 7 words) for the first 2 seconds, in the caption language, true to the content, "
        "ideally a question.\n"
        "cta: a short call to comment or follow (max 6 words), in the caption language.\n"
        "Do not add punctuation-only words. Do not invent content that is not said."
    )
    user = f"(A) Transcript:\n{text or '(not available, rely on B)'}\n\n(B) Words (index, start-end seconds, word):\n{indexed}"
    body = {
        "model": TEXT_MODEL,
        "input": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "text": {"format": {"type": "json_schema", "name": "captions", "schema": SCHEMA, "strict": True}},
    }
    with _client() as c:
        r = c.post("/responses", json=body)
    if r.status_code >= 400:
        raise TranscriptionError(f"{TEXT_MODEL} failed ({r.status_code}): {r.text[:300]}")
    payload = r.json()
    for item in payload.get("output", []):
        for part in item.get("content", []) or []:
            if part.get("type") == "output_text":
                return json.loads(part["text"])
    raise TranscriptionError("caption model returned no text")


_PUNCT = re.compile(r"^[\s\.\,\!\?\:\;\"'«»“”\(\)\[\]،؛؟…\-–—]+|[\s\.\,\!\?\:\;\"'«»“”\(\)\[\]،؛؟…\-–—]+$")


def bare(word: str) -> str:
    return _PUNCT.sub("", word).lower()


def distribute(tokens: list[str], start: float, end: float) -> list[tuple[float, float]]:
    weights = [max(1, len(bare(t))) + 1 for t in tokens]
    total = sum(weights)
    out, t = [], start
    for w in weights:
        d = (end - start) * w / total
        out.append((round(t, 3), round(t + d, 3)))
        t += d
    return out


def _segments_from_llm(llm: dict, words: list[dict]) -> list[dict]:
    n = len(words)
    segments, last_to = [], -1
    for seg in llm.get("segments", []):
        a, b = int(seg.get("from", 0)), int(seg.get("to", 0))
        a, b = max(a, last_to + 1, 0), min(b, n - 1)
        tokens = str(seg.get("text", "")).split()
        if b < a or not tokens:
            continue
        if len(tokens) == b - a + 1:
            timing = [(words[i]["s"], words[i]["e"]) for i in range(a, b + 1)]
        else:
            timing = distribute(tokens, words[a]["s"], words[b]["e"])
        kws = {bare(k) for k in seg.get("keywords", []) if bare(k)}
        segments.append({"words": [{"t": tok, "s": s, "e": e, "k": bare(tok) in kws} for tok, (s, e) in zip(tokens, timing)]})
        last_to = b
    return segments


def segments_from_words(words: list[dict]) -> list[dict]:
    segments, cur = [], []
    for i, w in enumerate(words):
        if cur and (w["s"] - cur[-1]["e"] > 0.45 or len(cur) >= 6):
            segments.append({"words": cur})
            cur = []
        cur.append({"t": w["w"], "s": w["s"], "e": w["e"], "k": False})
        if re.search(r"[\.\!\?؟]$", w["w"]):
            segments.append({"words": cur})
            cur = []
    if cur:
        segments.append({"words": cur})
    return segments


def transcribe(audio: Path, speech: str, caption_language: str) -> dict:
    words = whisper_words(audio, speech)
    if not words:
        return {"segments": [], "hook": "", "cta": ""}
    text = accurate_text(audio, speech)
    try:
        llm = _llm_structure(words, text, caption_language, speech)
        segments = _segments_from_llm(llm, words)
        if segments:
            return {"segments": segments, "hook": llm.get("hook", "").strip(), "cta": llm.get("cta", "").strip()}
    except Exception as exc:
        log.warning("caption structuring failed, using raw words: %s", exc)
    return {"segments": segments_from_words(words), "hook": "", "cta": ""}


def apply_edits(segments: list[dict], edits: list[dict]) -> list[dict]:
    """Edited text per segment; *word* marks a keyword. Timings are kept when the word count is unchanged."""
    out = []
    for i, seg in enumerate(segments):
        if i >= len(edits) or not isinstance(edits[i], dict) or "text" not in edits[i]:
            out.append(seg)
            continue
        raw = str(edits[i]["text"]).split()
        if not raw:
            continue
        tokens = [(t.strip("*"), t.startswith("*") and t.endswith("*") and len(t) > 2) for t in raw]
        tokens = [(t, k) for t, k in tokens if t]
        old = seg["words"]
        if len(tokens) == len(old):
            timing = [(w["s"], w["e"]) for w in old]
        else:
            timing = distribute([t for t, _ in tokens], old[0]["s"], old[-1]["e"])
        out.append({"words": [{"t": t, "s": s, "e": e, "k": k} for (t, k), (s, e) in zip(tokens, timing)]})
    return out
