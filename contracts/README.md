# Teen Patti Smart Contracts

Smart contracts for the Teen Patti blockchain gaming platform.

## Contracts

### TeenPattiToken (TPT)
ERC20 token for gameplay with buy/sell functionality.

**Features:**
- Buy tokens with ETH/MATIC (1 Wei = 100 TPT)
- Sell tokens back for ETH/MATIC
- Configurable buy/sell fees
- Pausable for emergency stops
- Burnable for deflationary mechanism

### TeenPattiGame
Manages game rooms, bets, and payouts.

**Features:**
- Create and join game rooms
- Lock buy-ins in escrow
- Declare winners and distribute pot
- Collect platform rake (default 5%)
- Emergency withdrawal with penalty
- Timeout handling

## Setup

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

## Deployment

### Local Network
```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:localhost
```

### Mumbai Testnet (Polygon)
```bash
npm run deploy:mumbai
```

### Polygon Mainnet
```bash
npm run deploy:polygon
```

## Testing

Run all tests:
```bash
npm test
```

Run specific test:
```bash
npx hardhat test test/TeenPattiToken.test.js
```

Run with gas reporting:
```bash
REPORT_GAS=true npm test
```

## Verification

After deployment to testnet/mainnet, verify contracts:

```bash
npx hardhat verify --network mumbai <TOKEN_ADDRESS> <TREASURY_ADDRESS>
npx hardhat verify --network mumbai <GAME_ADDRESS> <TOKEN_ADDRESS> <TREASURY_ADDRESS>
```

## Contract Addresses

Deployment addresses are saved in:
- `deployments/<network>-latest.json`
- `../backend/blockchain/abis/` (for backend)
- `../frontend/src/contracts/` (for frontend)

## Security

- ✅ Uses OpenZeppelin audited contracts
- ✅ ReentrancyGuard on all financial functions
- ✅ Pausable for emergency stops
- ✅ Owner-only admin functions
- ✅ Input validation on all functions

## Gas Optimization

Contracts are optimized for low gas usage:
- Create Room: ~50,000 gas
- Join Room: ~40,000 gas
- Declare Winner: ~60,000 gas

On Polygon: ~$0.01-0.02 per transaction

## License

MIT
