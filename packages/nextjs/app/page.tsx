"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Web3 Dino Runner Game</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <p className="text-center text-lg mt-4">
            Play our exciting Dino Runner game with Web3 features!
          </p>
          <p className="text-center text-sm opacity-70">
            Spend 0.01 MON to play and earn NFT achievements for your high scores
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <PlayCircleIcon className="h-8 w-8 fill-primary" />
              <p className="mt-2 mb-4">
                Play the Dino Runner Game and earn NFT achievements!
              </p>
              <Link href="/dino-game" className="btn btn-primary">
                Play Game
              </Link>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p className="mt-2 mb-4">
                Tinker with game contracts using the Debug panel
              </p>
              <Link href="/debug" className="btn btn-secondary">
                Debug Contracts
              </Link>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-accent" />
              <p className="mt-2 mb-4">
                View your transactions and NFTs in the explorer
              </p>
              <Link href="/blockexplorer" className="btn btn-accent">
                Block Explorer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
