"""Mechanical FireRed metatile decoding; source artwork is not modified."""
from pathlib import Path
import struct
from PIL import Image, ImageDraw

ROOT = Path(__file__).parent
SOURCE = ROOT / 'source'
source = Image.open(SOURCE / 'tiles.png')
palettes = [[tuple(map(int, line.split())) for line in (SOURCE / f'{i:02d}.pal').read_text().splitlines()[3:19]] for i in range(16)]
words = struct.unpack('<5120H', (SOURCE / 'metatiles.bin').read_bytes())
tiles = []
for index in range(640):
    result = Image.new('RGBA', (16, 16))
    for offset, word in enumerate(words[index * 8:index * 8 + 8]):
        tid = word & 1023
        if tid >= 640:
            continue
        crop = source.crop(((tid % 16) * 8, (tid // 16) * 8, (tid % 16) * 8 + 8, (tid // 16) * 8 + 8))
        pixels = Image.new('RGBA', (8, 8))
        pixels.putdata([(*palettes[word >> 12][p], 0 if p == 0 else 255) for p in crop.getdata()])
        if word & 1024:
            pixels = pixels.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if word & 2048:
            pixels = pixels.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        result.alpha_composite(pixels, ((offset % 2) * 8, ((offset % 4) // 2) * 8))
    tiles.append(result)

atlas = Image.new('RGBA', (256, 640))
proof = Image.new('RGB', (16 * 52, 40 * 64), '#334441')
draw = ImageDraw.Draw(proof)
for index, tile in enumerate(tiles):
    atlas.alpha_composite(tile, ((index % 16) * 16, (index // 16) * 16))
    proof.paste(tile.resize((48, 48), Image.Resampling.NEAREST), ((index % 16) * 52, (index // 16) * 64), tile.resize((48, 48), Image.Resampling.NEAREST))
    draw.text(((index % 16) * 52, (index // 16) * 64 + 48), str(index), fill='white')
atlas.save(ROOT / 'metatiles.png')
proof.save(ROOT / 'metatiles-proof.png')

# Runtime assets use original pixels, assembled by the original 16x16 metatile layout.
def assemble(name, ids, columns, clear_grass=False):
    result = Image.new('RGBA', (columns * 16, ((len(ids) + columns - 1) // columns) * 16))
    grass_colors = set([palettes[0][8], *palettes[0][12:16]])
    for index, tile_id in enumerate(ids):
        tile = tiles[tile_id].copy()
        if clear_grass:
            tile.putdata([(r,g,b,0 if (r,g,b) in grass_colors else a) for r,g,b,a in tile.getdata()])
        result.alpha_composite(tile, ((index % columns) * 16, (index // columns) * 16))
    result.save(ROOT / f'{name}.png')
    return result

grass = assemble('grass', [1,8,9,16,17,1], 6)
assemble('path', [208,209,210,216,217,218,224,225,226], 3)
assemble('tree', [14,15,30,31,38,39], 2, True)
assemble('bush', [5], 1, True)
assemble('sapling', [19,35], 1, True)
assemble('sign', [3], 1, True)
assemble('cabin', [44,45,45,47,52,53,54,55,60,61,62,63], 4, True)

flowers = Image.new('RGBA', (16 * 5, 16))
for frame in range(5):
    image = Image.open(SOURCE / f'flower-{frame}.png')
    decoded = Image.new('RGBA', image.size)
    decoded.putdata([(*palettes[0][p], 0 if p == 0 else 255) for p in image.getdata()])
    flowers.alpha_composite(decoded, (16 * frame, 0))
flowers.save(ROOT / 'flowers.png')

# Source animation replaces tile indices 416..463; metatile 465 is open water.
water = Image.new('RGBA', (16 * 8, 16))
for frame in range(8):
    image = Image.open(SOURCE / f'water-{frame}.png')
    decoded = Image.new('RGBA', (16, 16))
    for offset, word in enumerate(words[465 * 8:465 * 8 + 4]):
        tid = (word & 1023) - 416
        crop = image.crop(((tid % 2) * 8, (tid // 2) * 8, (tid % 2) * 8 + 8, (tid // 2) * 8 + 8))
        pixels = Image.new('RGBA', (8, 8))
        pixels.putdata([(*palettes[word >> 12][p], 0 if p == 0 else 255) for p in crop.getdata()])
        if word & 1024:
            pixels = pixels.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if word & 2048:
            pixels = pixels.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        decoded.alpha_composite(pixels, ((offset % 2) * 8, (offset // 2) * 8))
    water.alpha_composite(decoded, (16 * frame, 0))
water.save(ROOT / 'water.png')

boulder = Image.open(SOURCE / 'strength_boulder.png')
boulder_palette = [tuple(map(int, line.split())) for line in (SOURCE / 'npc_white.pal').read_text().splitlines()[3:19]]
decoded = Image.new('RGBA', boulder.size)
decoded.putdata([(*boulder_palette[p], 0 if p == 0 else 255) for p in boulder.getdata()])
decoded.save(ROOT / 'rock.png')

preview = Image.new('RGB', (672, 288), '#73cda4')
draw = ImageDraw.Draw(preview)
for i, name in enumerate(['tree', 'sapling', 'bush', 'sign', 'cabin', 'rock', 'flowers', 'path', 'grass', 'water']):
    img = Image.open(ROOT / f'{name}.png')
    scale = 3 if name not in ['flowers', 'grass', 'water'] else 2
    thumb = img.resize((img.width * scale, img.height * scale), Image.Resampling.NEAREST)
    positions = [(0,0),(104,0),(164,0),(224,0),(296,0),(512,0),(0,174),(176,144),(328,174),(328,230)]
    x,y = positions[i]
    preview.paste(thumb, (x,y), thumb)
    draw.text((x,y+thumb.height+1),name, fill='#24302e')
preview.save(ROOT / 'runtime-proof.png')
