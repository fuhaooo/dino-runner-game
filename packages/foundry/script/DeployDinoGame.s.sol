// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/DinoGameManager.sol";
import "../contracts/DinoAchievementNFT.sol";

/**
 * @notice Deploy script for Dino Game contracts
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 * Example:
 * yarn deploy --file DeployDinoGame.s.sol  # local anvil chain
 * yarn deploy --file DeployDinoGame.s.sol --network monad # live network (requires keystore)
 */
contract DeployDinoGame is ScaffoldETHDeploy {
    /**
     * @dev Deploys DinoAchievementNFT and DinoGameManager contracts
     * Sets up the relationship between them
     */
    function run() external ScaffoldEthDeployerRunner {
        // Default metadata URIs - should be updated after deployment with actual URIs
        string memory bronzeURI = "ipfs://QmYourBronzeNftMetadataHash";
        string memory silverURI = "ipfs://QmYourSilverNftMetadataHash";
        string memory goldURI = "ipfs://QmYourGoldNftMetadataHash";
        
        // Deploy NFT contract
        DinoAchievementNFT nftContract = new DinoAchievementNFT(
            bronzeURI,
            silverURI,
            goldURI,
            deployer
        );
        
        // Deploy game manager contract
        DinoGameManager gameContract = new DinoGameManager(deployer);
        
        // Set up relationship between contracts
        nftContract.setGameContract(address(gameContract));
        gameContract.setAchievementNFT(address(nftContract));
        
        console.log("DinoAchievementNFT deployed at:", address(nftContract));
        console.log("DinoGameManager deployed at:", address(gameContract));
    }
}
