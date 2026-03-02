import React from 'react';
import { Wallet, X } from 'lucide-react';

export default function Header({ isConnected, hbarBalance, hashplayBalance, onConnect, onDisconnect }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
            <div className="font-bold text-xl tracking-widest text-white">
                HASHPLAY<span className="text-hedera-green">.AI</span>
            </div>

            <div className="pointer-events-auto">
                {!isConnected ? (
                    <button
                        onClick={onConnect}
                        className="flex items-center gap-2 px-6 py-3 rounded-full glass-panel hover:bg-white/10 transition-colors uppercase text-sm tracking-widest"
                    >
                        <Wallet size={16} />
                        Connect Wallet
                    </button>
                ) : (
                    <div className="flex items-center gap-2 glass-panel p-2 rounded-full">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span className="text-sm font-medium">{hbarBalance} HBAR</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-1.5 bg-hedera-green/20 rounded-full border border-hedera-green/30 text-hedera-green">
                            <span className="w-2 h-2 rounded-full bg-hedera-green animate-pulse"></span>
                            <span className="text-sm font-medium">{hashplayBalance} $HASHPLAY</span>
                        </div>

                        <button
                            onClick={onDisconnect}
                            className="p-2 ml-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                            title="Disconnect"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
