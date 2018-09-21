#/bin/sh

rm data/fdb/fdb.cluster
rm data/blocks/*
rm data/contract/*
docker-compose down
docker-compose pull
docker-compose up --force-recreate --build --remove-orphans
