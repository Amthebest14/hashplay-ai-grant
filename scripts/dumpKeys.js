import { PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function writeKeys() {
    const operatorId = process.env.VITE_OPERATOR_ID;
    const keyEd25519 = PrivateKey.fromString(process.env.VITE_OPERATOR_KEY);
    const keyECDSA = PrivateKey.fromStringECDSA(process.env.VITE_OPERATOR_KEY);

    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${operatorId}`);
    const data = await response.json();

    fs.writeFileSync(path.resolve(__dirname, "../keys.json"), JSON.stringify({
        providedPublicKeyED25519: keyEd25519.publicKey.toString(),
        providedPublicKeyECDSA: keyECDSA.publicKey.toString(),
        mirrorNodeKey: data.key.key
    }, null, 2));
}

writeKeys();
