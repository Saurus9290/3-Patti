const { ethers } = require("ethers");

async function main() {
  const tokenAddress = "0x0755C24388721293cC01e6fBAa94562dd3Ced12B";
  
  // Connect to Base Sepolia
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  
  // Minimal ABI to check paused state
  const minimalABI = [
    "function paused() view returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
  ];
  
  const contract = new ethers.Contract(tokenAddress, minimalABI, provider);
  
  console.log("Checking contract on Base Sepolia...\n");
  
  try {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const paused = await contract.paused();
    
    console.log("✅ Contract found!");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Paused:", paused);
    
    if (paused) {
      console.log("\n⚠️  CONTRACT IS PAUSED!");
      console.log("You need to unpause it before users can buy tokens.");
      console.log("Run: pnpm exec hardhat run scripts/unpause.js --network baseSepolia");
    } else {
      console.log("\n✅ Contract is active and ready!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main();
