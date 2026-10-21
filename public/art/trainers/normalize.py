"""Mechanical sprite layout conversion. Inputs are pinned public pret source assets.

No game/repository code is executed. Requires Pillow only for this offline build step.
Runtime uses the generated PNGs and needs no Python or remote asset request.
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import hashlib
import json

ROOT = Path(__file__).resolve().parent
SOURCES = ROOT / "sources"
IDS = ("red", "leaf", "ethan", "kris", "brendan", "may")


def gba_frames(name):
    indexed = Image.open(SOURCES / f"{name}.png")
    assert indexed.size == (144, 32) and indexed.mode == "P"
    indexed.info["transparency"] = 0  # Object-event palette index 0 is transparent.
    rgba = indexed.convert("RGBA")
    original = [rgba.crop((i * 16, 0, (i + 1) * 16, 32)) for i in range(9)]
    # Down, up, left: idle / leading foot / trailing foot. Right is mirrored left.
    directions = [[original[i] for i in group] for group in ((0, 3, 4), (1, 5, 6), (2, 7, 8))]
    directions.append([ImageOps.mirror(frame) for frame in directions[2]])
    padded = []
    for direction in directions:
        for frame in direction:
            canvas = Image.new("RGBA", (32, 32))
            canvas.alpha_composite(frame, (8, 0))
            padded.append(canvas)
    return padded


def crystal_frames(name):
    source = Image.open(SOURCES / f"{name}.png")
    assert source.size == (16, 96) and source.mode == "L"
    # Crystal source grayscale stores 2bpp indices. Restore the game's day palette,
    # PAL_OW_RED for Chris / PAL_OW_BLUE for Kris (npc_sprites.pal, sprites.asm).
    accent = (31, 7, 1) if name == "ethan" else (10, 9, 31)
    rgb5 = [(27, 31, 27), (31, 19, 10), accent, (0, 0, 0)]
    palette = [tuple(round(channel * 255 / 31) for channel in color) for color in rgb5]
    colors = {255: (0, 0, 0, 0), 170: (*palette[1], 255), 85: (*palette[2], 255), 0: (*palette[3], 255)}
    rgba = Image.new("RGBA", source.size)
    rgba.putdata([colors[value] for value in source.getdata()])
    original = [rgba.crop((0, i * 16, 16, (i + 1) * 16)) for i in range(6)]
    directions = [
        [original[0], original[3], ImageOps.mirror(original[3])],
        [original[1], original[4], ImageOps.mirror(original[4])],
        [original[2], original[5], original[5]],
    ]
    directions.append([ImageOps.mirror(frame) for frame in directions[2]])
    return [frame.resize((32, 32), Image.Resampling.NEAREST) for direction in directions for frame in direction]


hashes = {}
preview = Image.new("RGB", (12 * 64, len(IDS) * 92), "#c4deb0")
draw = ImageDraw.Draw(preview)
for row, name in enumerate(IDS):
    frames = crystal_frames(name) if name in ("ethan", "kris") else gba_frames(name)
    sheet = Image.new("RGBA", (384, 32))
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, (i * 32, 0))
        large = frame.resize((64, 64), Image.Resampling.NEAREST)
        preview.paste(large, (i * 64, row * 92 + 22), large)
    sheet.save(ROOT / f"{name}.png", optimize=True)
    frames[0].save(ROOT / f"{name}-portrait.png", optimize=True)
    draw.text((4, row * 92 + 4), name + "    down x3 / up x3 / left x3 / right x3", fill="#182d22")
    for filename in (f"sources/{name}.png", f"{name}.png", f"{name}-portrait.png"):
        hashes[filename] = hashlib.sha256((ROOT / filename).read_bytes()).hexdigest()
preview.save(ROOT / "contact-sheet.png")
(ROOT / "sha256.json").write_text(json.dumps(hashes, indent=2) + "\n", encoding="utf-8")
print(f"Prepared {len(IDS)} trainers, 12 transparent 32x32 frames each; portraits and provenance hashes saved.")
