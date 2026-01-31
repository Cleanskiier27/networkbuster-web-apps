Network Boost — contribution docs

Overview
- This contribution adds cross-platform utilities to safely tune network settings for higher throughput and better performance in certain environments.

Files
- `scripts/network-boost.ps1` — Windows PowerShell script (hardened, produces `network-boost-restore.ps1`).
- `scripts/network-boost.sh` — Linux script (hardened, produces `network-boost-restore.sh`).

Usage (Windows)
- Dry-run (recommended): open an elevated PowerShell and run:
  powershell -ExecutionPolicy Bypass -File scripts\network-boost.ps1
- Apply (interactive): powershell -ExecutionPolicy Bypass -File scripts\network-boost.ps1 -Apply
- Apply non-interactive (CI / installer): powershell -ExecutionPolicy Bypass -File scripts\network-boost.ps1 -Apply -Confirm:$false
- After apply: review `network-boost.log` and use `network-boost-restore.ps1` to revert if needed.

Usage (Linux)
- Dry-run: sudo ./scripts/network-boost.sh
- Apply: sudo ./scripts/network-boost.sh --apply
- Apply w/out prompt and persist: sudo ./scripts/network-boost.sh --apply --no-confirm --persist
- After apply: review `network-boost.log` and use `network-boost-restore.sh` to revert.

Safety & Testing
- Test in a non-production environment first.
- Scripts create restore scripts and logs; reviewers should inspect these before merging.

Integration notes for maintainers
- Place scripts in `scripts/` in the upstream repository.
- Add an installer option if desired (NSIS page already implemented in NetworkBuster repo, but needs to be mirrored in Final repo installer if present).
- CI: run dry-run linter and optionally test script generation on Windows and Linux runners.

Author & Contribution
- Prepared by: GitHub Copilot (contribution ready for cleanskiier27/Final)
- License: follow upstream project license (MIT in this repo)
