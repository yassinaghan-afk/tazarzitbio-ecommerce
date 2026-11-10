import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 48000


def _rng() -> np.random.Generator:
    return np.random.default_rng(7)


def _env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def boom() -> np.ndarray:
    n = int(1.4 * SR); t = np.arange(n) / SR
    f = 30 + 70 * np.exp(-t / 0.08)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    click = _rng().standard_normal(n) * np.exp(-t / 0.012) * 0.5
    b, a = signal.butter(2, 3000 / (SR / 2))
    return np.tanh(1.6 * (body + signal.lfilter(b, a, click))) * 0.9


def whoosh(dur: float = 0.55) -> np.ndarray:
    n = int(dur * SR)
    f, tt, z = signal.stft(_rng().standard_normal(n), SR, nperseg=1024)
    prog = tt / tt[-1]
    centre = np.where(prog < 0.55, 250 * (18 ** (prog / 0.55)), 4500 * ((600 / 4500) ** ((prog - 0.55) / 0.45)))
    mask = np.exp(-((np.log(f[:, None] + 1) - np.log(centre[None, :])) ** 2) / (2 * 0.55 ** 2))
    _, y = signal.istft(z * mask, SR, nperseg=1024)
    y = y[:n] * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return y / np.abs(y).max() * 0.7


def pop() -> np.ndarray:
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = 260 + 900 * np.exp(-t / 0.015)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.002, 0.03) * 0.55


def shutter() -> np.ndarray:
    n = int(0.25 * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    rng = _rng()
    for st, amp in [(0.0, 1.0), (0.075, 0.7)]:
        k = t >= st
        y[k] += rng.standard_normal(k.sum()) * np.exp(-(t[k] - st) / 0.012) * amp
    b, a = signal.butter(2, [1500 / (SR / 2), 9000 / (SR / 2)], "band")
    return signal.lfilter(b, a, y) / 3


def _note(m: int) -> float:
    return 440 * 2 ** ((m - 69) / 12)


def music(dur: float, beat_from: float) -> np.ndarray:
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros((n, 2))
    rng = _rng()
    beat = 60 / 100
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
    seg = beat * 4
    lp = signal.butter(2, 1400 / (SR / 2))
    i = 0
    while i * seg < dur:
        ch = chords[i % 4]
        s, e = int(i * seg * SR), min(int((i + 1) * seg * SR), n)
        tt = t[s:e] - t[s]
        env = np.minimum(1, tt / 0.4) * np.minimum(1, (seg - tt) / 0.3 + 0.05)
        pad = sum(signal.sawtooth(2 * np.pi * _note(m + 12) * (1 + d / 100) * tt) for m in ch for d in (-0.08, 0.08))
        pad = signal.lfilter(*lp, pad) * 0.05 * env
        bass = np.sin(2 * np.pi * _note(ch[0] - 12) * tt) * 0.22 * env
        out[s:e] += (pad + bass)[:, None]
        for k in range(8):
            ns = s + int(k * beat / 2 * SR)
            ln = min(int(0.35 * SR), n - ns)
            if ln <= 0 or ns >= e:
                break
            tn = np.arange(ln) / SR
            pl = np.sin(2 * np.pi * _note(ch[[0, 1, 2, 1][k % 4]] + 24) * tn) * np.exp(-tn / 0.12) * 0.07
            pan = 0.35 if k % 2 else -0.35
            out[ns:ns + ln, 0] += pl * (1 - pan)
            out[ns:ns + ln, 1] += pl * (1 + pan)
        i += 1
    hp = signal.butter(2, 7000 / (SR / 2), "high")
    k = 0
    while k * beat < dur:
        st = k * beat
        if st >= beat_from:
            ns = int(st * SR); ln = min(int(0.3 * SR), n - ns); tn = np.arange(ln) / SR
            f = 45 + 90 * np.exp(-tn / 0.03)
            out[ns:ns + ln] += (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tn / 0.12) * 0.35)[:, None]
            hs = int((st + beat / 2) * SR); hl = min(int(0.05 * SR), n - hs)
            if hl > 0:
                hn = rng.standard_normal(hl) * np.exp(-np.arange(hl) / SR / 0.012) * 0.06
                out[hs:hs + hl] += signal.lfilter(*hp, hn)[:, None]
        k += 1
    fade = np.clip((dur - t) / 1.2, 0, 1) * np.clip(t / 0.3, 0, 1)
    return out * fade[:, None]


def load_voice(ffmpeg: str, src: Path) -> np.ndarray:
    raw = subprocess.run([ffmpeg, "-v", "error", "-i", str(src), "-map", "0:a:0", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def build_mix(out: Path, ffmpeg: str, src: Path, has_audio: bool, src_dur: float, total_dur: float,
              settings: dict, cuts: list[float], punches: list[float], hook: bool, cta: bool) -> None:
    n = int(total_dur * SR) + SR // 10
    voice = np.zeros((n, 2))
    if has_audio:
        v = load_voice(ffmpeg, src)
        b, a = signal.butter(2, 85 / (SR / 2), "high")
        v = signal.lfilter(b, a, v, axis=0)
        lvl = np.sqrt(signal.lfilter([0.002], [1, -0.998], (v ** 2).mean(1)))
        thr = 10 ** (-24 / 20)
        gain = np.where(lvl > thr, (thr / np.maximum(lvl, 1e-9)) ** (1 - 1 / 3), 1.0)
        v = v * gain[:, None]
        peak = np.abs(v).max()
        if peak > 0:
            v = v / peak * 0.8
        voice[:min(len(v), n)] = v[:n]

    mix = voice.copy()
    if settings["music"]:
        env = np.sqrt(signal.lfilter([0.0005], [1, -0.9995], (voice ** 2).mean(1)))
        duck = 1 - 0.65 * np.clip(env / 0.05, 0, 1)
        level = 0.55 if has_audio else 1.0
        mix += music(n / SR, cuts[0] if cuts else min(2.0, src_dur)) * duck[:, None] * level

    if settings["sfx"]:
        sfx = np.zeros((n, 2))

        def place(sig: np.ndarray, at: float, vol: float, centre: bool = False) -> None:
            if centre:
                at -= len(sig) / SR / 2
            s = int(max(0.0, at) * SR)
            ln = min(len(sig), n - s)
            if ln > 0:
                sfx[s:s + ln] += (sig[:ln] * vol)[:, None]

        if hook:
            place(boom(), 0.0, 0.9)
            place(whoosh(), 0.0, 0.35)
        if settings["zooms"]:
            w = whoosh()
            for c in cuts:
                place(w, c, 0.8, centre=True)
        p = pop()
        for t in punches:
            place(p, t, 0.5)
        if cta:
            place(shutter(), src_dur, 0.9)
            place(boom(), src_dur, 0.75)
            place(p, src_dur + 0.05, 0.6)
        mix += sfx * 0.6

    mix = np.tanh(mix * 0.9) / np.tanh(0.9)
    peak = np.abs(mix).max()
    if peak > 0:
        mix = mix / peak * 0.9
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
