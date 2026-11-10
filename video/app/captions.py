import re
from pathlib import Path

from .settings import ACCENTS
from .transcribe import bare

STYLES = {
    "viral": dict(font="Tajawal Black", size=0.096, words=3, chars=20, outline=0.075, shadow=0.045,
                  highlight=True, keywords=True, pop="strong"),
    "boxed": dict(font="Tajawal ExtraBold", size=0.072, words=4, chars=26, outline=0.22, shadow=0,
                  highlight=True, keywords=False, pop="soft", box=True),
    "one_word": dict(font="Tajawal Black", size=0.135, words=1, chars=40, outline=0.085, shadow=0.05,
                     highlight=False, keywords=True, pop="big"),
    "neon": dict(font="Tajawal ExtraBold", size=0.088, words=3, chars=22, outline=0.02, shadow=0,
                 highlight=True, keywords=False, pop="soft", glow=True),
    "minimal": dict(font="Tajawal Bold", size=0.068, words=7, chars=38, outline=0.03, shadow=0.025,
                    highlight=False, keywords=True, pop="fade", keep_punct=True),
    "classic": dict(font="Tajawal Bold", size=0.055, words=9, chars=44, outline=0.06, shadow=0,
                    highlight=False, keywords=False, pop=None, keep_punct=True, bottom_only=True),
}

POPS = {
    "strong": r"\fscx70\fscy70\t(0,90,\fscx108\fscy108)\t(90,170,\fscx100\fscy100)",
    "soft": r"\fad(60,0)\fscx88\fscy88\t(0,120,\fscx100\fscy100)",
    "big": r"\fscx45\fscy45\t(0,100,\fscx115\fscy115)\t(100,180,\fscx100\fscy100)",
    "fade": r"\fad(120,120)",
}

KEYWORD_COLOR = {"green": "#FFD400"}
DEFAULT_KEYWORD = "#3CFF6B"


def ass_color(hex_color: str, alpha: int = 0) -> str:
    h = hex_color.lstrip("#")
    return f"&H{alpha:02X}{h[4:6]}{h[2:4]}{h[0:2]}&"


def ts(t: float) -> str:
    t = max(0.0, t)
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def _escape(text: str) -> str:
    return text.replace("\\", "").replace("{", "(").replace("}", ")")


_STRIP_END = re.compile(r"[\.\,،؛;:…]+$")


def _display(word: str, keep_punct: bool) -> str:
    w = _escape(word)
    return w if keep_punct else _STRIP_END.sub("", w).strip("\"'«»“”") or w


def chunk(segments: list[dict], style: dict) -> list[list[dict]]:
    chunks = []
    for seg in segments:
        cur, chars = [], 0
        for w in seg["words"]:
            ln = len(w["t"])
            gap = w["s"] - cur[-1]["e"] if cur else 0
            if cur and (len(cur) >= style["words"] or chars + ln > style["chars"] or gap > 0.45):
                chunks.append(cur)
                cur, chars = [], 0
            cur.append(w)
            chars += ln + 1
        if cur:
            chunks.append(cur)
    return chunks


def _two_lines(text: str) -> str:
    words = text.split()
    if len(text) <= 18 or len(words) < 3:
        return text
    best, best_diff = 1, 1e9
    for i in range(1, len(words)):
        diff = abs(len(" ".join(words[:i])) - len(" ".join(words[i:])))
        if diff < best_diff:
            best, best_diff = i, diff
    return " ".join(words[:best]) + r"\N" + "{\\c%ACCENT%}" + " ".join(words[best:])


def build_ass(path: Path, segments: list[dict], settings: dict, width: int, height: int,
              src_dur: float, total_dur: float, hook: str, cta: str) -> None:
    style = STYLES[settings["style"]]
    accent = ACCENTS[settings["accent"]]
    kw_hex = KEYWORD_COLOR.get(settings["accent"], DEFAULT_KEYWORD)
    ref = min(width, height)
    portrait = height >= width
    fs = round(ref * style["size"])
    outline = max(1, round(fs * style["outline"]))
    shadow = round(fs * style["shadow"])
    margin = round(width * 0.07)
    keep_punct = style.get("keep_punct", False)

    pos = "bottom" if style.get("bottom_only") else settings["position"]
    y_frac = {"top": 0.24 if portrait else 0.14, "middle": 0.5,
              "bottom": (0.86 if portrait else 0.9) if style.get("bottom_only") else (0.72 if portrait else 0.84)}[pos]
    cx, cy = width // 2, round(height * y_frac)

    white, black = "&H00FFFFFF", "&H00000000"
    acc, kw = ass_color(accent), ass_color(kw_hex)
    if style.get("box"):
        cap_style = f"Cap,{style['font']},{fs},{white},{white},&H40000000,&H00000000,0,0,0,0,100,100,0,0,3,{outline},0,5,{margin},{margin},0,-1"
    elif style.get("glow"):
        cap_style = f"Cap,{style['font']},{fs},{white},{white},{ass_color(accent).rstrip('&')},&H00000000,0,0,0,0,100,100,0,0,1,{outline},0,5,{margin},{margin},0,-1"
    else:
        cap_style = f"Cap,{style['font']},{fs},{white},{white},{black},&H90000000,0,0,0,0,100,100,0,0,1,{outline},{shadow},5,{margin},{margin},0,-1"
    hook_fs = round(ref * 0.078)
    cta_fs = round(ref * 0.085)

    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: {cap_style}
Style: Hook,Tajawal Black,{hook_fs},{white},{white},{black},&H90000000,0,0,0,0,100,100,0,0,1,{round(hook_fs * 0.085)},{round(hook_fs * 0.05)},5,{margin},{margin},0,-1
Style: Cta,Tajawal Black,{cta_fs},&H00141414,&H00141414,{acc.rstrip('&')},&H00000000,0,0,0,0,100,100,0,0,3,{round(cta_fs * 0.25)},0,5,{margin},{margin},0,-1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events: list[str] = []
    chunks = chunk(segments, style)
    pop = POPS.get(style["pop"] or "", "")
    for ci, words in enumerate(chunks):
        start = words[0]["s"]
        nxt = chunks[ci + 1][0]["s"] if ci + 1 < len(chunks) else None
        end = nxt if nxt is not None and nxt - words[-1]["e"] < 0.6 else words[-1]["e"] + 0.2
        end = min(end, src_dur)
        if end <= start:
            continue
        place = f"\\an5\\pos({cx},{cy})"

        def line(active: int | None) -> str:
            parts = []
            for wi, w in enumerate(words):
                if style.get("glow"):
                    col = white + "&" if wi == active else "&H00B4B4B4&"
                elif active is not None and wi == active:
                    col = acc
                elif style["keywords"] and w.get("k"):
                    col = acc if not style["highlight"] else kw
                else:
                    col = white + "&"
                parts.append("{\\c" + col + "}" + _display(w["t"], keep_punct))
            return " ".join(parts)

        if style["highlight"]:
            for wi, w in enumerate(words):
                s = w["s"] if wi else start
                e = words[wi + 1]["s"] if wi + 1 < len(words) else end
                if e <= s:
                    continue
                anim = pop if wi == 0 else ""
                text = line(wi)
                if style.get("glow"):
                    glow = round(fs * 0.12)
                    events.append(f"Dialogue: 0,{ts(s)},{ts(e)},Cap,,0,0,0,,{{{place}{anim}\\1a&HFF&\\bord{glow}\\blur{glow}\\3a&H40&}}"
                                  + " ".join(_display(x["t"], keep_punct) for x in words))
                events.append(f"Dialogue: 1,{ts(s)},{ts(e)},Cap,,0,0,0,,{{{place}{anim}}}{text}")
        else:
            events.append(f"Dialogue: 1,{ts(start)},{ts(end)},Cap,,0,0,0,,{{{place}{pop}}}{line(None)}")

    if hook:
        hy = round(height * (0.42 if pos == "top" else (0.14 if portrait else 0.12)))
        text = _two_lines(_escape(hook)).replace("%ACCENT%", acc)
        events.append(f"Dialogue: 2,{ts(0)},{ts(min(2.3, src_dur))},Hook,,0,0,0,,{{\\an5\\pos({cx},{hy})\\fad(0,150)" + POPS["strong"] + "}" + text)
    if cta and total_dur > src_dur:
        events.append(f"Dialogue: 3,{ts(src_dur + 0.05)},{ts(total_dur)},Cta,,0,0,0,,{{\\an5\\pos({cx},{height // 2})" + POPS["big"] + "}" + _escape(cta))

    path.write_text(head + "\n".join(events) + "\n", encoding="utf-8")


def punch_times(segments: list[dict], cuts: list[float], src_dur: float) -> list[float]:
    times, last = [], -10.0
    for seg in segments:
        for w in seg["words"]:
            t = w["s"]
            if not w.get("k") or t - last < 1.6 or t > src_dur - 0.6:
                continue
            if any(0 <= t - c < 0.5 for c in cuts):
                continue
            times.append(t)
            last = t
    return times


__all__ = ["STYLES", "build_ass", "punch_times", "bare"]
