/**
 * Room ID Utilities
 * Convert between full blockchain roomId (bytes32) and short human-readable format
 */

/**
 * Convert full bytes32 roomId to short display format
 * Example: 0x0090b8d800000000... -> 0090B8
 * @param {string} fullRoomId - Full bytes32 hex string
 * @returns {string} - Short 6-character uppercase hex code
 */
export function encodeRoomId(fullRoomId) {
  if (!fullRoomId) return "";

  // Remove 0x prefix if present
  const hex = fullRoomId.startsWith("0x") ? fullRoomId.slice(2) : fullRoomId;

  // Take first 6 characters (3 bytes) and uppercase
  const shortId = hex.slice(0, 6).toUpperCase();

  return shortId;
}

/**
 * Convert short display format back to full bytes32 roomId
 * Example: 0090B8 -> 0x0090b8d800000000...
 * Note: This requires looking up the full ID from storage
 * @param {string} shortRoomId - Short 6-character code
 * @param {string} fullRoomId - Full bytes32 to verify against
 * @returns {boolean} - Whether short ID matches full ID
 */
export function verifyRoomId(shortRoomId, fullRoomId) {
  if (!shortRoomId || !fullRoomId) return false;

  const encoded = encodeRoomId(fullRoomId);
  return encoded.toLowerCase() === shortRoomId.toLowerCase();
}

/**
 * Find full roomId from short code in a list of rooms
 * @param {string} shortRoomId - Short 6-character code
 * @param {Array} roomList - Array of room objects with fullRoomId property
 * @returns {string|null} - Full roomId or null if not found
 */
export function findFullRoomId(shortRoomId, roomList) {
  if (!shortRoomId || !roomList) return null;

  const normalized = shortRoomId.toUpperCase();

  for (const room of roomList) {
    const roomId = room.roomId || room.fullRoomId || room.id;
    if (roomId && encodeRoomId(roomId) === normalized) {
      return roomId;
    }
  }

  return null;
}

/**
 * Format room ID for display with prefix
 * Example: 0090B8 -> Room #0090B8
 * @param {string} roomId - Either short or full roomId
 * @returns {string} - Formatted display string
 */
export function formatRoomIdDisplay(roomId) {
  if (!roomId) return "Unknown Room";

  const shortId =
    roomId.length > 10 ? encodeRoomId(roomId) : roomId.toUpperCase();
  return `Room #${shortId}`;
}

/**
 * Validate short room ID format
 * @param {string} shortRoomId - Short room code to validate
 * @returns {boolean} - Whether format is valid
 */
export function isValidShortRoomId(shortRoomId) {
  if (!shortRoomId) return false;

  // Must be exactly 6 hex characters
  return /^[0-9A-Fa-f]{6}$/.test(shortRoomId);
}

/**
 * Generate room URL with short ID
 * @param {string} roomId - Full or short room ID
 * @param {string} baseUrl - Base URL for the app
 * @returns {string} - Shareable room URL
 */
export function generateRoomUrl(roomId, baseUrl = window.location.origin) {
  const shortId = roomId.length > 10 ? encodeRoomId(roomId) : roomId;
  return `${baseUrl}/room/${shortId}`;
}

/**
 * Copy room code to clipboard
 * @param {string} roomId - Full or short room ID
 * @returns {Promise<boolean>} - Whether copy was successful
 */
export async function copyRoomCode(roomId) {
  try {
    const shortId = roomId.length > 10 ? encodeRoomId(roomId) : roomId;
    await navigator.clipboard.writeText(shortId);
    return true;
  } catch (error) {
    console.error("Failed to copy room code:", error);
    return false;
  }
}
