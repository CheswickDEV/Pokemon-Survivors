# Pokémon Survivors — 1.0.0-rc.6.5

A local browser adventure: move your trainer, build a team of automatically
battling Pokémon, and explore Kanto with Survivors-style combat.
Five run modes, four difficulty levels, 151 Pokémon, and separate save slots.

**English is the default language.** Select **English / Deutsch** in the main
menu or **Settings** to switch at any time. Your choice is saved locally and
included in profile backups. Pokémon names, moves, story dialogue, menus and
combat messages follow your selection. Pokédex search accepts either language.

**The complete developer download includes the game code, all current media,
tests and tools for local development.** No account, API key, paid tool or
installed Pokémon game is required.

**License:** original project code is **GPL-3.0-only**. Pokémon graphics, cries
and other third-party content retain their respective rights. The entire game
is **not fully freely licensed**: permission to redistribute those media has
not been documented. [Asset status](docs/ASSET-STATUS.md) ·
[Third-party notices](THIRD-PARTY-NOTICES.md)

[Complete download (prerelease)](https://github.com/CheswickDEV/Pokemon-Survivors/releases/tag/v1.0.0-rc.6.5) ·
[Repository](https://github.com/CheswickDEV/Pokemon-Survivors)

## Quick start

Install [Node.js 22.x](https://nodejs.org/en/download), **22.23.3 or later in the
22.x line**, including npm. Use a current Edge or Chrome browser. Git is useful
for contributing but is not required for a ZIP download.

1. Extract the complete **developer.zip**, or clone the repository. Open a
   terminal in the folder containing `package.json`.
2. Install dependencies and check the game files:

```text
npm ci
npm run doctor -- --player
```

3. Start the development server:

```text
npm run dev
```

Open the local address printed in the terminal. Changes in `src/` appear
automatically during development. Press **Ctrl+C** in the terminal to stop.
After the initial installation, normal local development and play work offline.

To run a production build:

```text
npm run build
npm start
```

Open **http://127.0.0.1:4173/**. Browser saves are separate for each address and
port; choose **Back up everything** in camp before moving to another one.

## Develop and contribute

- [Developer guide: code layout, editing assets, tests](docs/DEVELOPMENT.md)
- [Installation and troubleshooting](docs/INSTALLATION.md)
- [Dependencies and network access](docs/DEPENDENCIES.md)
- [Gameplay and controls](docs/GAMEPLAY.md)
- [Contributing and pull requests](CONTRIBUTING.md)
- [Security audit](docs/SECURITY-AUDIT.md) · [Developer package validation](docs/DEVELOPER-VALIDATION.md)
- [Changelog](CHANGELOG.md) · [Reporting security issues](SECURITY.md)

Before submitting a contribution:

```text
npm run check
npm test
npm run check:release
npm run check:developer
npm run build
```

## Download types

| Package | Contents |
|---|---|
| **developer.zip** | Complete editable project with current media, source credits and optional import tools; install Node.js separately |
| **source.zip** | Smaller code export without Pokémon images or cries; useful for code review, not playable on its own |
| **Windows-x64-LOCAL-ONLY.zip** | Local player test package with a bundled runtime; extract and double-click **Start game.cmd** |

The GitHub release provides the complete developer archive as a prerelease
for local development. Publishing it does not confirm third-party media
permissions or an independent full playthrough. The Windows package remains
a local test package. To create packages yourself:

```text
npm run release:developer
npm run release:source
npm run release:local
```

File inventories and SHA-256 checksums are written to `release/`.
See [Preparing and publishing on GitHub](docs/GITHUB-RELEASE.md).

Unofficial fan project. Not affiliated with Nintendo, GAME FREAK, Creatures,
or The Pokémon Company.
