//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Implementation of a simple counter
library Counters {
    struct Counter {
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}

/**
 * @title DinoAchievementNFT
 * @dev NFT contract for awarding achievements in the Dino Runner game
 */
contract DinoAchievementNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Achievement levels with their corresponding score thresholds
    uint256 public constant BRONZE_THRESHOLD = 100;
    uint256 public constant SILVER_THRESHOLD = 300;
    uint256 public constant GOLD_THRESHOLD = 500;
    
    // NFT metadata URIs for each achievement level
    string public bronzeTokenURI;
    string public silverTokenURI;
    string public goldTokenURI;
    
    // Mapping to track which achievements a player has claimed
    mapping(address => mapping(uint256 => bool)) public achievementsClaimed;
    
    // Game contract address allowed to mint achievements
    address public gameContract;
    
    event AchievementMinted(address indexed player, uint256 level, uint256 tokenId);
    
    constructor(
        string memory _bronzeURI, 
        string memory _silverURI, 
        string memory _goldURI,
        address initialOwner
    ) ERC721("Dino Runner Achievements", "DINOACH") Ownable(initialOwner) {
        bronzeTokenURI = _bronzeURI;
        silverTokenURI = _silverURI;
        goldTokenURI = _goldURI;
    }
    
    // Set the game contract that's allowed to mint NFTs
    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }
    
    // Update token URIs if needed
    function setTokenURIs(
        string memory _bronzeURI, 
        string memory _silverURI, 
        string memory _goldURI
    ) external onlyOwner {
        bronzeTokenURI = _bronzeURI;
        silverTokenURI = _silverURI;
        goldTokenURI = _goldURI;
    }
    
    // Mint achievement NFT for a player based on their score level
    function mintAchievement(address player, uint256 scoreLevel) external returns (uint256) {
        require(msg.sender == gameContract, "Only game contract can mint");
        require(!achievementsClaimed[player][scoreLevel], "Achievement already claimed");
        require(scoreLevel >= 1 && scoreLevel <= 3, "Invalid score level");
        
        // Mark achievement as claimed
        achievementsClaimed[player][scoreLevel] = true;
        
        // Mint the NFT
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(player, newTokenId);
        
        // Set token URI based on score level
        if (scoreLevel == 1) {
            _setTokenURI(newTokenId, bronzeTokenURI);
        } else if (scoreLevel == 2) {
            _setTokenURI(newTokenId, silverTokenURI);
        } else if (scoreLevel == 3) {
            _setTokenURI(newTokenId, goldTokenURI);
        }
        
        emit AchievementMinted(player, scoreLevel, newTokenId);
        return newTokenId;
    }
    
    // Check if player has already claimed an achievement level
    function hasClaimedAchievement(address player, uint256 scoreLevel) external view returns (bool) {
        return achievementsClaimed[player][scoreLevel];
    }
}
