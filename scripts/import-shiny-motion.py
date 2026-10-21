"""Import the authentic shiny variant at the existing pinned PMDCollab revision.

Only XML, PNG, credits and licensing data are fetched. No upstream code is loaded.
The local normal-motion importer supplies the same lossless ground-anchor packing
and verifies that the RGBA pixels of every source frame are preserved exactly.
"""
from __future__ import annotations

import concurrent.futures
import importlib.util
import json
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "public/art/pokemon-shiny"
spec = importlib.util.spec_from_file_location("local_motion_importer", ROOT / "scripts/import-pokemon-motion.py")
motion = importlib.util.module_from_spec(spec)
spec.loader.exec_module(motion)
motion.DEST = DEST


def species(id: int):
    source_dir = f"sprite/{id:04d}/0000/0001"
    xml_data = motion.fetch(f"{source_dir}/AnimData.xml")
    xml_root = ET.fromstring(xml_data)
    anims = {anim.findtext("Name"): anim for anim in xml_root.findall("Anims/Anim")}
    dest = DEST / str(id)
    dest.mkdir(parents=True, exist_ok=True)
    (dest / "AnimData.xml").write_bytes(xml_data)
    credits = motion.fetch(f"{source_dir}/credits.txt")
    (dest / "credits.txt").write_bytes(credits)
    metadata = {"id": id, "portrait": f"/art/pokemon-shiny/{id}/portrait.png", "displayScale": 1.5}
    evidence = {
        "id": id, "variant": "base-form-shiny",
        "xmlSource": f"{motion.BASE}/{source_dir}/AnimData.xml",
        "xmlSha256": motion.sha(xml_data),
        "creditsSource": f"{motion.BASE}/{source_dir}/credits.txt",
        "creditsSha256": motion.sha(credits), "actions": [],
    }
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
        data, proof, first_frame = motion.normalize_action(
            id, source_dir, source_name, anims[source_name], dest / f"{action}.png"
        )
        data["key"] = f"pokemon-shiny-{id}-{action}"
        data["url"] = f"/art/pokemon-shiny/{id}/{action}.png"
        metadata[action] = data
        normal_file = ROOT / f"public/art/pokemon-motion/{id}/{action}.png"
        with Image.open(normal_file).convert("RGBA") as normal:
            with Image.open(dest / f"{action}.png").convert("RGBA") as shiny:
                proof["matchesNormalDimensions"] = normal.size == shiny.size
                proof["matchesNormalAlpha"] = normal.size == shiny.size and (
                    normal.getchannel("A").tobytes() == shiny.getchannel("A").tobytes()
                )
                proof["differsFromNormalColors"] = normal.tobytes() != shiny.tobytes()
        evidence["actions"].append(proof)
        if action == "idle":
            portrait = first_frame.crop(first_frame.getbbox())
            portrait.save(dest / "portrait.png", optimize=True)
            metadata["portraitWidth"], metadata["portraitHeight"] = portrait.size
            evidence["portraitSha256"] = motion.sha((dest / "portrait.png").read_bytes())
    return metadata, evidence


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    for filename in ("LICENSE.md", "credit_names.txt", "README.md"):
        (DEST / ("UPSTREAM-README.md" if filename == "README.md" else filename)).write_bytes(motion.fetch(filename))
    data, evidence, errors = {}, {}, []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        tasks = {pool.submit(species, id): id for id in range(1, 152)}
        for result in concurrent.futures.as_completed(tasks):
            id = tasks[result]
            try:
                data[id], evidence[id] = result.result()
            except Exception as err:
                errors.append({"id": id, "error": str(err)})
            if len(data) % 15 == 0 or errors:
                print(json.dumps({"complete": len(data), "errors": errors}), flush=True)
    if errors:
        (DEST / "import-errors.json").write_text(json.dumps(errors, indent=2), encoding="utf-8")
        raise RuntimeError(f"Incomplete import: {len(data)}/151; {errors}")

    ordered = {id: data[id] for id in range(1, 152)}
    source = """/** Authentic pinned PMDCollab shiny motion sheets; see public/art/pokemon-shiny/PROVENANCE.md. */
import type { PokemonMotion } from './pokemon-motion';
export const POKEMON_SHINY: Readonly<Record<number, PokemonMotion>> = """ + json.dumps(
        ordered, separators=(",", ":")
    ) + """;
export function pokemonShinyMotion(id: number): PokemonMotion | undefined {
  return Number.isInteger(id) && id >= 1 && id <= 151 ? POKEMON_SHINY[id] : undefined;
}
"""
    (ROOT / "src/pokemon-shiny.ts").write_text(source, encoding="utf-8")
    manifest = {
        "repository": "https://github.com/PMDCollab/SpriteCollab", "revision": motion.REVISION,
        "variantPath": "sprite/{nationalDex:04d}/0000/0001",
        "directions": motion.DIRECTIONS, "sourceTickRate": 60, "speciesCount": len(data),
        "missingActions": [], "fallbacks": [], "recolorsGenerated": False,
        "species": [evidence[id] for id in range(1, 152)],
    }
    (DEST / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    actions = [action for proof in evidence.values() for action in proof["actions"]]
    report = {
        "species": len(data), "actions": len(actions), "frames": sum(action["frames"] for action in actions),
        "allEightDirections": all(data[id][action]["rows"] == 8 for id in data for action in ("walk", "idle", "attack")),
        "allPixelIdenticalToUpstream": all(action["verifiedPixelIdentical"] for action in actions),
        "normalDimensionsMatches": sum(action["matchesNormalDimensions"] for action in actions),
        "normalAlphaMatches": sum(action["matchesNormalAlpha"] for action in actions),
        "colorChanges": sum(action["differsFromNormalColors"] for action in actions),
        "identicalToNormalActions": [{"id": id, "animation": action["animation"]}
            for id in sorted(evidence) for action in evidence[id]["actions"]
            if not action["differsFromNormalColors"]],
        "minimumDistinctWalkFramesPerDirection": min(min(action["distinctFramesByDirection"])
            for action in actions if action["output"].endswith("/walk.png")),
        "pngBytes": sum(p.stat().st_size for id in data for p in (DEST / str(id)).glob("*.png")),
        "unavailableSpecies": [],
    }
    (DEST / "validation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    (DEST / "PROVENANCE.md").write_text(f"""# Shiny Pokémon motion assets

These are the published shiny variants of the first 151 Pokémon in
[PMDCollab/SpriteCollab](https://github.com/PMDCollab/SpriteCollab/tree/{motion.REVISION}),
pinned to `{motion.REVISION}`, the same revision as the normal animation set.
Each species uses the upstream base-form shiny folder `sprite/NNNN/0000/0001`.
The import retains all eight supplied directions for walking, idle and attacks.

No hue filter or invented recolor is applied. The project-local importer crops
transparent margins and repacks source frames using their supplied shadow/ground
anchors. It verifies the exact RGBA bytes of every retained source frame. Timing,
direction order and hit frames come directly from the corresponding upstream XML.
The portrait is the visible crop of the first supplied idle frame.

`manifest.json` records exact source URLs and SHA-256 hashes for animation sheets,
shadow markers, XML, credits and output assets. `validation.json` records coverage,
pixel-preservation checks, animation directions and comparison to normal sheets.
The shiny metadata is independent so any upstream geometry difference remains
represented rather than being forced into the normal sprite dimensions.
Diglett (#050) and Dugtrio (#051) have identical normal and shiny walking sheets:
these upstream burrowing animations show moving earth. Their idle and attack
animations and portraits retain their distinct supplied shiny coloration.

The import script is `scripts/import-shiny-motion.py`. It downloads data only,
never upstream executable code. Original inputs are cached under `.asset-cache`.

## Credits and usage

Per-species `credits.txt`, `credit_names.txt`, `LICENSE.md` and `UPSTREAM-README.md`
are retained verbatim. These third-party Pokémon assets are excluded from the
project code's GPL-3.0-only license. Their inclusion in the local test build does
not change the existing public-release asset clearance requirement.
""", encoding="utf-8")

    sheet = Image.new("RGB", (15 * 96, 11 * 96), "#e8efdf")
    draw = ImageDraw.Draw(sheet)
    for id in ordered:
        x, y = ((id - 1) % 15) * 96, ((id - 1) // 15) * 96
        portrait = Image.open(DEST / str(id) / "portrait.png").convert("RGBA")
        scale = min(2, 70 / max(portrait.size))
        portrait = portrait.resize((round(portrait.width * scale), round(portrait.height * scale)), Image.Resampling.NEAREST)
        sheet.paste(portrait, (x + (96 - portrait.width) // 2, y + 71 - portrait.height), portrait)
        draw.text((x + 36, y + 77), f"{id:03d}", fill="#15372d")
    sheet.save(DEST / "CONTACT-SHEET.png")
    print(json.dumps(report), flush=True)


if __name__ == "__main__":
    main()
