"use client";

import React, { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

interface SimpleGameProps {
  gameContractAddress: string;
  nftContractAddress: string;
}

const SimpleGame: React.FC<SimpleGameProps> = ({ gameContractAddress, nftContractAddress }) => {
  const { address: connectedAddress, isConnected } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw a simple rectangle
    ctx.fillStyle = '#333';
    ctx.fillRect(50, 50, 100, 100);
    
    // Add text
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Simple Game', 200, 100);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-3xl bg-base-200 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Simple Game</h2>
        
        {isConnected ? (
          <>
            <div className="mb-4">
              <p className="text-sm opacity-70">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
            
            <div className="border-2 border-base-300 rounded-md overflow-hidden mb-4">
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={200} 
                className="bg-white" 
              />
            </div>
            
            <div className="flex justify-center">
              <button className="btn btn-primary">
                Start Game
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="mb-4">Please connect your wallet to play!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleGame;
