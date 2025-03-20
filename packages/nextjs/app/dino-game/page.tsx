"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import SimpleGame from "~~/components/dino-game/SimpleGame";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const DinoGamePage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [gameContractAddress, setGameContractAddress] = useState<string>("");
  const [nftContractAddress, setNftContractAddress] = useState<string>("");

  // Get deployed contract info
  const { data: dinoGameInfo } = useDeployedContractInfo("DinoGameManager");
  const { data: nftInfo } = useDeployedContractInfo("DinoAchievementNFT");

  useEffect(() => {
    if (dinoGameInfo?.address) {
      setGameContractAddress(dinoGameInfo.address);
    }
    if (nftInfo?.address) {
      setNftContractAddress(nftInfo.address);
    }
  }, [dinoGameInfo, nftInfo]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-3xl">
          <h1 className="text-center mb-6">
            <span className="block text-4xl font-bold">Dino Runner Game</span>
            <span className="block text-xl mt-1 opacity-70">Powered by Web3</span>
          </h1>

          {isConnected ? (
            <div className="mb-8 text-center">
              <p className="mb-2">Ready to play? Start the game to begin your dino adventure!</p>
              <p className="text-sm opacity-70">Each game costs 0.01 MON. Earn achievements as NFTs based on your score.</p>
            </div>
          ) : (
            <div className="alert alert-warning mb-8 max-w-2xl mx-auto">
              <div className="flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 mx-2 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <label>Please connect your wallet to play the game and earn NFT achievements!</label>
              </div>
            </div>
          )}

          {gameContractAddress && nftContractAddress ? (
            <SimpleGame gameContractAddress={gameContractAddress} nftContractAddress={nftContractAddress} />
          ) : (
            <div className="alert alert-error shadow-lg max-w-2xl mx-auto">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Game contracts not deployed yet. Please deploy the contracts first.</span>
              </div>
            </div>
          )}

          <div className="mt-10 bg-base-200 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Connect your wallet to the Monad testnet</li>
              <li>Click "Start Game" and approve the 0.01 MON transaction</li>
              <li>Press SPACE or UP ARROW key to make the dino jump over obstacles</li>
              <li>Avoid obstacles and collect points</li>
              <li>Reach score thresholds to earn exclusive NFT achievements:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Score 100+ points: Bronze Achievement NFT</li>
                  <li>Score 300+ points: Silver Achievement NFT</li>
                  <li>Score 500+ points: Gold Achievement NFT</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default DinoGamePage;
