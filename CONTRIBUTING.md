# Contributing

Set up the complete developer project using [Installation](docs/INSTALLATION.md).
The [developer guide](docs/DEVELOPMENT.md) covers code layout, asset editing and
validation. Normal contributions need only Node.js and npm; no AI service,
Python or media import is required.

1. Fork and clone the repository, then create a branch.
2. Make a focused, understandable change. Add an appropriate regression test
   for a bug fix and inspect new gameplay features in the browser.
3. Run `npm run check`, `npm test`, `npm run check:release`,
   `npm run check:developer` and `npm run build`.
4. Commit and open a pull request describing the problem, change, checks and
   remaining limitations. Screenshots help for visible changes.

Write public documentation in English. Keep English as the default interface
language and preserve the German option. Add new visible messages to
`src/locales/en.json`; test both languages and avoid changing saved identifiers.

Do not commit credentials, personal saves, machine paths, caches,
`node_modules` or build/release output. Reviewed active media and available
editing sources belong in the full project. New media needs traceable sources
and license information; do not relicense third-party content under the GPL.

Add code/documentation files deliberately to `release-config/source-files.json`;
add media and editing sources to `developer-files.json`. Register runtime files
in `runtime-assets.json` as well. After an intentional image/audio edit, run
`npm run assets:refresh` and inspect the hash changes.

Change dependencies only with a reviewed lockfile. GitHub Actions stay pinned
to full commit SHAs. Importers run only when called manually, never during
installation, launch or CI. Follow [SECURITY.md](SECURITY.md) for security reports.

Contributed original code is accepted under GPL-3.0-only. Preserve source
credits and third-party notices.
