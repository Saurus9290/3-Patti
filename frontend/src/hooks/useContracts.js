import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet.jsx';
import TokenABI from '../contracts/TeenPattiToken.json';
import GameABI from '../contracts/TeenPattiGame.json';
import addresses from '../contracts/addresses.json';

// RPC URLs for different networks
const RPC_URLS = {
  84532: 'https://sepolia.base.org',
  8453: 'https://mainnet.base.org',
};

export function useContracts() {
  const { provider: walletProvider, signer, chainId } = useWallet();
  const [tokenContract, setTokenContract] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [contractAddresses, setContractAddresses] = useState(null);
  const [rpcProvider, setRpcProvider] = useState(null);

  // Initialize RPC provider (always available, even without wallet)
  useEffect(() => {
    initializeRpcProvider();
  }, []);

  // Initialize contracts when wallet connects or RPC provider is ready
  useEffect(() => {
    if ((walletProvider || rpcProvider) && chainId) {
      initializeContracts();
    } else if (rpcProvider && !chainId) {
      // If no wallet connected, use default network (Base Sepolia)
      initializeContractsWithRpc(84532);
    }
  }, [walletProvider, signer, chainId, rpcProvider]);

  function initializeRpcProvider() {
    try {
      // Default to Base Sepolia
      const defaultRpcUrl = RPC_URLS[84532];
      const provider = new ethers.JsonRpcProvider(defaultRpcUrl);
      setRpcProvider(provider);
      console.log('RPC provider initialized:', defaultRpcUrl);
    } catch (error) {
      console.error('Error initializing RPC provider:', error);
    }
  }

  function initializeContractsWithRpc(targetChainId) {
    try {
      const networkName = getNetworkName(targetChainId);
      const networkAddresses = addresses[networkName];

      if (!networkAddresses) {
        console.warn(`No contract addresses found for chain ${targetChainId}`);
        return;
      }

      setContractAddresses(networkAddresses);

      // Use RPC provider for read-only operations
      const provider = rpcProvider;

      // Initialize token contract
      if (networkAddresses.TeenPattiToken) {
        const token = new ethers.Contract(
          networkAddresses.TeenPattiToken,
          TokenABI.abi,
          provider
        );
        setTokenContract(token);
      }

      // Initialize game contract
      if (networkAddresses.TeenPattiGame) {
        const game = new ethers.Contract(
          networkAddresses.TeenPattiGame,
          GameABI.abi,
          provider
        );
        setGameContract(game);
      }

      console.log('Contracts initialized with RPC provider for network:', networkName);
    } catch (error) {
      console.error('Error initializing contracts with RPC:', error);
    }
  }

  function initializeContracts() {
    try {
      // Get network name from chainId
      const networkName = getNetworkName(chainId);
      const networkAddresses = addresses[networkName];

      if (!networkAddresses) {
        console.warn(`No contract addresses found for chain ${chainId}`);
        return;
      }

      setContractAddresses(networkAddresses);

      // Use signer for write operations, wallet provider for reads, or fallback to RPC
      const provider = signer || walletProvider || rpcProvider;

      // Initialize token contract
      if (networkAddresses.TeenPattiToken) {
        const token = new ethers.Contract(
          networkAddresses.TeenPattiToken,
          TokenABI.abi,
          provider
        );
        setTokenContract(token);
      }

      // Initialize game contract
      if (networkAddresses.TeenPattiGame) {
        const game = new ethers.Contract(
          networkAddresses.TeenPattiGame,
          GameABI.abi,
          provider
        );
        setGameContract(game);
      }

      console.log('Contracts initialized for network:', networkName);
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  }

  function getNetworkName(chainId) {
    const networks = {
      84532: 'baseSepolia',
      8453: 'base',
    };
    return networks[chainId] || 'baseSepolia';
  }

  // Token functions
  async function buyTokens(weiAmount) {
    if (!tokenContract || !signer) throw new Error('Contract not initialized');
    
    try {
      console.log('Buying tokens with amount:', ethers.formatEther(weiAmount), 'ETH');
      
      // Estimate gas first to catch errors early
      const gasEstimate = await tokenContract.buyTokens.estimateGas({ value: weiAmount });
      console.log('Gas estimate:', gasEstimate.toString());
      
      const tx = await tokenContract.buyTokens({ value: weiAmount });
      console.log('Buy tokens tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Buy tokens confirmed:', receipt);
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error buying tokens:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('paused')) {
        errorMessage = 'Contract is paused. Please contact support.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH balance for this transaction.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user.';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async function sellTokens(tokenAmount) {
    if (!tokenContract || !signer) throw new Error('Contract not initialized');
    
    try {
      const tx = await tokenContract.sellTokens(tokenAmount);
      console.log('Sell tokens tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Sell tokens confirmed:', receipt);
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error selling tokens:', error);
      return { success: false, error: error.message };
    }
  }

  const getTokenBalance = useCallback(async (address) => {
    if (!tokenContract) {
      console.warn('⏳ Token contract not initialized yet');
      return 0n;
    }
    return await tokenContract.balanceOf(address);
  }, [tokenContract]);

  async function approveTokens(spenderAddress, amount) {
    if (!tokenContract || !signer) throw new Error('Contract not initialized');
    
    try {
      const tx = await tokenContract.approve(spenderAddress, amount);
      console.log('Approve tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Approve confirmed:', receipt);
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error approving tokens:', error);
      return { success: false, error: error.message };
    }
  }

  async function calculateTokensForWei(weiAmount) {
    if (!tokenContract) {
      console.warn('⏳ Token contract not initialized yet');
      return 0n;
    }
    return await tokenContract.calculateTokensForWei(weiAmount);
  }

  // Game functions
  async function createRoom(buyIn, maxPlayers) {
    if (!gameContract || !signer) throw new Error('Contract not initialized');
    
    try {
      const tx = await gameContract.createRoom(buyIn, maxPlayers);
      console.log('Create room tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Create room confirmed:', receipt);
      
      // Extract roomId from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = gameContract.interface.parseLog(log);
          return parsed.name === 'RoomCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = gameContract.interface.parseLog(event);
        return { 
          success: true, 
          txHash: tx.hash, 
          receipt,
          roomId: parsed.args.roomId 
        };
      }
      
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error creating room:', error);
      return { success: false, error: error.message };
    }
  }

  async function joinRoom(roomId) {
    if (!gameContract || !signer) throw new Error('Contract not initialized');
    
    try {
      const tx = await gameContract.joinRoom(roomId);
      console.log('Join room tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Join room confirmed:', receipt);
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error joining room:', error);
      return { success: false, error: error.message };
    }
  }

  async function leaveRoom(roomId) {
    if (!gameContract || !signer) throw new Error('Contract not initialized');
    
    try {
      const tx = await gameContract.leaveRoom(roomId);
      console.log('Leave room tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Leave room confirmed:', receipt);
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error leaving room:', error);
      return { success: false, error: error.message };
    }
  }

  const getRoomDetails = useCallback(async (roomId) => {
    if (!gameContract) {
      console.warn('⏳ Contract not initialized yet, skipping room details fetch');
      return null;
    }
    
    try {
      console.log('📡 Fetching room details:', {
        roomId,
        contractAddress: await gameContract.getAddress(),
        network: await gameContract.runner?.provider?.getNetwork()
      });
      
      // Call the contract function directly
      const details = await gameContract.getRoomDetails(roomId);
      
      const isEmptyRoom = details.creator === '0x0000000000000000000000000000000000000000';
      
      console.log(isEmptyRoom ? '❌ Room NOT FOUND' : '✅ Room FOUND:', {
        roomId,
        creator: details.creator,
        buyIn: details.buyIn?.toString(),
        pot: details.pot?.toString(),
        maxPlayers: details.maxPlayers?.toString(),
        currentPlayers: details.currentPlayers?.toString(),
        state: details.state?.toString(),
        winner: details.winner
      });
      
      return {
        creator: details.creator,
        buyIn: details.buyIn,
        pot: details.pot,
        maxPlayers: details.maxPlayers,
        currentPlayers: details.currentPlayers,
        state: details.state,
        winner: details.winner
      };
    } catch (error) {
      console.error('❌ Error getting room details:', error);
      return null;
    }
  }, [gameContract]);

  async function startGame(roomId) {
    if (!gameContract || !signer) throw new Error('Contract not initialized');
    
    try {
      const tx = await gameContract.startGame(roomId);
      console.log('Start game tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Start game confirmed:', receipt);
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error starting game:', error);
      return { success: false, error: error.message };
    }
  }

  async function declareWinner(roomId, winner) {
    if (!gameContract || !signer) throw new Error('Contract not initialized');
    
    try {
      const tx = await gameContract.declareWinner(roomId, winner);
      console.log('Declare winner tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Declare winner confirmed:', receipt);
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error('Error declaring winner:', error);
      return { success: false, error: error.message };
    }
  }

  return {
    tokenContract,
    gameContract,
    contractAddresses,
    rpcProvider,
    // Token functions
    buyTokens,
    sellTokens,
    getTokenBalance,
    approveTokens,
    calculateTokensForWei,
    // Game functions
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomDetails,
    startGame,
    declareWinner,
  };
}
