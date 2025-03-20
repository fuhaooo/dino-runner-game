"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address, Balance } from "~~/components/scaffold-eth";

// Import components
import GameControls from "./GameControls";

// Import game engine
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  DINO_WIDTH, 
  DINO_HEIGHT, 
  GROUND_HEIGHT,
  JUMP_VELOCITY,
  GRAVITY,
  OBSTACLE_WIDTH,
  OBSTACLE_HEIGHT,
  OBSTACLE_SPEED,
  OBSTACLE_FREQUENCY,
  GameState,
  GameImages,
  Obstacle
} from "./GameEngine";

// Import renderer
import { renderGame } from "./DinoRenderer";

interface DinoGameProps {
  gameContractAddress: string;
  nftContractAddress: string;
}

interface Achievements {
  bronze: boolean;
  silver: boolean;
  gold: boolean;
}

const DinoGame = ({ gameContractAddress, nftContractAddress }: DinoGameProps) => {
  const { address: connectedAddress, isConnected } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState & {
    isLoading: boolean;
    gameActive: boolean;
    dinoY: number;
    dinoVelocity: number;
    isJumping: boolean;
    isDucking: boolean;
    showRestart: boolean; // Added new property for UI control
  }>({
    obstacles: [], 
    frameCount: 0,
    animationFrame: 0,
    gameOver: false,
    score: 0,
    highScore: 0,
    isLoading: true,
    gameActive: false,
    dinoY: CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT, // Initial dino Y position
    dinoVelocity: 0,
    isJumping: false,
    isDucking: false,
    showRestart: false, // Initially hide restart UI
    achievements: {
      bronze: false,
      silver: false,
      gold: false
    }
  });
  
  // Additional references
  const animationRef = useRef<number | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);

  // Game images
  const [gameImages, setGameImages] = useState<GameImages>({
    dino: {
      run: [],
      jump: null,
      duck: [],
      dead: null,
      start: null
    },
    obstacles: {
      cactusSmall: [],
      cactusLarge: [],
      bird: []
    },
    environment: {
      ground: null,
      cloud: null
    },
    ui: {
      gameOver: null,
      restart: null
    }
  });
  
  // Reference to game state for animation frame
  const gameRef = useRef<any>(gameState);

  // Update gameRef when gameState changes
  useEffect(() => {
    gameRef.current = gameState;
  }, [gameState]);
  
  // Helper function to load images
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Load game assets
  useEffect(() => {
    const loadAssets = async () => {
      setGameState(prev => ({ ...prev, isLoading: true }));
      try {
        // Load dino images
        const dinoRun1 = await loadImage('/assets/Dino/DinoRun1.png');
        const dinoRun2 = await loadImage('/assets/Dino/DinoRun2.png');
        const dinoJump = await loadImage('/assets/Dino/DinoJump.png');
        const dinoDuck1 = await loadImage('/assets/Dino/DinoDuck1.png');
        const dinoDuck2 = await loadImage('/assets/Dino/DinoDuck2.png');
        const dinoDead = await loadImage('/assets/Dino/DinoDead.png');
        const dinoStart = await loadImage('/assets/Dino/DinoStart.png');
        
        // Load obstacle images
        const smallCactus1 = await loadImage('/assets/Cactus/SmallCactus1.png');
        const smallCactus2 = await loadImage('/assets/Cactus/SmallCactus2.png');
        const smallCactus3 = await loadImage('/assets/Cactus/SmallCactus3.png');
        const largeCactus1 = await loadImage('/assets/Cactus/LargeCactus1.png');
        const largeCactus2 = await loadImage('/assets/Cactus/LargeCactus2.png');
        const largeCactus3 = await loadImage('/assets/Cactus/LargeCactus3.png');
        
        // Load bird images
        const bird1 = await loadImage('/assets/Bird/Bird1.png');
        const bird2 = await loadImage('/assets/Bird/Bird2.png');
        
        // Load environment images
        const groundImg = await loadImage('/assets/Other/Track.png');
        const cloudImg = await loadImage('/assets/Other/Cloud.png');
        
        // Load UI images
        const gameOverImg = await loadImage('/assets/Other/GameOver.png');
        const restartImg = await loadImage('/assets/Other/Reset.png');
        
        setGameImages({
          dino: {
            run: [dinoRun1, dinoRun2],
            jump: dinoJump,
            duck: [dinoDuck1, dinoDuck2],
            dead: dinoDead,
            start: dinoStart
          },
          obstacles: {
            cactusSmall: [smallCactus1, smallCactus2, smallCactus3],
            cactusLarge: [largeCactus1, largeCactus2, largeCactus3],
            bird: [bird1, bird2]
          },
          environment: {
            ground: groundImg,
            cloud: cloudImg
          },
          ui: {
            gameOver: gameOverImg,
            restart: restartImg
          }
        });
        
        setGameState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Error loading game assets:', error);
        setGameState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    loadAssets();
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState.gameActive) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 60;
    const frameTime = 1000 / fps;
    const dinoX = 50; // Fixed dino X position

    // Reset obstacles at start of game
    setGameState(prev => ({
      ...prev,
      obstacles: [],
      frameCount: 0,
      gameOver: false
    }));

    const gameLoop = (timestamp: number) => {
      if (!gameState.gameActive) return;
      
      // Calculate delta time
      const deltaTime = timestamp - lastTime;
      
      if (deltaTime >= frameTime) {
        // Log to debug
        console.log('Game loop running, frame:', gameState.frameCount);
        lastTime = timestamp;
        
        // It's important to get the latest state each time
        // Update game state using a function to ensure we have the latest state
        setGameState(prevState => {
          // Create a copy of the current state
          const newGameState = { ...prevState };
        
          // Update dino position (gravity)
          if (newGameState.isJumping) {
            newGameState.dinoVelocity += GRAVITY;
            newGameState.dinoY += newGameState.dinoVelocity;
            
            // Check if dino landed
            if (newGameState.dinoY >= CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT) {
              newGameState.dinoY = CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT;
              newGameState.isJumping = false;
              newGameState.dinoVelocity = 0;
            }
          }
        
          // Increment frame count
          newGameState.frameCount++;
          
          // Generate obstacles with improved logic
          if (newGameState.frameCount % OBSTACLE_FREQUENCY === 0 && !newGameState.gameOver) {
            console.log('Generating obstacle at frame:', newGameState.frameCount);
            
            // Check distance to last obstacle to prevent overlapping
            const lastObstacle = newGameState.obstacles[newGameState.obstacles.length - 1];
            const minDistance = CANVAS_WIDTH / 2; // Minimum safe distance between obstacles
            
            // Only generate a new obstacle if there's enough space or no obstacles yet
            if (!lastObstacle || (lastObstacle && lastObstacle.x < CANVAS_WIDTH - minDistance)) {
              // Determine obstacle type with context awareness
              // If last obstacle was a bird, make this one a cactus and vice versa
              // This ensures variety and prevents impossible scenarios
              let obstacleType;
              
              if (!lastObstacle) {
                // First obstacle is usually a cactus (easier)
                obstacleType = 'cactus';
              } else if (lastObstacle.type === 'bird') {
                // Last was bird, so this should be cactus
                obstacleType = 'cactus';
              } else {
                // Last was cactus, can be either but bird is less likely
                obstacleType = Math.random() < 0.7 ? 'cactus' : 'bird';
              }
            
              if (obstacleType === 'cactus') {
              // Randomly choose between small and large cactus
              const isBigCactus = Math.random() < 0.5;
              const cactusHeight = isBigCactus ? OBSTACLE_HEIGHT * 1.5 : OBSTACLE_HEIGHT;
              const cactusWidth = isBigCactus ? OBSTACLE_WIDTH * 1.5 : OBSTACLE_WIDTH;
              
              // Create cactus variant name (e.g. 'large1' or 'small2')
              // Ensure we don't exceed the array bounds
              const largeLength = Math.max(1, gameImages.obstacles.cactusLarge.length);
              const smallLength = Math.max(1, gameImages.obstacles.cactusSmall.length);
              
              const cactusVariant = isBigCactus ? 
                `large${Math.floor(Math.random() * largeLength) + 1}` : 
                `small${Math.floor(Math.random() * smallLength) + 1}`;
              
              newGameState.obstacles.push({
                x: CANVAS_WIDTH,
                y: CANVAS_HEIGHT - cactusHeight - GROUND_HEIGHT,
                width: cactusWidth,
                height: cactusHeight,
                type: 'cactus',
                variant: cactusVariant
              });
            } else {
              // Bird obstacle - flies at different heights
              const birdHeight = DINO_HEIGHT * 0.8;
              const birdWidth = DINO_WIDTH * 1.2;
              
              // New bird height logic - birds should be higher so player needs to duck
              // Birds should be at either middle height (need to duck) or high (also need to duck)
              const birdY = Math.random() < 0.5 ? 
                CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT - birdHeight / 2 : // Middle bird (head height)
                CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT - birdHeight - 20; // High bird
              
              // Create bird variant
              const birdVariant = `flying${Math.floor(Math.random() * 2) + 1}`;
              
              newGameState.obstacles.push({
                x: CANVAS_WIDTH,
                y: birdY,
                width: birdWidth,
                height: birdHeight,
                type: 'bird',
                variant: birdVariant
              });
              }
            }
          }
        
          // Move obstacles
          for (let i = 0; i < newGameState.obstacles.length; i++) {
            newGameState.obstacles[i].x -= OBSTACLE_SPEED;
            
            // Remove obstacles that are off screen
            if (newGameState.obstacles[i].x + OBSTACLE_WIDTH < 0) {
              newGameState.obstacles.splice(i, 1);
              i--;
            }
          }
          
          // Check for collisions
          if (!newGameState.gameOver) {
            for (const obstacle of newGameState.obstacles) {
              if (checkCollision(obstacle, newGameState)) { // Use newGameState here instead of gameState
                console.log('Collision detected with obstacle type:', obstacle.type);
                newGameState.gameOver = true;
                newGameState.gameActive = false;
                // Set a flag to show restart option
                newGameState.showRestart = true;
                break;
              }
            }
          }
          
          // Increment score
          if (!newGameState.gameOver) {
            newGameState.score++;
          }
          
          // Update high score
          if (newGameState.score > newGameState.highScore) {
            newGameState.highScore = newGameState.score;
          }
          
          // Check achievements
          if (newGameState.score >= 100 && !newGameState.achievements.bronze) {
            newGameState.achievements.bronze = true;
          }
          if (newGameState.score >= 300 && !newGameState.achievements.silver) {
            newGameState.achievements.silver = true;
          }
          if (newGameState.score >= 500 && !newGameState.achievements.gold) {
            newGameState.achievements.gold = true;
          }
          
          // Update animation frame
          if (newGameState.frameCount % 10 === 0) {
            newGameState.animationFrame = (newGameState.animationFrame + 1) % 2;
          }
          
          // Draw game
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              console.log('Rendering game, obstacles:', newGameState.obstacles.length, 'frame:', newGameState.frameCount);
              console.log('Dino position:', dinoX, newGameState.dinoY, 'isJumping:', newGameState.isJumping);
              
              // Ensure we're using fully loaded images
              if (gameImages.dino.run.length > 0 && gameImages.environment.ground) {
                renderGame({
                  ctx,
                  gameImages,
                  gameState: newGameState,
                  dinoX
                });
              } else {
                console.error('Game images not fully loaded yet!');
              }
            }
          }
          
          return newGameState;
        });
      }
      
      // Continue game loop if not game over
      if (!gameState.gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      } else {
        console.log('Game over, stopping game loop');
        cancelAnimationFrame(animationFrameId);
      }
    };
    
    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameState.gameActive, gameImages]);

  // Draw initial scene when game is not active
  const drawInitialScene = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw ground
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Draw dino
    if (gameImages.dino.start) {
      ctx.drawImage(
        gameImages.dino.start,
        50, // dinoX
        CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT,
        DINO_WIDTH,
        DINO_HEIGHT
      );
    }
    
    // Draw start message
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press Start to Play', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
  }

  // Check collision function
  const checkCollision = (obstacle: {x: number, y: number, width: number, height: number, type?: string}, gameState: GameState & {
    isLoading: boolean;
    gameActive: boolean;
    dinoY: number;
    dinoVelocity: number;
    isJumping: boolean;
    isDucking: boolean;
  }) => {
    const dinoX = 50; // Dino's fixed X position
    
    // Adjust hitbox for ducking
    const actualDinoHeight = gameState.isDucking ? DINO_HEIGHT / 2 : DINO_HEIGHT;
    const actualDinoWidth = gameState.isDucking ? DINO_WIDTH * 1.2 : DINO_WIDTH;
    
    // Add some forgiveness to the hitbox (make it smaller than the visual)
    const hitboxMargin = 10;
    const dinoHitboxX = dinoX + hitboxMargin;
    const dinoHitboxY = gameState.dinoY + hitboxMargin;
    const dinoHitboxWidth = actualDinoWidth - (hitboxMargin * 2);
    const dinoHitboxHeight = actualDinoHeight - (hitboxMargin * 2);
    
    // For bird obstacles, adjust collision based on ducking state
    if (obstacle.type === 'bird') {
      // If bird is flying high and dino is ducking, no collision
      if (gameState.isDucking && obstacle.y < CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT) {
        return false;
      }
    }
    
    // Simple rectangle collision detection with adjusted hitbox
    return (
      dinoHitboxX < obstacle.x + obstacle.width - hitboxMargin &&
      dinoHitboxX + dinoHitboxWidth > obstacle.x + hitboxMargin &&
      dinoHitboxY < obstacle.y + obstacle.height - hitboxMargin &&
      dinoHitboxY + dinoHitboxHeight > obstacle.y + hitboxMargin
    );
  };

  // Draw game function
  const drawGame = (ctx: CanvasRenderingContext2D, gameState: GameState & {
    isLoading: boolean;
    gameActive: boolean;
    dinoY: number;
    dinoVelocity: number;
    isJumping: boolean;
    isDucking: boolean;
  }) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background (optional)
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw clouds (decorative)
    if (gameImages.environment.cloud) {
      const currentGameState = gameRef.current;
      // Draw clouds at different positions based on frame count
      const cloudPositions = [
        { x: (CANVAS_WIDTH + 200 - (currentGameState.frameCount * 0.5) % (CANVAS_WIDTH + 400)), y: 50 },
        { x: (CANVAS_WIDTH + 500 - (currentGameState.frameCount * 0.5) % (CANVAS_WIDTH + 800)), y: 80 },
        { x: (CANVAS_WIDTH + 800 - (currentGameState.frameCount * 0.5) % (CANVAS_WIDTH + 1200)), y: 30 }
      ];
      
      for (const pos of cloudPositions) {
        if (pos.x < CANVAS_WIDTH && pos.x > -100) {
          ctx.drawImage(gameImages.environment.cloud, pos.x, pos.y, 70, 40);
        }
      }
    }
    
    // Draw ground
    if (gameImages.environment.ground) {
      // Calculate ground scroll position based on frame count
      const currentGame = gameRef.current;
      const groundScroll = -(currentGame.frameCount * OBSTACLE_SPEED) % CANVAS_WIDTH;
      
      // Draw two copies of the ground to create seamless scrolling
      ctx.drawImage(gameImages.environment.ground, groundScroll, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
      ctx.drawImage(gameImages.environment.ground, groundScroll + CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    } else {
      // Fallback if image not loaded
      ctx.fillStyle = '#333';
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    }
    
    // Draw obstacles
    for (const obstacle of gameState.obstacles) {
      if (obstacle.type === 'cactus') {
        // Extract variant type (large or small) from the variant string
        const isLarge = obstacle.variant.startsWith('large');
        const cactusImages = isLarge ? 
          gameImages.obstacles.cactusLarge : 
          gameImages.obstacles.cactusSmall;
        
        // Extract the index from the variant (e.g., 'large1' => 0)
        const variantIndex = parseInt(obstacle.variant.replace(/[^0-9]/g, '')) - 1;
          
        if (cactusImages && cactusImages.length > variantIndex && variantIndex >= 0) {
          ctx.drawImage(cactusImages[variantIndex], obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
          // Fallback if image not loaded
          ctx.fillStyle = '#0a0';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
      } else if (obstacle.type === 'bird') {
        const birdImages = gameImages.obstacles.bird;
        if (birdImages && birdImages.length > 0) {
          // Animate bird flapping wings
          const birdIndex = Math.floor(gameState.frameCount / 15) % birdImages.length;
          ctx.drawImage(birdImages[birdIndex], obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
          // Fallback if image not loaded
          ctx.fillStyle = '#00a';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
      }
    }
    
    // Draw dino
    const dinoX = 50; // Dino's fixed X position
    
    // Draw the dino based on its current state
    if (gameState.gameOver && gameImages.dino.dead) {
      // Draw dead dino
      ctx.drawImage(gameImages.dino.dead, dinoX, gameState.dinoY, DINO_WIDTH, DINO_HEIGHT);
    } else if (gameState.isJumping && gameImages.dino.jump) {
      // Draw jumping dino
      ctx.drawImage(gameImages.dino.jump, dinoX, gameState.dinoY, DINO_WIDTH, DINO_HEIGHT);
    } else if (gameState.isDucking && gameImages.dino.duck.length > 0) {
      // Draw ducking dino
      const duckImg = gameImages.dino.duck[gameState.animationFrame % gameImages.dino.duck.length];
      ctx.drawImage(duckImg, dinoX, gameState.dinoY, DINO_WIDTH, DINO_HEIGHT / 2);
    } else if (gameImages.dino.run.length > 0) {
      // Draw running dino
      const runImg = gameImages.dino.run[gameState.animationFrame % gameImages.dino.run.length];
      ctx.drawImage(runImg, dinoX, gameState.dinoY, DINO_WIDTH, DINO_HEIGHT);
    } else {
      // Fallback if images not loaded
      ctx.fillStyle = '#555';
      ctx.fillRect(dinoX, gameState.dinoY, DINO_WIDTH, DINO_HEIGHT);
    }
    
    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, CANVAS_WIDTH - 150, 30);
  };

  // Contract write hook for starting the game
  const { writeContractAsync: startGameWrite } = useScaffoldWriteContract({
    contractName: "DinoGameManager",
  });

  // Handle start game
  const handleStartGame = async () => {
    setIsStartingGame(true);
    try {
      // Call the contract to start the game with payment
      await startGameWrite({
        functionName: "startGame",
        value: BigInt(10000000000000000), // 0.01 ETH in wei
      });
      
      // Wait a moment for UI update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Payment successful, starting game...');
      
      // First ensure all images are loaded
      if (gameImages.dino.run.length === 0 || !gameImages.environment.ground) {
        console.error('Game assets not fully loaded yet!');
        alert('Game assets not fully loaded. Please wait a moment and try again.');
        return;
      }
      
      // Reset game state
      setGameState(prev => {
        console.log('Resetting game state...');
        return {
          ...prev,
          score: 0,
          dinoY: CANVAS_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT,
          dinoVelocity: 0,
          isJumping: false,
          isDucking: false,
          frameCount: 0,
          animationFrame: 0,
          achievements: {
            bronze: false,
            silver: false,
            gold: false,
          },
          gameActive: true,
          obstacles: [],
          gameOver: false,
          showRestart: false
        };
      });
      
      // Draw initial game state
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          // We'll draw in the game loop
          console.log('Canvas ready for game loop');
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Error starting game. Please try again.');
    } finally {
      setIsStartingGame(false);
    }
  };

  // Handle jump
  const handleJump = () => {
    if (!gameState.isJumping && gameState.gameActive && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        isJumping: true,
        dinoVelocity: -JUMP_VELOCITY
      }));
    }
  };

  // Set up game controls
  const handleDuckStart = () => {
    if (gameState.gameActive && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        isDucking: true
      }));
    }
  };
  
  const handleDuckEnd = () => {
    if (gameState.gameActive) {
      setGameState(prev => ({
        ...prev,
        isDucking: false
      }));
    }
  };

  return (
    <div className="flex flex-col items-center">
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
                <Address address={connectedAddress} />
              </div>
              <div>
                <p className="text-sm opacity-70">Your Balance:</p>
                <Balance address={connectedAddress} />
              </div>
            </div>
            
            <div className="flex justify-between mb-4 bg-base-100 p-3 rounded-lg shadow-sm">
              <div>
                <p className="font-bold">Current Score: <span className="text-xl">{gameState.score}</span></p>
                <p>High Score: {gameState.highScore}</p>
              </div>
              <div>
                <p className="font-bold">Achievements:</p>
                <div className="flex gap-2">
                  <span className={`text-2xl ${gameState.achievements.bronze ? "opacity-100" : "opacity-40"}`}>🥉</span>
                  <span className={`text-2xl ${gameState.achievements.silver ? "opacity-100" : "opacity-40"}`}>🥈</span>
                  <span className={`text-2xl ${gameState.achievements.gold ? "opacity-100" : "opacity-40"}`}>🥇</span>
                </div>
              </div>
            </div>
            
            {/* Ready to Run UI - 放置在画布外 */}
            {!gameState.gameActive && !isStartingGame && !gameState.gameOver && (
              <div className="mb-4 bg-base-100 p-5 rounded-lg shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <img src="/assets/Dino/DinoStart.png" alt="Dino" className="h-16 mr-3" />
                    <div className="text-left">
                      <h3 className="text-xl font-bold">Ready to Run?</h3>
                      <p className="text-sm">Avoid obstacles and earn achievements!</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      className="btn btn-primary mb-2"
                      onClick={handleStartGame}
                      disabled={isStartingGame}
                    >
                      Start Game (0.01 MON)
                    </button>
                    <div className="text-xs flex gap-2">
                      <span><kbd className="kbd kbd-xs">SPACE</kbd> or <kbd className="kbd kbd-xs">↑</kbd> Jump</span>
                      <span><kbd className="kbd kbd-xs">↓</kbd> Duck</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="rounded-lg overflow-hidden mb-4 relative shadow-md w-full p-4" 
                 style={{ 
                   backgroundImage: "url('/assets/DinoWallpaper.png')", 
                   backgroundSize: 'cover', 
                   backgroundPosition: 'center',
                   minHeight: `${CANVAS_HEIGHT + 40}px`,
                   maxWidth: '1000px',
                   margin: '0 auto'
                 }}>
              {gameState.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-80 z-10">
                  <div className="flex flex-col items-center bg-base-200 p-6 rounded-lg shadow-lg">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-2 font-bold">Loading game assets...</p>
                  </div>
                </div>
              )}
              
              <div className="relative flex justify-center items-center" style={{ minHeight: `${CANVAS_HEIGHT}px`, overflow: 'hidden' }}>
                <canvas 
                  ref={canvasRef} 
                  width={CANVAS_WIDTH} 
                  height={CANVAS_HEIGHT} 
                  className="bg-white bg-opacity-90 rounded-md shadow-md" 
                  style={{ 
                    touchAction: 'none', 
                    maxWidth: '100%', 
                    objectFit: 'contain',
                    border: '2px solid #333',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={gameState.gameActive ? handleJump : undefined}
                />
                
                {/* Game Over Screen with Try Again button */}
                {gameState.gameOver && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-base-100 bg-opacity-90 p-6 rounded-lg shadow-lg text-center">
                      <img src="/assets/Other/GameOver.png" alt="Game Over" className="h-16 mx-auto mb-4" />
                      <p className="text-2xl font-bold mb-2">Score: {gameState.score}</p>
                      {gameState.score > 0 && gameState.score >= 100 && (
                        <div className="my-2">
                          <p className="font-bold">Achievements Earned:</p>
                          <div className="flex justify-center gap-2 my-2">
                            {gameState.score >= 100 && <span className="text-2xl">🥉</span>}
                            {gameState.score >= 300 && <span className="text-2xl">🥈</span>}
                            {gameState.score >= 500 && <span className="text-2xl">🥇</span>}
                          </div>
                        </div>
                      )}
                      <button
                        className="btn btn-primary mt-4"
                        onClick={() => {
                          // Reset game over state but don't start yet
                          // Just show the Ready to Run screen
                          setGameState(prev => {
                            return {
                              ...prev,
                              gameOver: false,
                              showRestart: false
                            };
                          });
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 不再需要这里的Start Game UI，已移到画布外 */}
                
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

                {/* Game Controls Component - only render when game is active */}
                <GameControls
                  gameActive={gameState.gameActive && !gameState.gameOver}
                  isJumping={gameState.isJumping}
                  setIsJumping={(isJumping) => {
                    console.log('Setting jump state:', isJumping);
                    setGameState(prev => ({ ...prev, isJumping }));
                  }}
                  setIsDucking={(isDucking) => {
                    console.log('Setting duck state:', isDucking);
                    setGameState(prev => ({ ...prev, isDucking }));
                  }}
                  setDinoVelocity={(velocity) => {
                    console.log('Setting velocity:', velocity);
                    setGameState(prev => ({ ...prev, dinoVelocity: velocity }));
                  }}
                  canvasRef={canvasRef}
                />
              </div>
            </div>
            
            <div className="flex justify-center mb-4">
              {gameState.gameActive && (
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
                <div className={`p-3 rounded-lg ${gameState.achievements.bronze ? 'bg-amber-100' : 'bg-base-300'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥉</span>
                    <div>
                      <p className="font-bold">Bronze</p>
                      <p className="text-xs">Score 100+ points</p>
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${gameState.achievements.silver ? 'bg-slate-100' : 'bg-base-300'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥈</span>
                    <div>
                      <p className="font-bold">Silver</p>
                      <p className="text-xs">Score 300+ points</p>
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${gameState.achievements.gold ? 'bg-yellow-100' : 'bg-base-300'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥇</span>
                    <div>
                      <p className="font-bold">Gold</p>
                      <p className="text-xs">Score 500+ points</p>
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
    </div>
  );
};

export default DinoGame;
