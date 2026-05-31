// Socket handler — Room join/leave
export function registerRoomHandlers(io, socket, auctionEngine) {
  // Join room
  socket.on('join_room', ({ auctionId, userId, token }) => {
    if (!auctionId) return;
    const room = `auction_${auctionId}`;
    const userRoom = `user_${socket.userId || userId}`;
    
    socket.join(room);
    socket.join(userRoom);
    socket.currentRoom = room;
    socket.username = socket.username || `Bidder_${(socket.userId || userId || '').slice(-4)}`;

    // Send current state
    const auction = auctionEngine.getAuction(auctionId);
    if (auction) {
      socket.emit('auction_state', auction);
    }

    // Notify room
    const clients = io.sockets.adapter.rooms.get(room);
    const count = clients ? clients.size : 1;
    io.to(room).emit('player_joined', {
      userId: socket.userId || userId,
      username: socket.username,
      count,
    });

    // Send player list
    const players = [];
    if (clients) {
      for (const clientId of clients) {
        const s = io.sockets.sockets.get(clientId);
        if (s) players.push({ userId: s.userId, username: s.username, isConnected: true });
      }
    }
    io.to(room).emit('player_list', players);

    console.log(`👥 ${socket.username} joined auction_${auctionId} (${count} players)`);
  });

  // Leave room
  socket.on('leave_room', ({ auctionId }) => {
    if (!auctionId) return;
    const room = `auction_${auctionId}`;
    socket.leave(room);
    
    const clients = io.sockets.adapter.rooms.get(room);
    const count = clients ? clients.size : 0;
    io.to(room).emit('player_left', {
      userId: socket.userId,
      username: socket.username,
      count,
    });
  });

  // Heartbeat
  socket.on('heartbeat', ({ userId }) => {
    socket.emit('heartbeat_ack', { timestamp: Date.now() });
  });
}
