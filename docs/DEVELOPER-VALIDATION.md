# Complete developer project validation

Historical baseline: **1.0.0-rc.6.4**, October 21, 2026.

This supplements the [rc.6.3 security audit](SECURITY-AUDIT.md). The complete
developer package adds media and editing sources; the smaller code-only export
remains available separately.

## Changes in rc.6.4

- Complete developer export from explicit code/media lists, including source
  images, animation XML, credits, palettes, room data and import tools.
- Three machine-dependent image importers now use an optional project-local
  sharp installation with an exact version and separate lockfile.
- Private absolute paths in three prompts replaced with included relative
  source-image paths. No runtime image or audio file changed.
- Developer handbook, complete installation and contribution workflow, and
  controlled updates to media inventories.
- Export scans all contents for existing secret/private-path patterns, rejects
  links/traversal and verifies every runtime asset. Full-checkout CI runs all tests.
- Explicit separate metadata: `codeLicense: GPL-3.0-only`,
  `allContentsOpenSource: false`. Completeness does not relicense third-party content.

Public upload of the complete project and current media was explicitly requested
on October 21, 2026. Metadata distinguishes that approval from unresolved media rights.

## rc.6.4 validation

| Check | Result |
|---|---|
| Reviewed complete project | 2,524 project files plus package information and inventory in the ZIP |
| Runtime media | All 1,447 files present and hash-identical to the reviewed baseline; none removed or modified |
| Working-project tests | 164 passed, no failures or skips |
| Fresh developer archive in a path with spaces | `npm ci`, full-media doctor, 164 tests and build passed |
| Package inventory | All 2,525 entries checked for size/SHA-256 before launch; inventory does not list itself |
| Fresh project's local server | All 1,451 web files fetched and byte-matched; foreign origins/raw-source access rejected |
| npm dependencies, including development | Zero known vulnerabilities on the check date |
| Separate optional sharp dependencies | Zero known vulnerabilities; fresh install and PNG conversion passed |
| Portable Node image importers | Building, interior and overworld importers succeeded in an isolated copy; working/released media unchanged |
| Export/privacy checks | All 2,524 approved files scanned; no matches for tested private-path/credential patterns; link/traversal checks passed |
| Documentation links | Relative links in authored documentation resolved in the complete export |

These checks ran on the Windows x64 development machine. Subsequent GitHub
publication also passed CI on Windows and Linux for commit
`df664ed219e0e5f9f5b00e0570d946c93a6be13b`:
[CI run](https://github.com/CheswickDEV/Pokemon-Survivors/actions/runs/39567761569).
They do not establish an independent fresh OS install or a new full manual
playthrough. Earlier package/server security tests remain separately documented.
Vite bundle/font notices were not test failures; a successful build alone does
not establish error-free interactive play.

The optional Python pipeline is not automatically installed or fully rerun.
Existing source images and finished media are usable without reimport.
Pattern-based scans may miss unknown token formats and sensitive free text.

## rc.6.5 language update

English becomes the default, with persistent German selection. Translation is
confined to presentation: save IDs and game rules remain unchanged. Automated
tests cover defaults, legacy profiles, full-backup language preservation,
dynamic text, boundaries and bilingual Pokédex search. Browser checks cover
switching, reload persistence, menus, accessible labels and DOM safety.
Current build/package results are recorded in the rc.6.5 release validation
receipt. The historical rc.6.4 counts above remain attached to that version.
