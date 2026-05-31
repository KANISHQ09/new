// Socket handler — Live chat
const REACTION_COOLDOWN = new Map(); // userId → timestamp

export function registerChatHandlers(io, socket) {
  // Send message
  socket.on('send_message', ({ auctionId, message, userId }) => {
    if (!auctionId || !message?.trim()) return;
    if (message.length > 200) return;

    const msg = {
      id: `msg_${Date.now()}`,
      auctionId,
      userId: socket.userId || userId,
      username: socket.username || 'Anonymous',
      message: message.trim(),
      type: 'user',
      timestamp: new Date(),
    };

    io.to(`auction_${auctionId}`).emit('new_message', msg);
  });

  // Send reaction (rate limited)
  socket.on('send_reaction', ({ auctionId, emoji }) => {
    if (!auctionId || !emoji) return;
    
    const now = Date.now();
    const lastReaction = REACTION_COOLDOWN.get(socket.id) || 0;
    if (now - lastReaction < 1500) return; // 1.5s cooldown
    REACTION_COOLDOWN.set(socket.id, now);

    io.to(`auction_${auctionId}`).emit('new_reaction', {
      userId: socket.userId,
      username: socket.username,
      emoji,
      timestamp: new Date(),
    });
  });
}
