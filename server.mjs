import {
  AccountAddress,
  AccountTransactionType,
  CcdAmount,
  signTransaction,
  TransactionExpiry,
  buildAccountSigner,
  parseWallet,
} from "@concordium/web-sdk";
import { ConcordiumGRPCNodeClient } from "@concordium/web-sdk/nodejs";
import { credentials } from "@grpc/grpc-js";
import express from "express";
import { readFileSync } from "node:fs";
import { join } from "path";

const app = express();
const port = process.env.PORT || 3002;
app.use(express.json());

app.get("/", (req, res) => res.send("welcome to techFiesta CCD Token Server"));

//[x] protect with a middleware

// Home route
app.post("/", async (req, res) => {
  try {
    const { caccount } = req.body;

    const client = new ConcordiumGRPCNodeClient(
      "164.92.73.190",
      20001,
      credentials.createInsecure()
    );

    const fileName =
      "395NEo2MeaJysfsnNkj9g1X6FSjXKZsHDZz4UCj3j5AfNwnpqU.export";

    const filePath = join(process.cwd(), "keys", fileName);

    const fileContent = readFileSync(filePath, "utf8");
    const walletExport = parseWallet(fileContent);

    const sender = AccountAddress.fromBase58(walletExport.value.address);

    const toAddress = AccountAddress.fromBase58(caccount);

    const nextNonce = await client.getNextAccountNonce(sender);

    const header = {
      expiry: TransactionExpiry.futureMinutes(60),
      nonce: nextNonce.nonce,
      sender,
    };

    const simpleTransfer = {
      amount: CcdAmount.fromMicroCcd(100000000),
      toAddress,
    };

    // #region documentation-snippet-sign-transaction
    const accountTransaction = {
      header: header,
      payload: simpleTransfer,
      type: AccountTransactionType.Transfer,
    };

    // Sign transaction
    const signer = buildAccountSigner(walletExport);
    const signature = await signTransaction(accountTransaction, signer);

    const transactionHash = await client.sendAccountTransaction(
      accountTransaction,
      signature
    );

    const status = await client.waitForTransactionFinalization(transactionHash);

    console.log(status);

    return res.status(200).send({ mintToAccount: true });
  } catch (err) {
    return res.send(err.message).status(500);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
