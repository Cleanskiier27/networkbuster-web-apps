Network Booster contribution (PR-ready)

This folder contains a contribution to the `Cleanskiier27/Final` repository: a hardened cross-platform Network Boost utility with safe apply and restore functionality and documentation.

Included:
- `network-boost.ps1` — Windows PowerShell script (hardened and creates `network-boost-restore.ps1`).
- `network-boost.sh` — Linux shell script (hardened and creates `network-boost-restore.sh`).
- `docs/NETWORK-BOOST.md` — usage and notes for maintainers.
- `CONTRIBUTORS.md` — records contribution and author.

How to apply in upstream repo:
1. Copy `network-boost.*` into `scripts/` or `tools/` in the upstream repo.
2. Add installer integration or CI steps as desired.
3. Run tests on representative Windows and Linux machines (see docs/NETWORK-BOOST.md).

This contribution was prepared by: GitHub Copilot (contributor).

Note: This contribution intentionally does **not** include a LICENSE file — upstream maintainers should add or apply an appropriate license when accepting this contribution.

Initial release: v0.1.0 (publish automation script included as `publish.sh`).
