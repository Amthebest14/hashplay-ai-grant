import {
    Client,
    PrivateKey,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType
} from "@hashgraph/sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
    const operatorId = process.env.VITE_OPERATOR_ID;
    const operatorKey = process.env.VITE_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
        throw new Error("VITE_OPERATOR_ID and VITE_OPERATOR_KEY must be present in .env");
    }

    const client = process.env.VITE_HEDERA_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();

    let supplyKey;
    if (operatorKey.startsWith("0x") || operatorKey.length === 64) {
        supplyKey = PrivateKey.fromStringECDSA(operatorKey);
    } else {
        supplyKey = PrivateKey.fromStringED25519(operatorKey);
    }

    client.setOperatorWith(operatorId, supplyKey.publicKey, async (message) => {
        return supplyKey.sign(message);
    });

    const adminKey = supplyKey;

    // Initial Supply: 100,000,000 * 10^8
    // 100000000 * 100000000 = 10000000000000000
    const initialSupply = 100000000n * 100000000n;

    console.log("Creating Token $HASHPLAY...");

    let tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("Hashplay AI")
        .setTokenSymbol("$HASHPLAY")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(8)
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(operatorId)
        .setAdminKey(adminKey)
        .setSupplyKey(supplyKey)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(initialSupply)
        .freezeWith(client);

    let tokenCreateSign = await tokenCreateTx.sign(adminKey);
    let tokenCreateSubmit = await tokenCreateSign.execute(client);
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    let tokenId = tokenCreateRx.tokenId;

    console.log(`- Created token with ID: ${tokenId}`);

    // Automatically update .env
    const envPath = path.resolve(__dirname, '../.env');
    let envConfig = fs.readFileSync(envPath, 'utf8');

    if (envConfig.includes('VITE_HASHPLAY_TOKEN_ID=')) {
        envConfig = envConfig.replace(/VITE_HASHPLAY_TOKEN_ID=.*/g, `VITE_HASHPLAY_TOKEN_ID=${tokenId}`);
    } else {
        envConfig += `\nVITE_HASHPLAY_TOKEN_ID=${tokenId}`;
    }

    fs.writeFileSync(envPath, envConfig);
    console.log("- Auto-saved Token ID to .env");

    process.exit();
}

main().catch((err) => {
    console.error("Error creating token:", err);
    process.exit(1);
});
