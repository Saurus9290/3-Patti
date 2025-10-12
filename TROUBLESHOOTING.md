# Troubleshooting: Buy Tokens Error

## Issue
Getting `missing revert data` error when trying to buy tokens on Base Sepolia.

## Root Cause
The deployed contracts were compiled with **incorrect OpenZeppelin import paths**. OpenZeppelin v5 moved `Pausable` and `ReentrancyGuard` from `security/` to `utils/` folder.

## Solution: Redeploy Contracts

### 1. Fixed Import Paths ✅
Already updated in:
- `contracts/TeenPattiToken.sol`
- `contracts/TeenPattiGame.sol`

Changed from:
```solidity
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```

To:
```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

### 2. Redeploy to Base Sepolia

```bash
cd contracts

# Make sure .env is configured with your PRIVATE_KEY
# Make sure you have Base Sepolia ETH

# Deploy
pnpm run deploy:baseSepolia
```

### 3. Update Frontend Addresses

After deployment, update `frontend/src/contracts/addresses.json` with new addresses:

```json
{
  "baseSepolia": {
    "TeenPattiToken": "0xNEW_TOKEN_ADDRESS",
    "TeenPattiGame": "0xNEW_GAME_ADDRESS"
  }
}
```

### 4. Verify Contracts (Optional)

```bash
cd contracts

# Verify Token
pnpm exec hardhat verify --network baseSepolia <TOKEN_ADDRESS> <TREASURY_ADDRESS>

# Verify Game
pnpm exec hardhat verify --network baseSepolia <GAME_ADDRESS> <TOKEN_ADDRESS> <TREASURY_ADDRESS>
```

## Quick Check Script

To verify contract status without redeploying:

```bash
cd contracts
node scripts/quickCheck.js
```

This checks if the contract is:
- Deployed correctly
- Not paused
- Accessible

## Current Status

✅ Contracts compile successfully with fixed imports
✅ Old contract on Base Sepolia is NOT paused
❌ Old contract has incompatible bytecode (needs redeploy)

## Next Steps

1. **Redeploy contracts** with fixed imports
2. **Update frontend** with new addresses
3. **Test buy tokens** functionality
4. **Verify on Basescan**

## Alternative: Keep Old Contracts

If you want to keep the old deployed contracts, you would need to:
1. Revert the import changes
2. Downgrade OpenZeppelin to v4.x
3. Redeploy with old version

**Not recommended** - better to use the latest OpenZeppelin v5.

---

## Error Details

**Error Message:**
```
missing revert data (action="estimateGas", data=null, reason=null, 
transaction={ "data": "0xd0febe4c", "from": "0x...", "to": "0x..." }, 
code=CALL_EXCEPTION)
```

**What it means:**
- The contract call is failing during gas estimation
- Usually indicates a mismatch between ABI and deployed bytecode
- Or a require() statement failing in the contract

**Why it's happening:**
- Contract was deployed with old OpenZeppelin paths
- ABI expects new paths
- Bytecode mismatch causes the call to fail

---

## Prevention

For future deployments:
1. Always compile and test locally first
2. Deploy to testnet
3. Verify contract on explorer
4. Test all functions before announcing
5. Keep track of OpenZeppelin version compatibility
