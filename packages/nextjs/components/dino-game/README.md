# Dino Runner Game

A web3-enabled clone of the classic Chrome dinosaur game with NFT rewards for achievements. Jump over obstacles and avoid birds to earn a high score!

## 项目结构 (Project Structure)

整个项目由以下几个关键组件组成 (The project consists of the following key components):

### 组件文件 (Component Files)

1. **DinoGame.tsx** (主游戏组件 / Main Game Component)

   - 游戏的主要组件，整合了所有其他组件和游戏逻辑
   - 管理游戏状态、渲染循环和用户交互
   - 处理Web3集成，包括钱包连接和智能合约交互

2. **GameEngine.ts** (游戏引擎 / Game Engine)

   - 定义游戏常量如画布尺寸、恐龙尺寸和障碍物速度
   - 包含游戏状态接口定义
   - 处理物理计算如重力和跳跃物理

3. **DinoRenderer.tsx** (渲染器 / Renderer)

   - 负责将游戏状态渲染到画布上
   - 处理精灵动画和场景绘制

4. **GameControls.tsx** (游戏控制 / Game Controls)

   - 处理键盘和触摸输入
   - 提供游戏控制UI元素

5. **GameUI.tsx** (游戏界面 / Game UI)
   - 定义游戏的非画布UI元素
   - 显示分数、成就和游戏状态

### 关键常量和配置 (Key Constants and Configuration)

```typescript
// 画布尺寸 / Canvas dimensions
export const CANVAS_WIDTH = 800; // 画布宽度 / Canvas width
export const CANVAS_HEIGHT = 300; // 画布高度 / Canvas height

// 恐龙属性 / Dino properties
export const DINO_WIDTH = 60; // 恐龙宽度 / Dino width
export const DINO_HEIGHT = 60; // 恐龙高度 / Dino height
export const JUMP_VELOCITY = 15; // 跳跃初速度 / Initial jump velocity
export const GRAVITY = 0.8; // 重力 / Gravity

// 障碍物属性 / Obstacle properties
export const OBSTACLE_WIDTH = 30; // 障碍物宽度 / Obstacle width
export const OBSTACLE_HEIGHT = 50; // 障碍物高度 / Obstacle height
export const OBSTACLE_SPEED = 6; // 障碍物速度 / Obstacle speed
export const OBSTACLE_FREQUENCY = 100; // 障碍物生成频率 / Obstacle generation frequency
```

## 游戏流程 (Game Flow)

1. **初始化** (Initialization)

   - 创建画布和游戏状态
   - 加载游戏资源（图像、音效）
   - 设置事件监听器

2. **游戏循环** (Game Loop)

   - 使用`requestAnimationFrame`实现游戏循环
   - 更新游戏状态（位置、分数等）
   - 检测碟撞
   - 渲染游戏画面

3. **用户交互** (User Interaction)

   - 通过键盘（空格/上箭头）或点击/触摸屏幕跳跃
   - 使用下箭头键蹲下避开飞鸟

4. **Web3集成** (Web3 Integration)
   - 连接钱包开始游戏
   - 游戏开始需支付0.01 MON
   - 根据分数发放NFT成就奖励

## 成就系统 (Achievement System)

游戏包含三个级别的成就，基于玩家的分数：

- **铜牌** (Bronze): 达到100分
- **银牌** (Silver): 达到300分
- **金牌** (Gold): 达到500分

每个成就都可以铸造为NFT，永久记录在区块链上。

## 资源文件 (Assets)

游戏资源应位于`/public/assets/`目录中，包括：

- **恐龙图像** (Dino Images): `/assets/Dino/`
- **仙人掌图像** (Cactus Images): `/assets/Cactus/`
- **鸟图像** (Bird Images): `/assets/Bird/`
- **环境图像** (Environment Images): `/assets/Other/`

## Web3 Integration

The game integrates with the following smart contracts:

- `DinoGameManager`: Handles game starts and score recording
- `DinoAchievementNFT`: Mints achievement NFTs based on player performance

## Development

To modify the game:

1. Adjust game constants at the top of `DinoGame.tsx` to change difficulty
2. Add new obstacles or power-ups in the `updateGameState` function
3. Modify the achievement thresholds in the score checking section
