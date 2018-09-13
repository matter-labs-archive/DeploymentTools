#/bin/sh

rm data/fdb.cluster
docker-compose up --force-recreate --build
