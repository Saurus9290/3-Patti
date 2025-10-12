const hre = require("hardhat");

async function main() {
  const tokenAddress = "0xf5A7990A52E30b0d90c90fB335210Cf53DF91839";

  console.log("Testing token calculation...\n");

  const TeenPattiToken = await hre.ethers.getContractFactory("TeenPattiToken");
  const token = TeenPattiToken.attach(tokenAddress);

  // Test different amounts
  const testAmounts = [
    { eth: "0.0001", label: "0.0001 ETH" },
    { eth: "0.00001", label: "0.00001 ETH" },
    { eth: "0.000001", label: "0.000001 ETH" },
    { eth: "0.0000001", label: "0.0000001 ETH" },
  ];

  console.log("Exchange Rate: 0.00001 ETH = 10,000 TPT");
  console.log("Buy Fee: 1%\n");
  console.log("=" .repeat(70));

  for (const test of testAmounts) {
    const weiAmount = hre.ethers.parseEther(test.eth);
    const tokens = await token.calculateTokensForWei(weiAmount);
    const formattedTokens = hre.ethers.formatEther(tokens);
    
    console.log(`${test.label.padEnd(15)} => ${parseFloat(formattedTokens).toLocaleString()} TPT`);
  }

  console.log("=" .repeat(70));
  
  // Show the math for 0.0001 ETH
  console.log("\n📊 Detailed calculation for 0.0001 ETH:");
  const ethAmount = "0.0001";
  const weiAmount = hre.ethers.parseEther(ethAmount);
  console.log(`Wei amount: ${weiAmount.toString()}`);
  
  const tokensPerWei = await token.TOKENS_PER_WEI();
  console.log(`TOKENS_PER_WEI: ${tokensPerWei.toString()}`);
  
  const rawTokens = weiAmount * tokensPerWei;
  console.log(`Raw tokens (before fee): ${rawTokens.toString()}`);
  console.log(`Formatted: ${hre.ethers.formatEther(rawTokens)} TPT`);
  
  const buyFee = await token.buyFee();
  const fee = (rawTokens * buyFee) / 10000n;
  console.log(`Fee (1%): ${hre.ethers.formatEther(fee)} TPT`);
  
  const finalTokens = rawTokens - fee;
  console.log(`Final tokens: ${hre.ethers.formatEther(finalTokens)} TPT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
