const testPrivateKey = Buffer.from("8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5", "hex");
const testAccount = "0x5aeda56215b167893e80b4fe645ba6d5bab767de";
const rp = require('request-promise-native');
const ethUtil = require('ethereumjs-util');
const BN = ethUtil.BN;
const assert = require("assert");
const ONE = new BN(1);
const TWO = new BN(2);
const delay = 10000;
const utxoLimit = 1000;
const promiseLimit = require('promise-limit')
const limit = promiseLimit(100)
let didDeposit = false
let split = false;
const txprocessorPort = 3001
const depositorPort = 4000


async function doDeposit() {
    const amountAsString = "1000000000000000000"
    let options = {
        method: 'POST',
        uri: "http://127.0.0.1:" + depositorPort + "/deposit",
        body: {
            amount : amountAsString,
            for: testAccount
        },
        json: true 
    };
    let result = await rp(options);
    assert(!result.error)
}

async function getUTXOs() {
    let allUTXOs = [];
    let options = {
        method: 'POST',
        uri: "http://127.0.0.1:" + txprocessorPort + "/listUTXOs",
        body: {
            for: testAccount,
            blockNumber: 1, 
            transactionNumber: 0, 
            outputNumber: 0,
            limit: 100
        },
        json: true 
    };
    let result = await rp(options);
    if (result.error) {
        return []
    }
    if (result.utxos.length == 0) {
        return []
    }
    allUTXOs = allUTXOs.concat(result.utxos);
    let lastUTXO = allUTXOs[allUTXOs.length - 1];
    for (let i = 0; i < 100; i++) {
        options = {
            method: 'POST',
            uri: "http://127.0.0.1:" + txprocessorPort + "/listUTXOs",
            body: {
                for: testAccount,
                blockNumber: lastUTXO.blockNumber, 
                transactionNumber: lastUTXO.transactionNumber, 
                outputNumber: lastUTXO.outputNumber,
                limit: 100
            },
            json: true 
        };
        let result = await rp(options);
        if (result.error) {
            break
        }
        if (result.utxos.length == 0 || result.utxos.length == 1) {
            break
        }
        let tmp = result.utxos
        let lastUTXOcandidate = tmp[tmp.length - 1]
        if (lastUTXO.blockNumber === lastUTXOcandidate.blockNumber &&
            lastUTXO.transactionNumber === lastUTXOcandidate.transactionNumber &&
            lastUTXO.outputNumber === lastUTXOcandidate.outputNumber) {
                break
            }
        tmp.shift()
        lastUTXO = lastUTXOcandidate
        allUTXOs = allUTXOs.concat(tmp);
    }
    return allUTXOs
}

async function main() {
    try {
        if (!didDeposit) {
            await doDeposit();
            didDeposit = true;
            return setTimeout(main , delay);
        }
        let allUTXOs = await getUTXOs();
        if (allUTXOs.length == 0) {
            return setTimeout(main , delay);
        }
        if (allUTXOs.length >= utxoLimit) {
            split = false;
        } else {
            split = true;
        }

        console.log("Have UTXOs = " + allUTXOs.length);

        let milliSeconds;
        let succesful;
        let unsuccesful;

        console.log("Preparing and sending transactions")

        const prepared = allUTXOs.map((utxo) => {
            return sendSplitTransaction(utxo, split)
        })

        const oldTime = process.hrtime();  

        const results = await Promise.all(prepared.map((req) => {
            // return limit(async () => { return await rp(req)})
            return limit(async () => {
                try{
                    const r = await rp(req)
                    return r
                } catch(e) {
                    return {error: true}
                }
            })
        })) 

        const hrtime = process.hrtime(oldTime);

        milliSeconds = parseInt(((hrtime[0] * 1e3) + (hrtime[1]) * 1e-6));

        succesful = results.filter((el) => {
            return el.error === false;
        })
        unsuccesful = allUTXOs.length - succesful.length;

        console.log("TPS = " + Math.floor(succesful.length * 1000.0 / milliSeconds));

        console.log("Sended succesfully: " + succesful.length);

        console.log("Unsuccesful " + unsuccesful);

        console.log("Speeping and waiting for block to be produced");
        setTimeout(main , delay);
        return
    } catch(e) {
        console.log(e);
        console.log("FATAL");
        return
    }
}

main().then()

function sendSplitTransaction(utxo, split) {
    try {
        let trans;
        if (!split) {
            const {blockNumber, transactionNumber, outputNumber, value} = utxo;
            const amountBN = new BN(value);
            const output0Amount = amountBN;
            const assembledTX = createTransaction(TxTypeSplit, 
                [
                    {
                        blockNumber: blockNumber,
                        txNumberInBlock: transactionNumber,
                        outputNumberInTransaction : outputNumber,
                        amount: value
                    }
                ], [
                    {
                        to: testAccount,
                        amount: output0Amount.toString(10)
                    }
                ])
            assembledTX.sign(testPrivateKey)
            const serialized = assembledTX.serialize();
    
            trans = {
                tx: ethUtil.bufferToHex(serialized)
            }
        } else {
            const {blockNumber, transactionNumber, outputNumber, value} = utxo;
            const amountBN = new BN(value);
            const output0Amount = amountBN.div(TWO);
            const output1Amount = amountBN.sub(output0Amount);
            const assembledTX = createTransaction(TxTypeSplit, 
                [
                    {
                        blockNumber: blockNumber,
                        txNumberInBlock: transactionNumber,
                        outputNumberInTransaction : outputNumber,
                        amount: value
                    }
                ], [
                    {
                        to: testAccount,
                        amount: output0Amount.toString(10)
                    },
                    {
                        to: testAccount,
                        amount: output1Amount.toString(10)
                    }
                ])
            assembledTX.sign(testPrivateKey)
            const serialized = assembledTX.serialize();

            trans = {
                tx: ethUtil.bufferToHex(serialized)
            }
        }
        const options = {
            method: 'POST',
            uri: "http://127.0.0.1:" + txprocessorPort + "/sendRawTX",
            body: trans,
            json: true 
        }
        return options
    } catch(e) {
        console.log("Error assembling a split TX")
        console.log(e)
        return null
    }
}

const {PlasmaTransaction,
    TxTypeFund, 
    TxTypeMerge, 
    TxTypeSplit} = require("./lib/Tx/RLPtx.js");
    

const {PlasmaTransactionWithSignature} = require("./lib/Tx/RLPtxWithSignature");

const {TransactionInput} = require("./lib/Tx/RLPinput");
const {TransactionOutput} = require("./lib/Tx/RLPoutput");
    
function createTransaction(transactionType, inputs, outputs) {
    const allInputs = [];
    const allOutputs = [];

    for (const input of inputs) {
        const inp = new TransactionInput({
            blockNumber: (new BN(input.blockNumber)).toBuffer("be",4),
            txNumberInBlock: (new BN(input.txNumberInBlock)).toBuffer("be",4),
            outputNumberInTransaction: (new BN(input.outputNumberInTransaction)).toBuffer("be",1),
            amountBuffer: (new BN(input.amount)).toBuffer("be",32)
        })
        allInputs.push(inp)
    }
    let outputCounter = 0;
    for (const output of outputs) {
        const out = new TransactionOutput({
            outputNumberInTransaction: (new BN(outputCounter)).toBuffer("be", 1),
            amountBuffer: (new BN(output.amount)).toBuffer("be",32),
            to: ethUtil.toBuffer(output.to)
        })
        allOutputs.push(out)
        outputCounter++
    }

    const plasmaTransaction = new PlasmaTransaction({
        transactionType: (new BN(transactionType)).toBuffer("be",1),
        inputs: allInputs,
        outputs: allOutputs,
    })
    assert(plasmaTransaction.isWellFormed());
    const sigTX = new PlasmaTransactionWithSignature({
        transaction: plasmaTransaction
    });
    return sigTX;
}