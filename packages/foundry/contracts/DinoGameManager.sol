//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./DinoAchievementNFT.sol";

/**
 * @title DinoGameManager
 * @dev Manages the Dino Runner game, handles payments and achievement rewards
 */
contract DinoGameManager {
    // State Variables
    address public immutable owner;
    DinoAchievementNFT public achievementNFT;
    uint256 public constant GAME_FEE = 0.01 ether; // 0.01 MON in wei
    
    // Game stats
    uint256 public totalGamesPlayed;
    mapping(address => uint256) public playerHighScores;
    
    // Events
    event GameStarted(address indexed player, uint256 gameId);
    event ScoreRecorded(address indexed player, uint256 score);
    event AchievementUnlocked(address indexed player, uint256 level, uint256 score);
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    // Set the achievement NFT contract address
    function setAchievementNFT(address nftAddress) external {
        require(msg.sender == owner, "Not the owner");
        achievementNFT = DinoAchievementNFT(nftAddress);
    }
    
    // Start a new game (requires 0.01 MON payment)
    function startGame() external payable returns (uint256) {
        require(msg.value == GAME_FEE, "Game fee is 0.01 MON");
        
        totalGamesPlayed++;
        emit GameStarted(msg.sender, totalGamesPlayed);
        
        return totalGamesPlayed;
    }
    
    // Record a player's score and mint achievement NFTs if they qualify
    function recordScore(uint256 score) external {
        // Update high score if new score is higher
        if (score > playerHighScores[msg.sender]) {
            playerHighScores[msg.sender] = score;
        }
        
        emit ScoreRecorded(msg.sender, score);
        
        // Check for achievements and mint if eligible
        _checkAndMintAchievements(msg.sender, score);
    }
    
    // Check if player qualifies for achievements and mint them
    function _checkAndMintAchievements(address player, uint256 score) internal {
        // Check for Bronze achievement (level 1)
        if (score >= achievementNFT.BRONZE_THRESHOLD() && 
            !achievementNFT.hasClaimedAchievement(player, 1)) {
            achievementNFT.mintAchievement(player, 1);
            emit AchievementUnlocked(player, 1, score);
        }
        
        // Check for Silver achievement (level 2)
        if (score >= achievementNFT.SILVER_THRESHOLD() && 
            !achievementNFT.hasClaimedAchievement(player, 2)) {
            achievementNFT.mintAchievement(player, 2);
            emit AchievementUnlocked(player, 2, score);
        }
        
        // Check for Gold achievement (level 3)
        if (score >= achievementNFT.GOLD_THRESHOLD() && 
            !achievementNFT.hasClaimedAchievement(player, 3)) {
            achievementNFT.mintAchievement(player, 3);
            emit AchievementUnlocked(player, 3, score);
        }
    }
    
    // Get player's high score
    function getPlayerHighScore(address player) external view returns (uint256) {
        return playerHighScores[player];
    }
    
    // Allow owner to withdraw funds from the contract
    function withdraw() external {
        require(msg.sender == owner, "Not the owner");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
