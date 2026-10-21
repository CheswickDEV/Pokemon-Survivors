# Security

The current version is **1.0.0-rc.6.5**. Findings, fixes and limits are recorded
in the [rc.6.3 security audit](docs/SECURITY-AUDIT.md) and
[developer package validation](docs/DEVELOPER-VALIDATION.md).
Older local test packages are not presented as currently audited downloads.

The game runs in a browser. Its file server listens only on `127.0.0.1`,
accepts GET/HEAD and does not write game saves to the server. Saves and settings
stay in the browser profile. Normal startup requires no account, telemetry,
cloud sync, service installation or administrator access.

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/CheswickDEV/Pokemon-Survivors/security/advisories/new).
If that option is unavailable, open an issue asking for a private reporting
channel without attaching exploit code, credentials or personal saves.

Include the version, affected component, prerequisites, observed impact and,
if possible, a small synthetic reproduction. Report ordinary gameplay bugs
through the bug template. No fixed response time is promised; this project
does not have professional support.

## Limits

- A clean dependency scan does not guarantee the absence of vulnerabilities.
- Imported JSON is validated. Its checksum detects corruption; it is not a
  signature or proof that the file is trustworthy.
- Programs running as the same user, malicious browser extensions and a
  compromised operating system are outside the game's isolation boundary.
  The local server is not an internet-facing service.
- The bundled Node runtime is checked against a pinned SHA-256 and official
  HTTPS checksums. This does not code-sign the complete ZIP.
- Publication approval and third-party media rights are separate matters.
