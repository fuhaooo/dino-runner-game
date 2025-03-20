// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/DinoAchievementNFT.sol";
import "../contracts/DinoGameManager.sol";

contract DinoGameManagerTest is Test {
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
        
        // 给测试玩家一些ETH
        vm.deal(player1, 1 ether);
        vm.deal(player2, 1 ether);
    }
    
    function testInitialState() public view {
        // 测试初始状态
        assertEq(gameContract.owner(), owner);
        assertEq(address(gameContract.achievementNFT()), address(nftContract));
        assertEq(gameContract.totalGamesPlayed(), 0);
        assertEq(gameContract.GAME_FEE(), 0.01 ether);
    }
    
    function testStartGame() public {
        // 测试开始游戏
        vm.prank(player1);
        uint256 gameId = gameContract.startGame{value: 0.01 ether}();
        
        assertEq(gameId, 1);
        assertEq(gameContract.totalGamesPlayed(), 1);
        assertEq(address(gameContract).balance, 0.01 ether);
    }
    
    function testStartGameInvalidFee() public {
        // 测试使用错误的费用开始游戏
        vm.prank(player1);
        vm.expectRevert("Game fee is 0.01 MON");
        gameContract.startGame{value: 0.005 ether}();
    }
    
    function testRecordScore() public {
        // 测试记录分数
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player1);
        gameContract.recordScore(150);
        
        assertEq(gameContract.getPlayerHighScore(player1), 150);
    }
    
    function testRecordScoreUpdateHighScore() public {
        // 测试更新高分
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player1);
        gameContract.recordScore(150);
        
        vm.prank(player1);
        gameContract.recordScore(250);
        
        assertEq(gameContract.getPlayerHighScore(player1), 250);
    }
    
    function testRecordScoreLowerThanHighScore() public {
        // 测试记录低于高分的分数
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player1);
        gameContract.recordScore(250);
        
        vm.prank(player1);
        gameContract.recordScore(150);
        
        // 高分不应该被更新
        assertEq(gameContract.getPlayerHighScore(player1), 250);
    }
    
    function testBronzeAchievement() public {
        // 测试铜牌成就
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player1);
        gameContract.recordScore(150); // 大于铜牌阈值100
        
        assertTrue(nftContract.hasClaimedAchievement(player1, 1));
        assertFalse(nftContract.hasClaimedAchievement(player1, 2));
        assertFalse(nftContract.hasClaimedAchievement(player1, 3));
    }
    
    function testSilverAchievement() public {
        // 测试银牌成就
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player1);
        gameContract.recordScore(350); // 大于银牌阈值300
        
        assertTrue(nftContract.hasClaimedAchievement(player1, 1));
        assertTrue(nftContract.hasClaimedAchievement(player1, 2));
        assertFalse(nftContract.hasClaimedAchievement(player1, 3));
    }
    
    function testGoldAchievement() public {
        // 测试金牌成就
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player1);
        gameContract.recordScore(550); // 大于金牌阈值500
        
        assertTrue(nftContract.hasClaimedAchievement(player1, 1));
        assertTrue(nftContract.hasClaimedAchievement(player1, 2));
        assertTrue(nftContract.hasClaimedAchievement(player1, 3));
    }
    
    function testMultiplePlayersAchievements() public {
        // 测试多个玩家的成就
        // 玩家1获得金牌
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player1);
        gameContract.recordScore(550);
        
        // 玩家2获得银牌
        vm.prank(player2);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player2);
        gameContract.recordScore(350);
        
        // 验证玩家1的成就
        assertTrue(nftContract.hasClaimedAchievement(player1, 1));
        assertTrue(nftContract.hasClaimedAchievement(player1, 2));
        assertTrue(nftContract.hasClaimedAchievement(player1, 3));
        
        // 验证玩家2的成就
        assertTrue(nftContract.hasClaimedAchievement(player2, 1));
        assertTrue(nftContract.hasClaimedAchievement(player2, 2));
        assertFalse(nftContract.hasClaimedAchievement(player2, 3));
    }
    
    function testWithdraw() public {
        // 测试提取合约中的资金
        // 玩家1和玩家2各开始一个游戏
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player2);
        gameContract.startGame{value: 0.01 ether}();
        
        // 合约余额应该是0.02 ETH
        assertEq(address(gameContract).balance, 0.02 ether);
        
        // 记录所有者初始余额
        uint256 initialOwnerBalance = owner.balance;
        
        // 所有者提取资金
        vm.prank(owner);
        gameContract.withdraw();
        
        // 验证合约余额为0
        assertEq(address(gameContract).balance, 0);
        
        // 验证所有者余额增加了0.02 ETH
        assertEq(owner.balance, initialOwnerBalance + 0.02 ether);
    }
    
    function testWithdrawOnlyOwner() public {
        // 测试只有所有者可以提取资金
        vm.prank(player1);
        gameContract.startGame{value: 0.01 ether}();
        
        vm.prank(player1);
        vm.expectRevert("Not the owner");
        gameContract.withdraw();
    }
    
    function testSetAchievementNFTOnlyOwner() public {
        // 测试只有所有者可以设置成就NFT合约
        vm.prank(player1);
        vm.expectRevert("Not the owner");
        gameContract.setAchievementNFT(address(4));
    }
}
