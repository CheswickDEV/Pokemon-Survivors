"""Import pinned, data-only PMDCollab sheets. Requires Pillow; never runs source code.

Usage: python scripts/import-pokemon-motion.py
Sources remain cached under .asset-cache. Output only mechanically translates RGBA
frames around their supplied ground/shadow anchor and packs them into a new atlas.
"""
from __future__ import annotations
import concurrent.futures
import hashlib
import io
import json
import math
from pathlib import Path
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
REVISION = "0d0eb9d415a3f648c0df49de72a24a6d46ce3fab"
BASE = f"https://raw.githubusercontent.com/PMDCollab/SpriteCollab/{REVISION}"
DEST = ROOT / "public/art/pokemon-motion"
CACHE = ROOT / ".asset-cache" / f"pmd-{REVISION}"
DIRECTIONS = {"down": 0, "downRight": 1, "right": 2, "upRight": 3,
              "up": 4, "upLeft": 5, "left": 6, "downLeft": 7}


def fetch(path: str) -> bytes:
    local = CACHE / path
    if local.exists():
        return local.read_bytes()
    url = f"{BASE}/{path}"
    for attempt in range(4):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Auenwald-Pinned-Asset-Importer"})
            with urllib.request.urlopen(request, timeout=40) as response:
                data = response.read()
            local.parent.mkdir(parents=True, exist_ok=True)
            local.write_bytes(data)
            return data
        except (urllib.error.URLError, TimeoutError):
            if attempt == 3:
                raise
            time.sleep(0.3 * (attempt + 1))
    raise AssertionError("unreachable")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def normalize_action(id: int, source_dir: str, name: str, anim: ET.Element, out: Path):
    frame_w = int(anim.findtext("FrameWidth"))
    frame_h = int(anim.findtext("FrameHeight"))
    durations = [int(item.text) for item in anim.findall("Durations/Duration")]
    image_path = f"{source_dir}/{name}-Anim.png"
    shadow_path = f"{source_dir}/{name}-Shadow.png"
    image_data = fetch(image_path)
    shadow_data = fetch(shadow_path)
    source = Image.open(io.BytesIO(image_data)).convert("RGBA")
    shadow = Image.open(io.BytesIO(shadow_data)).convert("RGBA")
    if source.size != shadow.size or source.width != len(durations) * frame_w:
        raise ValueError(f"#{id} {name}: inconsistent dimensions or duration count")
    rows = source.height // frame_h
    if rows not in (1, 8) or source.height % frame_h:
        raise ValueError(f"#{id} {name}: unexpected directions {rows}")
    frames = []
    missing_anchors = []
    rel_bounds = []
    for row in range(rows):
        for col in range(len(durations)):
            box = (col * frame_w, row * frame_h, (col + 1) * frame_w, (row + 1) * frame_h)
            frame = source.crop(box)
            markers = shadow.crop(box)
            anchors = [(x, y) for y in range(frame_h) for x in range(frame_w)
                       if markers.getpixel((x, y)) == (255, 255, 255, 255)]
            if len(anchors) != 1:
                # Every official PMD action should provide one ground center.
                missing_anchors.append([row, col, len(anchors)])
                anchor = (frame_w // 2, frame_h // 2)
            else:
                anchor = anchors[0]
            bbox = frame.getbbox()
            if not bbox:
                raise ValueError(f"#{id} {name}: empty frame {row}/{col}")
            rel_bounds.append((bbox[0] - anchor[0], bbox[1] - anchor[1],
                               bbox[2] - anchor[0], bbox[3] - anchor[1]))
            frames.append((frame, anchor))
    if missing_anchors:
        raise ValueError(f"#{id} {name}: missing or ambiguous shadow anchors: {missing_anchors}")
    radius_x = max(max(abs(b[0]), abs(b[2])) for b in rel_bounds) + 2
    min_y = min(b[1] for b in rel_bounds) - 2
    max_y = max(b[3] for b in rel_bounds) + 2
    width = math.ceil(radius_x) * 2
    height = math.ceil((max_y - min_y) / 2) * 2
    anchor_x = width // 2
    anchor_y = -min_y
    atlas = Image.new("RGBA", (width * len(durations), height * rows))
    for idx, (frame, source_anchor) in enumerate(frames):
        col, row = idx % len(durations), idx // len(durations)
        bbox = frame.getbbox()
        atlas.paste(frame.crop(bbox), (col * width + anchor_x - source_anchor[0] + bbox[0],
                                     row * height + anchor_y - source_anchor[1] + bbox[1]))
        # Re-extract the original visible source pixels to verify byte identity.
        expected = frame.crop(bbox)
        extracted = atlas.crop((col * width + anchor_x - source_anchor[0] + bbox[0],
                                row * height + anchor_y - source_anchor[1] + bbox[1],
                                col * width + anchor_x - source_anchor[0] + bbox[2],
                                row * height + anchor_y - source_anchor[1] + bbox[3]))
        if extracted.tobytes() != expected.tobytes():
            raise ValueError(f"#{id} {name}: pixel preservation failed")
    action = out.stem
    atlas.save(out, optimize=True)
    metadata = {
        "key": f"pokemon-motion-{id}-{action}", "url": f"/art/pokemon-motion/{id}/{out.name}",
        "sourceAction": name, "frameWidth": width, "frameHeight": height,
        "columns": len(durations), "frameCount": len(frames), "rows": rows,
        "directions": DIRECTIONS if rows == 8 else {key: 0 for key in DIRECTIONS},
        "durationsMs": [round(tick * 1000 / 60, 4) for tick in durations],
        "durationMs": round(sum(durations) * 1000 / 60, 4),
        "originX": anchor_x / width, "originY": anchor_y / height,
        "hitFrame": int(anim.findtext("HitFrame") or anim.findtext("ReturnFrame") or "0"),
    }
    distinct_by_direction = []
    for row in range(rows):
        distinct_by_direction.append(len({atlas.crop((col * width, row * height, (col + 1) * width,
                                                      (row + 1) * height)).tobytes()
                                          for col in range(len(durations))}))
    evidence = {"animation": name, "source": f"{BASE}/{image_path}",
                "sourceSha256": sha(image_data), "shadowSource": f"{BASE}/{shadow_path}",
                "shadowSha256": sha(shadow_data), "output": str(out.relative_to(DEST)).replace("\\", "/"),
                "outputSha256": sha(out.read_bytes()), "frames": len(frames),
                "distinctFrames": len({frame.tobytes() for frame, _ in frames}),
                "distinctFramesByDirection": distinct_by_direction,
                "dimensions": [atlas.width, atlas.height], "verifiedPixelIdentical": True}
    return metadata, evidence, frames[0][0]


def species(id: int):
    source_dir = f"sprite/{id:04d}"
    xml_data = fetch(f"{source_dir}/AnimData.xml")
    xml_root = ET.fromstring(xml_data)
    anims = {anim.findtext("Name"): anim for anim in xml_root.findall("Anims/Anim")}
    dest = DEST / str(id)
    dest.mkdir(parents=True, exist_ok=True)
    (dest / "AnimData.xml").write_bytes(xml_data)
    credits = fetch(f"{source_dir}/credits.txt")
    (dest / "credits.txt").write_bytes(credits)
    metadata = {"id": id, "portrait": f"/art/pokemon-motion/{id}/portrait.png", "displayScale": 1.5}
    evidence = {"id": id, "xmlSource": f"{BASE}/{source_dir}/AnimData.xml",
                "xmlSha256": sha(xml_data), "creditsSource": f"{BASE}/{source_dir}/credits.txt",
                "creditsSha256": sha(credits), "actions": []}
    for action in ("walk", "idle", "attack"):
        source_name = action.title()
        if source_name not in anims:
            raise ValueError(f"#{id}: missing {source_name}")
        chain = []
        while anims[source_name].findtext("CopyOf"):
            chain.append(source_name)
            source_name = anims[source_name].findtext("CopyOf")
            if source_name in chain:
                raise ValueError(f"#{id}: circular animation alias")
        data, proof, first_frame = normalize_action(id, source_dir, source_name, anims[source_name], dest / f"{action}.png")
        metadata[action] = data
        evidence["actions"].append(proof)
        if action == "idle":
            portrait = first_frame.crop(first_frame.getbbox())
            portrait.save(dest / "portrait.png", optimize=True)
            metadata["portraitWidth"], metadata["portraitHeight"] = portrait.size
            evidence["portraitSha256"] = sha((dest / "portrait.png").read_bytes())
    return metadata, evidence


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    for filename in ("LICENSE.md", "credit_names.txt", "README.md"):
        (DEST / ("UPSTREAM-README.md" if filename == "README.md" else filename)).write_bytes(fetch(filename))
    data = {}
    evidence = {}
    errors = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        tasks = {pool.submit(species, id): id for id in range(1, 152)}
        for result in concurrent.futures.as_completed(tasks):
            id = tasks[result]
            try:
                entry, proof = result.result()
                data[id] = entry
                evidence[id] = proof
            except Exception as err:
                errors.append({"id": id, "error": str(err)})
            if len(data) % 15 == 0 or errors:
                print(json.dumps({"complete": len(data), "errors": errors}), flush=True)
    if errors:
        (DEST / "import-errors.json").write_text(json.dumps(errors, indent=2))
        raise RuntimeError(f"Incomplete import: {len(data)}/151; {errors}")
    ordered = {id: data[id] for id in range(1, 152)}
    source = """/** Pinned PMDCollab walking / idle / attack artwork. See public/art/pokemon-motion/PROVENANCE.md. */
export type PokemonDirection = 'down' | 'downRight' | 'right' | 'upRight' | 'up' | 'upLeft' | 'left' | 'downLeft';
export type PokemonMotionName = 'walk' | 'idle' | 'attack';
export interface PokemonMotionAction {
  key: string; url: string; sourceAction: string;
  frameWidth: number; frameHeight: number; columns: number; frameCount: number; rows: number;
  /** Row number; absolute Phaser frame is row * columns + timed frame. */
  directions: Record<PokemonDirection, number>;
  durationsMs: number[]; durationMs: number; originX: number; originY: number; hitFrame: number;
}
export interface PokemonMotion {
  id: number; portrait: string; portraitWidth: number; portraitHeight: number; displayScale: number;
  walk: PokemonMotionAction; idle: PokemonMotionAction; attack: PokemonMotionAction;
}
export const POKEMON_MOTION: Readonly<Record<number, PokemonMotion>> = """ + json.dumps(ordered, separators=(",", ":")) + """;
export function pokemonMotion(id: number): PokemonMotion | undefined {
  return Number.isInteger(id) && id >= 1 && id <= 151 ? POKEMON_MOTION[id] : undefined;
}
"""
    (ROOT / "src/pokemon-motion.ts").write_text(source, encoding="utf-8")
    manifest = {"repository": "https://github.com/PMDCollab/SpriteCollab", "revision": REVISION,
                "directions": DIRECTIONS, "sourceTickRate": 60, "speciesCount": len(data),
                "missingActions": [], "fallbacks": [], "species": [evidence[id] for id in range(1, 152)]}
    (DEST / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    total_frames = sum(action["frames"] for proof in evidence.values() for action in proof["actions"])
    largest = max((a["dimensions"][0] * a["dimensions"][1], id, a["animation"], a["dimensions"])
                  for id, item in evidence.items() for a in item["actions"])
    report = {"species": len(data), "frames": total_frames, "actions": len(data) * 3,
              "allEightDirections": all(data[id][action]["rows"] == 8 for id in data for action in ("walk", "idle", "attack")),
              "minimumDistinctWalkFramesPerDirection": min(min(a["distinctFramesByDirection"])
                  for proof in evidence.values() for a in proof["actions"] if a["output"].endswith("/walk.png")),
              "originalSinglePoseIdleSpecies": [id for id in data if data[id]["idle"]["columns"] == 1],
              "largestAtlas": largest, "pngBytes": sum(p.stat().st_size for p in DEST.rglob("*.png"))}
    (DEST / "validation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    # A contact sheet is mechanical QA, not a game asset.
    sheet = Image.new("RGB", (15 * 96, 11 * 96), "#e8efdf")
    draw = ImageDraw.Draw(sheet)
    for id, entry in ordered.items():
        x, y = ((id - 1) % 15) * 96, ((id - 1) // 15) * 96
        portrait = Image.open(DEST / str(id) / "portrait.png").convert("RGBA")
        scale = min(2, 70 / max(portrait.size))
        portrait = portrait.resize((round(portrait.width * scale), round(portrait.height * scale)), Image.Resampling.NEAREST)
        sheet.paste(portrait, (x + (96 - portrait.width) // 2, y + 71 - portrait.height), portrait)
        draw.text((x + 36, y + 77), f"{id:03d}", fill="#15372d")
    sheet.save(ROOT / "qa/gen1-motion-contact-sheet.png")
    print(json.dumps(report), flush=True)


if __name__ == "__main__":
    main()
