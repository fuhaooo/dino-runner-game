import React from 'react';
import { Address, Balance } from "~~/components/scaffold-eth";
import { GameState } from './GameEngine';

interface GameUIProps {
  isConnected: boolean;
  connectedAddress?: string;
  gameState: GameState;
  isStartingGame: boolean;
  isLoading: boolean;
  handleStartGame: () => void;
  handleJump: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  isConnected,
  connectedAddress,
  gameState,
  isStartingGame,
  isLoading,
  handleStartGame,
  handleJump
}) => {
  const { 
    score, 
    highScore, 
    gameActive, 
    gameOver,
    achievements 
  } = gameState;

  return (
    <div className="w-full max-w-4xl bg-base-200 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
        <img src="/assets/Dino/DinoRun1.png" alt="Dino" className="h-10 mr-2" />
        Dino Runner Game
      </h2>
      
      {isConnected ? (
        <>
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm opacity-70">Connected Address:</p>
              {connectedAddress && <Address address={connectedAddress} />}
            </div>
            <div>
              <p className="text-sm opacity-70">Your Balance:</p>
              {connectedAddress && <Balance address={connectedAddress} />}
            </div>
          </div>
          
          <div className="flex justify-between mb-4 bg-base-100 p-3 rounded-lg shadow-sm">
            <div>
              <p className="font-bold">Current Score: <span className="text-xl">{score}</span></p>
              <p>High Score: {highScore}</p>
            </div>
            <div>
              <p className="font-bold">Achievements:</p>
              <div className="flex gap-2">
                <span className={`text-2xl ${achievements.bronze ? "opacity-100" : "opacity-40"}`}>🥉</span>
                <span className={`text-2xl ${achievements.silver ? "opacity-100" : "opacity-40"}`}>🥈</span>
                <span className={`text-2xl ${achievements.gold ? "opacity-100" : "opacity-40"}`}>🥇</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden mb-4 relative shadow-md" 
               style={{ 
                 backgroundImage: "url('/assets/DinoWallpaper.png')", 
                 backgroundSize: 'cover', 
                 backgroundPosition: 'center' 
               }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-80 z-10">
                <div className="flex flex-col items-center bg-base-200 p-6 rounded-lg shadow-lg">
                  <span className="loading loading-spinner loading-lg"></span>
                  <p className="mt-2 font-bold">Loading game assets...</p>
                </div>
              </div>
            )}
            
            {/* Canvas container - actual canvas is rendered in the parent component */}
            <div className="relative" id="canvas-container">
              {/* Game Over Screen */}
              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-base-100 bg-opacity-90 p-6 rounded-lg shadow-lg text-center">
                    <img src="/assets/Other/GameOver.png" alt="Game Over" className="h-16 mx-auto mb-4" />
                    <p className="text-2xl font-bold mb-2">Score: {score}</p>
                    {score > 0 && score >= 100 && (
                      <div className="my-2">
                        <p className="font-bold">Achievements Earned:</p>
                        <div className="flex justify-center gap-2 my-2">
                          {score >= 100 && <span className="text-2xl">🥉</span>}
                          {score >= 300 && <span className="text-2xl">🥈</span>}
                          {score >= 500 && <span className="text-2xl">🥇</span>}
                        </div>
                      </div>
                    )}
                    <button
                      className="btn btn-primary mt-4"
                      onClick={handleStartGame}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              {/* Start Game UI */}
              {!gameActive && !isStartingGame && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-base-100 bg-opacity-90 p-6 rounded-lg shadow-lg text-center">
                    <img src="/assets/Dino/DinoStart.png" alt="Dino" className="h-24 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Ready to Run?</h2>
                    <p className="mb-4">Avoid obstacles and earn achievements!</p>
                    <button
                      className="btn btn-primary"
                      onClick={handleStartGame}
                      disabled={isStartingGame}
                    >
                      Start Game (0.01 MON)
                    </button>
                    <div className="mt-4 text-sm">
                      <p><kbd className="kbd kbd-sm">SPACE</kbd> or <kbd className="kbd kbd-sm">↑</kbd> to Jump</p>
                      <p><kbd className="kbd kbd-sm">↓</kbd> to Duck</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading Game UI */}
              {isStartingGame && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-base-100 bg-opacity-90 p-6 rounded-lg shadow-lg text-center">
                    <span className="loading loading-spinner loading-lg block mx-auto mb-4"></span>
                    <p className="font-bold">Connecting to Monad...</p>
                    <p className="text-sm mt-2">Please confirm the transaction in your wallet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            {gameActive && (
              <div className="text-center bg-base-100 p-3 rounded-lg shadow-md">
                <p className="mb-2 font-bold">Game Controls:</p>
                <div className="flex gap-4 justify-center">
                  <div className="text-center">
                    <kbd className="kbd">↑</kbd>
                    <p className="text-xs mt-1">Jump</p>
                  </div>
                  <div className="text-center">
                    <kbd className="kbd">SPACE</kbd>
                    <p className="text-xs mt-1">Jump</p>
                  </div>
                  <div className="text-center">
                    <kbd className="kbd">↓</kbd>
                    <p className="text-xs mt-1">Duck</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 bg-base-100 p-4 rounded-lg shadow-md">
            <h3 className="font-bold mb-2">Achievements</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg ${achievements.bronze ? 'bg-amber-100' : 'bg-base-300'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥉</span>
                  <div>
                    <p className="font-bold">Bronze</p>
                    <p className="text-xs">Score 5,000+ points</p>
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${achievements.silver ? 'bg-slate-100' : 'bg-base-300'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥈</span>
                  <div>
                    <p className="font-bold">Silver</p>
                    <p className="text-xs">Score 10,000+ points</p>
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${achievements.gold ? 'bg-yellow-100' : 'bg-base-300'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥇</span>
                  <div>
                    <p className="font-bold">Gold</p>
                    <p className="text-xs">Score 15,000+ points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 bg-base-100 rounded-lg shadow-md">
          <img src="/assets/Dino/DinoStart.png" alt="Dino" className="h-24 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet to Play</h2>
          <p className="mb-4">This game requires a connected wallet and 0.01 MON to play.</p>
          <p className="text-sm opacity-70 max-w-md mx-auto">
            Earn NFT achievements based on your score! Jump over obstacles, avoid birds, and see how far you can go!
          </p>
        </div>
      )}
    </div>
  );
};

export default GameUI;
