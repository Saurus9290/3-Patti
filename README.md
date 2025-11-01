# Teen Patti - Indian Poker 

A modern, real-time multiplayer Teen Patti (Indian Poker) game built with React, Node.js, and WebSocket technology.

## Features

- 🎮 **Real-time Multiplayer**: Play with 2-6 players simultaneously
- 🔄 **WebSocket Sync**: Instant game state synchronization across all players
- 🎨 **Modern UI**: Beautiful, responsive design with TailwindCSS
- 🃏 **Complete Game Logic**: Full Teen Patti rules implementation
- 👥 **Room System**: Create or join game rooms with unique IDs
- 💰 **Chip Management**: Track player chips and betting
- 👁️ **Blind/Seen Play**: Play blind or see your cards
- 🏆 **Winner Detection**: Automatic hand comparison and winner declaration

## Game Rules

### Hand Rankings (High to Low)
1. **Trio/Trail** - Three cards of the same rank (AAA is highest)
2. **Pure Sequence** - Three consecutive cards of the same suit
3. **Sequence** - Three consecutive cards of different suits
4. **Color/Flush** - Three cards of the same suit
5. **Pair** - Two cards of the same rank
6. **High Card** - Highest single card wins

### Gameplay
- Each player is dealt 3 cards face down
- Players can play **blind** (without seeing cards) or **seen** (after viewing)
- Blind players bet half the amount of seen players
- Players take turns betting or folding
- Game continues until only one player remains or players show their cards
- Winner takes the pot

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Socket.io Client** - WebSocket communication
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.io** - WebSocket server
- **UUID** - Unique ID generation

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:3001`

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## How to Play

1. **Start the Application**
   - Make sure both backend and frontend servers are running
   - Open your browser to `http://localhost:5173`

2. **Create or Join a Room**
   - Enter your name
   - Click "Create New Room" to start a new game
   - Or enter a Room ID and click "Join Room" to join an existing game

3. **Wait for Players**
   - Share the Room ID with friends
   - Need at least 2 players to start
   - Maximum 6 players per room

4. **Start the Game**
   - Once ready, click "Start Game"
   - Each player receives 3 cards

5. **Play Your Turn**
   - **See Cards**: View your cards (converts you from blind to seen player)
   - **Chaal/Bet**: Place a bet (amount depends on blind/seen status)
   - **Pack/Fold**: Give up your hand and exit the round

6. **Win the Game**
   - Last player standing wins
   - Or compare hands when only 2 players remain

## Project Structure

```
teen-patti/
├── backend/
│   ├── server.js          # WebSocket server and game orchestration
│   ├── gameLogic.js       # Core game logic, rules, and hand evaluation
│   └── package.json       # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── PlayingCard.jsx
│   │   │   └── PlayerSeat.jsx
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useSocket.js
│   │   ├── lib/           # Utility functions
│   │   │   └── utils.js
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   └── GameRoom.jsx
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
└── README.md
```

## WebSocket Events

### Client to Server
- `createRoom` - Create a new game room
- `joinRoom` - Join an existing room
- `startGame` - Start the game
- `seeCards` - View your cards
- `playerAction` - Perform an action (bet, fold)
- `leaveRoom` - Leave the current room

### Server to Client
- `roomCreated` - Room creation confirmation
- `roomJoined` - Room join confirmation
- `playerJoined` - Another player joined
- `gameStarted` - Game has started
- `yourCards` - Your dealt cards
- `playerSawCards` - A player viewed their cards
- `actionPerformed` - A player performed an action
- `turnChanged` - Turn moved to next player
- `gameEnded` - Game finished with winner
- `playerLeft` - A player left the room
- `error` - Error message

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## Future Enhancements

- [ ] Add sideshow functionality (compare cards with another player)
- [ ] Implement show/reveal cards at the end
- [ ] Add chat functionality
- [ ] Player avatars and customization
- [ ] Game statistics and leaderboards
- [ ] Sound effects and animations
- [ ] Mobile responsive improvements
- [ ] Reconnection handling
- [ ] Spectator mode
- [ ] Multiple game variations (AK47, Muflis, etc.)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or personal use.

## Credits

Built with ❤️ using modern web technologies.

Game rules reference: [Casino Pride - Teen Patti Rules](https://casinoprideofficial.com/teen-patti-rules-winning-strategies-for-2024/)
