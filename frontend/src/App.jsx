import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { WalletProvider } from './hooks/useWallet';
import { NetworkSwitcher } from './components/NetworkSwitcher';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';

function App() {
  const { socket, connected } = useSocket();

  return (
    <WalletProvider>
      <NetworkSwitcher />
      <Router>
        <Routes>
          <Route path="/" element={<Home socket={socket} />} />
          <Route path="/room/:roomId" element={<GameRoom socket={socket} />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
