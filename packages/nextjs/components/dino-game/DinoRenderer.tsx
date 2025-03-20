import React from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DINO_HEIGHT,
  DINO_WIDTH,
  GROUND_HEIGHT,
  GameImages,
  GameState,
  Obstacle,
} from "./GameEngine";

interface DinoRendererProps {
  ctx: CanvasRenderingContext2D;
  gameImages: GameImages;
  gameState: GameState;
  dinoX: number;
}

// Render the game to the canvas
export const renderGame = ({ ctx, gameImages, gameState, dinoX }: DinoRendererProps): void => {
  const { obstacles, animationFrame, dinoY, isJumping, isDucking, gameOver, score } = gameState;

  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw ground
  if (gameImages.environment.ground) {
    // Create a repeating pattern for the ground
    const groundPattern = ctx.createPattern(gameImages.environment.ground, "repeat-x");
    if (groundPattern) {
      ctx.fillStyle = groundPattern;
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    }
  } else {
    // Fallback if image not loaded
    ctx.fillStyle = "#ccc";
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
  }

  // Draw clouds (decorative)
  if (gameImages.environment.cloud) {
    // Draw a few clouds at different positions
    const cloudPositions = [
      { x: 100, y: 50 },
      { x: 300, y: 80 },
      { x: 600, y: 60 },
    ];

    const cloud = gameImages.environment.cloud;
    if (cloud) {
      cloudPositions.forEach(pos => {
        ctx.drawImage(cloud, pos.x, pos.y, 80, 40);
      });
    }
  }

  // Draw obstacles
  obstacles.forEach(obstacle => {
    drawObstacle(ctx, obstacle, gameImages);
  });

  // Draw dinosaur
  drawDino(ctx, {
    dinoX,
    dinoY,
    isJumping,
    isDucking,
    gameOver,
    animationFrame,
    gameImages,
  });

  // Draw score
  ctx.fillStyle = "#000";
  ctx.font = "20px sans-serif";
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH - 150, 30);
};

// Helper function to draw the dinosaur
interface DrawDinoProps {
  dinoX: number;
  dinoY: number;
  isJumping: boolean;
  isDucking: boolean;
  gameOver: boolean;
  animationFrame: number;
  gameImages: GameImages;
}

const drawDino = (
  ctx: CanvasRenderingContext2D,
  { dinoX, dinoY, isJumping, isDucking, gameOver, animationFrame, gameImages }: DrawDinoProps,
) => {
  if (gameOver && gameImages.dino.dead) {
    // Draw dead dino
    ctx.drawImage(gameImages.dino.dead, dinoX, dinoY, DINO_WIDTH, DINO_HEIGHT);
  } else if (isJumping && gameImages.dino.jump) {
    // Draw jumping dino
    ctx.drawImage(gameImages.dino.jump, dinoX, dinoY, DINO_WIDTH, DINO_HEIGHT);
  } else if (isDucking && gameImages.dino.duck.length > 0) {
    // Draw ducking dino with animation
    const duckFrame = Math.floor(animationFrame / 5) % gameImages.dino.duck.length;
    ctx.drawImage(
      gameImages.dino.duck[duckFrame],
      dinoX,
      dinoY + DINO_HEIGHT / 4, // Adjust Y position when ducking
      DINO_WIDTH,
      DINO_HEIGHT * 0.75, // Make ducking dino shorter
    );
  } else if (gameImages.dino.run.length > 0) {
    // Draw running dino with animation
    const runFrame = Math.floor(animationFrame / 5) % gameImages.dino.run.length;
    ctx.drawImage(gameImages.dino.run[runFrame], dinoX, dinoY, DINO_WIDTH, DINO_HEIGHT);
  }
};

// Helper function to draw obstacles
const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle, gameImages: GameImages) => {
  if (obstacle.type === "cactus") {
    // Draw cactus obstacle
    const isLarge = obstacle.variant.includes("large");
    const cactusIndex = parseInt(obstacle.variant.replace(/[^0-9]/g, "")) - 1;

    const cactusArray = isLarge ? gameImages.obstacles.cactusLarge : gameImages.obstacles.cactusSmall;

    if (cactusArray.length > 0 && cactusIndex < cactusArray.length) {
      ctx.drawImage(cactusArray[cactusIndex], obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  } else if (obstacle.type === "bird") {
    // Draw bird obstacle with animation
    const birdFrame = Math.floor(Date.now() / 200) % gameImages.obstacles.bird.length;

    if (gameImages.obstacles.bird.length > 0) {
      ctx.drawImage(gameImages.obstacles.bird[birdFrame], obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }
};
