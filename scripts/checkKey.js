import { PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function checkAccount() {
    const operatorId = process.env.VITE_OPERATOR_ID;
    const operatorKeyStr = process.env.VITE_OPERATOR_KEY;

    console.log("Checking Account:", operatorId);

    try {
        const key = PrivateKey.fromString(operatorKeyStr);
        console.log("Generated Public Key (from provided Private Key):", key.publicKey.toString());

        // Fetch from mirror node
        const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${operatorId}`);
        if (!response.ok) {
            console.error("Mirror node fetch failed", response.status);
            return;
        }
        const data = await response.json();
        console.log("Actual Public Key registered on Mirror Node:", data.key.key);

        if (key.publicKey.toString() === data.key.key || key.publicKey.toStringDer() === data.key.key) {
            console.log("MATCH! The key is correct.");
        } else {
            console.error("MISMATCH! The provided Private Key does not correspond to the Public Key on this account.");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

checkAccount();
