# Security audit and GitHub preparation

Date: **October 21, 2026**. Starting version: **1.0.0-rc.6.2**.
Remediated version: **1.0.0-rc.6.3**.

This is a historical audit. The later complete rc.6.4 developer distribution,
including media, sanitized editing sources and optional tools, is covered in
[DEVELOPER-VALIDATION.md](DEVELOPER-VALIDATION.md). Media exclusions below still
apply to the smaller code export, not the full developer package.

## Scope and method

Reviewed the local HTTP server, browser inputs and save imports, network and
process calls, npm dependencies, pinned Node runtime, build, source/player
exports, licenses/media status and GitHub workflow. Scanned filenames and
contents of the intended public source set. Exercised synthetic attacks and
checked extracted packages.

At the time, the working directory had no Git repository, commit history or
remote configuration to audit. The clean export was a new snapshot. The parent
workspace, synced references, old QA packages and caches were not upload targets.

## Confirmed findings and fixes

| ID | Severity | Evidence / impact | Remediation |
|---|---|---|---|
| S-01 | Medium: disclosure in ordinary builds | Vite copied the entire `public/` tree to `dist/`, including prompts/importers with private machine paths. The previous Windows package was already narrower. | Disabled `publicDir`; build and development media routes use the reviewed runtime allowlist. Verify built files for unexpected content and sensitive strings. |
| S-02 | Medium: incomplete export/Git boundary | Recursive source export included `scripts/__pycache__/*.pyc`, skipped by the old text scanner. Git ignore rules missed content including original-overworld. | Explicit source file list, scan every file's contents, reject caches/secrets/private paths and links in all path components. The rc.6.3 code-only Git policy excluded `public/` except the font and named notices; rc.6.4 deliberately expands this to reviewed developer media. |
| S-03 | Low: imported saves could cause later failures | Enemy species accepted the string `constructor` as an existing Pokémon reference; encounters and saved room objects shared the flaw. | Require integer own-property Pokémon IDs. Negative tests cover prototype names, strings, fractions and out-of-range IDs, including full backups. |

No confirmed remote code execution or credential exfiltration was found within
this scope. This is not a guarantee that no other issue exists.

## Additional hardening

- Server: exact loopback host and actual port, reject foreign origins/cross-site
  requests, GET/HEAD only, restrictive CSP and frame/permission headers,
  bounded header/request timeouts, traversal and webroot-link checks, no write API.
- Release: exactly one mode; public gates require literal boolean `true`.
  Reject missing media and stale builds. Build metadata ties version to reviewed source.
- ZIP: relative paths only; reject traversal, backslashes, drive names and
  alternate-data-stream syntax. Private workspace contents are not copied wholesale.
- Runtime: exact expected `nodejs.org` HTTPS URLs, no redirects, size/time limits
  and SHA-256 checks. No downloads during play.
- Dependencies: exact direct versions, complete lockfile, registry/integrity checks,
  installation scripts disabled.
- CI: read-only permissions, no persisted checkout credentials, actions pinned
  to full commit SHAs, Windows/Linux matrix, dependency and export checks,
  no automatic publication.

## Validation record

Initial baseline: 141 passing core tests. npm audit reported **0 known
vulnerabilities** in locked production/development dependencies on the audit
date. The official Node index was checked for **22.23.3**, and the archive pin
matched official checksums.

Final rc.6.3 checks: 160 full local tests, 149 core tests in freshly extracted
source and nine targeted security/server tests passed. The Windows launcher
worked from a path containing spaces with an empty PATH using the bundled runtime.
Verified hashes for 1,482 package files, and fetched all 1,451 web files over
HTTP with byte-for-byte matches. A second launch recognized the running server.

[SECURITY-VALIDATION.json](SECURITY-VALIDATION.json) records security tests,
full tests, type checking, controlled build, fresh source installation and
portable launch. These local checks did not themselves establish a GitHub CI run.

## Remaining limits at that audit

1. No documented public redistribution permission for original Pokémon media.
   The then-public code export omitted those binaries and was not playable.
   Characters, trademarks and generated depictions require separate consideration.
2. Independent clean Windows installation, full manual playthrough and long-term
   acceptance were outstanding; a local package test did not replace them.
3. No repository/release upload had yet occurred. This historical point was
   superseded by rc.6.4 publication; older test packages were not retroactively cleared.
4. No comprehensive fuzzing, formal proof, external penetration test, full
   optional Python-pipeline audit or audit of every transitive library's source.
   Pattern-based secret scans can miss unknown token formats and sensitive prose.
5. Same-user malware and malicious browser extensions are not isolated.
   Hashes detect changes but are not package signatures.

## Primary references

- [Node.js 22.23.3](https://nodejs.org/en/blog/release/v22.23.3),
  [official checksums](https://nodejs.org/dist/v22.23.3/SHASUMS256.txt),
  [version index](https://nodejs.org/dist/index.json).
- [Vite release support](https://vite.dev/releases).
- [GitHub Actions security](https://docs.github.com/en/actions/reference/security/secure-use).
- `npm audit --json` on the audit date; current results may differ.
  Media sources are listed in [Asset status](ASSET-STATUS.md).
