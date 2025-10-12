const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x0755C24388721293cC01e6fBAa94562dd3Ced12B";
  const gameAddress = "0x18298659a16721889dC287746C66c359AD74C198";

  console.log("Unpausing contracts...\n");

  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);

  // Unpause Token Contract
  console.log("\n=== Unpausing TeenPattiToken ===");
  try {
    const TeenPattiToken = await hre.ethers.getContractFactory("TeenPattiToken");
    const token = TeenPattiToken.attach(tokenAddress);

    const isPaused = await token.paused();
    console.log("Current paused state:", isPaused);

    if (isPaused) {
      console.log("Unpausing token contract...");
      const tx = await token.unpause();
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Token contract unpaused!");
    } else {
      console.log("Token contract is already unpaused");
    }
  } catch (error) {
    console.error("❌ Error unpausing token:", error.message);
  }

  // Unpause Game Contract
  console.log("\n=== Unpausing TeenPattiGame ===");
  try {
    const TeenPattiGame = await hre.ethers.getContractFactory("TeenPattiGame");
    const game = TeenPattiGame.attach(gameAddress);

    const isPaused = await game.paused();
    console.log("Current paused state:", isPaused);

    if (isPaused) {
      console.log("Unpausing game contract...");
      const tx = await game.unpause();
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Game contract unpaused!");
    } else {
      console.log("Game contract is already unpaused");
    }
  } catch (error) {
    console.error("❌ Error unpausing game:", error.message);
  }

  console.log("\n✅ Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
