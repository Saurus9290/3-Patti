import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useSocket } from './hooks/useSocket';
import { WalletProvider } from './hooks/useWallet';
import { NetworkSwitcher } from './components/NetworkSwitcher';
import { config } from './config/wagmi';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';

const queryClient = new QueryClient();

function App() {
  const { socket, connected } = useSocket();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <NetworkSwitcher />
          <Router>
            <Routes>
              <Route path="/" element={<Home socket={socket} />} />
              <Route path="/room/:roomId" element={<GameRoom socket={socket} />} />
            </Routes>
          </Router>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
