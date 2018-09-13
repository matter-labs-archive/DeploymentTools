FROM ubuntu:18.04

ARG FDB_VERSION="5.2.5"
ARG FDB_DEB_REVISION="1"

ARG FDB_PKG_URL="https://www.foundationdb.org/downloads/${FDB_VERSION}/ubuntu/installers"
ARG FDB_CLIENTS_PKG="foundationdb-clients_${FDB_VERSION}-${FDB_DEB_REVISION}_amd64.deb"
ARG FDB_SERVER_PKG="foundationdb-server_${FDB_VERSION}-${FDB_DEB_REVISION}_amd64.deb"
ARG FDB_USER_DIRS="/etc/foundationdb /var/log/foundationdb /var/lib/foundationdb"

ENV FDB_USER_DIRS="$FDB_USER_DIRS"
ENV FDB_UID="1000"
ENV FDB_GID="1000"

ADD $FDB_PKG_URL/$FDB_CLIENTS_PKG /tmp/$FDB_CLIENTS_PKG
ADD $FDB_PKG_URL/$FDB_SERVER_PKG /tmp/$FDB_SERVER_PKG

RUN apt update && \
    apt install -y python
RUN dpkg -i /tmp/$FDB_CLIENTS_PKG /tmp/$FDB_SERVER_PKG && \
    rm /tmp/$FDB_CLIENTS_PKG /tmp/$FDB_SERVER_PKG

RUN rm /var/log/foundationdb/trace.127.000.000.001.*.1.xml && \
    for DIR in $FDB_USER_DIRS; do mv $DIR $DIR.default; done

COPY entrypoint.sh /usr/local/bin/
RUN chmod a+x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/lib/foundationdb/fdbmonitor"]