Name:     networkbuster
Version:  1.0.1
Release:  1
Summary:  High-performance network server built with Node.js and Express
License:  MIT
URL:      https://github.com/NetworkBuster/networkbuster.net

%description
NetworkBuster is a production-ready server application built with Node.js and Express.
It provides powerful networking capabilities with built-in health checks, logging, and monitoring.

Features:
- Express.js web framework
- Node.js 24.x runtime
- Docker support
- Production-ready configuration
- Health monitoring endpoints
- Comprehensive logging

%prep
%autosetup -n networkbuster-%{version}

%build
npm install --production
npm run build --if-present

%install
mkdir -p %{buildroot}%{_opt}/networkbuster
cp -r . %{buildroot}%{_opt}/networkbuster/

mkdir -p %{buildroot}%{_bindir}
cat > %{buildroot}%{_bindir}/networkbuster << 'EOF'
#!/bin/bash
cd %{_opt}/networkbuster
node server.js "$@"
EOF
chmod +x %{buildroot}%{_bindir}/networkbuster

mkdir -p %{buildroot}%{_unitdir}
cat > %{buildroot}%{_unitdir}/networkbuster.service << 'EOF'
[Unit]
Description=NetworkBuster Server
After=network.target

[Service]
Type=simple
User=networkbuster
WorkingDirectory=%{_opt}/networkbuster
ExecStart=%{_bindir}/networkbuster
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

%pre
getent group networkbuster >/dev/null 2>&1 || groupadd -r networkbuster
getent passwd networkbuster >/dev/null 2>&1 || useradd -r -g networkbuster -d /opt/networkbuster -s /sbin/nologin networkbuster

%post
chown -R networkbuster:networkbuster %{_opt}/networkbuster
systemctl daemon-reload
systemctl enable networkbuster.service

%preun
if [ $1 -eq 0 ] ; then
    systemctl stop networkbuster.service 2>/dev/null || true
    systemctl disable networkbuster.service 2>/dev/null || true
fi

%postun
systemctl daemon-reload

%files
%attr(-, networkbuster, networkbuster) %{_opt}/networkbuster
%{_bindir}/networkbuster
%{_unitdir}/networkbuster.service

%changelog
* Fri Dec 14 2025 NetworkBuster Developers <dev@networkbuster.net> - 1.0.1-1
- Initial stable release
- Docker support
- Health check endpoints
- Comprehensive documentation
