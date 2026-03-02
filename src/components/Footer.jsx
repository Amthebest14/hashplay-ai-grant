import React from 'react';
import { Twitter, MessageSquare } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 p-6 flex flex-col md:flex-row justify-between items-center pointer-events-none text-white/50 text-xs">
            <div className="pointer-events-auto mb-4 md:mb-0">
                rankings are snapshot-ready for the mainnet airdrop allocation.
            </div>

            <div className="flex items-center gap-6 pointer-events-auto">
                <a
                    href="https://portal.hedera.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-hedera-green transition-colors underline underline-offset-4"
                >
                    get testnet hbar
                </a>

                <a
                    href="https://x.com/HashPlayApp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 glass-panel rounded-full hover:bg-white/10 hover:text-white transition-all"
                >
                    <Twitter size={16} />
                </a>

                <a
                    href="https://discord.gg/8nvyyHPJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 glass-panel rounded-full hover:bg-white/10 hover:text-white transition-all"
                >
                    <MessageSquare size={16} />
                </a>
            </div>
        </footer>
    );
}
