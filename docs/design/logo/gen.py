import json, math, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FD = pathlib.Path(__file__).resolve().parent.parent / "fonts"
ETH = TTFont(FD / "ethiopic.ttf"); LAT = TTFont(FD / "familjen.ttf")
def n(v): return f"{v:.2f}".rstrip("0").rstrip(".")

class Face:
    def __init__(s, f):
        s.f = f; s.gs = f.getGlyphSet(); s.cm = f.getBestCmap(); s.upm = f["head"].unitsPerEm
        s.cap = getattr(f["OS/2"], "sCapHeight", 0) or 0.7 * s.upm
    def adv(s, ch): return s.gs[s.cm[ord(ch)]].width
    def bounds(s, ch):
        bp = BoundsPen(s.gs); s.gs[s.cm[ord(ch)]].draw(bp); return bp.bounds
    def path(s, ch, m):  # m = (a,b,c,d,e,f) affine applied to font units (y up)
        pen = SVGPathPen(s.gs, ntos=n); tp = TransformPen(pen, m)
        s.gs[s.cm[ord(ch)]].draw(tp); return pen.getCommands()
E, L = Face(ETH), Face(LAT)

def mul(A, B):  # apply B first, then A
    a1,b1,c1,d1,e1,f1 = A; a2,b2,c2,d2,e2,f2 = B
    return (a1*a2+c1*b2, b1*a2+d1*b2, a1*c2+c1*d2, b1*c2+d1*d2, a1*e2+c1*f2+e1, b1*e2+d1*f2+f1)
def T(tx,ty): return (1,0,0,1,tx,ty)
def S(sx,sy): return (sx,0,0,sy,0,0)
def R(deg):
    r=math.radians(deg); c,s=math.cos(r),math.sin(r); return (c,s,-s,c,0,0)

def glyph_centered(face, ch, cx, cy, height, use_cap=False):
    """Glyph centred on (cx,cy) with its bbox height = height (y-up font flipped to SVG)."""
    x0,y0,x1,y1 = face.bounds(ch); sc = height/(y1-y0)
    m = mul(T(cx - (x0+x1)/2*sc, cy + (y0+y1)/2*sc), S(sc,-sc))
    return face.path(ch, m)

def text_line(face, s, x, baseline, capheight, track=0.0, kern=None):
    """Left-aligned text as one path, baseline at y=baseline; returns (d, width)."""
    sc = capheight/face.cap; cur = x; ds=[]
    for i,ch in enumerate(s):
        ds.append(face.path(ch, mul(T(cur,baseline), S(sc,-sc))))
        a = face.adv(ch)*sc + track
        if kern and (i,) in kern: a += kern[(i,)]*sc
        cur += a
    return " ".join(ds), cur - x - track

def arc_text(face, s, R0, capheight, track, top=True):
    sc = capheight/face.cap
    advs = [face.adv(ch)*sc + track for ch in s]; W = sum(advs) - track
    Reff = R0 + capheight/2 if top else R0 - capheight/2
    cum = 0; ds = []
    for ch, a in zip(s, advs):
        mid = cum + (a - track)/2 - W/2; cum += a
        t = math.degrees(mid / Reff) * (1 if top else -1)
        if top: m = mul(R(t), mul(T(-face.adv(ch)*sc/2, -R0), S(sc,-sc)))
        else:   m = mul(R(t), mul(T(-face.adv(ch)*sc/2, R0), S(sc,-sc)))
        ds.append(face.path(ch, m))
    return " ".join(ds)

INK = "currentColor"
def svg(vb, body, extra=""): return f'<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"{extra}>{body}</svg>'
BI = "ቢ"

# ---------- concept A: voice-to-stamp ----------
def mark_A():
    g = glyph_centered(E, BI, 32, 27, 27)
    heights = [3,6,10,15,10,6,3]; bars=""
    for i,h in enumerate(heights):
        x = 17.5 + i*4.8; bars += f'<rect x="{n(x-1.1)}" y="{n(49-h/2)}" width="2.2" height="{h}" rx="1.1" fill="{INK}"/>'
    return svg("0 0 64 64",
      f'<rect x="2" y="2" width="60" height="60" rx="4" stroke="{INK}" stroke-width="3.5"/>'
      f'<rect x="8" y="8" width="48" height="48" rx="2" stroke="{INK}" stroke-width="1.5"/>'
      f'<path d="{g}" fill="{INK}"/>{bars}')
def small_A():
    g = glyph_centered(E, BI, 32, 32, 32)
    return svg("0 0 64 64", f'<rect x="3" y="3" width="58" height="58" rx="5" stroke="{INK}" stroke-width="5"/><path d="{g}" fill="{INK}"/>')

# ---------- concept B: round office stamp ----------
def mark_B():
    top = arc_text(E, "ቢዝኤጀንት", 19.6, 6.6, 2.6, top=True)
    bot = arc_text(L, "BIZZAGENT", 26.2, 6.2, 1.5, top=False)
    g = glyph_centered(E, BI, 32, 31.2, 9.5)
    bubble = ('<path d="M20.5 24.2a3 3 0 0 1 3-3h17a3 3 0 0 1 3 3v9.4a3 3 0 0 1-3 3H30.6l-5.6 4.4v-4.4h-1.5a3 3 0 0 1-3-3z" '
              f'stroke="{INK}" stroke-width="1.7" stroke-linejoin="round"/>')
    return svg("0 0 64 64",
      f'<circle cx="32" cy="32" r="30.4" stroke="{INK}" stroke-width="3"/>'
      f'<circle cx="32" cy="32" r="27.4" stroke="{INK}" stroke-width="1"/>'
      f'<circle cx="32" cy="32" r="17.8" stroke="{INK}" stroke-width="1.4"/>'
      f'<g transform="translate(32 32)"><path d="{top}" fill="{INK}"/><path d="{bot}" fill="{INK}"/></g>'
      f'<circle cx="11.6" cy="32" r="1.4" fill="{INK}"/><circle cx="52.4" cy="32" r="1.4" fill="{INK}"/>'
      f'{bubble}<path d="{g}" fill="{INK}"/>')
def small_B():
    g = glyph_centered(E, BI, 32, 31.5, 27)
    return svg("0 0 64 64", f'<circle cx="32" cy="32" r="29.5" stroke="{INK}" stroke-width="4.5"/><circle cx="32" cy="32" r="23" stroke="{INK}" stroke-width="1.8"/><path d="{g}" fill="{INK}"/>')

# ---------- concept C: paper clip + receipt slip ----------
CLIP = "M5 22.5V8a4.6 4.6 0 0 1 9.2 0v17a7 7 0 0 1-14 0V10"
def mark_C():
    g = glyph_centered(E, BI, 27, 29, 24)
    # slip with zigzag bottom
    zz = "".join(f"L{n(10+ (i+0.5)*5.5)} 61L{n(10+(i+1)*5.5)} 56" for i in range(8))
    slip = f'<path d="M10 8H54V56{"".join(f"L{n(54-(i+0.5)*7.33)} 61L{n(54-(i+1)*7.33)} 56" for i in range(6))}Z" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
    rules = f'<path d="M18 43H42M18 49.5H34" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>'
    clip = (f'<g transform="translate(40 -1) rotate(8 7 15)">'
            f'<path d="{CLIP}" stroke="var(--logo-knock,#fff)" stroke-width="5.4" stroke-linecap="round"/>'
            f'<path d="{CLIP}" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/></g>')
    return svg("0 0 64 64", f'{slip}<path d="{g}" fill="{INK}"/>{rules}{clip}')
def small_C():
    g = glyph_centered(E, BI, 26, 35, 27)
    clip = (f'<g transform="translate(40 -1) rotate(8 7 15)"><path d="{CLIP}" stroke="var(--logo-knock,#fff)" stroke-width="6" stroke-linecap="round"/>'
            f'<path d="{CLIP}" stroke="{INK}" stroke-width="3" stroke-linecap="round"/></g>')
    return svg("0 0 64 64", f'<path d="M8 12H52V58H8Z" stroke="{INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="{g}" fill="{INK}"/>{clip}')

# ---------- concept D: receipt roll ----------
def mark_D():
    g = glyph_centered(E, BI, 32, 25.5, 13)
    zig = "".join(f"L{n(50-(i+0.5)*4.5)} 62L{n(50-(i+1)*4.5)} 57" for i in range(8))
    strip = f'<path d="M14 15V57{"".join(f"L{n(14+(i+0.5)*6)} 62L{n(14+(i+1)*6)} 57" for i in range(6))}V15" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
    roll = f'<rect x="7" y="4" width="50" height="12" rx="6" stroke="{INK}" stroke-width="3"/><path d="M13 10H17" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>'
    rules = f'<path d="M21 35H43M21 40.5H35" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>'
    stamp = f'<circle cx="32" cy="50" r="4.6" stroke="{INK}" stroke-width="1.8"/><path d="M29.6 50.1l1.7 1.8 3.2-3.6" stroke="{INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    return svg("0 0 64 64", f'{strip}{roll}<path d="{g}" fill="{INK}"/>{rules}{stamp}')
def small_D():
    g = glyph_centered(E, BI, 32, 38, 26)
    return svg("0 0 64 64", f'<rect x="6" y="4" width="52" height="12" rx="6" stroke="{INK}" stroke-width="4"/><path d="M13 16V58H51V16" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/><path d="{g}" fill="{INK}"/>')

# ---------- wordmarks ----------
def wordmark_latin():
    # "BizzAgent" with the zz kerned tight; viewBox sized to the path.
    cap = 22; sc = cap/L.cap; cur=0; ds=[]
    for i,ch in enumerate("BizzAgent"):
        ds.append(L.path(ch, mul(T(cur,30), S(sc,-sc))))
        a = L.adv(ch)*sc
        if i==2: a -= 0.07*L.upm*sc   # i z | z : tighten the first z -> second z
        cur += a - 0.5
    return svg(f"0 0 {n(cur+2)} 40", f'<path d="{" ".join(ds)}" fill="{INK}"/>'), cur+2
def wordmark_am():
    d,w = text_line(E, "ቢዝኤጀንት", 0, 30, 22*0.97, track=1.5)
    return svg(f"0 0 {n(w+2)} 40", f'<path d="{d}" fill="{INK}"/>'), w+2

wl, wl_w = wordmark_latin(); wa, wa_w = wordmark_am()
out = {k: {"mark": f(), "small": g()} for k,(f,g) in {"A":(mark_A,small_A),"B":(mark_B,small_B),"C":(mark_C,small_C),"D":(mark_D,small_D)}.items()}
out["wordmark"] = {"latin": wl, "latin_w": wl_w, "am": wa, "am_w": wa_w}
# alternative names (marks only: first syllable in a stamp)
def name_mark(ch):
    g = glyph_centered(E, ch, 32, 32, 30)
    return svg("0 0 64 64", f'<circle cx="32" cy="32" r="29.5" stroke="{INK}" stroke-width="4.5"/><circle cx="32" cy="32" r="23" stroke="{INK}" stroke-width="1.8"/><path d="{g}" fill="{INK}"/>')
out["alt"] = {"mahtem": name_mark("ማ"), "wekil": name_mark("ወ")}
(pathlib.Path(__file__).parent / "logos.json").write_text(json.dumps(out, ensure_ascii=False))
print({k: len(v["mark"]) for k,v in out.items() if k in "ABCD"}, wl_w, wa_w)
