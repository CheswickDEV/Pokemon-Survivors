# Installation and first launch

## Complete developer project

The **developer.zip** contains the current source code, images, cries, local
data, tests and available media sources. The full repository contains the same
project. The smaller **source.zip** contains code and notices only; it cannot
be played without the game media.

1. Install [Node.js](https://nodejs.org/en/download) **22.23.3 or a later 22.x
   patch**, including npm. Reopen existing terminals afterward. Node 24 and
   other major versions have not been validated for this project.
2. Extract the entire ZIP or clone the repository. Open a terminal in the
   folder containing `package.json`. Administrator access is not needed.
3. Install dependencies and verify the files:

```text
npm ci
npm run doctor -- --player
```

4. Start development mode:

```text
npm run dev
```

Open the printed address, normally **http://127.0.0.1:5173/**. The server only
listens locally. Source changes update automatically. Press **Ctrl+C** in the
terminal to stop it.

`npm ci` installs into this project using the versions in `package-lock.json`
and needs internet access for the initial download. `.npmrc` disables dependency
installation scripts. No global npm packages are needed. Normal development and
play work offline afterward. Git, Python and asset tools are optional.

To check and run a production build:

```text
npm run check
npm test
npm run build
npm start
```

Open **http://127.0.0.1:4173/**, not `index.html` directly. Development and
production addresses have separate browser saves.

English is selected by default. Choose **Deutsch** in the main menu or in
**Settings** for German. The selection persists in your browser profile and
full backups. Existing profiles without a language setting default to English.

Windows x64 with current Edge/Chrome is the locally checked target. The
repository also runs build and automated tests on Windows and Linux in GitHub
CI. Interactive play on macOS/Linux and ARM64 has not been separately accepted.
A keyboard and mouse are required; no measured minimum RAM/GPU specification
is claimed.

## Windows player test package

Extract the complete `Windows-x64-LOCAL-ONLY.zip` and double-click
**Start game.cmd**. The legacy **Spiel starten.cmd** filename remains available.
The Node runtime is included under `runtime/`; npm, Git, Python, Steam and an
installed Pokémon game are not required.

Keep the launch window open. The browser opens **http://127.0.0.1:4173/**.
Save before closing the launch window. No service or startup task is installed.
LOCAL-ONLY records the outstanding media rights and release acceptance work;
see [Release readiness](RELEASE-READINESS.md).

## Saves, updates and removal

- Before updating, choose **Back up everything** in camp. The JSON backup
  includes your profile, settings and run slots.
- Extract new versions separately and close the old launch window first.
  Commit or back up your own changes before updating a Git checkout. Run
  `npm ci` again after lockfile changes.
- Saves belong to a browser profile, host and port. Export and import a backup
  when switching any of these.
- To remove the game, close it and delete its project folder. Saves remain in
  the browser's site data for that local address until you clear it. Export first.

## Troubleshooting

| Problem | Solution |
|---|---|
| `node` or `npm` not found | Install Node.js 22.x with npm, reopen the terminal and check `node --version`. |
| PowerShell blocks `npm.ps1` | Use `npm.cmd` for the same commands, or Windows Command Prompt. No system execution-policy change is needed. |
| Wrong Node version | Use 22.23.3 or a later 22.x patch. An existing version manager can read `.nvmrc`. |
| Missing media | Use the full developer.zip. The smaller source.zip omits Pokémon media. |
| Changed media | After an intentional edit, run `npm run assets:refresh`, tests and build. Investigate unexpected changes first. |
| Build reported as stale | Run `npm run build` again after source or documentation changes. |
| Optional image tool missing | Follow the separate installation in the [developer guide](DEVELOPMENT.md), only if importing media. |
| Port 4173 in use | Close your own previous launch window. Do not terminate unrelated processes. |
| Blank page or missing pictures | Extract completely, use the local server and run the doctor check. |
| Progress seems missing | Check the browser profile and exact address, or import your backup. |
| Language did not persist | Another game tab may own save access. Close it and reload. The selector still works for the current session. |
| Windows warns about an unknown file | Check the source and checksum; do not disable security features. The overall package is not signed. |

PowerShell checksum: `Get-FileHash .\FILENAME.zip -Algorithm SHA256`.
Compare developer archives with `DEVELOPER-SHA256SUMS.txt`, other packages with
`SHA256SUMS.txt`. A hash is not an independent signature.

Keep the [third-party notices](../THIRD-PARTY-NOTICES.md). A complete developer
download does not place third-party media under the project's GPL license.
