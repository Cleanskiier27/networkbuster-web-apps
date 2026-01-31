# NetworkBuster - USB/NB Admin Device Registry

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecma-international.org/)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

**NetworkBuster** is a professional OS imaging and device management tool designed for creating bootable USB devices with various operating systems. The application provides an intuitive interface for managing device flashing operations with advanced features including GPU-accelerated data processing and satellite frequency mode capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Documentation](#documentation)
- [Supported Operating Systems](#supported-operating-systems)
- [Advanced Features](#advanced-features)
- [Project Structure](#project-structure)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Capabilities

- **🔥 OS Imaging**: Flash multiple Linux distributions, Windows, and utility tools to USB devices
- **🎯 Device Management**: Automatic USB device detection and management
- **⚙️ Configuration Options**: Customize hostname, users, network settings, and more
- **🤖 AI Agent Mode**: Automated device processing with queue management
- **📊 Progress Monitoring**: Real-time flashing progress and verification
- **🔐 Security**: Write verification and secure device handling

### Advanced Features

- **🎮 GPU Acceleration**: WebGPU-powered data processing for improved performance
- **📡 Satellite Frequency Mode**: Specialized support for satellite data and frequency analysis
- **📁 Universal Table Reader**: Support for 11+ data formats (CSV, JSON, HTML, XML, YAML, FITS, TLE, and more)
- **📈 Statistical Analysis**: Advanced data processing with GPU acceleration
- **🔄 Multi-Format Support**: Read and process various table and data formats

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Graphics**: WebGPU for GPU-accelerated computations
- **APIs**: File System Access API, Web USB API
- **Styling**: Modern CSS with gradient effects and animations
- **Architecture**: Modular JavaScript with separation of concerns

## 🚀 Getting Started

### Prerequisites

- Modern web browser with:
  - File System Access API support
  - WebGPU support (optional, for GPU features)
  - JavaScript enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Cleanskiier27/usbnb.git
   cd usbnb
   ```

2. Navigate to the application directory:
   ```bash
   cd GITREPOVSLOCAL/networkbuster
   ```

3. Open `index.html` in a supported web browser

**Note**: Due to browser security restrictions, the application must be served from a web server for full functionality. You can use:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000
```

Then open: `http://localhost:8000`

## 💻 Usage

### Basic Workflow

1. **Select Operating System**: Choose from 15+ pre-configured OS options
2. **Select USB Device**: Connect and select your target USB device
3. **Configure Settings**: Set up hostname, credentials, network, and other options
4. **Flash**: Start the imaging process with real-time progress monitoring

### Configuration Options

- **System Settings**: Hostname, username, password
- **Localization**: Timezone, keyboard layout
- **Network**: WiFi SSID, password, country code
- **Advanced**: SSH access, verification options, eject after completion

### AI Agent Mode

Enable automated processing for batch device operations:
- Automatic device detection and switching
- Queue management for multiple devices
- Background processing with status monitoring
- History tracking and reporting

## 📚 Documentation

Comprehensive documentation is available in the `GITREPOVSLOCAL/networkbuster/` directory:

### Quick Start
- **[INDEX.md](GITREPOVSLOCAL/networkbuster/INDEX.md)** - Complete documentation index with learning paths
- **[GPU-SATELLITE-QUICK-REF.md](GITREPOVSLOCAL/networkbuster/GPU-SATELLITE-QUICK-REF.md)** - Quick reference guide (5 min read)

### Complete Guides
- **[GPU-SATELLITE-README.md](GITREPOVSLOCAL/networkbuster/GPU-SATELLITE-README.md)** - Complete API reference for GPU and Satellite features
- **[GPU-SATELLITE-IMPLEMENTATION.md](GITREPOVSLOCAL/networkbuster/GPU-SATELLITE-IMPLEMENTATION.md)** - Implementation details and architecture
- **[FILE-MANIFEST.md](GITREPOVSLOCAL/networkbuster/FILE-MANIFEST.md)** - File structure and dependencies
- **[COMPLETION-REPORT.md](GITREPOVSLOCAL/networkbuster/COMPLETION-REPORT.md)** - Project completion status and metrics

### Code Examples
- **[gpu-satellite-examples.js](GITREPOVSLOCAL/networkbuster/gpu-satellite-examples.js)** - 8 complete working examples
- **[gpu-satellite-tests.js](GITREPOVSLOCAL/networkbuster/gpu-satellite-tests.js)** - 20+ test cases

## 🐧 Supported Operating Systems

### Linux Distributions
- Ubuntu 24.04 LTS (Desktop & Server)
- Debian 12 Bookworm
- Fedora 40 Workstation
- Arch Linux
- Linux Mint 21.3
- Raspberry Pi OS
- Tails OS (Privacy-focused)

### Windows
- Windows 11 Pro
- Windows 10 LTSC
- Windows Server 2022

### Utilities
- Clonezilla Live (Disk Cloning)
- GParted Live (Partition Editor)
- Memtest86+ (Memory Testing)
- Ventoy (Multi-boot USB)

## 🎮 Advanced Features

### GPU Application Module

The GPU module provides accelerated data processing capabilities:

```javascript
// Initialize GPU app
GPUApp.enabled = true;

// Process table with GPU acceleration
const table = await GPUApp.readTableFile(csvFile);
const result = await GPUApp.process(table);
```

**Features:**
- GPU-accelerated parallel computations
- Automatic CPU fallback for compatibility
- Performance monitoring and metrics
- Statistical analysis (min, max, mean, median, sum)

### Satellite Frequency Mode

Specialized module for satellite data processing:

```javascript
// Initialize satellite mode
SatelliteFrequencyMode.enabled = true;

// Read and process satellite data
const freqTable = await SatelliteFrequencyMode.readFrequencyTable(file);
const analysis = await SatelliteFrequencyMode.processFrequencyTable(freqTable);
```

**Capabilities:**
- TLE (Two-Line Element) data parsing
- Frequency allocation analysis
- Doppler shift calculation
- Ephemeris data processing
- Band allocation analysis

### Universal Table Reader

Support for multiple data formats:
- CSV, JSON, HTML, XML, TSV
- Binary, YAML, FITS
- TLE (Satellite elements)
- Frequency allocations
- Ephemeris trajectories

## 📁 Project Structure

```
usbnb/
├── README.md                          # This file
├── .gitignore                         # Git ignore rules
├── .gitattributes                     # Git attributes
├── repository.lnk                     # Repository shortcut
├── .github/
│   └── workflows/
│       └── azure-functions-app-nodejs.yml  # CI/CD workflow
└── GITREPOVSLOCAL/
    └── networkbuster/
        ├── index.html                 # Main application HTML (12KB)
        ├── app.js                     # Core application logic (151KB)
        ├── index.css                  # Application styling (14KB)
        ├── modals.css                 # Modal dialog styles (31KB)
        ├── gpu-satellite-module.js    # GPU/Satellite module (17KB)
        ├── gpu-satellite-examples.js  # Code examples (16KB)
        ├── gpu-satellite-tests.js     # Test suite (13KB)
        ├── INDEX.md                   # Documentation index
        ├── GPU-SATELLITE-README.md    # Complete GPU/Satellite API reference
        ├── GPU-SATELLITE-QUICK-REF.md # Quick reference guide
        ├── GPU-SATELLITE-IMPLEMENTATION.md  # Implementation details
        ├── FILE-MANIFEST.md           # File structure overview
        └── COMPLETION-REPORT.md       # Project completion report
```

## 🔗 Related Repositories

For advanced GPU and satellite data processing capabilities, check out:

- **[satgpuNASA](https://github.com/NetworkBuster/satgpuNASA)** - GPU-accelerated NASA satellite data processing and analysis tools
  - Enhanced FITS data processing
  - Advanced TLE orbit calculations
  - NASA API integrations
  - Extended satellite frequency analysis

For more information, visit: [networkbuster.net](https://networkbuster.net)

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and releases.

**Latest Release**: v1.0.0 - Initial release with full feature set
- Commit: [521b282](https://github.com/NetworkBuster/usbnb/commit/521b2828617abd5100f6a92a5f6da25fca50885d)
- Merged via [PR #8](https://github.com/NetworkBuster/usbnb/pull/8)
- Date: December 13, 2025

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

## 📄 License

This project is available for use under standard open source practices. Please contact the repository owner for specific licensing details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by professional OS imaging tools
- GPU acceleration powered by WebGPU
- Community-driven OS support

## 📞 Contact

For questions, issues, or suggestions:
- Open an issue on GitHub
- Email: cleanskiier27@networkbuster.net

---

**Made with ❤️ for the USB/NB community**
