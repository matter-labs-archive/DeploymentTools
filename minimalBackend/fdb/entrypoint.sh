#!/usr/bin/env bash
set -e

if [ ! -f /etc/foundationdb/fdb.cluster ]
then
        # Ensure a unique cluster ID for new installs.
        CLUSTER_ID=$(mktemp -u XXXXXXXX)
        sed -i s/^@/$CLUSTER_ID@/ /etc/foundationdb.default/fdb.cluster

        # Replace the default IP address with the container's IP.
        CONTAINER_IP=$(grep $(hostname) /etc/hosts | awk '{print $1}')
        sed -i s/@.*:/@$CONTAINER_IP:/ /etc/foundationdb.default/fdb.cluster
        
        # copy file to external location
        cp /etc/foundationdb.default/fdb.cluster /user/data/
fi

# Copy the default files into volumes if they do not exist.
for DIR in $FDB_USER_DIRS
do
        find $DIR.default -maxdepth 1 -exec cp -r --no-clobber {} $DIR \;
done

# Sync the foundationdb user and group with the host.
CURR_FDB_UID=$(id -u foundationdb)
CURR_FDB_GID=$(id -g foundationdb)
if [ $CURR_FDB_UID != $FDB_UID -o $CURR_FDB_GID != $FDB_GID ]
then
        groupmod -g $FDB_GID --non-unique foundationdb
        usermod -g $FDB_GID -u $FDB_UID --non-unique foundationdb
        chown -R foundationdb:foundationdb $FDB_USER_DIRS
fi

$@ &

trap 'kill $!' SIGHUP SIGINT SIGQUIT SIGTERM
wait