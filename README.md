# 🦖 Web3 Dino Runner Game

<h4 align="center">
  <a href="https://x.com/Alfredfuuu">Twitter</a> |
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🎮 A Web3-enabled Dino Runner game built with Scaffold-ETH 2. Players can spend crypto to play the game and earn NFT achievements based on their scores. The game features dynamic difficulty scaling, animated sprites, and a responsive user interface.

⚙️ Built using NextJS, RainbowKit, Foundry, Wagmi, Viem, and Typescript with HTML5 Canvas for game rendering.

### Game Features

- 🏃 **Dynamic Difficulty**: The game scales in difficulty as your score increases
- 🏆 **NFT Achievements**: Earn achievements at 5,000, 10,000, and 15,000 points
- 🔄 **Animated Sprites**: Dino animations change between running, jumping, and ducking states
- 🎨 **Responsive Design**: Beautiful UI that adapts to both light and dark modes
- 🌐 **Web3 Integration**: Connect your wallet to play and record achievements on-chain

### Tech Stack

- ✅ **NextJS App Router**: Modern React framework with efficient client-side routing
- 🪝 **Custom Game Engine**: Purpose-built game loop and physics for the dino runner game
- 🧱 **Tailwind CSS**: Utility-first CSS framework for responsive design
- 🔥 **Web3 Integration**: Using wagmi hooks for blockchain interactions
- 🔐 **Wallet Connection**: Easy connection to MetaMask and other popular wallets

![Dino Game Screenshot](/packages/nextjs/public/assets/DinoWallpaper.png)

*Screenshot of the Dino Runner game in action*

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Foundry. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/foundry/foundry.toml`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/foundry/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/foundry/script` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn foundry:test`

- Edit your smart contracts in `packages/foundry/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/foundry/script`


## Documentation

## AI-Assisted Development

This project was developed in collaboration with AI assistants. Here are some key prompts and strategies used during development:

### Game Mechanics Implementation

```
help me implement dynamic difficulty adjustments based on the player's score
and improve the dinosaur's animation with alternating frames for running and ducking
```

### Performance Optimization

```
optimize the game loop to prevent lag during animation and make obstacle generation more efficient
```

### Responsive Design

```
optimize the homepage design with dino-background.png as background
and ensure components adapt to both light and dark mode themes
```

### Achievement System

```
update Bronze achievement to require 5,000 points
update Silver achievement to require 10,000 points
update Gold achievement to require 15,000 points
```

## Game Parameters

Key parameters that can be adjusted to modify game difficulty:

```typescript
// Initial game parameters (will increase with difficulty)
export const INITIAL_OBSTACLE_SPEED = 6;
export const MAX_OBSTACLE_SPEED = 15;
export const INITIAL_OBSTACLE_FREQUENCY = 100; // Lower is more frequent
export const MIN_OBSTACLE_FREQUENCY = 40; // Maximum frequency (minimum frames between obstacles)
```

## Contributing

We welcome contributions to the Web3 Dino Runner Game!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to this project.

## Acknowledgments

This project is built upon Scaffold-ETH 2, an excellent toolkit for developing web3 applications. The dinosaur game mechanic is inspired by the Chrome offline dinosaur game, with additional features and Web3 integration.