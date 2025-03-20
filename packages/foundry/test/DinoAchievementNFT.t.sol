// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/DinoAchievementNFT.sol";
import "../contracts/DinoGameManager.sol";

contract DinoAchievementNFTTest is Test {
    DinoAchievementNFT public nftContract;
    DinoGameManager public gameContract;
    
    address public owner = address(1);
    address public player1 = address(2);
    address public player2 = address(3);
    
    string public bronzeURI = "ipfs://bronze";
    string public silverURI = "ipfs://silver";
    string public goldURI = "ipfs://gold";
    
    function setUp() public {
        // 部署NFT合约
        nftContract = new DinoAchievementNFT(
            bronzeURI,
            silverURI,
            goldURI,
            owner
        );
        
        // 部署游戏合约
        gameContract = new DinoGameManager(owner);
        
        // 设置合约之间的关系
        vm.prank(owner);
        nftContract.setGameContract(address(gameContract));
        
        vm.prank(owner);
        gameContract.setAchievementNFT(address(nftContract));
    }
    
    function testInitialState() public view {
        // 测试初始状态
        assertEq(nftContract.bronzeTokenURI(), bronzeURI);
        assertEq(nftContract.silverTokenURI(), silverURI);
        assertEq(nftContract.goldTokenURI(), goldURI);
        assertEq(nftContract.owner(), owner);
        assertEq(nftContract.gameContract(), address(gameContract));
    }
    
    function testSetTokenURIs() public {
        // 测试更新Token URI
        string memory newBronzeURI = "ipfs://newBronze";
        string memory newSilverURI = "ipfs://newSilver";
        string memory newGoldURI = "ipfs://newGold";
        
        vm.prank(owner);
        nftContract.setTokenURIs(newBronzeURI, newSilverURI, newGoldURI);
        
        assertEq(nftContract.bronzeTokenURI(), newBronzeURI);
        assertEq(nftContract.silverTokenURI(), newSilverURI);
        assertEq(nftContract.goldTokenURI(), newGoldURI);
    }
    
    function testSetTokenURIsOnlyOwner() public {
        // 测试只有所有者可以更新Token URI
        vm.prank(player1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", player1));
        nftContract.setTokenURIs("test", "test", "test");
    }
    
    function testSetGameContractOnlyOwner() public {
        // 测试只有所有者可以设置游戏合约
        vm.prank(player1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", player1));
        nftContract.setGameContract(address(4));
    }
    
    function testMintAchievementOnlyGameContract() public {
        // 测试只有游戏合约可以铸造成就
        vm.prank(player1);
        vm.expectRevert("Only game contract can mint");
        nftContract.mintAchievement(player1, 1);
    }
    
    function testTokenURI() public {
        // 测试通过游戏合约铸造成就并验证tokenURI
        // 玩家1开始游戏
        vm.deal(player1, 1 ether);
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        // 记录分数，达到铜牌成就
        vm.prank(player1);
        gameContract.recordScore(150);
        
        // 验证铜牌成就已铸造
        assertTrue(nftContract.hasClaimedAchievement(player1, 1));
        
        // 获取tokenId (应该是1，因为是第一个铸造的)
        uint256 tokenId = 1;
        
        // 验证tokenURI
        assertEq(nftContract.tokenURI(tokenId), bronzeURI);
    }
    
    function testCannotMintSameAchievementTwice() public {
        // 测试无法为同一玩家铸造相同的成就两次
        // 玩家1开始游戏
        vm.deal(player1, 1 ether);
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        // 记录分数，达到铜牌成就
        vm.prank(player1);
        gameContract.recordScore(150);
        
        // 验证铜牌成就已铸造
        assertTrue(nftContract.hasClaimedAchievement(player1, 1));
        
        // 再次记录分数，尝试再次铸造铜牌
        vm.prank(player1);
        gameContract.recordScore(200);
        
        // 验证只有一个铜牌成就被铸造
        uint256 balance = nftContract.balanceOf(player1);
        assertEq(balance, 1);
    }
}
