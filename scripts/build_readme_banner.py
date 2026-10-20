"""Buduje animowany baner do README z prawdziwych grafik z gry (Project Amber): wizytówki gracza i ikony żywiołów.
Skrypt uruchamia GitHub Actions (workflow readme-banner.yml), bo wymaga internetu. Wynik: build/readme-banner.webp."""
import io
import math
import sys
import urllib.request

from PIL import Image, ImageDraw, ImageFilter

WIDTH, HEIGHT = 960, 240
FPS = 12
HOLD, FADE = 30, 8
SLIDES = 3
ZOOM = 0.07
OUTPUT = 'build/readme-banner.webp'
CARD_URL = 'https://gi.yatta.moe/assets/UI/namecard/UI_NameCardPic_{}_P.png'
ICON_URL = 'https://gi.yatta.moe/assets/UI/UI_Buff_Element_{}.png'
CARDS = ['Furina', 'Arlecchino', 'Nahida', 'Zhongli', 'Hutao', 'Venti', 'Navia', 'Neuvillette', 'Ayaka', 'Kazuha']
ELEMENTS = [
    ('Fire', (255, 122, 69)), ('Water', (76, 194, 255)), ('Grass', (123, 216, 75)), ('Electric', (185, 133, 255)),
    ('Ice', (159, 232, 255)), ('Wind', (95, 224, 184)), ('Rock', (240, 181, 58)),
]


def download(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'genshin-build-card-banner/1.0'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return Image.open(io.BytesIO(response.read())).convert('RGBA')
    except Exception as error:
        print('Pominięto', url, '-', error)
        return None


def cover(image, factor):
    """Skaluje obraz tak, by wypełnił baner (z zapasem na przybliżanie)."""
    scale = max(WIDTH * factor / image.width, HEIGHT * factor / image.height)
    size = (round(image.width * scale), round(image.height * scale))
    return image.resize(size, Image.LANCZOS)


def frame_of(base, progress):
    """Wycinek obrazu z powolnym przybliżaniem w czasie."""
    zoom = 1 + ZOOM * progress
    crop_w, crop_h = base.width / zoom, base.height / zoom
    left, top = (base.width - crop_w) / 2, (base.height - crop_h) / 2
    return base.crop((left, top, left + crop_w, top + crop_h)).resize((WIDTH, HEIGHT), Image.LANCZOS)


def shade():
    layer = Image.new('RGBA', (WIDTH, HEIGHT))
    pixels = layer.load()
    for y in range(HEIGHT):
        alpha = int(190 * max(0, (y / HEIGHT - 0.35) / 0.65) ** 1.4)
        for x in range(WIDTH):
            pixels[x, y] = (11, 11, 15, alpha)
    return layer


def icons_layer(icons, tick):
    glow = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    spacing = 74
    start = WIDTH / 2 - spacing * (len(icons) - 1) / 2
    placed = []
    for index, (icon, color) in enumerate(icons):
        phase = tick / (FPS * 3.2) * 2 * math.pi + index * 0.8
        x = start + index * spacing
        y = HEIGHT - 44 + 5 * math.sin(phase)
        pulse = 0.55 + 0.45 * math.sin(phase + 1.2)
        radius = 27 + 4 * pulse
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color + (int(70 + 70 * pulse),))
        placed.append((icon, int(x - icon.width / 2), int(y - icon.height / 2)))
    glow = glow.filter(ImageFilter.GaussianBlur(10))
    for icon, x, y in placed:
        glow.alpha_composite(icon, (x, y))
    return glow


def main():
    slides = []
    for name in CARDS:
        image = download(CARD_URL.format(name))
        if image is not None:
            slides.append(cover(image, 1 + ZOOM))
        if len(slides) == SLIDES:
            break
    if len(slides) < 2:
        sys.exit('Za mało pobranych wizytówek, baner nie powstał.')

    icons = []
    for name, color in ELEMENTS:
        icon = download(ICON_URL.format(name))
        if icon is None:
            sys.exit('Brak ikony żywiołu ' + name)
        icons.append((icon.resize((44, 44), Image.LANCZOS), color))

    overlay = shade()
    period = HOLD + FADE
    frames = []
    for tick in range(len(slides) * period):
        index, step = divmod(tick, period)
        current = frame_of(slides[index], step / period)
        if step >= HOLD:
            following = frame_of(slides[(index + 1) % len(slides)], (step - HOLD) / period)
            current = Image.blend(current, following, (step - HOLD + 1) / (FADE + 1))
        current.alpha_composite(overlay)
        current.alpha_composite(icons_layer(icons, tick))
        frames.append(current.convert('RGB'))

    for quality in (72, 58, 45):
        frames[0].save(OUTPUT, save_all=True, append_images=frames[1:], duration=round(1000 / FPS), loop=0,
                       format='WEBP', quality=quality, method=4)
        with open(OUTPUT, 'rb') as handle:
            size = len(handle.read())
        print('Jakość', quality, '-', round(size / 1024), 'KB,', len(frames), 'klatek')
        if size < 4_000_000:
            break


if __name__ == '__main__':
    main()
