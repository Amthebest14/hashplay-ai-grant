import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function CoinMesh({ isFlipping, targetRotation }) {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (isFlipping) {
            meshRef.current.rotation.x += delta * 15;
            meshRef.current.rotation.y += delta * 5;
        } else if (targetRotation) {
            meshRef.current.rotation.x += (targetRotation.x - meshRef.current.rotation.x) * 0.1;
            meshRef.current.rotation.y += (targetRotation.y - meshRef.current.rotation.y) * 0.1;
            meshRef.current.rotation.z += (targetRotation.z - meshRef.current.rotation.z) * 0.1;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            {/* Simplified text representation. Real app would use a displacement map or texture */}
        </mesh>
    );
}

export default function CoinFlip({ isConnected, onPlay }) {
    const [wager, setWager] = useState(5);
    const [prediction, setPrediction] = useState('heads');
    const [isFlipping, setIsFlipping] = useState(false);
    const [coinRot, setCoinRot] = useState({ x: Math.PI / 2, y: 0, z: 0 });

    const wagers = [5, 10, 25, 50, 100, 500];

    const handleFlip = async () => {
        if (!isConnected || isFlipping) return;

        setIsFlipping(true);

        setTimeout(async () => {
            // Simulate settling on heads or tails
            const isHeads = Math.random() > 0.5;
            setCoinRot({
                x: isHeads ? Math.PI / 2 : -Math.PI / 2,
                y: 0,
                z: 0
            });

            setIsFlipping(false);

            if (onPlay) {
                await onPlay(wager, 'coin', prediction);
            }
        }, 2000);
    };

    return (
        <div className="flex-1 glass-panel p-6 flex flex-col items-center justify-between min-h-[450px]">
            <h3 className="text-xl font-bold mb-2 tracking-widest text-hedera-green">FLIP COIN</h3>

            {/* 3D Canvas */}
            <div className="w-full h-48 rounded-xl overflow-hidden bg-black/50 mb-4 border border-white/10 relative">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD700" />
                    <CoinMesh isFlipping={isFlipping} targetRotation={coinRot} />
                </Canvas>
            </div>

            <div className="w-full space-y-4">
                {/* Prediction Selection */}
                <div className="flex justify-between gap-2">
                    {['heads', 'tails'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPrediction(p)}
                            className={`flex-1 py-2 text-xs uppercase tracking-widest rounded-lg border transition-all ${prediction === p
                                    ? 'bg-hedera-green text-black border-hedera-green font-bold'
                                    : 'border-white/20 text-white/70 hover:border-white/50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Wager Selection */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {wagers.map(w => (
                        <button
                            key={w}
                            onClick={() => setWager(w)}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${wager === w
                                    ? 'bg-white text-black border-white font-bold'
                                    : 'border-white/20 text-white/70 hover:border-white/50'
                                }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>

                {/* Flip Button */}
                <button
                    onClick={handleFlip}
                    disabled={!isConnected || isFlipping}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${isConnected && !isFlipping
                            ? 'bg-hedera-green text-black hover:bg-white'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                >
                    {isFlipping ? 'Flipping...' : !isConnected ? 'Connect to Flip' : 'FLIP COIN'}
                </button>
            </div>
        </div>
    );
}
