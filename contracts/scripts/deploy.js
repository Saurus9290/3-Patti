const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH/MATIC");
  
  // Set treasury address (use deployer for now, change later)
  const treasuryAddress = deployer.address;
  console.log("Treasury address:", treasuryAddress);
  
  // Deploy TeenPattiToken
  console.log("\n📝 Deploying TeenPattiToken...");
  const TeenPattiToken = await hre.ethers.getContractFactory("TeenPattiToken");
  const token = await TeenPattiToken.deploy(treasuryAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ TeenPattiToken deployed to:", tokenAddress);
  
  // Deploy TeenPattiGame
  console.log("\n📝 Deploying TeenPattiGame...");
  const TeenPattiGame = await hre.ethers.getContractFactory("TeenPattiGame");
  const game = await TeenPattiGame.deploy(tokenAddress, treasuryAddress);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("✅ TeenPattiGame deployed to:", gameAddress);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    treasury: treasuryAddress,
    contracts: {
      TeenPattiToken: tokenAddress,
      TeenPattiGame: gameAddress
    },
    timestamp: new Date().toISOString()
  };
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-${Date.now()}.json`
  );
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 Deployment info saved to:", deploymentFile);
  
  // Save latest deployment
  const latestFile = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Latest deployment saved to:", latestFile);
  
  // Copy ABIs to backend
  console.log("\n📋 Copying ABIs to backend...");
  const backendAbiDir = path.join(__dirname, "../../backend/blockchain/abis");
  if (!fs.existsSync(backendAbiDir)) {
    fs.mkdirSync(backendAbiDir, { recursive: true });
  }
  
  const tokenArtifact = await hre.artifacts.readArtifact("TeenPattiToken");
  const gameArtifact = await hre.artifacts.readArtifact("TeenPattiGame");
  
  fs.writeFileSync(
    path.join(backendAbiDir, "TeenPattiToken.json"),
    JSON.stringify(tokenArtifact, null, 2)
  );
  
  fs.writeFileSync(
    path.join(backendAbiDir, "TeenPattiGame.json"),
    JSON.stringify(gameArtifact, null, 2)
  );
  
  console.log("✅ ABIs copied to backend");
  
  // Copy ABIs to frontend
  console.log("\n📋 Copying ABIs to frontend...");
  const frontendAbiDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendAbiDir, "TeenPattiToken.json"),
    JSON.stringify(tokenArtifact, null, 2)
  );
  
  fs.writeFileSync(
    path.join(frontendAbiDir, "TeenPattiGame.json"),
    JSON.stringify(gameArtifact, null, 2)
  );
  
  // Save deployment addresses for frontend
  fs.writeFileSync(
    path.join(frontendAbiDir, "addresses.json"),
    JSON.stringify({
      [hre.network.name]: {
        TeenPattiToken: tokenAddress,
        TeenPattiGame: gameAddress
      }
    }, null, 2)
  );
  
  console.log("✅ ABIs and addresses copied to frontend");
  
  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("TeenPattiToken:", tokenAddress);
  console.log("TeenPattiGame:", gameAddress);
  console.log("\nNetwork:", hre.network.name);
  console.log("Treasury:", treasuryAddress);
  console.log("\nNext Steps:");
  console.log("1. Update backend .env with contract addresses");
  console.log("2. Update frontend config with contract addresses");
  console.log("3. Verify contracts on block explorer (if mainnet/testnet)");
  console.log("4. Test token buying and game creation");
  console.log("=".repeat(60));
  
  // If on testnet/mainnet, print verification command
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n📝 To verify contracts, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${tokenAddress} ${treasuryAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${gameAddress} ${tokenAddress} ${treasuryAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
