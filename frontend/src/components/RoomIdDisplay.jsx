import React, { useState } from 'react';
import { encodeRoomId, formatRoomIdDisplay, copyRoomCode } from '../utils/roomIdUtils';
import { Copy, Check, Share2 } from 'lucide-react';

/**
 * Component to display room ID in a user-friendly format with copy functionality
 */
export default function RoomIdDisplay({ roomId, showCopy = true, showShare = false }) {
    const [copied, setCopied] = useState(false);

    if (!roomId) return null;

    const shortId = roomId.length > 10 ? encodeRoomId(roomId) : roomId.toUpperCase();

    const handleCopy = async () => {
        const success = await copyRoomCode(roomId);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/room/${shortId}`;

        if (navigator.share) {
            navigator.share({
                title: 'Join my Teen Patti game',
                text: `Join room #${shortId}`,
                url: url
            }).catch(err => console.log('Share failed:', err));
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-400">Room Code:</span>
            <span className="text-xl font-bold text-purple-300 tracking-wider font-mono">
                {shortId}
            </span>

            {showCopy && (
                <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
                    title="Copy room code"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-purple-400" />
                    )}
                </button>
            )}

            {showShare && (
                <button
                    onClick={handleShare}
                    className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
                    title="Share room"
                >
                    <Share2 className="w-4 h-4 text-purple-400" />
                </button>
            )}

            {copied && (
                <span className="text-xs text-green-400 animate-fade-in">
                    Copied!
                </span>
            )}
        </div>
    );
}

/**
 * Simple text-only version for inline display
 */
export function RoomIdText({ roomId }) {
    if (!roomId) return null;

    const shortId = roomId.length > 10 ? encodeRoomId(roomId) : roomId.toUpperCase();

    return (
        <span className="font-mono font-bold text-purple-300">
            #{shortId}
        </span>
    );
}

/**
 * Large display version for room header
 */
export function RoomIdHeader({ roomId }) {
    const [copied, setCopied] = useState(false);

    if (!roomId) return null;

    const shortId = roomId.length > 10 ? encodeRoomId(roomId) : roomId.toUpperCase();

    const handleCopy = async () => {
        const success = await copyRoomCode(roomId);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="text-center space-y-2">
            <div className="text-sm text-gray-400 uppercase tracking-wide">
                Room Code
            </div>
            <div
                onClick={handleCopy}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500/50 rounded-xl px-6 py-3 cursor-pointer hover:border-purple-400/70 transition-all group"
            >
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 tracking-wider font-mono">
                    {shortId}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied ? (
                        <Check className="w-6 h-6 text-green-400" />
                    ) : (
                        <Copy className="w-6 h-6 text-purple-400" />
                    )}
                </div>
            </div>
            {copied && (
                <div className="text-sm text-green-400 animate-fade-in">
                    ✓ Copied to clipboard!
                </div>
            )}
        </div>
    );
}
