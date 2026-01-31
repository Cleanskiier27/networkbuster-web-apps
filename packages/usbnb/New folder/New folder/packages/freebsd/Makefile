#!/bin/bash
# FreeBSD Port Makefile

PORTNAME=networkbuster
PORTVERSION=1.0.1
PORTREVISION=0
CATEGORIES=www
MASTER_SITES=https://github.com/NetworkBuster/networkbuster.net/archive/

MAINTAINER=dev@networkbuster.net
COMMENT=High-performance network server built with Node.js and Express
LICENSE=MIT

RUN_DEPENDS=node:www/node

USES=gmake npm
USE_NODE=yes
USE_GITHUB=yes
GH_ACCOUNT=NetworkBuster
GH_PROJECT=networkbuster.net
GH_TAGNAME=v${PORTVERSION}

NO_ARCH=yes

PLIST_FILES=\
    bin/networkbuster \
    %%DATADIR%%/server.js \
    %%DATADIR%%/package.json \
    %%DATADIR%%/README.md

post-patch:
    ${REINPLACE_CMD} 's|#!/usr/bin/env node|#!/usr/bin/env -S node|' \
        ${WRKSRC}/server.js

do-build:
    ${MAKE} -C ${WRKSRC} npm install --production

do-install:
    ${MKDIR} ${STAGEDIR}${DATADIR}
    ${CP} -r ${WRKSRC}/* ${STAGEDIR}${DATADIR}/
    ${MKDIR} ${STAGEDIR}${PREFIX}/bin
    ${ECHO} '#!/bin/sh' > ${STAGEDIR}${PREFIX}/bin/networkbuster
    ${ECHO} 'exec ${LOCALBASE}/bin/node ${DATADIR}/server.js "$$@"' \
        >> ${STAGEDIR}${PREFIX}/bin/networkbuster
    ${CHMOD} 755 ${STAGEDIR}${PREFIX}/bin/networkbuster

post-install:
    @${ECHO_CMD} "To start NetworkBuster, run: service networkbuster start"
    @${ECHO_CMD} "To enable at boot, add 'networkbuster_enable=\"YES\"' to /etc/rc.conf"
