# How to run 

## Plasma block processor for UI purposes and feeling
`
    git clone https://github.com/matterinc/DeploymentTools.git
    cd minimalBackend
    chmod +x run.sh
    ./run.sh
`

### Give yourselves some outputs
`
    POST
    http://127.0.0.1:3001/createUTXO
    {
        "for": "0x6394b37cf80a7358b38068f0ca4760ad49983a1b",
        "blockNumber": 1, 
        "transactionNumber": 0, 
        "outputNumber": 0, 
        "value": "1000"
    }

    combination of block number + tx number + output number should be unique
`

of course this endpoint is never used in production, just for testing purposes

### List your outputs
`
    POST
    http://127.0.0.1:3001/listUTXOs
    {
        "for": "0x6394b37cf80a7358b38068f0ca4760ad49983a1b",
        "blockNumber": 1, 
        "transactionNumber": 0, 
        "outputNumber": 0,
        "limit": 50
    }
`

This will list all the UTXOs that belong to the user and where created in this block, transaction and output number or later. Orders by block number, transaction number and output number in sequence