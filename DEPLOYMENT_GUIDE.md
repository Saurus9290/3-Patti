# Teen Patti Blockchain Deployment Guide

Complete guide to deploy and run the Teen Patti game with blockchain integration.

---

## 📋 Prerequisites

- Node.js v16+ and npm/pnpm
- MetaMask or another Web3 wallet
- MATIC tokens (for Polygon Mumbai testnet or mainnet)
- Git

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```bash
# Install contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 2. Start Local Blockchain

```bash
cd contracts
npm run node
```

Keep this terminal running. This starts a local Hardhat network on `http://127.0.0.1:8545`.

### 3. Deploy Contracts (New Terminal)

```bash
cd contracts
npm run deploy:localhost
```

This will:
- Deploy TeenPattiToken and TeenPattiGame contracts
- Copy ABIs to backend and frontend
- Save contract addresses

**Important**: Note the contract addresses from the output!

### 4. Configure Backend

Create `.env` file in `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
# Blockchain Configuration
BLOCKCHAIN_ENABLED=false
BLOCKCHAIN_NETWORK=localhost
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=1337

# Contract Addresses (from deployment output)
TOKEN_CONTRACT_ADDRESS=0x...
GAME_CONTRACT_ADDRESS=0x...

# Backend Wallet (optional, not needed for user-signed transactions)
BACKEND_PRIVATE_KEY=

# Server
PORT=3001
```

### 5. Start Backend

```bash
cd backend
pnpm start
```

Backend runs on `http://localhost:3001`

### 6. Start Frontend

```bash
cd frontend
pnpm run dev
```

Frontend runs on `http://localhost:5173`

### 7. Connect MetaMask to Local Network

1. Open MetaMask
2. Add Network:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

3. Import test account:
   - Hardhat provides test accounts with 10000 ETH each
   - Get private key from Hardhat node terminal output
   - Import into MetaMask

### 8. Test the Application

1. Open `http://localhost:5173`
2. Click "Connect Wallet"
3. Buy TPT tokens
4. Create/join a game room
5. Play!

---

## 🌐 Testnet Deployment (Polygon Mumbai)

### 1. Get Mumbai MATIC

- Visit [Mumbai Faucet](https://faucet.polygon.technology/)
- Enter your wallet address
- Receive test MATIC

### 2. Configure Deployment

Create `.env` in `contracts/` directory:

```env
PRIVATE_KEY=your_private_key_here
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_api_key
```

**⚠️ Never commit your private key!**

### 3. Deploy to Mumbai

```bash
cd contracts
npm run deploy:mumbai
```

### 4. Verify Contracts (Optional)

```bash
npx hardhat verify --network mumbai <TOKEN_ADDRESS> <TREASURY_ADDRESS>
npx hardhat verify --network mumbai <GAME_ADDRESS> <TOKEN_ADDRESS> <TREASURY_ADDRESS>
```

### 5. Update Backend Configuration

Edit `backend/.env`:

```env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=mumbai
RPC_URL=https://rpc-mumbai.maticvigil.com
CHAIN_ID=80001
TOKEN_CONTRACT_ADDRESS=<deployed_token_address>
GAME_CONTRACT_ADDRESS=<deployed_game_address>
```

### 6. Update Frontend Configuration

The deployment script automatically updates `frontend/src/contracts/addresses.json`.

Verify the addresses are correct:

```json
{
  "mumbai": {
    "TeenPattiToken": "0x...",
    "TeenPattiGame": "0x..."
  }
}
```

### 7. Connect MetaMask to Mumbai

1. Open MetaMask
2. Select "Polygon Mumbai" network
3. If not available, add manually:
   - Network Name: `Polygon Mumbai`
   - RPC URL: `https://rpc-mumbai.maticvigil.com`
   - Chain ID: `80001`
   - Currency Symbol: `MATIC`
   - Block Explorer: `https://mumbai.polygonscan.com`

---

## 🎮 Game Flow with Blockchain

### User Journey

1. **Connect Wallet**
   - User clicks "Connect Wallet"
   - MetaMask prompts for connection
   - Wallet address displayed

2. **Buy Tokens**
   - User clicks "Buy Tokens"
   - Enters MATIC amount
   - Confirms transaction in MetaMask
   - Receives TPT tokens

3. **Create Room (On-Chain)**
   - User sets buy-in amount and max players
   - Approves token spending (if first time)
   - Calls `createRoom()` contract function
   - Signs transaction in MetaMask
   - Room created on blockchain
   - Buy-in locked in contract

4. **Join Room (On-Chain)**
   - User enters room ID
   - Calls `joinRoom()` contract function
   - Signs transaction in MetaMask
   - Buy-in transferred to contract

5. **Play Game (Off-Chain)**
   - All game logic runs on WebSocket server
   - Fast, no gas fees during gameplay
   - Cards dealt, bets placed, turns managed

6. **Winner Declared (On-Chain)**
   - Game ends, winner determined
   - Frontend calls `declareWinner()` (signed by winner or any player)
   - Smart contract distributes pot
   - Deducts 5% rake
   - Winner receives tokens

7. **Withdraw/Play Again**
   - Winner's tokens in wallet
   - Can play another game or sell tokens

---

## 🔧 Architecture Overview

### Hybrid Approach

```
┌─────────────┐
│   Frontend  │ ← User signs all transactions
│  (React +   │
│   ethers.js)│
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐  ┌──────────────┐
│  WebSocket  │  │  Blockchain  │
│   Backend   │  │  (Polygon)   │
│             │  │              │
│ • Game      │  │ • Token      │
│   Logic     │  │ • Rooms      │
│ • Cards     │  │ • Payouts    │
│ • Turns     │  │ • Rake       │
└─────────────┘  └──────────────┘
```

### What's On-Chain vs Off-Chain

**On-Chain (Blockchain)**:
- ✅ Token purchases/sales
- ✅ Room creation
- ✅ Joining rooms (buy-in)
- ✅ Winner declaration
- ✅ Pot distribution
- ✅ Rake collection

**Off-Chain (WebSocket Server)**:
- ✅ Card dealing
- ✅ Turn management
- ✅ Betting actions
- ✅ Game state
- ✅ Player communication

**Why Hybrid?**
- ⚡ Fast gameplay (no waiting for blockchain)
- 💰 Low cost (fewer transactions)
- 🔒 Secure finances (money on-chain)
- ✨ Great UX (no interruptions)

---

## 🧪 Testing

### Contract Tests

```bash
cd contracts
npm test
```

### Test Coverage

```bash
cd contracts
npm run coverage
```

### Manual Testing Checklist

- [ ] Connect wallet
- [ ] Buy tokens
- [ ] Approve token spending
- [ ] Create room (on-chain)
- [ ] Join room (on-chain)
- [ ] Play game (off-chain)
- [ ] Winner declared (on-chain)
- [ ] Tokens received
- [ ] Sell tokens

---

## 📊 Gas Costs (Polygon Mumbai/Mainnet)

| Action | Gas Used | Cost (MATIC) | Cost (USD) |
|--------|----------|--------------|------------|
| Buy Tokens | ~45,000 | ~0.00001 | ~$0.00001 |
| Approve Tokens | ~46,000 | ~0.00001 | ~$0.00001 |
| Create Room | ~150,000 | ~0.00003 | ~$0.00003 |
| Join Room | ~80,000 | ~0.00002 | ~$0.00002 |
| Declare Winner | ~100,000 | ~0.00002 | ~$0.00002 |

**Total per game: ~$0.0001 (extremely affordable!)**

---

## 🔒 Security Best Practices

### For Users
1. Never share your private key
2. Always verify contract addresses
3. Check transaction details before signing
4. Use hardware wallet for large amounts
5. Start with small amounts for testing

### For Developers
1. Audit smart contracts before mainnet
2. Use OpenZeppelin audited contracts
3. Implement rate limiting
4. Monitor contract events
5. Have emergency pause mechanism
6. Use multi-sig for admin functions

---

## 🐛 Troubleshooting

### "Contract not initialized"
- Ensure contracts are deployed
- Check contract addresses in config
- Verify network matches deployment

### "Insufficient funds"
- Get testnet MATIC from faucet
- Check wallet balance
- Ensure enough for gas fees

### "Transaction failed"
- Check gas limit
- Verify token approval
- Ensure sufficient token balance
- Check network congestion

### "Wrong network"
- Switch MetaMask to correct network
- Verify chainId in config
- Check RPC URL

### MetaMask not connecting
- Refresh page
- Disconnect and reconnect
- Clear browser cache
- Update MetaMask

---

## 📝 Environment Variables Reference

### Backend `.env`

```env
# Blockchain
BLOCKCHAIN_ENABLED=true|false
BLOCKCHAIN_NETWORK=localhost|mumbai|polygon
RPC_URL=<rpc_endpoint>
CHAIN_ID=1337|80001|137

# Contracts
TOKEN_CONTRACT_ADDRESS=0x...
GAME_CONTRACT_ADDRESS=0x...

# Server
PORT=3001
```

### Contracts `.env`

```env
PRIVATE_KEY=<deployer_private_key>
MUMBAI_RPC_URL=<mumbai_rpc>
POLYGON_RPC_URL=<polygon_rpc>
POLYGONSCAN_API_KEY=<api_key>
```

---

## 🚀 Production Deployment

### 1. Deploy to Polygon Mainnet

```bash
cd contracts
npm run deploy:polygon
```

### 2. Verify Contracts

```bash
npx hardhat verify --network polygon <addresses>
```

### 3. Update Production Config

- Set `BLOCKCHAIN_ENABLED=true`
- Use mainnet RPC URLs
- Update contract addresses
- Enable monitoring

### 4. Deploy Backend

- Use PM2 or Docker
- Set up SSL/TLS
- Configure firewall
- Enable logging

### 5. Deploy Frontend

- Build: `npm run build`
- Deploy to Vercel/Netlify
- Configure environment variables
- Set up CDN

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [MetaMask Documentation](https://docs.metamask.io/)

---

## 🆘 Support

For issues or questions:
1. Check troubleshooting section
2. Review contract tests
3. Check blockchain explorer
4. Review transaction logs

---

## 📄 License

MIT License - See LICENSE file for details
