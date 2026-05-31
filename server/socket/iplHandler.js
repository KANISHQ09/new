// Socket handler — IPL Auction room & bid events

export function registerIPLHandlers(io, socket, iplRoomManager) {

  // ── Create Room ────────────────────────────────────────────────
  socket.on('ipl:create_room', ({ teamId, username }) => {
    if (!teamId) return socket.emit('ipl:error', { message: 'Team required' });

    const room = iplRoomManager.createRoom(socket.userId, teamId, username || `Player_${socket.userId.slice(-4)}`);
    socket.join(`ipl_${room.roomCode}`);
    socket.currentIPLRoom = room.roomCode;
    socket.iplTeamId = teamId;

    socket.emit('ipl:room_created', {
      roomCode: room.roomCode,
      state: iplRoomManager.getPublicState(room.roomCode),
    });

    console.log(`🏏 IPL Room created: ${room.roomCode} by ${username} (${teamId})`);
  });

  // ── Join Room ──────────────────────────────────────────────────
  socket.on('ipl:join_room', ({ roomCode, teamId, username }) => {
    if (!roomCode || !teamId) return socket.emit('ipl:error', { message: 'Room code and team required' });

    const result = iplRoomManager.joinRoom(roomCode, socket.userId, teamId, username || `Player_${socket.userId.slice(-4)}`);
    if (!result.success) {
      return socket.emit('ipl:error', { message: result.reason });
    }

    socket.join(`ipl_${roomCode}`);
    socket.currentIPLRoom = roomCode;
    socket.iplTeamId = teamId;

    const state = iplRoomManager.getPublicState(roomCode);

    // Notify the joining user
    socket.emit('ipl:joined_room', { roomCode, state });

    // Notify everyone in the room
    io.to(`ipl_${roomCode}`).emit('ipl:room_state', state);
    io.to(`ipl_${roomCode}`).emit('ipl:team_joined', {
      teamId,
      username,
      teamCount: Object.keys(state.teams).length,
    });

    console.log(`🏏 ${username} (${teamId}) joined room ${roomCode}`);
  });

  // ── Get Room State ─────────────────────────────────────────────
  socket.on('ipl:get_state', ({ roomCode }) => {
    const code = roomCode || socket.currentIPLRoom;
    if (!code) return;
    const state = iplRoomManager.getPublicState(code);
    if (state) socket.emit('ipl:room_state', state);
  });

  // ── Start Auction ──────────────────────────────────────────────
  socket.on('ipl:start_auction', ({ roomCode }) => {
    const code = roomCode || socket.currentIPLRoom;
    const result = iplRoomManager.startAuction(code, socket.userId);
    if (!result.success) {
      return socket.emit('ipl:error', { message: result.reason });
    }

    io.to(`ipl_${code}`).emit('ipl:auction_started', {
      message: 'The IPL Mega Auction has begun! Good luck to all teams!',
    });

    console.log(`🔨 IPL Auction started in room ${code}`);
  });

  // ── Place Bid ──────────────────────────────────────────────────
  socket.on('ipl:place_bid', ({ roomCode, amount }) => {
    const code = roomCode || socket.currentIPLRoom;
    if (!code || amount === undefined) return;

    const result = iplRoomManager.placeBid(code, socket.userId, parseFloat(amount));
    if (!result.success) {
      socket.emit('ipl:bid_rejected', { reason: result.reason });
    }
  });

  // ── Pass on Player ─────────────────────────────────────────────
  socket.on('ipl:pass', ({ roomCode }) => {
    const code = roomCode || socket.currentIPLRoom;
    if (!code) return;
    iplRoomManager.passOnPlayer(code, socket.userId);
  });

  // ── Leave Room ─────────────────────────────────────────────────
  socket.on('ipl:leave_room', ({ roomCode }) => {
    const code = roomCode || socket.currentIPLRoom;
    if (!code) return;
    socket.leave(`ipl_${code}`);
    socket.currentIPLRoom = null;
  });

  // ── Disconnect cleanup ─────────────────────────────────────────
  socket.on('disconnect', () => {
    if (socket.currentIPLRoom) {
      const state = iplRoomManager.getPublicState(socket.currentIPLRoom);
      if (state) {
        io.to(`ipl_${socket.currentIPLRoom}`).emit('ipl:team_disconnected', {
          teamId: socket.iplTeamId,
          roomCode: socket.currentIPLRoom,
        });
      }
    }
  });
}
