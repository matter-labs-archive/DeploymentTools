#!/bin/sh
ganache-cli -l=7e7 -m 'actor odor damp cannon demand element simple worry smart warm intact illness' 2>&1 > ganache-output.log &
cd PlasmaContract 
npm install lodash
echo "Migrating" 
truffle compile 
truffle migrate
echo "Done migration"
wait