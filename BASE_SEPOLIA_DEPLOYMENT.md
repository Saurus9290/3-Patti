# Base Sepolia Deployment Guide

Quick guide to deploy Teen Patti contracts on Base Sepolia testnet.

---

## 📋 Prerequisites

1. **Get Base Sepolia ETH**
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Or bridge from Sepolia ETH using [Base Bridge](https://bridge.base.org/)
   - You need ~0.01 ETH for deployment

2. **Get Basescan API Key** (for verification)
   - Visit [Basescan](https://basescan.org/)
   - Create account and get API key

---

## 🚀 Deployment Steps

### 1. Configure Environment

Create `.env` file in `contracts/` directory:

```bash
cd contracts
cp .env.example .env
```

Edit `.env`:
```env
# Your wallet private key (with Base Sepolia ETH)
PRIVATE_KEY=your_private_key_here

# Base Sepolia RPC (default is fine)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Basescan API key for verification
BASESCAN_API_KEY=your_basescan_api_key
```

**⚠️ IMPORTANT**: Never commit your `.env` file with real private keys!

### 2. Install Dependencies

```bash
cd contracts
npm install
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy to Base Sepolia

```bash
npm run deploy:baseSepolia
```

Expected output:
```
Starting deployment...
Deploying contracts with account: 0x...
Account balance: 0.01 ETH

📝 Deploying TeenPattiToken...
✅ TeenPattiToken deployed to: 0x...

📝 Deploying TeenPattiGame...
✅ TeenPattiGame deployed to: 0x...

🎉 DEPLOYMENT SUCCESSFUL!
```

**Save these contract addresses!**

### 5. Verify Contracts on Basescan

```bash
# Verify Token Contract
npx hardhat verify --network baseSepolia <TOKEN_ADDRESS> <TREASURY_ADDRESS>

# Verify Game Contract
npx hardhat verify --network baseSepolia <GAME_ADDRESS> <TOKEN_ADDRESS> <TREASURY_ADDRESS>
```

Example:
```bash
npx hardhat verify --network baseSepolia 0x123... 0xYourWallet...
npx hardhat verify --network baseSepolia 0x456... 0x123... 0xYourWallet...
```

---

## 🔧 Configure Application

### Backend Configuration

Edit `backend/.env`:

```env
# Enable blockchain
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=baseSepolia
RPC_URL=https://sepolia.base.org
CHAIN_ID=84532

# Contract addresses from deployment
TOKEN_CONTRACT_ADDRESS=0x...
GAME_CONTRACT_ADDRESS=0x...

# Server
PORT=3001
```

### Frontend Configuration

The deployment script automatically updates `frontend/src/contracts/addresses.json`.

Verify it looks like:
```json
{
  "baseSepolia": {
    "TeenPattiToken": "0x...",
    "TeenPattiGame": "0x..."
  }
}
```

---

## 🦊 MetaMask Setup

### Add Base Sepolia Network

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter details:

```
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

5. Click "Save"

### Import Test Account (if needed)

If you want to use the deployment account:
1. Click account icon → Import Account
2. Paste your private key
3. Account imported with ETH balance

---

## 🧪 Test the Deployment

### 1. Start Backend

```bash
cd backend
pnpm install
pnpm start
```

### 2. Start Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### 3. Test in Browser

1. Open `http://localhost:5173`
2. Connect MetaMask (Base Sepolia network)
3. Click "Buy Tokens"
4. Enter amount (e.g., 0.001 ETH)
5. Confirm transaction in MetaMask
6. Wait for confirmation
7. Check your TPT balance!

---

## 📊 Base Sepolia Details

- **Chain ID**: 84532
- **Currency**: ETH (testnet)
- **Block Time**: ~2 seconds
- **Gas Price**: Very low (~0.001 Gwei)
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

## 💰 Estimated Costs

| Action | Gas | Cost (ETH) | Cost (USD) |
|--------|-----|------------|------------|
| Deploy Token | ~1,500,000 | ~0.0015 | ~$3 |
| Deploy Game | ~2,000,000 | ~0.002 | ~$4 |
| Buy Tokens | ~45,000 | ~0.00005 | ~$0.10 |
| Create Room | ~150,000 | ~0.00015 | ~$0.30 |
| Join Room | ~80,000 | ~0.00008 | ~$0.16 |

**Total Deployment: ~$7**
**Per Game: ~$0.50**

---

## 🔍 Verify Deployment

### Check Contracts on Basescan

1. Visit https://sepolia.basescan.org
2. Search for your contract addresses
3. Verify:
   - Contract is verified (green checkmark)
   - Contract has correct code
   - Can read contract functions

### Test Token Functions

On Basescan, go to your Token contract → "Read Contract":
- Check `name()` → "TeenPattiToken"
- Check `symbol()` → "TPT"
- Check `totalSupply()` → Should show initial supply
- Check `balanceOf(your_address)` → Should show your balance

### Test Game Functions

On Basescan, go to your Game contract → "Read Contract":
- Check `token()` → Should match Token address
- Check `treasury()` → Should match your treasury address
- Check `rakeFee()` → Should be 500 (5%)

---

## 🐛 Troubleshooting

### "Insufficient funds for gas"
- Get more Base Sepolia ETH from faucet
- Check you're on Base Sepolia network

### "Invalid API Key" during verification
- Check your Basescan API key
- Make sure it's for Basescan (not Etherscan)

### "Contract already verified"
- This is fine! Contract is already verified
- You can skip verification step

### "Network not found"
- Check hardhat.config.js has baseSepolia network
- Verify RPC URL is correct
- Try alternative RPC: `https://base-sepolia-rpc.publicnode.com`

### Frontend can't find contracts
- Check addresses.json has correct addresses
- Verify chainId is 84532
- Check MetaMask is on Base Sepolia

---

## 🎮 Next Steps

After successful deployment:

1. **Test Token Purchase**
   - Buy small amount of TPT
   - Verify balance updates

2. **Test Room Creation**
   - Create a test room
   - Check transaction on Basescan
   - Verify room exists on-chain

3. **Test Full Game Flow**
   - Create room with 2+ players
   - Play a game
   - Verify winner receives tokens

4. **Monitor Contracts**
   - Watch transactions on Basescan
   - Check event logs
   - Monitor gas usage

5. **Consider Mainnet**
   - If tests pass, deploy to Base Mainnet
   - Use `npm run deploy:base`
   - Much higher costs on mainnet!

---

## 📚 Resources

- [Base Documentation](https://docs.base.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [Basescan Explorer](https://sepolia.basescan.org)
- [Base Bridge](https://bridge.base.org/)
- [Hardhat Documentation](https://hardhat.org/docs)

---

## ✅ Deployment Checklist

- [ ] Get Base Sepolia ETH from faucet
- [ ] Configure .env with private key
- [ ] Install dependencies
- [ ] Compile contracts
- [ ] Deploy to Base Sepolia
- [ ] Save contract addresses
- [ ] Verify contracts on Basescan
- [ ] Update backend .env
- [ ] Verify frontend addresses.json
- [ ] Add Base Sepolia to MetaMask
- [ ] Test token purchase
- [ ] Test room creation
- [ ] Test full game flow
- [ ] Monitor on Basescan

---

Good luck with your deployment! 🚀
