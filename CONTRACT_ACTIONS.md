# Teen Patti Contract Actions

Complete list of all blockchain contract actions in the game.

---

## 🎯 Overview

The game uses a **hybrid approach**:
- **On-Chain**: Financial transactions (token purchases, room creation, payouts)
- **Off-Chain**: Game logic (cards, betting, turns)

---

## 📝 Contract Actions (User Signs)

### **TeenPattiToken Contract**

#### 1. **Buy Tokens** 💰
**Function**: `buyTokens()`
**When**: User wants to purchase TPT tokens
**User Action**: Send ETH → Receive TPT tokens
**Gas Cost**: ~45,000 gas

**Flow**:
```
User sends ETH
  ↓
Contract mints TPT tokens (1 Wei = 100 TPT)
  ↓
Deducts 1% fee to treasury
  ↓
User receives 99 TPT per Wei
```

**Frontend Code**:
```javascript
// In BuyTokensModal.jsx or useContracts.js
const tx = await tokenContract.buyTokens({ value: weiAmount });
await tx.wait();
```

**Emits Event**: `TokensPurchased(buyer, weiAmount, tokenAmount, fee)`

---

#### 2. **Approve Tokens** ✅
**Function**: `approve(spender, amount)`
**When**: Before creating/joining a room (first time only)
**User Action**: Approve Game contract to spend TPT tokens
**Gas Cost**: ~46,000 gas

**Flow**:
```
User approves Game contract
  ↓
Game contract can now transfer user's TPT
  ↓
Required before createRoom() or joinRoom()
```

**Frontend Code**:
```javascript
// In useContracts.js
const gameAddress = contractAddresses.TeenPattiGame;
const tx = await tokenContract.approve(gameAddress, amount);
await tx.wait();
```

**Emits Event**: `Approval(owner, spender, value)`

---

#### 3. **Sell Tokens** 💸
**Function**: `sellTokens(tokenAmount)`
**When**: User wants to cash out TPT for ETH
**User Action**: Burn TPT tokens → Receive ETH
**Gas Cost**: ~50,000 gas

**Flow**:
```
User burns TPT tokens
  ↓
Contract sends ETH back (1 TPT = 0.01 Wei)
  ↓
Deducts 2% fee to treasury
  ↓
User receives 98% of ETH value
```

**Frontend Code**:
```javascript
const tx = await tokenContract.sellTokens(tokenAmount);
await tx.wait();
```

**Emits Event**: `TokensSold(seller, tokenAmount, weiAmount, fee)`

---

### **TeenPattiGame Contract**

#### 4. **Create Room** 🎮
**Function**: `createRoom(buyIn, maxPlayers)`
**When**: User creates a new game room
**User Action**: Lock buy-in amount in contract
**Gas Cost**: ~150,000 gas

**Flow**:
```
User calls createRoom(1000 TPT, 4 players)
  ↓
Contract transfers 1000 TPT from user to contract
  ↓
Generates unique roomId
  ↓
User becomes first player in room
  ↓
Room state = WAITING
```

**Frontend Code**:
```javascript
// In useContracts.js
const buyIn = ethers.parseEther("1000"); // 1000 TPT
const tx = await gameContract.createRoom(buyIn, 4);
const receipt = await tx.wait();
// Extract roomId from RoomCreated event
```

**Emits Events**: 
- `RoomCreated(roomId, creator, buyIn, maxPlayers)`
- `PlayerJoined(roomId, player, buyIn)`

---

#### 5. **Join Room** 🚪
**Function**: `joinRoom(roomId)`
**When**: User joins an existing room
**User Action**: Lock buy-in amount in contract
**Gas Cost**: ~80,000 gas

**Flow**:
```
User calls joinRoom(roomId)
  ↓
Contract checks room exists and has space
  ↓
Contract transfers buy-in TPT from user
  ↓
User added to room.players[]
  ↓
Pot increases by buy-in amount
```

**Frontend Code**:
```javascript
const tx = await gameContract.joinRoom(roomId);
await tx.wait();
```

**Emits Event**: `PlayerJoined(roomId, player, buyIn)`

---

#### 6. **Leave Room** 🚶
**Function**: `leaveRoom(roomId)`
**When**: User wants to leave before game starts
**User Action**: Get refund of buy-in
**Gas Cost**: ~60,000 gas

**Flow**:
```
User calls leaveRoom(roomId)
  ↓
Contract checks game hasn't started
  ↓
Contract refunds buy-in TPT to user
  ↓
User removed from room
  ↓
If no players left, room cancelled
```

**Frontend Code**:
```javascript
const tx = await gameContract.leaveRoom(roomId);
await tx.wait();
```

**Emits Event**: `PlayerLeft(roomId, player, refund)`

---

#### 7. **Start Game** ▶️
**Function**: `startGame(roomId)`
**When**: Room creator or backend starts the game
**User Action**: Lock all funds, begin gameplay
**Gas Cost**: ~50,000 gas

**Flow**:
```
Creator calls startGame(roomId)
  ↓
Contract checks at least 2 players
  ↓
Room state = ACTIVE
  ↓
All buy-ins locked (no refunds)
  ↓
Off-chain game begins
```

**Frontend Code**:
```javascript
const tx = await gameContract.startGame(roomId);
await tx.wait();
```

**Emits Event**: `GameStarted(roomId, pot, playerCount)`

---

#### 8. **Declare Winner** 🏆
**Function**: `declareWinner(roomId, winnerAddress)`
**When**: Game ends, winner determined off-chain
**User Action**: Distribute pot to winner
**Gas Cost**: ~100,000 gas

**Flow**:
```
Anyone calls declareWinner(roomId, winner)
  ↓
Contract calculates rake (5% of pot)
  ↓
Winner receives 95% of pot
  ↓
Treasury receives 5% rake
  ↓
Room state = FINISHED
```

**Frontend Code**:
```javascript
const tx = await gameContract.declareWinner(roomId, winnerAddress);
await tx.wait();
```

**Emits Event**: `WinnerDeclared(roomId, winner, amount, rake)`

---

#### 9. **Emergency Withdraw** 🚨
**Function**: `emergencyWithdraw(roomId)`
**When**: User needs to exit during active game
**User Action**: Withdraw with 10% penalty
**Gas Cost**: ~70,000 gas

**Flow**:
```
User calls emergencyWithdraw(roomId)
  ↓
Contract deducts 10% penalty
  ↓
User receives 90% of their balance
  ↓
10% penalty added to pot
  ↓
User removed from game
```

**Frontend Code**:
```javascript
const tx = await gameContract.emergencyWithdraw(roomId);
await tx.wait();
```

**Emits Event**: `EmergencyWithdraw(roomId, player, amount)`

---

## 🎮 Complete Game Flow

### **Phase 1: Setup (On-Chain)**

1. **User connects wallet** (MetaMask)
2. **User buys TPT tokens** → `buyTokens()` 💰
3. **User approves Game contract** → `approve()` ✅
4. **User creates room** → `createRoom()` 🎮
   - OR **User joins room** → `joinRoom()` 🚪
5. **Wait for players**
6. **Start game** → `startGame()` ▶️

### **Phase 2: Gameplay (Off-Chain)**

7. **Cards dealt** (WebSocket server)
8. **Players bet/fold** (WebSocket server)
9. **Turn management** (WebSocket server)
10. **Winner determined** (WebSocket server)

### **Phase 3: Payout (On-Chain)**

11. **Declare winner** → `declareWinner()` 🏆
12. **Winner receives tokens** (automatic)
13. **Play again or cash out** → `sellTokens()` 💸

---

## 📊 Gas Cost Summary

| Action | Gas Used | Cost (Base Sepolia) | Cost (USD) |
|--------|----------|---------------------|------------|
| Buy Tokens | ~45,000 | ~0.00005 ETH | ~$0.10 |
| Approve Tokens | ~46,000 | ~0.00005 ETH | ~$0.10 |
| Create Room | ~150,000 | ~0.00015 ETH | ~$0.30 |
| Join Room | ~80,000 | ~0.00008 ETH | ~$0.16 |
| Start Game | ~50,000 | ~0.00005 ETH | ~$0.10 |
| Declare Winner | ~100,000 | ~0.0001 ETH | ~$0.20 |
| Leave Room | ~60,000 | ~0.00006 ETH | ~$0.12 |
| Sell Tokens | ~50,000 | ~0.00005 ETH | ~$0.10 |

**Total per game**: ~$0.96 (very affordable!)

---

## 🔍 Read-Only Functions (No Gas)

These functions don't require transactions and are free:

### Token Contract
- `balanceOf(address)` - Check TPT balance
- `allowance(owner, spender)` - Check approval amount
- `totalSupply()` - Total TPT in circulation
- `calculateTokensForWei(weiAmount)` - Preview buy amount
- `calculateWeiForTokens(tokenAmount)` - Preview sell amount
- `getTokenPrice()` - Get current token price

### Game Contract
- `getRoomDetails(roomId)` - Get room info
- `getRoomPlayers(roomId)` - Get player list
- `getPlayerBalance(roomId, player)` - Get player's balance in room
- `getPlayerRooms(player)` - Get all rooms for player
- `getActiveRooms()` - Get all active room IDs

---

## 🛠️ Implementation in Frontend

### Where Contract Calls Happen

1. **BuyTokensModal.jsx**
   - `buyTokens()` - Purchase TPT tokens

2. **Home.jsx** (or CreateRoomModal)
   - `approve()` - Approve tokens (if needed)
   - `createRoom()` - Create new game room

3. **GameRoom.jsx**
   - `approve()` - Approve tokens (if needed)
   - `joinRoom()` - Join existing room
   - `leaveRoom()` - Leave before game starts
   - `startGame()` - Start the game
   - `declareWinner()` - Declare winner after game

4. **useContracts.js Hook**
   - All contract interaction logic
   - Error handling
   - Transaction waiting
   - Event parsing

---

## 🔒 Security Notes

### User Must Sign All Transactions
- Every contract action requires MetaMask signature
- User sees exact amount being spent
- User can reject any transaction
- Backend CANNOT sign transactions for users

### Approval Pattern
- User approves Game contract once
- Game contract can then transfer tokens
- Standard ERC20 pattern
- User can revoke approval anytime

### Non-Custodial
- Users always control their tokens
- Contract holds tokens only during active games
- Winners receive tokens immediately
- No withdrawal delays

---

## 📱 User Experience Flow

### First Time User (Current Implementation - Fully Off-Chain)
1. Connect wallet → No gas
2. Buy tokens → **Gas required** 💰
3. Create/join room → **No gas** 🎮 (Socket.IO - off-chain)
4. Play game → **No gas** (off-chain)
5. Winner declared → **No gas** (off-chain, manual token transfer)

### Returning User (Current Implementation)
1. Connect wallet → No gas
2. Create/join room → **No gas** 🎮 (Socket.IO)
3. Play game → **No gas** (off-chain)
4. Winner declared → **No gas** (off-chain)

---

## 🔄 Hybrid Implementation (If Using Smart Contracts)

### First Time User (With On-Chain Rooms)
1. Connect wallet → No gas
2. Buy tokens → **Gas required** 💰
3. Approve game contract → **Gas required** ✅
4. Create/join room → **Gas required** 🎮
5. Play game → No gas (off-chain)
6. Winner declared → **Gas required** 🏆

### Returning User (Already Approved)
1. Connect wallet → No gas
2. Create/join room → **Gas required** 🎮
3. Play game → No gas (off-chain)
4. Winner declared → **Gas required** 🏆

---

## 🎯 Key Takeaways

1. **Only 2-3 transactions per game** (create/join + declare winner)
2. **Gameplay is free** (no gas during betting/folding)
3. **User always in control** (signs every transaction)
4. **Very affordable** (~$1 per game on Base)
5. **Fast confirmations** (~2 seconds on Base)

---

## 🔗 Contract Addresses (Base Sepolia)

- **TeenPattiToken**: `0x0755C24388721293cC01e6fBAa94562dd3Ced12B`
- **TeenPattiGame**: `0x18298659a16721889dC287746C66c359AD74C198`

View on [Basescan](https://sepolia.basescan.org/)
