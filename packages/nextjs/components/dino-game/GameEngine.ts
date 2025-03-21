// Game engine for Dino Runner
// Handles game logic, physics, collision detection, etc.

// Game configuration
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 300;

// Responsive dimensions - these will be used to maintain aspect ratio
export const CANVAS_ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;
export const DINO_WIDTH = 60;
export const DINO_HEIGHT = 60;
export const GROUND_HEIGHT = 20;
export const JUMP_VELOCITY = 15;
export const GRAVITY = 0.8;
export const OBSTACLE_WIDTH = 30;
export const OBSTACLE_HEIGHT = 50;

// Initial game parameters (will increase with difficulty)
export const INITIAL_OBSTACLE_SPEED = 6;
export const MAX_OBSTACLE_SPEED = 15;
export const INITIAL_OBSTACLE_FREQUENCY = 100; // Lower is more frequent
export const MIN_OBSTACLE_FREQUENCY = 40; // Maximum frequency (minimum frames between obstacles)

// Difficulty scaling parameters
export const SPEED_INCREASE_INTERVAL = 500; // Increase speed every 500 points
export const SPEED_INCREASE_AMOUNT = 0.5; // How much to increase speed each interval
export const FREQUENCY_DECREASE_INTERVAL = 300; // Decrease frequency every 300 points
export const FREQUENCY_DECREASE_AMOUNT = 5; // How much to decrease frequency each interval

// Game state interfaces
export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "cactus" | "bird";
  variant: string;
}

export interface GameState {
  obstacles: Obstacle[];
  frameCount: number;
  animationFrame: number;
  gameOver: boolean;
  score: number;
  highScore: number;
  dinoY: number;
  dinoVelocity: number;
  isJumping: boolean;
  isDucking: boolean;
  gameActive: boolean;
  isLoading: boolean;
  // Current difficulty parameters
  currentSpeed: number;
  currentFrequency: number;
  // Animation state for more dynamic animations
  legPosition: "left" | "right";
  animationSpeed: number; // Controls how fast animations cycle
  achievements: {
    bronze: boolean;
    silver: boolean;
    gold: boolean;
  };
  showRestart: boolean; // Added from previous changes
}

export interface GameImages {
  dino: {
    run: HTMLImageElement[];
    jump: HTMLImageElement | null;
    duck: HTMLImageElement[];
    dead: HTMLImageElement | null;
    start: HTMLImageElement | null;
  };
  obstacles: {
    cactusSmall: HTMLImageElement[];
    cactusLarge: HTMLImageElement[];
    bird: HTMLImageElement[];
  };
  environment: {
    ground: HTMLImageElement | null;
    cloud: HTMLImageElement | null;
  };
  ui: {
    gameOver: HTMLImageElement | null;
    restart: HTMLImageElement | null;
  };
}

// Helper function to load images
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Calculate current game difficulty based on score
export const calculateGameDifficulty = (score: number) => {
  // Increase speed based on score
  const speedIncrease = Math.floor(score / SPEED_INCREASE_INTERVAL) * SPEED_INCREASE_AMOUNT;
  const currentSpeed = Math.min(INITIAL_OBSTACLE_SPEED + speedIncrease, MAX_OBSTACLE_SPEED);

  // Decrease obstacle frequency based on score (making obstacles appear more often)
  const frequencyDecrease = Math.floor(score / FREQUENCY_DECREASE_INTERVAL) * FREQUENCY_DECREASE_AMOUNT;
  const currentFrequency = Math.max(INITIAL_OBSTACLE_FREQUENCY - frequencyDecrease, MIN_OBSTACLE_FREQUENCY);

  return { currentSpeed, currentFrequency };
};

// Generate a random obstacle
export const generateObstacle = (gameImages: GameImages, currentSpeed: number = INITIAL_OBSTACLE_SPEED): Obstacle => {
  const isBird = Math.random() > 0.7; // 30% chance of bird

  if (isBird) {
    // Bird obstacle
    const birdHeight = 50;
    // Birds at different heights based on current speed (higher speeds = more challenging positions)
    const birdPositionFactor = Math.min((currentSpeed - INITIAL_OBSTACLE_SPEED) / 2, 2);
    const birdY =
      Math.random() > 0.5
        ? CANVAS_HEIGHT - GROUND_HEIGHT - birdHeight - 40 - birdPositionFactor * 10 // Flying high
        : CANVAS_HEIGHT - GROUND_HEIGHT - birdHeight - birdPositionFactor * 5; // Flying low

    // Use bird variants for animation
    const birdVariant = Math.random() > 0.5 ? "flying1" : "flying2";

    return {
      x: CANVAS_WIDTH,
      y: birdY,
      width: 60,
      height: birdHeight,
      type: "bird",
      variant: birdVariant,
    };
  } else {
    // Cactus obstacle
    const isLarge = Math.random() > 0.5;

    // Use existing logic for cactus variants
    const cactusVariant = isLarge
      ? `large${Math.floor(Math.random() * Math.max(1, gameImages.obstacles.cactusLarge.length)) + 1}`
      : `small${Math.floor(Math.random() * Math.max(1, gameImages.obstacles.cactusSmall.length)) + 1}`;

    const cactusHeight = isLarge ? 70 : 50;

    return {
      x: CANVAS_WIDTH,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - cactusHeight,
      width: isLarge ? 40 : 30,
      height: cactusHeight,
      type: "cactus",
      variant: cactusVariant,
    };
  }
};

// Check collision between dino and obstacle
export const checkCollision = (dinoX: number, dinoY: number, isDucking: boolean, obstacle: Obstacle): boolean => {
  // Adjust hitbox based on ducking state
  const dinoHitboxWidth = isDucking ? DINO_WIDTH : DINO_WIDTH * 0.8;
  const dinoHitboxHeight = isDucking ? DINO_HEIGHT * 0.5 : DINO_HEIGHT * 0.8;
  const dinoHitboxX = dinoX + (DINO_WIDTH - dinoHitboxWidth) / 2;
  const dinoHitboxY = dinoY + (DINO_HEIGHT - dinoHitboxHeight) / 2;

  // For bird obstacles, make the hitbox slightly smaller
  const obstacleHitboxWidth = obstacle.type === "bird" ? obstacle.width * 0.6 : obstacle.width * 0.8;
  const obstacleHitboxHeight = obstacle.type === "bird" ? obstacle.height * 0.6 : obstacle.height * 0.8;
  const obstacleHitboxX = obstacle.x + (obstacle.width - obstacleHitboxWidth) / 2;
  const obstacleHitboxY = obstacle.y + (obstacle.height - obstacleHitboxHeight) / 2;

  return (
    dinoHitboxX < obstacleHitboxX + obstacleHitboxWidth &&
    dinoHitboxX + dinoHitboxWidth > obstacleHitboxX &&
    dinoHitboxY < obstacleHitboxY + obstacleHitboxHeight &&
    dinoHitboxY + dinoHitboxHeight > obstacleHitboxY
  );
};

// Update game state for one frame
export const updateGameState = (gameState: GameState, gameImages: GameImages, dinoX: number): GameState => {
  const {
    obstacles,
    frameCount,
    animationFrame,
    dinoY,
    dinoVelocity,
    isJumping,
    isDucking,
    score,
    highScore,
    achievements,
  } = gameState;

  if (!gameState.gameActive) return gameState;

  // Update frame count
  const newFrameCount = frameCount + 1;
  const newAnimationFrame = (animationFrame + 1) % 10;

  // Update score
  const newScore = Math.floor(newFrameCount / 10);

  // Check for achievements
  const newAchievements = {
    bronze: achievements.bronze || newScore >= 100,
    silver: achievements.silver || newScore >= 300,
    gold: achievements.gold || newScore >= 500,
  };

  // Update dino position with gravity
  let newDinoY = dinoY;
  let newDinoVelocity = dinoVelocity;
  let newIsJumping = isJumping;

  if (isJumping) {
    newDinoY += dinoVelocity;
    newDinoVelocity += GRAVITY;

    // Check if landed
    if (newDinoY >= CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT) {
      newDinoY = CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT;
      newIsJumping = false;
      newDinoVelocity = 0;
    }
  }

  // Generate new obstacle
  let newObstacles = [...obstacles];
  if (newFrameCount % INITIAL_OBSTACLE_FREQUENCY === 0) {
    newObstacles.push(generateObstacle(gameImages));
  }

  // Update obstacles position
  newObstacles = newObstacles
    .map(obstacle => ({
      ...obstacle,
      x: obstacle.x - INITIAL_OBSTACLE_SPEED,
    }))
    .filter(obstacle => obstacle.x > -obstacle.width); // Remove off-screen obstacles

  // Check for collisions
  let gameOver = false;
  for (const obstacle of newObstacles) {
    if (checkCollision(dinoX, newDinoY, isDucking, obstacle)) {
      gameOver = true;
      break;
    }
  }

  // Update high score
  const newHighScore = gameOver && newScore > highScore ? newScore : highScore;

  return {
    ...gameState,
    obstacles: newObstacles,
    frameCount: newFrameCount,
    animationFrame: newAnimationFrame,
    dinoY: newDinoY,
    dinoVelocity: newDinoVelocity,
    isJumping: newIsJumping,
    score: newScore,
    highScore: newHighScore,
    gameOver,
    achievements: newAchievements,
  };
};
