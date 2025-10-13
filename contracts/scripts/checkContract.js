const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x927799E679EEF0d35e237f6C95a3c9baFacCd5Fa";
  const gameAddress = "0xE55eD308b3E19e8C1Bf25788c5f6c82f64eb62A7";

  console.log("Checking contract state...\n");

  // Get contract instances
  const TeenPattiToken = await hre.ethers.getContractFactory("TeenPattiToken");
  const token = TeenPattiToken.attach(tokenAddress);

  const TeenPattiGame = await hre.ethers.getContractFactory("TeenPattiGame");
  const game = TeenPattiGame.attach(gameAddress);

  // Check Token Contract
  console.log("=== TeenPattiToken ===");
  try {
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const paused = await token.paused();
    const owner = await token.owner();
    const treasury = await token.treasury();
    const buyFee = await token.buyFee();
    const sellFee = await token.sellFee();

    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Total Supply:", hre.ethers.formatEther(totalSupply), "TPT");
    console.log("Paused:", paused);
    console.log("Owner:", owner);
    console.log("Treasury:", treasury);
    console.log("Buy Fee:", buyFee.toString(), "basis points (", Number(buyFee) / 100, "%)");
    console.log("Sell Fee:", sellFee.toString(), "basis points (", Number(sellFee) / 100, "%)");
  } catch (error) {
    console.error("Error reading token contract:", error.message);
  }

  console.log("\n=== TeenPattiGame ===");
  try {
    const tokenAddr = await game.token();
    const treasuryAddr = await game.treasury();
    const rakeFee = await game.rakeFee();
    const gamePaused = await game.paused();
    const gameOwner = await game.owner();

    console.log("Token Address:", tokenAddr);
    console.log("Treasury:", treasuryAddr);
    console.log("Rake Fee:", rakeFee.toString(), "basis points (", Number(rakeFee) / 100, "%)");
    console.log("Paused:", gamePaused);
    console.log("Owner:", gameOwner);
  } catch (error) {
    console.error("Error reading game contract:", error.message);
  }

  console.log("\n=== Testing Buy Tokens ===");
  try {
    const [signer] = await hre.ethers.getSigners();
    console.log("Testing with account:", signer.address);
    
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Try to estimate gas for buying tokens
    const weiAmount = hre.ethers.parseEther("0.0000001"); // 0.001 ETH
    console.log("\nTrying to buy tokens with 0.0000001 ETH...");
    
    const gasEstimate = await token.buyTokens.estimateGas({ value: weiAmount });
    console.log("Gas estimate:", gasEstimate.toString());
    console.log("✅ buyTokens() should work!");

  } catch (error) {
    console.error("❌ Error testing buyTokens():", error.message);
    
    if (error.message.includes("paused")) {
      console.log("\n⚠️  Contract is PAUSED. Run unpause script to enable it.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
