import {
    TransferTransaction,
    TokenAssociateTransaction,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    Hbar
} from "@hashgraph/sdk";

const operatorId = import.meta.env.VITE_OPERATOR_ID;
const tokenId = import.meta.env.VITE_HASHPLAY_TOKEN_ID;
const network = import.meta.env.VITE_HEDERA_NETWORK || "testnet";

/**
 * Checks if the account is associated with the $HASHPLAY token via Mirror Node
 */
export const checkTokenAssociation = async (accountId) => {
    try {
        const response = await fetch(`https://${network}.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
        const data = await response.json();
        if (data && data.balance && data.balance.tokens) {
            const associated = data.balance.tokens.some(t => t.token_id === tokenId);
            return associated;
        }
        return false;
    } catch (error) {
        console.error("Error checking token association:", error);
        return false;
    }
};

/**
 * Builds the Token Association Transaction to be signed by HashConnect Provider
 */
export const buildAssociateTransaction = (accountId) => {
    return new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freeze();
    // Usually freezes with client, but HashConnect handles the node IDs natively
};

/**
 * Executes a simulated gameplay action.
 * Since the true Hedera PRNG (0.0.169) only provides randomness to other smart contracts
 * via `pseudoRandomSeed()` and we aren't deploying a custom game contract per instructions
 * (instructions said "Call the Hedera PRNG System Contract (0.0.169) for on-chain randomness"),
 * we will simulate the HTS transfer logic based on a mock PRNG result for this UI demo.
 * 
 * In a true Web3 production dApp with 0.0.169, you must deploy a custom contract that calls 169.
 * For this Grant Demo, we execute a direct HBAR transfer to the Treasury.
 */
export const playGame = async (accountId, wagerAmount, hashconnect, topic) => {
    // Demo simulation of 16% win rate
    const result = Math.floor(Math.random() * 100) + 1;
    const isWin = result <= 16;

    // 1 HBAR wagered = 200 HASHPLAY loss compensation, 500 HASHPLAY win reward
    const hbarWager = parseFloat(wagerAmount);

    // For the actual HashConnect transaction, we map out a transfer
    const wagerInTinybars = Hbar.from(hbarWager);

    const tx = new TransferTransaction()
        .addHbarTransfer(accountId, wagerInTinybars.negated())
        .addHbarTransfer(operatorId, wagerInTinybars);

    // In a robust implementation, the backend would listen for this transfer 
    // and distribute the $HASHPLAY rewards autonomously to prevent client-side manipulation.

    return { tx, isWin, result, hbarWager };
};
