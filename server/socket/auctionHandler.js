// Socket handler — Auction bidding events
export function registerAuctionHandlers(io, socket, auctionEngine) {
  // Place a bid
  socket.on('place_bid', async ({ auctionId, amount, userId }) => {
    if (!auctionId || !amount) return;
    
    const result = auctionEngine.placeBid(
      auctionId,
      socket.userId || userId,
      socket.username || 'Anonymous',
      parseFloat(amount)
    );

    if (!result.success) {
      socket.emit('bid_rejected', { reason: result.reason });
    }
  });

  // Set proxy / auto bid
  socket.on('set_proxy_bid', ({ auctionId, maxAmount, userId }) => {
    const auction = auctionEngine.getAuction(auctionId);
    if (!auction) return socket.emit('bid_rejected', { reason: 'Auction not found' });
    
    const minBid = auction.currentPrice + (auction.bidIncrement || 10);
    if (maxAmount < minBid) return socket.emit('bid_rejected', { reason: `Proxy max must be at least $${minBid}` });

    // Place initial proxy bid at min
    const result = auctionEngine.placeBid(auctionId, socket.userId || userId, socket.username || 'Anonymous', minBid, { isProxy: true });
    if (!result.success) {
      socket.emit('bid_rejected', { reason: result.reason });
    }
  });

  // Get auction state on demand
  socket.on('get_auction_state', ({ auctionId }) => {
    const auction = auctionEngine.getAuction(auctionId);
    if (auction) {
      socket.emit('auction_state', auction);
    }
  });
}
