"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Game configuration
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 300;
const DINO_WIDTH = 60;
const DINO_HEIGHT = 60;
const GROUND_HEIGHT = 20;
const JUMP_VELOCITY = 15;
const GRAVITY = 0.8;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 50;
const OBSTACLE_SPEED = 6;
const OBSTACLE_FREQUENCY = 100; // Lower is more frequent

interface DinoGameProps {
  gameContractAddress: string;
  nftContractAddress: string;
}

const DinoGame = ({ gameContractAddress, nftContractAddress }: DinoGameProps) => {
  const { address: connectedAddress, isConnected } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<any>({ 
    obstacles: [], 
    frameCount: 0,
    animationFrame: 0,
    gameOver: false
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [achievements, setAchievements] = useState({
    bronze: false,
    silver: false,
    gold: false,
  });

  // Game images
  const [gameImages, setGameImages] = useState<any>({
    dino: {
      run: [],
      jump: null,
      duck: [],
      dead: null
    },
    ground: null,
    obstacle: null,
    cloud: null
  });

  // Dino state
  const [dinoY, setDinoY] = useState(CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT);
  const [dinoVelocity, setDinoVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);

  // Handle jump
  const handleJump = () => {
    if (!isJumping && gameActive && !gameRef.current.gameOver) {
      setIsJumping(true);
      setDinoVelocity(-JUMP_VELOCITY);
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "ArrowUp") && gameActive && !gameRef.current.gameOver) {
        handleJump();
        e.preventDefault();
      } else if (e.code === "ArrowDown" && gameActive && !gameRef.current.gameOver) {
        setIsDucking(true);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") {
        setIsDucking(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameActive]);

  // Handle touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouch = (e: TouchEvent) => {
      if (gameActive && !gameRef.current.gameOver) {
        // Jump if touch is in the top half of the canvas
        const touchY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
        if (touchY < CANVAS_HEIGHT / 2) {
          handleJump();
        } else {
          setIsDucking(true);
        }
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      setIsDucking(false);
    };

    canvas.addEventListener("touchstart", handleTouch as EventListener);
    canvas.addEventListener("touchend", handleTouchEnd as EventListener);
    return () => {
      canvas.removeEventListener("touchstart", handleTouch as EventListener);
      canvas.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [gameActive, canvasRef]);

  // Load game assets
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        // Load dino images
        const dinoRun1 = await loadImage('/assets/dino-run1.png');
        const dinoRun2 = await loadImage('/assets/dino-run2.png');
        const dinoJump = await loadImage('/assets/dino-jump.png');
        const dinoDuck1 = await loadImage('/assets/dino-duck1.png');
        const dinoDuck2 = await loadImage('/assets/dino-duck2.png');
        const dinoDead = await loadImage('/assets/dino-dead.png');
        
        // Load environment images
        const groundImg = await loadImage('/assets/ground.png');
        const cactusImg = await loadImage('/assets/cactus.png');
        const cloudImg = await loadImage('/assets/cloud.png');
        
        // Set game images
        setGameImages({
          dino: {
            run: [dinoRun1, dinoRun2],
            jump: dinoJump,
            duck: [dinoDuck1, dinoDuck2],
            dead: dinoDead
          },
          ground: groundImg,
          obstacle: cactusImg,
          cloud: cloudImg
        });

        // Draw initial scene
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawInitialScene(ctx);
          }
        }
      } catch (error) {
        console.error('Error loading game assets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []);

  // Helper function to load images
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Game loop
  useEffect(() => {
    if (!gameActive) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 60;
    const frameTime = 1000 / fps;

    const game = gameRef.current;
    game.obstacles = [];
    game.frameCount = 0;
    game.gameOver = false;

    const gameLoop = (timestamp: number) => {
      if (!gameActive) return;
      
      // Calculate delta time
      const deltaTime = timestamp - lastTime;
      
      if (deltaTime >= frameTime) {
        lastTime = timestamp;
        
        // Update game state
        updateGameState();
        
        // Draw game
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawGame(ctx);
          }
        }
      }
      
      // Continue game loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameActive]);

  // Update game state
  const updateGameState = () => {
    const game = gameRef.current;
    
    // Increment frame count
    game.frameCount++;
    
    // Update dino position with gravity
    if (isJumping) {
      setDinoY(prevY => {
        const newY = prevY + dinoVelocity;
        setDinoVelocity(prevVel => prevVel + GRAVITY);
        
        // Check if landed
        if (newY >= CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT) {
          setIsJumping(false);
          setDinoVelocity(0);
          return CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT;
        }
        
        return newY;
      });
    }
    
    // Generate obstacles
    if (game.frameCount % OBSTACLE_FREQUENCY === 0 && !game.gameOver) {
      game.obstacles.push({
        x: CANVAS_WIDTH,
        y: CANVAS_HEIGHT - OBSTACLE_HEIGHT - GROUND_HEIGHT,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT
      });
    }
    
    // Move obstacles
    for (let i = 0; i < game.obstacles.length; i++) {
      game.obstacles[i].x -= OBSTACLE_SPEED;
      
      // Remove obstacles that are off screen
      if (game.obstacles[i].x + OBSTACLE_WIDTH < 0) {
        game.obstacles.splice(i, 1);
        i--;
      }
    }
    
    // Check for collisions
    if (!game.gameOver) {
      for (const obstacle of game.obstacles) {
        if (checkCollision(obstacle)) {
          game.gameOver = true;
          setGameActive(false);
          break;
        }
      }
    }
    
    // Increment score
    if (!game.gameOver) {
      setScore(prevScore => prevScore + 1);
    }
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
    }
    
    // Check achievements
    if (score >= 100 && !achievements.bronze) {
      setAchievements(prev => ({ ...prev, bronze: true }));
    }
    if (score >= 300 && !achievements.silver) {
      setAchievements(prev => ({ ...prev, silver: true }));
    }
    if (score >= 500 && !achievements.gold) {
      setAchievements(prev => ({ ...prev, gold: true }));
    }
    
    // Update animation frame
    if (game.frameCount % 10 === 0) {
      game.animationFrame = (game.animationFrame + 1) % 2;
    }
  };

  // Draw initial scene
  const drawInitialScene = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Draw dino (simple rectangle if images not loaded)
    ctx.fillStyle = '#555';
    ctx.fillRect(50, CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT, DINO_WIDTH, DINO_HEIGHT);
    
    // Draw instructions
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Press Start to Play', CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2);
  };

  // Check collision function
  const checkCollision = (obstacle: {x: number, y: number, width: number, height: number}) => {
    const dinoX = 50; // Dino's fixed X position
    
    // Adjust hitbox for ducking
    const actualDinoHeight = isDucking ? DINO_HEIGHT / 2 : DINO_HEIGHT;
    const actualDinoWidth = isDucking ? DINO_WIDTH * 1.2 : DINO_WIDTH;
    
    // Simple rectangle collision detection
    return (
      dinoX < obstacle.x + obstacle.width &&
      dinoX + actualDinoWidth > obstacle.x &&
      dinoY < obstacle.y + obstacle.height &&
      dinoY + actualDinoHeight > obstacle.y
    );
  };

  // Draw game function
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw ground
    if (gameImages.ground) {
      // Draw repeating ground
      const groundPattern = ctx.createPattern(gameImages.ground, 'repeat-x');
      if (groundPattern) {
        ctx.fillStyle = groundPattern;
        ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
      }
    } else {
      // Fallback if image not loaded
      ctx.fillStyle = '#333';
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    }
    
    // Draw obstacles
    const game = gameRef.current;
    for (const obstacle of game.obstacles) {
      if (gameImages.obstacle) {
        ctx.drawImage(gameImages.obstacle, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#0a0';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    }
    
    // Draw dino
    const dinoX = 50; // Dino's fixed X position
    
    if (gameRef.current.gameOver && gameImages.dino.dead) {
      // Draw dead dino
      ctx.drawImage(gameImages.dino.dead, dinoX, dinoY, DINO_WIDTH, DINO_HEIGHT);
    } else if (isJumping && gameImages.dino.jump) {
      // Draw jumping dino
      ctx.drawImage(gameImages.dino.jump, dinoX, dinoY, DINO_WIDTH, DINO_HEIGHT);
    } else if (isDucking && gameImages.dino.duck.length > 0) {
      // Draw ducking dino
      const duckImg = gameImages.dino.duck[game.animationFrame % gameImages.dino.duck.length];
      ctx.drawImage(duckImg, dinoX, dinoY, DINO_WIDTH, DINO_HEIGHT / 2);
    } else if (gameImages.dino.run.length > 0) {
      // Draw running dino
      const runImg = gameImages.dino.run[game.animationFrame % gameImages.dino.run.length];
      ctx.drawImage(runImg, dinoX, dinoY, DINO_WIDTH, DINO_HEIGHT);
    } else {
      // Fallback if images not loaded
      ctx.fillStyle = '#555';
      ctx.fillRect(dinoX, dinoY, DINO_WIDTH, DINO_HEIGHT);
    }
    
    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, CANVAS_WIDTH - 150, 30);
  };

  // Contract write hook for starting the game
  const { writeContractAsync: startGameWrite } = useScaffoldWriteContract({
    contractName: "DinoGameManager",
  });

  // Handle start game
  const handleStartGame = async () => {
    setIsStartingGame(true);
    try {
      // Call the contract to start the game
      await startGameWrite({
        functionName: "startGame",
        value: BigInt(10000000000000000), // 0.01 ETH in wei
      });
      
      // Reset game state
      setScore(0);
      setDinoY(CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT);
      setDinoVelocity(0);
      setIsJumping(false);
      setIsDucking(false);
      
      // Reset achievements for this session
      setAchievements({
        bronze: false,
        silver: false,
        gold: false,
      });
      
      // Start the game
      setGameActive(true);
      
      // Draw initial game state
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawGame(ctx);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setIsStartingGame(false);
    }
  };



  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-3xl bg-base-200 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Dino Runner Game</h2>
        
        {isConnected ? (
          <>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm opacity-70">Connected Address:</p>
                <Address address={connectedAddress} />
              </div>
              <div>
                <p className="text-sm opacity-70">Your Balance:</p>
                <Balance address={connectedAddress} />
              </div>
            </div>
            
            <div className="flex justify-between mb-4">
              <div>
                <p>Current Score: {score}</p>
                <p>High Score: {highScore}</p>
              </div>
              <div>
                <p className="font-bold">Achievements:</p>
                <div className="flex gap-2">
                  <span className={`badge ${achievements.bronze ? "badge-success" : "badge-outline"}`}>Bronze</span>
                  <span className={`badge ${achievements.silver ? "badge-success" : "badge-outline"}`}>Silver</span>
                  <span className={`badge ${achievements.gold ? "badge-success" : "badge-outline"}`}>Gold</span>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-base-300 rounded-md overflow-hidden mb-4 relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                  <div className="flex flex-col items-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-2">Loading game assets...</p>
                  </div>
                </div>
              )}
              <canvas 
                ref={canvasRef} 
                width={CANVAS_WIDTH} 
                height={CANVAS_HEIGHT} 
                className="bg-white" 
                style={{ touchAction: 'none' }}
                onClick={gameActive ? handleJump : undefined}
              />
            </div>
            
            <div className="flex justify-center">
              {!gameActive && (
                <button
                  className="btn btn-primary"
                  onClick={handleStartGame}
                  disabled={isStartingGame || gameActive}
                >
                  {isStartingGame ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Starting...
                    </>
                  ) : (
                    "Start Game (0.01 MON)"
                  )}
                </button>
              )}
              {gameActive && (
                <div className="text-center">
                  <p className="mb-2 font-bold">Game is active!</p>
                  <p className="text-sm">Press SPACE or UP ARROW to jump</p>
                  <p className="text-sm">Click or tap on the canvas to jump</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm opacity-70">
              <p>🥉 Bronze: Score 100+ points</p>
              <p>🥈 Silver: Score 300+ points</p>
              <p>🥇 Gold: Score 500+ points</p>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="mb-4">Please connect your wallet to play!</p>
            <p className="text-sm opacity-70">
              This game requires a connected wallet and 0.01 MON to play. You will be able to mint NFT achievements based
              on your score!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DinoGame;
