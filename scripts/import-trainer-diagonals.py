"""Mechanically pack generated whole-character poses. No body-part synthesis.

Run from game/: python scripts/import-trainer-diagonals.py
Requires Pillow. Source files live under public/art/trainers-v5/generated/.
The transparent rows of each output overlay intentionally leave cardinal art alone.
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import hashlib
import json
import statistics

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'public/art/trainers-v5'
QA = ROOT / 'qa'
IDS = ['red', 'leaf', 'ethan', 'kris', 'brendan', 'may']
ROW_COUNTS = {
    'red': [4, 4, 4, 4], 'leaf': [4, 4, 4, 4],
    'ethan': [6, 6, 6], 'kris': [5, 5, 4, 4],
    'brendan': [5, 5, 4, 4], 'may': [4, 4, 4, 4],
}
FRONT_COUNTS = {'red': 8, 'leaf': 8, 'ethan': 12, 'kris': 10, 'brendan': 10, 'may': 8}


def spans(values, threshold, bridge=10):
    indices = [i for i, v in enumerate(values) if v >= threshold]
    result = []
    for i in indices:
        if not result or i - result[-1][1] > bridge:
            result.append([i, i + 1])
        else:
            result[-1][1] = i + 1
    return result


def poses_from_sheet(image, id):
    # Alpha is used only to locate whole poses; generated pixel alpha is preserved.
    alpha = image.getchannel('A')
    w, h = image.size
    pixels = alpha.load()
    rows = spans([sum(pixels[x, y] >= 160 for x in range(w)) for y in range(h)], 12, 8)
    assert len(rows) == len(ROW_COUNTS[id]), (id, 'rows', rows)
    result, boxes = [], []
    for (y0, y1), expected in zip(rows, ROW_COUNTS[id]):
        columns = spans([sum(pixels[x, y] >= 160 for y in range(y0, y1)) for x in range(w)], 2, 15)
        assert len(columns) == expected, (id, 'columns', columns)
        for x0, x1 in columns:
            # Preserve low-alpha outlines around the core silhouette without including neighbors.
            box = (max(0, x0 - 5), max(0, y0 - 5), min(w, x1 + 5), min(h, y1 + 5))
            crop = image.crop(box)
            tight = crop.getbbox()
            assert tight
            result.append(crop.crop(tight))
            boxes.append([box[0] + tight[0], box[1] + tight[1], box[0] + tight[2], box[1] + tight[3]])
    return result, boxes


def pack_pose(image, scale, baseline):
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    sprite = image.resize(size, Image.Resampling.NEAREST)
    sprite = sprite.crop(sprite.getbbox())
    # Anchor by the head rather than the arm-swing silhouette to avoid sideways jitter.
    head = sprite.crop((0, 0, sprite.width, max(1, round(sprite.height * .48))))
    head_box = head.getbbox()
    center_x = (head_box[0] + head_box[2]) / 2 if head_box else sprite.width / 2
    result = Image.new('RGBA', (64, 64))
    result.alpha_composite(sprite, (round(32 - center_x), baseline - sprite.height))
    return result


def hash_image(im):
    return hashlib.sha256(im.tobytes()).hexdigest()


metadata = {'version': 1, 'frameWidth': 64, 'frameHeight': 64, 'columns': 9, 'rows': 8,
            'order': ['down', 'downRight', 'right', 'upRight', 'up', 'upLeft', 'left', 'downLeft'],
            'method': 'Whole newly generated diagonal poses; only extraction, uniform scaling, alignment, and full-image horizontal mirroring.',
            'trainers': {}}
preview = Image.new('RGB', (64 * 9 * 2, 6 * (64 * 2 + 26)), '#b9d2b2')
pd = ImageDraw.Draw(preview)
gif_frames = [Image.new('RGB', (64 * 4 * 2, 6 * (64 * 2 + 26)), '#b9d2b2') for _ in range(8)]

for trainer_index, id in enumerate(IDS):
    source_path = ART / 'generated' / (id + '.png')
    source = Image.open(source_path).convert('RGBA')
    poses, boxes = poses_from_sheet(source, id)
    split = FRONT_COUNTS[id]
    groups = [poses[:split], poses[split:]]
    original = Image.open(ROOT / 'public/art/trainers' / (id + '.png')).convert('RGBA').crop((0, 0, 32, 32))
    original_bounds = original.getbbox()
    baseline = original_bounds[3] * 2
    desired_height = (original_bounds[3] - original_bounds[1]) * 2
    # One scale factor per character, shared by both diagonal views and every pose.
    scale = min(desired_height / statistics.median([p.height for p in poses]),
                baseline / max(p.height for p in poses))
    atlas = Image.new('RGBA', (64 * 9, 64 * 8))
    group_stats = []
    packed_groups = []
    for group_index, group in enumerate(groups):
        packed = [pack_pose(pose, scale, baseline) for pose in group]
        chosen = [min(len(packed) - 1, i * len(packed) // 8) for i in range(8)]
        frames = [packed[i] for i in chosen]
        packed_groups.append(frames)
        right_row = 1 if group_index == 0 else 3
        left_row = 7 if group_index == 0 else 5
        # The first compact-foot passing pose also provides the resting view.
        idle_index = min(range(len(packed)), key=lambda i: packed[i].getbbox()[2] - packed[i].getbbox()[0])
        for column, frame in enumerate([packed[idle_index], *frames]):
            atlas.alpha_composite(frame, (column * 64, right_row * 64))
            atlas.alpha_composite(ImageOps.mirror(frame), (column * 64, left_row * 64))
        unique = len({hash_image(frame) for frame in frames})
        assert unique >= 6, (id, 'unique poses', unique)
        group_stats.append({'direction': 'downRight' if group_index == 0 else 'upRight',
                            'availablePoses': len(group), 'uniqueWalkPoses': unique,
                            'selectedSourceFrames': chosen, 'idleSourceFrame': idle_index})
    output = ART / (id + '-diagonals.png')
    atlas.save(output, optimize=True)
    for row in [1, 3, 5, 7]:
        for col in range(9):
            box = atlas.crop((col * 64, row * 64, (col + 1) * 64, (row + 1) * 64)).getbbox()
            assert box and box[3] == baseline, (id, row, col, box, baseline)
    assert all(not atlas.crop((0, row * 64, 576, (row + 1) * 64)).getbbox() for row in [0, 2, 4, 6])
    metadata['trainers'][id] = {
        'sheet': '/art/trainers-v5/' + id + '-diagonals.png', 'baseline': baseline,
        'targetOriginalHeight': desired_height, 'normalizationScale': scale,
        'sourceSize': list(source.size), 'sourcePoseBoxes': boxes, 'groups': group_stats,
        'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
    }
    y = trainer_index * (128 + 26)
    pd.text((8, y + 3), id + ' | SE walk frames 0-7 / mirrored and NE poses in animated proof', fill='#163826')
    contact = Image.new('RGBA', (576, 64))
    contact.alpha_composite(original.resize((64, 64), Image.Resampling.NEAREST), (0, 0))
    for i, frame in enumerate(packed_groups[0]):
        contact.alpha_composite(frame, ((i + 1) * 64, 0))
    enlarged = contact.resize((1152, 128), Image.Resampling.NEAREST)
    preview.paste(enlarged, (0, y + 26), enlarged)
    for phase in range(8):
        gd = ImageDraw.Draw(gif_frames[phase])
        gd.text((8, y + 3), id + ' | SE     NE     NW     SW', fill='#163826')
        frames = [packed_groups[0][phase], packed_groups[1][phase],
                  ImageOps.mirror(packed_groups[1][phase]), ImageOps.mirror(packed_groups[0][phase])]
        for col, frame in enumerate(frames):
            enlarged = frame.resize((128, 128), Image.Resampling.NEAREST)
            gif_frames[phase].paste(enlarged, (col * 128, y + 26), enlarged)
    print(id, 'source poses', len(poses), 'walk counts', [s['uniqueWalkPoses'] for s in group_stats], 'baseline', baseline)

(ART / 'metadata.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
QA.mkdir(exist_ok=True)
preview.save(QA / 'trainer-diagonals-v5.png')
gif_frames[0].save(QA / 'trainer-diagonals-v5.gif', save_all=True, append_images=gif_frames[1:], duration=108, loop=0)
print('Verified all 216 diagonal atlas cells; source cardinal sheets unchanged.')

# Supplemental cardinal drawings share the generated diagonal character designs.
# This optional pass produces complete atlases once all six supplements are present.
if all((ART / 'generated' / (id + '-cardinal.png')).exists() for id in IDS):
    complete = {'version': 1, 'frameWidth': 64, 'frameHeight': 64, 'columns': 9, 'rows': 8,
                'order': metadata['order'], 'trainers': {}}
    full_preview = Image.new('RGB', (64 * 8 * 2, 6 * (64 * 2 + 26)), '#b9d2b2')
    fpd = ImageDraw.Draw(full_preview)
    full_gif = [Image.new('RGB', full_preview.size, '#b9d2b2') for _ in range(8)]
    # Keep asymmetric hats in a consistent orientation by mirroring whole frontal/rear
    # drawings where the generation alternated their symmetry. No internal parts change.
    full_pose_mirrors = {'kris': {1: [2, 4, 5]}, 'may': {0: [3, 4], 1: [0, 3, 4]}}
    for ti, id in enumerate(IDS):
        source = Image.open(ART / 'generated' / (id + '-cardinal.png')).convert('RGBA')
        original_counts = ROW_COUNTS[id]
        ROW_COUNTS[id] = [6, 6, 6]
        poses, boxes = poses_from_sheet(source, id)
        ROW_COUNTS[id] = original_counts
        assert len(poses) == 18, (id, 'cardinal pose count', len(poses))
        info = metadata['trainers'][id]
        baseline, height = info['baseline'], info['targetOriginalHeight']
        scale = min(height / statistics.median([p.height for p in poses]), baseline / max(p.height for p in poses))
        atlas = Image.open(ART / (id + '-diagonals.png')).convert('RGBA')
        group_info = []
        for group_index, row in enumerate([0, 4, 2]):
            group = poses[group_index * 6:(group_index + 1) * 6]
            mirrored = full_pose_mirrors.get(id, {}).get(group_index, [])
            packed = [pack_pose(ImageOps.mirror(pose) if pi in mirrored else pose, scale, baseline)
                      for pi, pose in enumerate(group)]
            chosen = [i * len(packed) // 8 for i in range(8)]
            frames = [packed[i] for i in chosen]
            idle_index = min(range(len(packed)), key=lambda i: packed[i].getbbox()[2] - packed[i].getbbox()[0])
            for col, frame in enumerate([packed[idle_index], *frames]):
                atlas.alpha_composite(frame, (col * 64, row * 64))
                if row == 2:
                    atlas.alpha_composite(ImageOps.mirror(frame), (col * 64, 6 * 64))
            unique = len({hash_image(frame) for frame in frames})
            assert unique == 6, (id, row, 'cardinal unique', unique)
            group_info.append({'direction': metadata['order'][row], 'availablePoses': 6,
                               'uniqueWalkPoses': unique, 'selectedSourceFrames': chosen,
                               'idleSourceFrame': idle_index, 'wholePoseMirrorCorrections': mirrored})
        for row in range(8):
            for col in range(9):
                box = atlas.crop((col * 64, row * 64, (col + 1) * 64, (row + 1) * 64)).getbbox()
                assert box and box[3] == baseline, (id, row, col, box, baseline)
        output = ART / (id + '-complete.png')
        atlas.save(output, optimize=True)
        complete['trainers'][id] = {'sheet': '/art/trainers-v5/' + id + '-complete.png',
                                   'baseline': baseline, 'normalizationScale': scale,
                                   'cardinalSourceSize': list(source.size), 'cardinalSourcePoseBoxes': boxes,
                                   'groups': group_info, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}
        py = ti * (128 + 26)
        label = id + ' | S       SE      E       NE      N       NW      W       SW'
        fpd.text((8, py + 3), label, fill='#163826')
        for gi in range(8):
            ImageDraw.Draw(full_gif[gi]).text((8, py + 3), label, fill='#163826')
        for row in range(8):
            idle = atlas.crop((0, row * 64, 64, (row + 1) * 64)).resize((128, 128), Image.Resampling.NEAREST)
            full_preview.paste(idle, (row * 128, py + 26), idle)
            for gi in range(8):
                frame = atlas.crop(((gi + 1) * 64, row * 64, (gi + 2) * 64, (row + 1) * 64)).resize((128, 128), Image.Resampling.NEAREST)
                full_gif[gi].paste(frame, (row * 128, py + 26), frame)
        print(id, 'complete atlas ready; six unique cardinal poses per direction')
    (ART / 'complete-metadata.json').write_text(json.dumps(complete, indent=2) + '\n', encoding='utf-8')
    full_preview.save(QA / 'trainer-complete-v5.png')
    full_gif[0].save(QA / 'trainer-complete-v5.gif', save_all=True, append_images=full_gif[1:], duration=108, loop=0)
    print('Verified all 432 complete atlas cells and all 48 direction cycles.')
