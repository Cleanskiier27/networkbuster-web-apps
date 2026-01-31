#!/bin/bash
# AppImage build script for NetworkBuster
# Creates a portable AppImage for Linux systems

set -e

VERSION="1.0.1"
ARCH="x86_64"
APP_NAME="NetworkBuster"
REPO="https://github.com/NetworkBuster/networkbuster.net"

echo "Building AppImage for $APP_NAME $VERSION..."

# Create AppDir structure
mkdir -p AppDir/usr/{bin,lib,share/{applications,icons}}
mkdir -p AppDir/usr/share/doc/$APP_NAME

# Download and extract application
cd AppDir
wget -q "$REPO/archive/v$VERSION.tar.gz" -O networkbuster.tar.gz
tar -xzf networkbuster.tar.gz
mv networkbuster.net-$VERSION/* .
rmdir networkbuster.net-$VERSION
rm networkbuster.tar.gz

# Install dependencies
npm install --production --prefix ./

# Create wrapper script
cat > usr/bin/networkbuster << 'EOF'
#!/bin/bash
exec "$(dirname "$0")/../lib/node/bin/node" "$(dirname "$0")/../app/server.js" "$@"
EOF
chmod +x usr/bin/networkbuster

# Copy Node.js (or use system node)
# cp /usr/bin/node usr/lib/

# Create desktop entry
cat > usr/share/applications/networkbuster.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=NetworkBuster
Comment=High-performance network server
Exec=networkbuster
Icon=networkbuster
Categories=Utility;Server;
Terminal=true
EOF

# Create AppRun script
cat > AppRun << 'EOF'
#!/bin/bash
APPDIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$APPDIR/usr/bin:$PATH"
export LD_LIBRARY_PATH="$APPDIR/usr/lib:$LD_LIBRARY_PATH"
exec "$APPDIR/usr/bin/networkbuster" "$@"
EOF
chmod +x AppRun

cd ..

# Download and use appimagetool
wget -q https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-$ARCH.AppImage
chmod +x appimagetool-$ARCH.AppImage

# Create AppImage
APPIMAGE_VERSION=$VERSION ./appimagetool-$ARCH.AppImage AppDir NetworkBuster-$VERSION-$ARCH.AppImage

echo "✓ AppImage created: NetworkBuster-$VERSION-$ARCH.AppImage"
