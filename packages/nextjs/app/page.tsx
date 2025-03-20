"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [dinoPosition, setDinoPosition] = useState({ x: 50, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Animation effect for the dino
  useEffect(() => {
    const jumpSequence = [0, 20, 40, 60, 50, 40, 20, 0];
    let jumpIndex = 0;
    let frameCount = 0;

    const animate = () => {
      frameCount++;

      // Handle jumping animation
      if (isJumping) {
        setDinoPosition(prev => ({
          ...prev,
          y: jumpSequence[jumpIndex],
        }));

        if (frameCount % 4 === 0) {
          jumpIndex++;
          if (jumpIndex >= jumpSequence.length) {
            jumpIndex = 0;
            setIsJumping(false);
          }
        }
      } else if (frameCount % 15 === 0 && Math.random() < 0.1) {
        // Random jumps when not already jumping
        setIsJumping(true);
      }

      // Handle running animation
      if (frameCount % 10 === 0) {
        setFrameIndex(prev => (prev === 0 ? 1 : 0));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isJumping]);

  return (
    <>
      <div
        className="flex items-center flex-col flex-grow relative overflow-hidden"
        style={{
          backgroundImage: "url(/assets/Background/dino-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        {/* Overlay to make content readable */}
        <div
          className={`absolute inset-0 ${isDarkMode ? "bg-black bg-opacity-60" : "bg-black bg-opacity-40"} z-0`}
        ></div>

        {/* X Button */}
        <div className="absolute top-4 right-4 z-20">
          <Link
            href="https://x.com/Alfredfuuu"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center p-2 rounded-full ${isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"} transition-colors duration-200`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`${isDarkMode ? "text-white" : "text-black"}`}
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
          </Link>
        </div>

        {/* Small animated dino */}
        <div
          className="absolute z-10 transition-all duration-300 ease-in-out"
          style={{
            bottom: `${100 + dinoPosition.y}px`,
            left: `${dinoPosition.x}px`,
            transform: "scale(0.5)",
          }}
        >
          <Image src={`/assets/Dino/DinoRun${frameIndex + 1}.png`} alt="Running Dino" width={60} height={60} />
        </div>

        <div className="px-5 z-10 mt-20">
          <h1 className="text-center">
            <span className="block text-3xl mb-2 text-yellow-300">Welcome to</span>
            <span className="block text-6xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Dino Runner
            </span>
          </h1>
          <div
            className={`flex justify-center items-center space-x-2 flex-col mt-4 ${isDarkMode ? "bg-gray-900 bg-opacity-80" : "bg-white bg-opacity-80"} p-4 rounded-xl shadow-lg`}
          >
            <p className={`my-2 font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <div
            className={`text-center mt-8 p-6 ${isDarkMode ? "bg-gray-900 bg-opacity-80" : "bg-white bg-opacity-80"} rounded-xl max-w-lg mx-auto shadow-lg`}
          >
            <p className={`text-xl ${isDarkMode ? "text-white" : "text-gray-800"} mb-2`}>
              Run, jump, and avoid obstacles in this exciting Web3 game!
            </p>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Spend 0.01 MON to play and earn NFT achievements at{" "}
              <span className="text-yellow-600 font-bold">5000</span>,{" "}
              <span className={`${isDarkMode ? "text-gray-300" : "text-gray-500"} font-bold`}>10000</span>, and{" "}
              <span className="text-yellow-500 font-bold">15000</span> points!
            </p>
          </div>
        </div>

        <div className="w-full mt-16 px-8 py-12 z-10">
          <div className="flex justify-center items-center gap-8 flex-col md:flex-row max-w-6xl mx-auto">
            <div
              className={`flex flex-col ${isDarkMode ? "bg-gray-900" : "bg-white"} bg-opacity-90 border border-yellow-500 px-10 py-10 text-center items-center max-w-xs rounded-2xl transform transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]`}
            >
              <PlayCircleIcon className="h-12 w-12 text-yellow-500" />
              <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"} mt-2`}>Play Now!</h3>
              <p className={`mt-2 mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Run through the desert, avoid obstacles, and set a high score!
              </p>
              <Link
                href="/dino-game"
                className="btn bg-yellow-500 hover:bg-yellow-600 border-none text-black font-bold px-8 py-3"
              >
                Start Game
              </Link>
            </div>

            <div
              className={`flex flex-col ${isDarkMode ? "bg-gray-900" : "bg-white"} bg-opacity-90 border border-blue-500 px-10 py-10 text-center items-center max-w-xs rounded-2xl transform transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
            >
              <BugAntIcon className="h-12 w-12 text-blue-500" />
              <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"} mt-2`}>
                Developer Tools
              </h3>
              <p className={`mt-2 mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Explore and interact with the game&apos;s smart contracts
              </p>
              <Link
                href="/debug"
                className="btn bg-blue-500 hover:bg-blue-600 border-none text-white font-bold px-8 py-3"
              >
                Debug Contracts
              </Link>
            </div>

            <div
              className={`flex flex-col ${isDarkMode ? "bg-gray-900" : "bg-white"} bg-opacity-90 border border-purple-500 px-10 py-10 text-center items-center max-w-xs rounded-2xl transform transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]`}
            >
              <MagnifyingGlassIcon className="h-12 w-12 text-purple-500" />
              <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"} mt-2`}>Explorer</h3>
              <p className={`mt-2 mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                View your achievements, transactions, and NFT collection
              </p>
              <Link
                href="/blockexplorer"
                className="btn bg-purple-500 hover:bg-purple-600 border-none text-white font-bold px-8 py-3"
              >
                View Explorer
              </Link>
            </div>
          </div>

          <div className={`text-center mt-16 ${isDarkMode ? "text-white" : "text-gray-800"} text-opacity-90 z-10`}>
            <p>Challenge yourself to beat the highest scores and collect all achievements!</p>
            <p className="mt-2 flex justify-center items-center gap-3 flex-wrap">
              <span className="inline-flex items-center">
                🥉 Bronze: <span className="text-yellow-600 font-bold">5,000 pts</span>
              </span>
              <span className="inline-flex items-center">
                🥈 Silver:{" "}
                <span className={`${isDarkMode ? "text-gray-300" : "text-gray-500"} font-bold`}>10,000 pts</span>
              </span>
              <span className="inline-flex items-center">
                🥇 Gold: <span className="text-yellow-500 font-bold">15,000 pts</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
