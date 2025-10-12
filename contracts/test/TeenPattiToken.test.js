const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TeenPattiToken", function () {
  let token;
  let owner;
  let treasury;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, treasury, user1, user2] = await ethers.getSigners();

    const TeenPattiToken = await ethers.getContractFactory("TeenPattiToken");
    token = await TeenPattiToken.deploy(treasury.address);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should set the right treasury", async function () {
      expect(await token.treasury()).to.equal(treasury.address);
    });

    it("Should mint initial supply to owner", async function () {
      const initialSupply = ethers.parseEther("100000000"); // 100 million
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should have correct token details", async function () {
      expect(await token.name()).to.equal("TeenPattiToken");
      expect(await token.symbol()).to.equal("TPT");
      expect(await token.decimals()).to.equal(18);
    });
  });

  describe("Buying Tokens", function () {
    it("Should allow users to buy tokens", async function () {
      const weiAmount = ethers.parseEther("1"); // 1 MATIC
      
      await token.connect(user1).buyTokens({ value: weiAmount });
      
      const expectedTokens = await token.calculateTokensForWei(weiAmount);
      expect(await token.balanceOf(user1.address)).to.equal(expectedTokens);
    });

    it("Should collect buy fee to treasury", async function () {
      const weiAmount = ethers.parseEther("1");
      
      const treasuryBalanceBefore = await token.balanceOf(treasury.address);
      await token.connect(user1).buyTokens({ value: weiAmount });
      const treasuryBalanceAfter = await token.balanceOf(treasury.address);
      
      expect(treasuryBalanceAfter).to.be.gt(treasuryBalanceBefore);
    });

    it("Should revert if no ETH sent", async function () {
      await expect(
        token.connect(user1).buyTokens({ value: 0 })
      ).to.be.revertedWith("Must send ETH/MATIC to buy tokens");
    });

    it("Should emit TokensPurchased event", async function () {
      const weiAmount = ethers.parseEther("1");
      
      await expect(token.connect(user1).buyTokens({ value: weiAmount }))
        .to.emit(token, "TokensPurchased");
    });
  });

  describe("Selling Tokens", function () {
    beforeEach(async function () {
      // Buy tokens first
      const weiAmount = ethers.parseEther("10");
      await token.connect(user1).buyTokens({ value: weiAmount });
      
      // Fund contract for selling
      await owner.sendTransaction({
        to: await token.getAddress(),
        value: ethers.parseEther("100")
      });
    });

    it("Should allow users to sell tokens", async function () {
      const tokenAmount = ethers.parseEther("100");
      const userBalanceBefore = await ethers.provider.getBalance(user1.address);
      
      await token.connect(user1).sellTokens(tokenAmount);
      
      const userBalanceAfter = await ethers.provider.getBalance(user1.address);
      expect(userBalanceAfter).to.be.gt(userBalanceBefore);
    });

    it("Should burn tokens when selling", async function () {
      const tokenAmount = ethers.parseEther("100");
      const balanceBefore = await token.balanceOf(user1.address);
      
      await token.connect(user1).sellTokens(tokenAmount);
      
      const balanceAfter = await token.balanceOf(user1.address);
      expect(balanceAfter).to.equal(balanceBefore - tokenAmount);
    });

    it("Should revert if insufficient token balance", async function () {
      const tokenAmount = ethers.parseEther("1000000");
      
      await expect(
        token.connect(user1).sellTokens(tokenAmount)
      ).to.be.revertedWith("Insufficient token balance");
    });

    it("Should emit TokensSold event", async function () {
      const tokenAmount = ethers.parseEther("100");
      
      await expect(token.connect(user1).sellTokens(tokenAmount))
        .to.emit(token, "TokensSold");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update fees", async function () {
      await token.updateFees(200, 300);
      
      expect(await token.buyFee()).to.equal(200);
      expect(await token.sellFee()).to.equal(300);
    });

    it("Should revert if non-owner tries to update fees", async function () {
      await expect(
        token.connect(user1).updateFees(200, 300)
      ).to.be.reverted;
    });

    it("Should allow owner to pause", async function () {
      await token.pause();
      expect(await token.paused()).to.equal(true);
    });

    it("Should prevent buying when paused", async function () {
      await token.pause();
      
      await expect(
        token.connect(user1).buyTokens({ value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await token.mint(user1.address, mintAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
    });
  });

  describe("Token Calculations", function () {
    it("Should calculate correct tokens for wei", async function () {
      const weiAmount = ethers.parseEther("1");
      const expectedTokens = weiAmount * 100n * 99n / 100n; // 100 tokens per wei, minus 1% fee
      
      const calculatedTokens = await token.calculateTokensForWei(weiAmount);
      expect(calculatedTokens).to.equal(expectedTokens);
    });

    it("Should calculate correct wei for tokens", async function () {
      const tokenAmount = ethers.parseEther("100");
      const expectedWei = tokenAmount / 100n * 98n / 100n; // Divide by 100, minus 2% fee
      
      const calculatedWei = await token.calculateWeiForTokens(tokenAmount);
      expect(calculatedWei).to.equal(expectedWei);
    });
  });
});
