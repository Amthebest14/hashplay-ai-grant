import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';

function DiceMesh({ position, isRolling, targetRotation }) {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (isRolling) {
            meshRef.current.rotation.x += delta * 10;
            meshRef.current.rotation.y += delta * 12;
            meshRef.current.rotation.z += delta * 8;
        } else if (targetRotation) {
            // Smoothly interpolate to target rotation
            meshRef.current.rotation.x += (targetRotation.x - meshRef.current.rotation.x) * 0.1;
            meshRef.current.rotation.y += (targetRotation.y - meshRef.current.rotation.y) * 0.1;
            meshRef.current.rotation.z += (targetRotation.z - meshRef.current.rotation.z) * 0.1;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            {/* Very simplified dice representation for demo */}
            <meshStandardMaterial attach="material-0" color="#ff0000" /> {/* sides to tell them apart */}
            <meshStandardMaterial attach="material-1" color="#00ff00" />
            <meshStandardMaterial attach="material-2" color="#0000ff" />
            <meshStandardMaterial attach="material-3" color="#ffff00" />
            <meshStandardMaterial attach="material-4" color="#ff00ff" />
            <meshStandardMaterial attach="material-5" color="#00ffff" />
        </mesh>
    );
}

export default function DiceGame({ isConnected, onPlay }) {
    const [wager, setWager] = useState(5);
    const [prediction, setPrediction] = useState('higher'); // higher, equal, lower
    const [isRolling, setIsRolling] = useState(false);
    const [dice1Rot, setDice1Rot] = useState({ x: 0, y: 0, z: 0 });
    const [dice2Rot, setDice2Rot] = useState({ x: 0, y: 0, z: 0 });

    const wagers = [5, 10, 25, 50, 100, 500];

    const handleRoll = async () => {
        if (!isConnected || isRolling) return;

        setIsRolling(true);

        // Simulate roll time
        setTimeout(async () => {
            // Pick random rotations for the dice landing
            setDice1Rot({ x: Math.random() * Math.PI * 4, y: Math.random() * Math.PI * 4, z: 0 });
            setDice2Rot({ x: Math.random() * Math.PI * 4, y: Math.random() * Math.PI * 4, z: 0 });

            setIsRolling(false);

            // Call parent logic
            if (onPlay) {
                await onPlay(wager, 'dice', prediction);
            }
        }, 2000);
    };

    return (
        <div className="flex-1 glass-panel p-6 flex flex-col items-center justify-between min-h-[450px]">
            <h3 className="text-xl font-bold mb-2 tracking-widest text-hedera-green">ROLL DICE</h3>

            {/* 3D Canvas */}
            <div className="w-full h-48 rounded-xl overflow-hidden bg-black/50 mb-4 border border-white/10 relative">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <DiceMesh position={[-1.2, 0, 0]} isRolling={isRolling} targetRotation={dice1Rot} />
                    <DiceMesh position={[1.2, 0, 0]} isRolling={isRolling} targetRotation={dice2Rot} />
                </Canvas>
            </div>

            <div className="w-full space-y-4">
                {/* Prediction Selection */}
                <div className="flex justify-between gap-2">
                    {['lower', 'equal', 'higher'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPrediction(p)}
                            className={`flex-1 py-2 text-xs uppercase tracking-widest rounded-lg border transition-all ${prediction === p
                                    ? 'bg-hedera-green text-black border-hedera-green font-bold'
                                    : 'border-white/20 text-white/70 hover:border-white/50'
                                }`}
                        >
                            {p} (7)
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

                {/* Roll Button */}
                <button
                    onClick={handleRoll}
                    disabled={!isConnected || isRolling}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${isConnected && !isRolling
                            ? 'bg-hedera-green text-black hover:bg-white'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                >
                    {isRolling ? 'Rolling...' : !isConnected ? 'Connect to Roll' : 'ROLL DICE'}
                </button>
            </div>
        </div>
    );
}
