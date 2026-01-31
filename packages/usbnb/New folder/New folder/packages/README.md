# NetworkBuster Package Manager Configurations

This directory contains package manager configurations for distributing NetworkBuster across multiple platforms.

## Contents

### Windows Package Managers

#### Chocolatey
- **`chocolatey/networkbuster.nuspec`** - Chocolatey package manifest
- **`chocolatey/tools/chocolateyInstall.ps1`** - Installation script
- **`chocolatey/tools/chocolateyUninstall.ps1`** - Uninstallation script

Install via Chocolatey:
```powershell
choco install networkbuster
```

#### WinGet (Windows Package Manager)
- **`winget/NetworkBuster.NetworkBuster.yaml`** - WinGet manifest

Install via WinGet:
```powershell
winget install NetworkBuster.NetworkBuster
```

### Linux Package Managers

#### RPM (Red Hat, CentOS, Fedora)
- **`rpm/networkbuster.spec`** - RPM spec file

Build RPM package:
```bash
rpmbuild -ba packages/rpm/networkbuster.spec
```

#### DEB (Debian, Ubuntu)
- **`deb/control`** - Package metadata
- **`deb/preinst`** - Pre-installation script
- **`deb/postinst`** - Post-installation script
- **`deb/prerm`** - Pre-removal script
- **`deb/postrm`** - Post-removal script

Build DEB package:
```bash
dpkg-deb --build packages/deb networkbuster_1.0.1_amd64.deb
```

Install DEB package:
```bash
sudo dpkg -i networkbuster_1.0.1_amd64.deb
```

### NPM Package

- **`package.json`** - NPM package configuration (in root)

Publish to NPM:
```bash
npm publish
```

Install from NPM:
```bash
npm install networkbuster-server
```

## Building Packages

### Prerequisites

- **Windows**: Chocolatey, WinGet tools
- **Linux (RPM)**: rpm-build, rpmlint
- **Linux (DEB)**: build-essential, debhelper
- **NPM**: Node.js, npm

### Build Scripts

See [build-packages.sh](../scripts/build-packages.sh) for automated multi-platform builds.

## Distribution

### Release Process

1. Update version in all package files
2. Build packages for all platforms
3. Test packages in clean environments
4. Upload to package repositories:
   - Chocolatey Community Repository
   - WinGet Community Repository
   - GitHub Releases
   - NPM Registry
   - Linux distribution repositories

### Platform-Specific Requirements

**Chocolatey:**
- Requires Chocolatey moderator approval
- Community feed: https://community.chocolatey.org

**WinGet:**
- Submit via GitHub PR to https://github.com/microsoft/winget-pkgs
- Automated testing performed

**RPM:**
- Test on CentOS, Fedora, RHEL
- Consider COPR repository for community releases

**DEB:**
- Test on Ubuntu LTS and Debian stable
- Consider PPA for automated builds

**NPM:**
- Published to https://registry.npmjs.org
- Automated CI/CD builds

## Support

For issues with specific package managers, refer to:
- [Chocolatey Documentation](https://docs.chocolatey.org)
- [WinGet Documentation](https://docs.microsoft.com/en-us/windows/package-manager/)
- [RPM Documentation](https://rpm.org)
- [Debian Packaging Guide](https://www.debian.org/doc/debian-policy/)
- [NPM Documentation](https://docs.npmjs.com)
