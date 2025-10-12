// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TeenPattiToken
 * @dev ERC20 token for Teen Patti game platform
 * Conversion: 0.00001 ETH = 10,000 TPT (1 Wei = 0.000000001 TPT)
 */
contract TeenPattiToken is ERC20, ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    uint256 public constant TOKENS_PER_WEI = 10**9; // 1 billion (0.000000001 TPT per wei with 18 decimals)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Fee for buying/selling tokens (in basis points, 100 = 1%)
    uint256 public buyFee = 100; // 1%
    uint256 public sellFee = 200; // 2%
    
    // Treasury to collect fees
    address public treasury;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 weiAmount, uint256 tokenAmount, uint256 fee);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 weiAmount, uint256 fee);
    event FeesUpdated(uint256 newBuyFee, uint256 newSellFee);
    event TreasuryUpdated(address indexed newTreasury);
    
    constructor(address _treasury) ERC20("TeenPattiToken", "TPT") Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        
        // Mint initial supply to owner for distribution
        _mint(msg.sender, 100_000_000 * 10**18); // 100 million initial supply
    }
    
    /**
     * @dev Buy tokens with native currency (ETH/MATIC)
     * Conversion: 1 Wei = 100 TPT (minus fee)
     */
    function buyTokens() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH/MATIC to buy tokens");
        
        uint256 tokenAmount = msg.value * TOKENS_PER_WEI;
        uint256 fee = (tokenAmount * buyFee) / 10000;
        uint256 tokensToUser = tokenAmount - fee;
        
        require(totalSupply() + tokenAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        // Mint tokens to user
        _mint(msg.sender, tokensToUser);
        
        // Mint fee tokens to treasury
        if (fee > 0) {
            _mint(treasury, fee);
        }
        
        emit TokensPurchased(msg.sender, msg.value, tokensToUser, fee);
    }
    
    /**
     * @dev Sell tokens back for native currency
     * Burns tokens and sends ETH/MATIC to user
     */
    function sellTokens(uint256 tokenAmount) external nonReentrant whenNotPaused {
        require(tokenAmount > 0, "Must sell positive amount");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        uint256 weiAmount = tokenAmount / TOKENS_PER_WEI;
        uint256 fee = (weiAmount * sellFee) / 10000;
        uint256 weiToUser = weiAmount - fee;
        
        require(address(this).balance >= weiToUser, "Insufficient contract balance");
        
        // Burn user's tokens
        _burn(msg.sender, tokenAmount);
        
        // Send ETH/MATIC to user
        (bool success, ) = payable(msg.sender).call{value: weiToUser}("");
        require(success, "Transfer failed");
        
        // Send fee to treasury
        if (fee > 0) {
            (bool feeSuccess, ) = payable(treasury).call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        emit TokensSold(msg.sender, tokenAmount, weiToUser, fee);
    }
    
    /**
     * @dev Get token price in wei
     */
    function getTokenPrice() external pure returns (uint256) {
        return 1 * 10**18 / TOKENS_PER_WEI; // Price of 1 TPT in wei
    }
    
    /**
     * @dev Calculate tokens received for given wei amount (after fee)
     */
    function calculateTokensForWei(uint256 weiAmount) external view returns (uint256) {
        uint256 tokenAmount = weiAmount * TOKENS_PER_WEI;
        uint256 fee = (tokenAmount * buyFee) / 10000;
        return tokenAmount - fee;
    }
    
    /**
     * @dev Calculate wei received for given token amount (after fee)
     */
    function calculateWeiForTokens(uint256 tokenAmount) external view returns (uint256) {
        uint256 weiAmount = tokenAmount / TOKENS_PER_WEI;
        uint256 fee = (weiAmount * sellFee) / 10000;
        return weiAmount - fee;
    }
    
    /**
     * @dev Update buy and sell fees (only owner)
     */
    function updateFees(uint256 _buyFee, uint256 _sellFee) external onlyOwner {
        require(_buyFee <= 500, "Buy fee too high"); // Max 5%
        require(_sellFee <= 500, "Sell fee too high"); // Max 5%
        
        buyFee = _buyFee;
        sellFee = _sellFee;
        
        emit FeesUpdated(_buyFee, _sellFee);
    }
    
    /**
     * @dev Update treasury address (only owner)
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }
    
    /**
     * @dev Pause token operations (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token operations (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Mint additional tokens (only owner, respects max supply)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Withdraw contract balance (only owner, emergency use)
     */
    function withdrawBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Receive function to accept ETH/MATIC
     */
    receive() external payable {}
}
