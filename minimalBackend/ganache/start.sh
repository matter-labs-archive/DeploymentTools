#!/bin/sh
ganache-cli --gasLimit=7e7 -h 0.0.0.0 --defaultBalanceEther=10000 -m 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat' 2>&1 > ganache-output.log &
cd PlasmaContract 
npm install lodash
echo "Migrating" 
truffle compile 
truffle migrate
echo "Done migration"
wait