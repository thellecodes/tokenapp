import {} from "@concordium/web-sdk";
import { ConcordiumGRPCNodeClient } from "@concordium/web-sdk/nodejs";
import { credentials } from "@grpc/grpc-js";
import { readFileSync } from "node:fs";
import express from "express";

// const cli = meow(
//     `
//   Usage
//     $ yarn run-example <path-to-this-file> [options]

//   Required
//     --amount,      -a  The amount to send
//     --receiver,    -r  The receivnig account address
//     --wallet-file, -w  A path to a wallet export file from a Concordium wallet

//   Options
//     --help,         Displays this message
//     --memo,     -m  A hex-encoded memo to be included in the transaction, by default there is no memo
//     --endpoint, -e  Specify endpoint of the form "address:port", defaults to localhost:20000
// `,
//     {
//         importMeta: import.meta,
//         flags: {
//             amount: {
//                 type: 'number',
//                 alias: 'a',
//                 isRequired: true,
//             },
//             receiver: {
//                 type: 'string',
//                 alias: 'r',
//                 isRequired: true,
//             },
//             walletFile: {
//                 type: 'string',
//                 alias: 'w',
//                 isRequired: true,
//             },
//             memo: {
//                 type: 'string',
//                 alias: 'm',
//                 default: '',
//             },
//             endpoint: {
//                 type: 'string',
//                 alias: 'e',
//                 default: 'localhost:20000',
//             },
//         },
//     }
// );

// const [address, port] = parseEndpoint(cli.flags.endpoint);
// const client = new ConcordiumGRPCNodeClient(
//     address,
//     Number(port),
//     credentials.createInsecure()
// );

// /**
//  * The following example demonstrates how a simple transfer can be created.
//  */

// (async () => )();

const app = express();
const port = process.env.PORT || 3002;

// Home route
app.get("/", (req, res) => {
  const client = new ConcordiumGRPCNodeClient(
    "164.92.73.190",
    20001,
    credentials.createInsecure()
  );

  res.send("works fine").status(200);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
