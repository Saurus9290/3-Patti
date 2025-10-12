# Network Setup Guide

## Base Sepolia Network Configuration

The Teen Patti game is deployed on **Base Sepolia** testnet. Users need to connect their wallet to this network to interact with the smart contracts.

### Network Details

- **Network Name**: Base Sepolia
- **Chain ID**: 84532 (0x14a34 in hex)
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Native Currency**: ETH

### Contract Addresses

- **TeenPattiToken**: `0x3aeBdED2797b3caB549A5642d0Ce447E7288c5EA`
- **TeenPattiGame**: `0xC2BA8A7d75cc710477255D1644a95A162a6339FC`

## How to Connect

### Automatic Network Switching

The app includes an automatic network switcher that will:
1. Detect if you're on the wrong network
2. Show a yellow banner at the top of the page
3. Provide a "Switch Network" button to automatically switch to Base Sepolia

### Manual Setup in MetaMask

If you prefer to add the network manually:

1. Open MetaMask
2. Click on the network dropdown (top center)
3. Click "Add Network" or "Add a network manually"
4. Enter the following details:
   - Network Name: `Base Sepolia`
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.basescan.org`
5. Click "Save"

## Getting Test ETH

To interact with the contracts, you need Base Sepolia ETH:

1. **Alchemy Faucet**: https://www.alchemy.com/faucets/base-sepolia
2. **Base Docs**: https://docs.base.org/docs/tools/network-faucets/

## Troubleshooting

### "Contract not found" or "Cannot read properties"

**Cause**: Your wallet is connected to the wrong network.

**Solution**: 
- Look for the yellow banner at the top of the page
- Click "Switch Network" button
- Or manually switch to Base Sepolia in MetaMask

### "Insufficient funds" error

**Cause**: You don't have enough Base Sepolia ETH for gas fees.

**Solution**: Get test ETH from the faucets listed above.

### Network indicator shows wrong chain

**Cause**: MetaMask is connected to a different network.

**Solution**: 
- Check the network dropdown in MetaMask
- Switch to Base Sepolia
- Refresh the page if needed

## Features

### Network Indicator
- The token balance component shows which network you're connected to
- Look for the blue badge next to "TPT Balance"
- It should say "Base Sepolia"

### Network Switcher
- Automatically detects wrong network
- One-click network switching
- Automatically adds Base Sepolia if not present in MetaMask

## Development

When testing locally, make sure to:
1. Have MetaMask installed
2. Add Base Sepolia network
3. Get test ETH from faucets
4. Connect your wallet to the app

The app will automatically load the correct contract addresses for Base Sepolia.
