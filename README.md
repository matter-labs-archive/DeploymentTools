# Self-contained deployment of Matter Inc. Move Viable Plasma

# How to run 

## Plasma block processor for UI purposes and feeling
```
    git clone https://github.com/matterinc/DeploymentTools.git
    cd minimalBackend
    chmod +x run.sh
    ./run.sh
```

## List of allowed accounts for further use of API calls

```
    "0xf17f52151ebef6c7334fad080c5704d77216b732"
    "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef"
    "0x821aea9a577a9b44299b9c15c88cf3087f3b5544"
    "0x0d1d4e623d10f9fba5db95830f7d3839406c6af2"
    "0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e"
    "0x2191ef87e392377ec08e7c08eb105ef5448eced5"
    "0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5"
    "0x6330a553fc93768f612722bb8c2ec78ac90b3bbc"
    "0x5aeda56215b167893e80b4fe645ba6d5bab767de"
```

On the `4000` port there is a wrapper for API calls to the smart-contract running in Ganache test RPC

## Block assembly loop and header commitment loop are run automatically in background, as well as deposits procesure and exit challenges procedure

### Give yourselves some outputs

This call makes a deposit to the Plasma smart-contract

```
    POST
    http://127.0.0.1:4000/deposit
    {
        "amount" : "2000",
        "for": "0x5aeda56215b167893e80b4fe645ba6d5bab767de"
    }
```

### Start an output exit

This starts an exit by making a transaction to the Plasma smart-contract

```
    POST
    http://127.0.0.1:4000/startExit
    {
        "blockNumber": 11,
        "txNumber": 0,
        "outputNumber": 0,
        "from": "0x5aeda56215b167893e80b4fe645ba6d5bab767de"
    }
```

`blockNumber`, `txNumber` and `outputNumber` should correspond to some UTXO in the corresponding block. Owner should match with the `from` field

### There is a Plasma server running on `3001` port

### List your outputs
```
    POST
    http://127.0.0.1:3001/listUTXOs
    {
        "for": "0x5aeda56215b167893e80b4fe645ba6d5bab767de",
        "blockNumber": 1, 
        "transactionNumber": 0, 
        "outputNumber": 0,
        "limit": 50
    }
```

This will list all the UTXOs that belong to the user and where created in this block, transaction and output number or later. Orders by block number, transaction number and output number in sequence

### Make a transfer

Under the hood it assembles a well-formed transaction, signs it from the corresponding account and sends to the Plasma node

```
    POST
    http://127.0.0.1:4000/sendTX
    {
        "inputs" : [
            {
                "blockNumber" : 2,
                "txNumberInBlock" : 0,
                "outputNumberInTransaction":0,
                "amount" : "2000"
            }
        ],
        "outputs": [
            {
                "amount": "2000",
                "to": "0x5aeda56215b167893e80b4fe645ba6d5bab767de"
            }
        ],
        "from": "0x5aeda56215b167893e80b4fe645ba6d5bab767de"
    }
```

If you do the transfer to the account not in a list above - you will not be able to later spend or exit it

## Authors

Alex Vlasov, alex.m.vlasov@gmail.com, [shamatar](https://github.com/shamatar)