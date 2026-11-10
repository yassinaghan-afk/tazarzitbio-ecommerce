from typing import Any

STYLE_IDS = ("viral", "boxed", "one_word", "neon", "minimal", "classic")
POSITIONS = ("top", "middle", "bottom")
SPEECH_LANGS = ("darija", "ar", "fr", "en", "auto")
CAPTION_LANGS = ("same", "darija_ar", "darija_latin", "ar", "fr", "en")
ACCENTS = {
    "yellow": "#FFD400",
    "green": "#3CFF6B",
    "cyan": "#00E0FF",
    "pink": "#FF3EA5",
    "orange": "#FF7A00",
    "red": "#FF2D2D",
}

DEFAULTS: dict[str, Any] = {
    "style": "viral",
    "position": "bottom",
    "accent": "yellow",
    "speech_language": "darija",
    "caption_language": "same",
    "hook": True,
    "hook_text": "",
    "cta": True,
    "cta_text": "",
    "zooms": True,
    "sfx": True,
    "music": True,
    "grade": True,
    "progress_bar": True,
}


def _pick(value: Any, allowed: tuple[str, ...] | dict, default: str) -> str:
    return value if isinstance(value, str) and value in allowed else default


def _text(value: Any, limit: int = 120) -> str:
    return value.strip()[:limit] if isinstance(value, str) else ""


def normalize(raw: dict[str, Any] | None, base: dict[str, Any] | None = None) -> dict[str, Any]:
    src = {**DEFAULTS, **(base or {}), **(raw or {})}
    return {
        "style": _pick(src["style"], STYLE_IDS, DEFAULTS["style"]),
        "position": _pick(src["position"], POSITIONS, DEFAULTS["position"]),
        "accent": _pick(src["accent"], ACCENTS, DEFAULTS["accent"]),
        "speech_language": _pick(src["speech_language"], SPEECH_LANGS, DEFAULTS["speech_language"]),
        "caption_language": _pick(src["caption_language"], CAPTION_LANGS, DEFAULTS["caption_language"]),
        "hook": bool(src["hook"]),
        "hook_text": _text(src["hook_text"]),
        "cta": bool(src["cta"]),
        "cta_text": _text(src["cta_text"]),
        "zooms": bool(src["zooms"]),
        "sfx": bool(src["sfx"]),
        "music": bool(src["music"]),
        "grade": bool(src["grade"]),
        "progress_bar": bool(src["progress_bar"]),
    }


def default_cta(caption_language: str, speech_language: str) -> str:
    lang = caption_language
    if lang == "same":
        lang = {"darija": "darija_ar", "auto": "darija_ar"}.get(speech_language, speech_language)
    return {
        "darija_ar": "شنو رأيكم؟ كتبو ليا فالكومنتير",
        "darija_latin": "Chno ra2yekom? Kteb lia f commentaire",
        "ar": "ما رأيكم؟ اكتبوا في التعليقات",
        "fr": "Votre avis ? Dites-le en commentaire",
        "en": "What do you think? Comment below",
    }.get(lang, "شنو رأيكم؟ كتبو ليا فالكومنتير")
