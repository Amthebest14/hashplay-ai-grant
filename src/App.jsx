import React, { useState } from 'react';
import LiquidBackground from './components/LiquidBackground';
import Header from './components/Header';
import Footer from './components/Footer';
import DiceGame from './components/DiceGame';
import CoinFlip from './components/CoinFlip';
import { useHashConnect } from './hooks/useHashConnect';
import { checkTokenAssociation, buildAssociateTransaction, playGame } from './utils/hederaTransactions';

// Placeholder components to be expanded
const HeroSection = ({ onEnter }) => (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10 transition-opacity duration-1000">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 tracking-tight drop-shadow-2xl text-white">
            the future of play is <span className="text-hedera-green">liquid</span>.
        </h1>
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl">
            mine $hashplay through every wager.
        </p>
        <button
            onClick={onEnter}
            className="px-8 py-4 glass-panel text-lg hover:bg-white/10 hover:text-hedera-green transition-all uppercase tracking-widest"
        >
            Enter the Arena
        </button>
    </div>
);

const ArenaSection = ({ isConnected, onPlay }) => (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 pt-24 pb-32">
        <h2 className="text-3xl font-bold mb-12 text-hedera-green tracking-widest">THE ARENA</h2>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
            <DiceGame isConnected={isConnected} onPlay={onPlay} />
            <CoinFlip isConnected={isConnected} onPlay={onPlay} />
        </div>
    </div>
);

const LeaderboardSection = () => {
    const [leaders, setLeaders] = useState([]);

    React.useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const network = import.meta.env.VITE_HEDERA_NETWORK || "testnet";
                const tokenId = import.meta.env.VITE_HASHPLAY_TOKEN_ID;
                if (!tokenId) return;

                const res = await fetch(`https://${network}.mirrornode.hedera.com/api/v1/tokens/${tokenId}/balances?order=desc&limit=25`);
                const data = await res.json();

                if (data && data.balances) {
                    setLeaders(data.balances);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            }
        };
        fetchLeaders();
        // Refresh every 30s
        const interval = setInterval(fetchLeaders, 30000);
        return () => clearInterval(interval);
    }, []);

    const shortenAddress = (addr) => {
        if (!addr || addr.length <= 8) return addr;
        return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start px-6 relative z-10 pt-32 pb-32">
            <h2 className="text-3xl font-bold mb-12 text-white/80 tracking-widest">HIGH SCORE</h2>

            <div className="w-full max-w-2xl glass-panel p-8">
                <div className="flex justify-between pb-4 border-b border-white/10 text-white/50 text-sm mb-4">
                    <span>RANK</span>
                    <span>WALLET</span>
                    <span>$HASHPLAY</span>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                    {leaders.map((l, idx) => (
                        <div key={l.account} className="flex justify-between items-center py-2 text-lg">
                            <span className={idx === 0 ? "text-hedera-green font-bold" : "text-white/80"}>#{idx + 1}</span>
                            <span className="font-mono text-white/70">{shortenAddress(l.account)}</span>
                            <span className="font-bold text-white mb-0">{(l.balance / 100000000).toLocaleString()}</span>
                        </div>
                    ))}
                    {leaders.length === 0 && (
                        <div className="text-center text-white/50 py-8">Awaiting initial snapshot...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

function App() {
    const [activeSection, setActiveSection] = useState('hero');
    const {
        connect,
        disconnect,
        isConnected,
        hbarBalance,
        hashplayBalance,
        accountId,
        fetchBalances,
        hashconnect
    } = useHashConnect();
    const [isPending, setIsPending] = useState(false);

    const handlePlay = async (wager, gameType, prediction) => {
        setIsPending(true);
        try {
            // Check association first
            const isAssociated = await checkTokenAssociation(accountId);

            if (!isAssociated) {
                alert("Please associate the $HASHPLAY token first.");
                const associateTx = buildAssociateTransaction(accountId);
                // In a real app we would send this to Hashpack to sign
                // await hashconnect.sendTransaction(hashconnect.hcData.topic, associateTx);
                // setIsPending(false);
                // return;
            }

            // Execute simulated game transaction
            const { tx, isWin, result, hbarWager } = await playGame(accountId, wager, hashconnect, hashconnect.hcData?.topic);

            // Send transaction to wallet
            // await hashconnect.sendTransaction(hashconnect.hcData.topic, tx);

            // Wait for consensus / simulation delay
            await new Promise(r => setTimeout(r, 2000));

            // Show result
            if (isWin) {
                alert(`YOU WON! Result: ${result}\nReward: ${hbarWager * 2} HBAR + ${hbarWager * 500} HASHPLAY`);
            } else {
                alert(`You lost. Result: ${result}\nMining Compensation: ${hbarWager * 200} HASHPLAY`);
            }

            // Manual refresh of balances
            await fetchBalances(accountId);
        } catch (error) {
            console.error("Game error:", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <LiquidBackground isPending={isPending} />

            {activeSection !== 'hero' && (
                <Header
                    isConnected={isConnected}
                    hbarBalance={hbarBalance}
                    hashplayBalance={hashplayBalance}
                    onConnect={connect}
                    onDisconnect={disconnect}
                />
            )}

            <main className="relative h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar">
                {activeSection === 'hero' ? (
                    <section className="snap-start w-full">
                        <HeroSection onEnter={() => setActiveSection('app')} />
                    </section>
                ) : (
                    <>
                        <section className="snap-start w-full">
                            <ArenaSection isConnected={isConnected} onPlay={handlePlay} />
                        </section>

                        <section className="snap-start w-full">
                            <LeaderboardSection />
                        </section>
                    </>
                )}
            </main>

            {activeSection !== 'hero' && <Footer />}

            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
        </>
    );
}

export default App;
