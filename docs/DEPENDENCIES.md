# Dependencies and network access

## Playing

| Component | Version / requirement | Included in the Windows package? |
|---|---|---|
| Node.js | 22.23.3, Windows x64; official archive pinned by SHA-256 | Yes, `runtime/node.exe` and its full license |
| Browser | Current Edge or Chrome with JavaScript and local browser storage | No; required on the computer |
| Phaser | 3.90.0, MIT | Bundled into the built JavaScript |
| eventemitter3 | 5.0.4, MIT; indirect Phaser dependency | Bundled into the built JavaScript |
| Silkscreen | Local font, SIL OFL 1.1 | Yes |
| Images and cries | 1,447 verified runtime files including the font; hashes in `release-config/runtime-assets.json` | Included in full developer/player packages; third-party rights remain separate |

No accounts, API keys, external services or separately installed games are
required. Launch and gameplay use the local server. Browser game code has no
intended external network requests or telemetry.

## Developing and building

| Tool | Supported / pinned version | Purpose |
|---|---|---|
| Node.js | 22.23.3 or later 22.x patch; `.nvmrc` pins 22.23.3 | Tests, build, server and release tools |
| npm | Version supplied with Node.js; lockfile format 3 | `npm ci`, scripts and advisory checks |
| TypeScript | 5.9.3, Apache-2.0 | Type checking |
| Vite | 8.3.4, MIT | Development server and build |
| Git | Optional | Cloning, commits and pull requests |

`package-lock.json` records exact transitive packages, platform variants,
download URLs and integrity hashes. `npm ls --all` shows the installed tree;
`npm audit` checks known npm security advisories. Results change over time.
`.npmrc` sets `ignore-scripts=true`; validated installation and builds do not
require dependency lifecycle scripts. Localization adds no external service
or runtime dependency: both languages are bundled locally.

## Optional asset tools

These are unnecessary for installing, testing, building or playing. The complete
developer project already includes the media and available editing sources.
For deliberately reimporting or repacking media:

| Tool | Pin / license | Installation and use |
|---|---|---|
| sharp | 0.35.5, Apache-2.0; native transitive libraries have separate licenses | Run `npm ci` inside `tools/assets/`, which has its own lockfile. Building, interior and world importers use this local installation. |
| Python | 3.12 in the original workflow; compatible newer versions may work | Install separately if needed; use a project virtual environment. |
| Pillow | 13.0.0, HPND; pinned in `requirements-assets.txt` | Install in that virtual environment for sprite, trainer and forest imports. |

`build-kanto-catalog.py` uses only the Python standard library. Trainer imports
use included source images under `public/art/trainers-v5/generated/`.
See the [developer guide](DEVELOPMENT.md). sharp was installed separately,
audited with npm, and checked with an included image on Windows x64. The entire
Python import pipeline was not rerun for this release.

Some importers fetch data, images or XML from pinned `raw.githubusercontent.com`
revisions. They do not run during installation or CI. A successful download
does not grant redistribution rights; see [asset status](ASSET-STATUS.md).
The optional Python environment is outside the npm audit and is not installed
by the normal build.

## When is the internet used?

| Operation | Destination / information sent |
|---|---|
| `npm ci` | npm registry; package names and requested versions |
| `npm audit` | npm advisory service; dependency names and versions, no game save |
| First complete player package build | `nodejs.org`, if the hash-verified runtime archive is not cached |
| Optional media import | Public sources fixed in the import scripts |
| GitHub CI / Dependabot | GitHub and npm; source checks and update proposals |
| Launching and playing | Only `127.0.0.1`; no intended gameplay telemetry or media downloads |

Keep [third-party notices](../THIRD-PARTY-NOTICES.md) and supplied license texts.
The project's GPL does not replace third-party licenses.
