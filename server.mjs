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

const client = new ConcordiumGRPCNodeClient(
  "grpc.mainnet.concordium.software",
  20000,
  credentials.createSsl()
);

//airdrop
//airdrop
app.post("/airdrop", async (req, res) => {
  const { wallets, amount } = req.body;

  const fileName = "3vQpCVjpfLLg5qKDN11YEkuWC5W69Q9zstXSMANahAT9bZSFNQ.export";

  const filePath = join(process.cwd(), "keys", fileName);

  const fileContent = readFileSync(filePath, "utf8");
  const walletExport = parseWallet(fileContent);

  const sender = AccountAddress.fromBase58(walletExport.value.address);

  try {
    // Array to hold promises for each wallet transaction
    const promises = wallets.map(async (wallet) => {
      const toAddress = AccountAddress.fromBase58(wallet);

      const nextNonce = await client.getNextAccountNonce(sender);

      const header = {
        expiry: TransactionExpiry.futureMinutes(60),
        nonce: nextNonce.nonce,
        sender,
      };

      const simpleTransfer = {
        amount: CcdAmount.fromMicroCcd(Number(`${amount}000000`)),
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

      const status = await client.waitForTransactionFinalization(
        transactionHash
      );

      const hashHex = bufferToHex(transactionHash.buffer);

      console.log(hashHex);

      return true; // Indicate success for this wallet
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // If all promises resolve without error, send the response
    return res.status(200).send({ distributed: true });
  } catch (error) {
    // If any error occurs during the process, send an error response
    console.error("An error occurred:", error);
    return res
      .status(500)
      .send({ error: "An error occurred while processing the airdrop." });
  }
});

// Home route
app.post("/", async (req, res) => {
  try {
    const { caccount } = req.body;

    const fileName =
      "3vQpCVjpfLLg5qKDN11YEkuWC5W69Q9zstXSMANahAT9bZSFNQ.export";

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
      amount: CcdAmount.fromMicroCcd(1000000),
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

    const hashHex = bufferToHex(transactionHash.buffer);

    return res
      .status(200)
      .send({ mintToAccount: true, transactionHash: hashHex });
  } catch (err) {
    return res.send(err.message).status(500);
  }
});

function bufferToHex(buffer) {
  return Array.prototype.map
    .call(buffer, function (byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join("");
}

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
