#! /usr/bin/env node

import * as program from "commander";
import * as shell from "shelljs";
import * as JSZip from "jszip";
import * as fs from "fs";
import { SAFECoinTransactions, TransactionCSVRow } from './types';
import { Parser } from "json2csv";
import * as moment from "moment";

// Define the options for the CLI
program
    .version("0.0.1")
    .description("Converts exodus' SAFE report to CSV transaction history that other tools can consume")
    .option(`-s, --source [zip]`, "Source SAFE report .zip")
    .option(`-d, --destination [directory]`, "Destination directory")
    .parse(process.argv)

console.log(`Starting export of '${program.source}' to '${program.destination}'`);

// Load the Zip
fs.readFile(program.source, async (err, data) => {
    if (err) throw err;
    const zip = await JSZip.loadAsync(data)
    parseZip(zip);
});

// Make the out dir if its doesnt exist
shell.mkdir(program.destination);

// Parse the Zip contents
async function parseZip(zip: JSZip) {
    
    // Make sure the user supplied the right kind of Zip
    const transactions = zip.folder("v1/txs");
    if (!transactions)
        throw new Error("Zip should contain the folder `v1/txs");

    // Iterate over each coin and export its transactions as CSV
    for(var key in transactions.files)
    {
        if (!key.includes("v1\\txs"))
            continue;

        const contents = await transactions.files[key].async("text");
        const safeTransactions: SAFECoinTransactions = JSON.parse(contents);
        const rows: TransactionCSVRow[] = safeTransactions.map(tx => ({
            TXID: tx.txId,
            TXURL: `https://live.blockcypher.com/btc/tx/${tx.txId}`,
            DATE: moment(tx.date).format(),
            COINAMOUNT: tx.coinAmount,
            FEE: tx.feeAmount,
            BALANCE: "0",
            EXCHANGE: "",
            MEMO: ""
        }))

        const parser = new Parser();
        const csv = parser.parse(rows);
        const fname = `${safeTransactions[0].coinName}.csv`;
        const fout = `${program.destination}/${fname}`;

        fs.writeFileSync(fout, csv);
        console.log(`Exported ${safeTransactions.length} SAFE transactions to ${fout}`);
    }
}
