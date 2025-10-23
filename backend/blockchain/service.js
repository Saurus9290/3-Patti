import { ethers } from "ethers";
import { blockchainConfig, getNetworkConfig } from "./config.js";
import { encodeRoomId, formatRoomIdDisplay } from "../utils/roomIdUtils.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlockchainService {
  constructor() {
    this.provider = null;
    this.tokenContract = null;
    this.gameContract = null;
    this.initialized = false;
    this.eventListeners = [];
  }

  async initialize() {
    if (!blockchainConfig.enabled) {
      console.log("⚠️  Blockchain integration is disabled");
      return false;
    }

    try {
      console.log("🔗 Initializing blockchain service (read-only mode)...");

      // Setup provider (read-only, no wallet needed)
      this.provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);

      // Test connection
      const network = await this.provider.getNetwork();
      console.log(
        `✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`
      );

      console.log(
        "ℹ️  Backend runs in read-only mode - all transactions signed by users in frontend"
      );

      // Load contract ABIs
      const tokenABI = this.loadABI("TeenPattiToken");
      const gameABI = this.loadABI("TeenPattiGame");

      // Initialize contracts (read-only)
      if (blockchainConfig.tokenAddress) {
        this.tokenContract = new ethers.Contract(
          blockchainConfig.tokenAddress,
          tokenABI,
          this.provider
        );
        console.log(
          `✅ Token contract loaded: ${blockchainConfig.tokenAddress}`
        );
      }

      if (blockchainConfig.gameAddress) {
        this.gameContract = new ethers.Contract(
          blockchainConfig.gameAddress,
          gameABI,
          this.provider
        );
        console.log(`✅ Game contract loaded: ${blockchainConfig.gameAddress}`);
      }

      this.initialized = true;
      console.log("🎉 Blockchain service initialized successfully");
      return true;
    } catch (error) {
      console.error(
        "❌ Failed to initialize blockchain service:",
        error.message
      );
      return false;
    }
  }

  loadABI(contractName) {
    try {
      const abiPath = path.join(__dirname, "abis", `${contractName}.json`);
      const abiFile = fs.readFileSync(abiPath, "utf8");
      const artifact = JSON.parse(abiFile);
      return artifact.abi;
    } catch (error) {
      console.error(`Failed to load ABI for ${contractName}:`, error.message);
      throw error;
    }
  }

  // Token functions
  async getTokenBalance(address) {
    if (!this.tokenContract) throw new Error("Token contract not initialized");
    return await this.tokenContract.balanceOf(address);
  }

  async getTokenPrice() {
    if (!this.tokenContract) throw new Error("Token contract not initialized");
    return await this.tokenContract.getTokenPrice();
  }

  async calculateTokensForWei(weiAmount) {
    if (!this.tokenContract) throw new Error("Token contract not initialized");
    return await this.tokenContract.calculateTokensForWei(weiAmount);
  }

  // Event listening functions
  async startEventListeners(io) {
    if (!this.gameContract) {
      console.warn("Game contract not initialized, skipping event listeners");
      return;
    }

    console.log("🎧 Starting blockchain event listeners...");

    // Listen for RoomCreated events
    this.gameContract.on(
      "RoomCreated",
      (roomId, creator, buyIn, maxPlayers, event) => {
        const shortId = encodeRoomId(roomId);
        console.log(
          `📢 RoomCreated event: ${formatRoomIdDisplay(roomId)} (${shortId})`
        );
        io.emit("blockchainEvent", {
          type: "RoomCreated",
          data: {
            roomId,
            shortRoomId: shortId,
            creator,
            buyIn: buyIn.toString(),
            maxPlayers: maxPlayers.toString(),
          },
        });
      }
    );

    // Listen for PlayerJoined events
    this.gameContract.on("PlayerJoined", (roomId, player, buyIn, event) => {
      const shortId = encodeRoomId(roomId);
      console.log(
        `📢 PlayerJoined event: ${player} joined ${formatRoomIdDisplay(roomId)}`
      );
      io.emit("blockchainEvent", {
        type: "PlayerJoined",
        data: {
          roomId,
          shortRoomId: shortId,
          player,
          buyIn: buyIn.toString(),
        },
      });
    });

    // Listen for GameStarted events
    this.gameContract.on("GameStarted", (roomId, pot, playerCount, event) => {
      const shortId = encodeRoomId(roomId);
      console.log(`📢 GameStarted event: ${formatRoomIdDisplay(roomId)}`);
      io.emit("blockchainEvent", {
        type: "GameStarted",
        data: {
          roomId,
          shortRoomId: shortId,
          pot: pot.toString(),
          playerCount: playerCount.toString(),
        },
      });
    });

    // Listen for WinnerDeclared events
    this.gameContract.on(
      "WinnerDeclared",
      (roomId, winner, amount, rake, event) => {
        const shortId = encodeRoomId(roomId);
        console.log(
          `📢 WinnerDeclared event: ${winner} won ${amount} in ${formatRoomIdDisplay(
            roomId
          )}`
        );
        io.emit("blockchainEvent", {
          type: "WinnerDeclared",
          data: {
            roomId,
            shortRoomId: shortId,
            winner,
            amount: amount.toString(),
            rake: rake.toString(),
          },
        });
      }
    );

    console.log("✅ Event listeners started");
  }

  stopEventListeners() {
    if (this.gameContract) {
      this.gameContract.removeAllListeners();
      console.log("🛑 Event listeners stopped");
    }
  }

  async getRoomDetails(roomId) {
    if (!this.gameContract) throw new Error("Game contract not initialized");

    try {
      const details = await this.gameContract.getRoomDetails(roomId);
      return {
        roomId,
        shortRoomId: encodeRoomId(roomId),
        creator: details.creator,
        buyIn: details.buyIn,
        pot: details.pot,
        maxPlayers: details.maxPlayers,
        currentPlayers: details.currentPlayers,
        state: details.state,
        winner: details.winner,
      };
    } catch (error) {
      console.error("Failed to get room details:", error);
      return null;
    }
  }

  async getPlayerBalance(roomId, playerAddress) {
    if (!this.gameContract) throw new Error("Game contract not initialized");
    return await this.gameContract.getPlayerBalance(roomId, playerAddress);
  }

  // Utility functions
  formatTokenAmount(amount) {
    return ethers.formatEther(amount);
  }

  parseTokenAmount(amount) {
    return ethers.parseEther(amount.toString());
  }

  async estimateGas(contract, method, ...args) {
    try {
      const gasEstimate = await contract[method].estimateGas(...args);
      return gasEstimate;
    } catch (error) {
      console.error("Gas estimation failed:", error);
      return blockchainConfig.gasLimit;
    }
  }

  async waitForTransaction(txHash, confirmations = 1) {
    try {
      const receipt = await this.provider.waitForTransaction(
        txHash,
        confirmations
      );
      return receipt;
    } catch (error) {
      console.error("Error waiting for transaction:", error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  getContractAddresses() {
    return {
      token: blockchainConfig.tokenAddress,
      game: blockchainConfig.gameAddress,
    };
  }

  getNetworkInfo() {
    return getNetworkConfig();
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;
