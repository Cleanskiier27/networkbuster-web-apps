class Cask
  app "NetworkBuster Server.app"
  homepage "https://networkbuster.net"
  url "https://github.com/NetworkBuster/networkbuster.net/releases/download/v#{version}/NetworkBuster-#{version}.zip"
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"
  version "1.0.1"
  
  name "NetworkBuster"
  desc "High-performance network server built with Node.js and Express"
  license "MIT"

  depends_on macos: ">= :big_sur"
  depends_on formula: "node@24"

  def install
    # Extract and install
    system "unzip", "-q", cached_download, "-d", staged_path
    
    # Copy to Applications
    prefix.install "NetworkBuster Server.app"
    
    # Create symlink to /usr/local/bin
    bin.install_symlink prefix/"NetworkBuster Server.app"/Contents/MacOS/networkbuster
  end

  def post_install
    # Create launch agent
    system "launchctl", "load", "-w", "#{prefix}/NetworkBuster Server.app/Contents/MacOS/com.networkbuster.plist"
  end

  def uninstall_postflight
    # Unload launch agent
    system "launchctl", "unload", "-w", "#{prefix}/NetworkBuster Server.app/Contents/MacOS/com.networkbuster.plist"
  end

  test do
    system "#{bin}/networkbuster", "--version"
  end
end
