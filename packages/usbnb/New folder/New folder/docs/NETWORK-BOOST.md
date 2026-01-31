# Network Boost — Overview

This document describes the optional "Network Boost" tuning available during installation or as a manual step.

What it does (safe, recommended changes)
- Windows (via `netsh`): adjusts TCP autotuning, congestion provider (CTCP if available), RSS, and ECN settings (non-destructive; reversible).
- Linux (via `sysctl`): increases socket buffers, enables window scaling, optionally chooses congestion control if available (e.g., BBR).

How it's applied
- During installation you can opt in by checking "Apply Network Boost" on the installer page. The installer runs a bundled script `scripts/network-boost.ps1` with the `-Apply` flag.
- Manually via npm script:
  - Show recommended changes (dry-run): `npm run show:network-boost`
  - Apply non-interactively: `npm run apply:network-boost`

Reversion and safety
- The script records current settings in `scripts/network-boost.log` and creates a `scripts/network-boost-restore.ps1` (Windows/Linux) to restore previous settings.
- The script will prompt for confirmation unless run with `-Confirm:$false`.

Notes
- Changes requiring admin/root will fail without proper privileges.
- Reboot may be required for some Windows settings to take effect.
- Always test in a controlled environment before applying to production servers.