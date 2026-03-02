import { useState, useEffect, useCallback } from 'react';
import { HashConnect } from 'hashconnect';
import { Client, AccountBalanceQuery } from '@hashgraph/sdk';

const hashconnect = new HashConnect();

const appMetadata = {
    name: "Hashplay AI",
    description: "The future of play is liquid. Mine $HASHPLAY.",
    icon: "https://cryptologos.cc/logos/hedera-hbar-logo.png",
    url: window.location.origin
};

export function useHashConnect() {
    const [pairingData, setPairingData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [accountId, setAccountId] = useState("");
    const [hbarBalance, setHbarBalance] = useState("0");
    const [hashplayBalance, setHashplayBalance] = useState("0");

    const hederaNetwork = import.meta.env.VITE_HEDERA_NETWORK || "testnet";
    const hashplayTokenId = import.meta.env.VITE_HASHPLAY_TOKEN_ID;

    const initHashConnect = async () => {
        try {
            await hashconnect.init(appMetadata, "testnet", false);

            hashconnect.pairingEvent.on((pairingData) => {
                setPairingData(pairingData);
                if (pairingData?.accountIds?.length > 0) {
                    setIsConnected(true);
                    setAccountId(pairingData.accountIds[0]);
                    fetchBalances(pairingData.accountIds[0]);
                }
            });

            // Auto-connect if already paired
            const savedData = hashconnect.hcData.pairingData;
            if (savedData && savedData.length > 0) {
                setIsConnected(true);
                setAccountId(savedData[0].accountIds[0]);
                fetchBalances(savedData[0].accountIds[0]);
            }
        } catch (error) {
            console.error("Hashconnect Init Error:", error);
        }
    };

    useEffect(() => {
        initHashConnect();
    }, []);

    const connect = async () => {
        if (hashconnect) {
            hashconnect.connectToLocalWallet();
        }
    };

    const disconnect = async () => {
        if (hashconnect?.hcData?.topic) {
            await hashconnect.disconnect(hashconnect.hcData.topic);
        }
        await hashconnect.clearConnectionsAndData();
        setPairingData(null);
        setIsConnected(false);
        setAccountId("");
        setHbarBalance("0");
        setHashplayBalance("0");
    };

    const fetchBalances = useCallback(async (account) => {
        if (!account) return;
        try {
            // Direct mirror node call for reliability in React clients
            const response = await fetch(`https://${hederaNetwork}.mirrornode.hedera.com/api/v1/accounts/${account}`);
            const data = await response.json();

            if (data) {
                // HBAR balance (convert from tinybars)
                const hbar = data.balance.balance / 100000000;
                setHbarBalance(hbar.toFixed(2));

                // HASHPLAY balance
                if (data.balance.tokens) {
                    const hashplay = data.balance.tokens.find(t => t.token_id === hashplayTokenId);
                    if (hashplay) {
                        // HASHPLAY has 8 decimals
                        const tokenBal = hashplay.balance / 100000000;
                        setHashplayBalance(tokenBal.toLocaleString());
                    } else {
                        setHashplayBalance("0");
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching balances:", error);
        }
    }, [hederaNetwork, hashplayTokenId]);

    return {
        connect,
        disconnect,
        isConnected,
        accountId,
        hbarBalance,
        hashplayBalance,
        fetchBalances,
        hashconnect
    };
}
