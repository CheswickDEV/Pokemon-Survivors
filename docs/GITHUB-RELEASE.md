# Preparing and publishing the complete project

The repository includes **code, tests, active game media and available editing
sources**. Use the complete developer export, not the smaller code-only export.
Media and original software retain the separate licenses described in
[Asset status](ASSET-STATUS.md).

## Repository workflow

1. Validate the complete working project:

```text
npm ci
npm audit --audit-level=low
npm run check
npm test
npm run check:release
npm run check:developer
npm run build
npm run release:developer
```

2. Extract `Pokemon-Survivors-…-developer.zip` into a separate folder. It contains
   the reviewed project files. The parent private workspace, including
   `sources/`, `analysis/`, caches and QA archives, is not an upload target.
3. Review the file list and changes. If necessary, initialize a new repository
   with `git init -b main`. Commit with your intended public Git identity,
   configure the actual repository URL and push. The export contains no old
   private Git history. For an existing repository, preserve its history.
4. Describe it as a complete editable Pokémon fan project with GPL-3.0-only
   original code and separate media rights. Do not describe the complete media
   set as unrestricted open source.
5. Check CI on GitHub. Enable private vulnerability reporting and available
   secret scanning/push protection. Local preparation alone does not enable
   repository settings.
6. Contributors can follow [CONTRIBUTING.md](../CONTRIBUTING.md).

Repository: [CheswickDEV/Pokemon-Survivors](https://github.com/CheswickDEV/Pokemon-Survivors).
Publication of the full developer project and current media was explicitly
requested on October 21, 2026. rc.6.4 was published as a prerelease for local
development. rc.6.5 adds English by default with selectable German and English
public documentation. The release page lists the actual uploaded files.

## Downloads

The developer download is `release/*-developer.zip`. Its checksum is in
`release/DEVELOPER-SHA256SUMS.txt` and `developer-manifest.json`.
GitHub's **Code → Download ZIP** also includes media in the full repository,
but Node.js must be installed separately. Git LFS is not needed.

`npm run release:windows` (on Windows) creates the ready-to-play prerelease ZIP
with a graphical launcher, the pinned runtime and exact corresponding source.
Checksums are in `WINDOWS-SHA256SUMS.txt`; metadata is in `windows-manifest.json`.
This command requires publication approval and a prerelease version/channel.
It preserves the separate media-rights and full-acceptance status fields.
The owner explicitly requested this Windows prerelease on October 21, 2026.

`npm run release:local` creates the local Windows player test package with
build, runtime, launcher and corresponding code. The separate developer
archive also includes all available editing sources and tools.

The open items in [Release readiness](RELEASE-READINESS.md) must be resolved
before labeling a player release as publicly cleared. `release:public`
checks those status fields. Creating a complete developer export does not
silently change them. The Windows prerelease is not a cleared stable release.

The rc.6.5 Windows package was added after the original developer release.
The original tag and downloads stay unchanged. The Windows ZIP includes its
exact corresponding source, including the added launcher and build scripts;
this source is also available as a separate Windows-player-source.zip asset.

CI checks Windows and Linux, runs all tests for a full developer checkout,
and produces an additional code-only artifact. It does not publish releases
or download media. Dependabot proposes updates but does not merge them.

## New versions

Update `package.json`, both root version entries in `package-lock.json`,
`release-config/status.json`, the server default version and the displayed
game version together. Update the changelog and validation report, check
dependencies, rebuild and export. Verify archive hashes and file inventories.
Old archives do not automatically belong to the new release.

Commit and push the reviewed changes, wait for CI on that exact commit, then
create a new version tag and prerelease with English release notes. Do not move
an already published version tag to disguise changed download contents.

Windows package generation downloads the pinned official Node runtime if
necessary and checks its SHA-256. Launching the game downloads nothing.
