# Dino Game Component

This is a simplified version of the Chrome Dino game with Web3 integration.

## Features

- Jumping and obstacle avoidance mechanics
- Web3 integration for starting games and recording scores
- Achievement system with NFT rewards
- Responsive to both keyboard and touch inputs

## How to Play

- Press the Start button to begin the game (requires a connected wallet)
- Press Space, Up Arrow, or tap the screen to jump
- Press Down Arrow to duck
- Avoid obstacles to increase your score
- Earn achievements at score milestones (100, 300, 500)

## Assets

Game assets should be placed in the `/public/assets/` directory. See the README in that directory for details on required assets.

## Web3 Integration

The game integrates with the following smart contracts:
- `DinoGameManager`: Handles game starts and score recording
- `DinoAchievementNFT`: Mints achievement NFTs based on player performance

## Development

To modify the game:
1. Adjust game constants at the top of `DinoGame.tsx` to change difficulty
2. Add new obstacles or power-ups in the `updateGameState` function
3. Modify the achievement thresholds in the score checking section
