"""Simple scannable QR card — URL text only."""
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from qrcode.constants import ERROR_CORRECT_M

URL = "https://muis.bd/seerah-2026"
OUT = Path(__file__).resolve().parents[1] / "public" / "seerah-2026-qr.png"

NAVY_DEEP = (7, 9, 19)
GOLD = (201, 154, 76)
GOLD_LIGHT = (232, 201, 140)
GOLD_DEEP = (168, 122, 52)
CREAM = (250, 248, 243)
INK = (22, 26, 56)


def font(names, size):
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def is_finder(r, c, n):
    return (
        (r < 7 and c < 7)
        or (r < 7 and c >= n - 7)
        or (r >= n - 7 and c < 7)
    )


def draw_finder(draw, ox, oy, module, origin_r, origin_c, n):
    x0 = ox + origin_c * module
    y0 = oy + origin_r * module
    s = module * 7
    draw.rounded_rectangle((x0, y0, x0 + s, y0 + s), radius=module * 0.9, fill=INK)
    inset = module
    draw.rounded_rectangle(
        (x0 + inset, y0 + inset, x0 + s - inset, y0 + s - inset),
        radius=module * 0.65,
        fill=CREAM,
    )
    inner = module * 2
    draw.rounded_rectangle(
        (x0 + inner, y0 + inner, x0 + s - inner, y0 + s - inner),
        radius=module * 0.45,
        fill=GOLD_DEEP,
    )


def main():
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=1,
        border=0,
    )
    qr.add_data(URL)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    n = len(matrix)

    W, H = 1080, 1080
    card = Image.new("RGB", (W, H), NAVY_DEEP)
    draw = ImageDraw.Draw(card)

    glow = Image.new("RGB", (W, H), NAVY_DEEP)
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((120, 80, 960, 1000), fill=(42, 34, 18))
    card = Image.blend(card, glow.filter(ImageFilter.GaussianBlur(90)), 0.55)
    draw = ImageDraw.Draw(card)

    rounded_rect(draw, (40, 40, W - 40, H - 40), 40, outline=GOLD, width=3)

    qr_size = 760
    ox = (W - qr_size) // 2
    oy = 72
    module = qr_size / n
    pad = 36
    plate = (ox - pad, oy - pad, ox + qr_size + pad, oy + qr_size + pad)
    rounded_rect(draw, plate, 36, fill=CREAM)
    rounded_rect(draw, (plate[0] + 8, plate[1] + 8, plate[2] - 8, plate[3] - 8), 30, outline=GOLD, width=3)

    half = module * 0.42
    radius = module * 0.28
    for r, row in enumerate(matrix):
        for c, on in enumerate(row):
            if not on or is_finder(r, c, n):
                continue
            cx = ox + (c + 0.5) * module
            cy = oy + (r + 0.5) * module
            draw.rounded_rectangle(
                (cx - half, cy - half, cx + half, cy + half),
                radius=radius,
                fill=INK,
            )

    draw_finder(draw, ox, oy, module, 0, 0, n)
    draw_finder(draw, ox, oy, module, 0, n - 7, n)
    draw_finder(draw, ox, oy, module, n - 7, 0, n)

    url_font = font(["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"], 32)
    box = draw.textbbox((0, 0), URL, font=url_font)
    x = (W - (box[2] - box[0])) / 2
    draw.text((x, 962), URL, font=url_font, fill=GOLD_LIGHT)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    card.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT} ({card.size[0]}x{card.size[1]}) modules={n}")


if __name__ == "__main__":
    main()
