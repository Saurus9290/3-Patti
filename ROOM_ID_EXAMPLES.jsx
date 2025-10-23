/**
 * ROOM ID SYSTEM USAGE EXAMPLES
 * 
 * This file demonstrates how to use the room ID encoding/decoding system
 * in your components.
 */

// ============================================================================
// EXAMPLE 1: Display Room ID in a Component
// ============================================================================

import RoomIdDisplay, { RoomIdText, RoomIdHeader } from '@/components/RoomIdDisplay';

function MyRoomComponent({ roomId }) {
    return (
        <div>
            {/* Standard display with copy button */}
            <RoomIdDisplay roomId={roomId} showCopy={true} />

            {/* Inline text version */}
            <p>Join room <RoomIdText roomId={roomId} /> to play</p>

            {/* Large header version */}
            <RoomIdHeader roomId={roomId} />
        </div>
    );
}

// ============================================================================
// EXAMPLE 2: Socket Event Handling
// ============================================================================

function handleRoomCreated() {
    socket.on('roomCreated', ({ roomId, shortRoomId, playerId, gameState }) => {
        console.log(`Room created: ${shortRoomId}`);

        // Store full ID for blockchain operations
        setFullRoomId(roomId);

        // Use short ID for display
        setDisplayRoomId(shortRoomId);
    });
}

// ============================================================================
// EXAMPLE 3: Encoding Full Room ID
// ============================================================================

import { encodeRoomId } from '@/utils/roomIdUtils';

function createRoom() {
    // After blockchain transaction
    const blockchainRoomId = '0x0090b8d800000000000000000000000000000000000000000000000000000000';

    // Convert to short code
    const shortCode = encodeRoomId(blockchainRoomId);
    console.log(`Share this code: ${shortCode}`); // "0090B8"

    // Display to user
    alert(`Your room code is: ${shortCode}`);
}

// ============================================================================
// EXAMPLE 4: Copy to Clipboard
// ============================================================================

import { copyRoomCode, formatRoomIdDisplay } from '@/utils/roomIdUtils';

async function handleCopyRoomId(roomId) {
    const success = await copyRoomCode(roomId);

    if (success) {
        toast.success('Room code copied!');
    } else {
        toast.error('Failed to copy');
    }
}

// ============================================================================
// EXAMPLE 5: Share Room URL
// ============================================================================

import { generateRoomUrl, encodeRoomId } from '@/utils/roomIdUtils';

function ShareButton({ roomId }) {
    const handleShare = () => {
        const shortId = encodeRoomId(roomId);
        const url = generateRoomUrl(roomId);

        // Using Web Share API
        if (navigator.share) {
            navigator.share({
                title: 'Join my Teen Patti game',
                text: `Use code: ${shortId}`,
                url: url
            });
        }
    };

    return (
        <button onClick={handleShare}>
            Share Room
        </button>
    );
}

// ============================================================================
// EXAMPLE 6: Validate Room Code Input
// ============================================================================

import { isValidShortRoomId } from '@/utils/roomIdUtils';

function JoinRoomInput() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!isValidShortRoomId(code)) {
            setError('Please enter a valid 6-character room code');
            return;
        }

        // Proceed with joining
        joinRoom(code);
    };

    return (
        <div>
            <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter room code (e.g., 0090B8)"
                maxLength={6}
            />
            {error && <p className="error">{error}</p>}
            <button onClick={handleSubmit}>Join</button>
        </div>
    );
}

// ============================================================================
// EXAMPLE 7: Backend Socket Handler
// ============================================================================

import { encodeRoomId, formatRoomIdDisplay } from './utils/roomIdUtils.js';

// In server.js
socket.on('createRoomWithBlockchain', ({ blockchainRoomId, buyIn, maxPlayers, creator }) => {
    const shortId = encodeRoomId(blockchainRoomId);
    console.log(`Creating ${formatRoomIdDisplay(blockchainRoomId)}`);

    // Create game
    const game = createGame(blockchainRoomId);
    game.shortRoomId = shortId;

    // Notify client
    socket.emit('roomCreated', {
        roomId: blockchainRoomId,
        shortRoomId: shortId,
        gameState: game.getState()
    });
});

// ============================================================================
// EXAMPLE 8: Finding Room by Short Code
// ============================================================================

import { findFullRoomId } from '@/utils/roomIdUtils';

function joinByShortCode(shortCode) {
    // Get list of active rooms from backend/blockchain
    const activeRooms = [
        { roomId: '0x0090b8d800000000...', creator: '0x123...' },
        { roomId: '0x00aabbcc00000000...', creator: '0x456...' },
    ];

    // Find matching full ID
    const fullRoomId = findFullRoomId(shortCode, activeRooms);

    if (fullRoomId) {
        // Join using full ID
        joinRoom(fullRoomId);
    } else {
        alert('Room not found');
    }
}

// ============================================================================
// EXAMPLE 9: Display in Room List
// ============================================================================

function RoomList({ rooms }) {
    return (
        <div>
            {rooms.map(room => (
                <div key={room.roomId} className="room-card">
                    <RoomIdText roomId={room.roomId} />
                    <span>Players: {room.playerCount}/{room.maxPlayers}</span>
                    <span>Buy-in: {room.buyIn} TPT</span>
                    <button onClick={() => joinRoom(room.roomId)}>
                        Join
                    </button>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// EXAMPLE 10: URL Routing with Short Code
// ============================================================================

import { useParams, useNavigate } from 'react-router-dom';
import { encodeRoomId } from '@/utils/roomIdUtils';

function GameRoom() {
    const { roomId } = useParams(); // Could be short or full ID
    const navigate = useNavigate();

    useEffect(() => {
        // If it's a full ID, redirect to short version
        if (roomId.startsWith('0x') && roomId.length > 10) {
            const shortId = encodeRoomId(roomId);
            navigate(`/room/${shortId}`, { replace: true });
        }
    }, [roomId]);

    return (
        <div>
            <RoomIdHeader roomId={fullRoomId} />
            {/* Rest of game UI */}
        </div>
    );
}

// ============================================================================
// COMPLETE COMPONENT EXAMPLE
// ============================================================================

import React, { useState } from 'react';
import RoomIdDisplay from '@/components/RoomIdDisplay';
import { encodeRoomId, copyRoomCode } from '@/utils/roomIdUtils';

function CompleteRoomExample({ socket }) {
    const [roomId, setRoomId] = useState(null);
    const [shortId, setShortId] = useState(null);

    const createRoom = async () => {
        // Create on blockchain
        const result = await blockchainService.createRoom(1000, 4);
        const blockchainRoomId = result.roomId;
        const shortRoomId = encodeRoomId(blockchainRoomId);

        setRoomId(blockchainRoomId);
        setShortId(shortRoomId);

        // Notify backend
        socket.emit('createRoomWithBlockchain', {
            blockchainRoomId,
            buyIn: 1000,
            maxPlayers: 4
        });
    };

    return (
        <div>
            <h1>My Game Room</h1>

            {roomId ? (
                <>
                    <RoomIdDisplay
                        roomId={roomId}
                        showCopy={true}
                        showShare={true}
                    />

                    <p>
                        Share code <strong>{shortId}</strong> with your friends!
                    </p>

                    <button onClick={() => copyRoomCode(roomId)}>
                        Copy Code
                    </button>
                </>
            ) : (
                <button onClick={createRoom}>
                    Create Room
                </button>
            )}
        </div>
    );
}

export default CompleteRoomExample;
