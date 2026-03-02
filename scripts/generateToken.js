import { Client, TokenCreateTransaction, PrivateKey, Hbar, TokenType, TokenSupplyType } from "@hashgraph/sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

async function main() {
  if (process.env.VITE_HASHPLAY_TOKEN_ID) {
    console.log("Token already generated:", process.env.VITE_HASHPLAY_TOKEN_ID);
    return;
  }

  const operatorId = process.env.VITE_OPERATOR_ID;
  const operatorKey = PrivateKey.fromStringECDSA(process.env.VITE_OPERATOR_KEY);
  const network = process.env.VITE_HEDERA_NETWORK || "testnet";

  const client = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  console.log("Generating $HASHPLAY Token...");

  try {
    const transaction = new TokenCreateTransaction()
      .setTokenName("Hashplay AI")
      .setTokenSymbol("$HASHPLAY")
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Finite)
      .setDecimals(8)
      .setInitialSupply(100_000_000 * Math.pow(10, 8)) // 100M total units
      .setMaxSupply(100_000_000 * Math.pow(10, 8))
      .setTreasuryAccountId(operatorId)
      .setAdminKey(operatorKey)
      .setSupplyKey(operatorKey)
      .setFreezeDefault(false);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    console.log("Token Created! ID:", tokenId.toString());

    // Auto-Save to .env
    const envContent = fs.readFileSync(envPath, "utf-8");
    const newEnvContent = envContent.replace(
      /VITE_HASHPLAY_TOKEN_ID=.*/,
      `VITE_HASHPLAY_TOKEN_ID=${tokenId.toString()}`
    );

    fs.writeFileSync(envPath, newEnvContent);
    console.log("Token ID saved to .env");
  } catch (err) {
    console.error("Error creating token:", err);
    fs.writeFileSync(path.resolve(__dirname, "../error.json"), JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }

  process.exit(0);
}

main();
