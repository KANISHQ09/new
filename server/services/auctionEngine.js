// Server-authoritative Auction Engine
// Manages timers, bid validation, auto-extension, and state broadcasting

export class AuctionEngine {
  constructor(io) {
    this.io = io;
    this.auctions = new Map(); // auctionId → auction state
    this.timers = new Map();   // auctionId → setInterval
  }

  // ── Create / Start Auction ──────────────────────────────────────
  startAuction(auctionData) {
    const auction = {
      ...auctionData,
      status: 'active',
      currentPrice: auctionData.startingPrice,
      bids: [],
      reserveMet: false,
      extended: false,
      totalBids: 0,
      startedAt: new Date(),
      endsAt: new Date(Date.now() + (auctionData.durationSeconds || 300) * 1000),
    };
    this.auctions.set(auction.id, auction);
    this._startTimer(auction.id);
    this._broadcast(auction.id, 'auction_state', this._publicState(auction));
    return auction;
  }

  // ── Place a Bid ─────────────────────────────────────────────────
  placeBid(auctionId, userId, username, amount, options = {}) {
    const auction = this.auctions.get(auctionId);
    if (!auction) return { success: false, reason: 'Auction not found' };
    if (auction.status !== 'active') return { success: false, reason: 'Auction is not active' };

    const minBid = auction.currentPrice + (auction.bidIncrement || 10);
    if (amount < minBid) {
      return { success: false, reason: `Minimum bid is $${minBid}` };
    }

    // Create bid record
    const bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      auctionId,
      userId,
      username,
      amount,
      bidType: options.isProxy ? 'proxy' : 'manual',
      timestamp: new Date(),
    };

    // Update auction state
    const prevLeader = auction.leadingBidder;
    auction.currentPrice = amount;
    auction.leadingBidder = userId;
    auction.leadingBidderName = username;
    auction.totalBids += 1;
    auction.bids.unshift(bid);

    // Check reserve
    if (auction.reservePrice && !auction.reserveMet && amount >= auction.reservePrice) {
      auction.reserveMet = true;
      this._broadcast(auctionId, 'reserve_met', {});
    }

    // Auto-extend: if bid placed in final 30s, add 30s
    const secondsLeft = Math.max(0, (auction.endsAt.getTime() - Date.now()) / 1000);
    if (auction.autoExtend && secondsLeft < 30) {
      auction.endsAt = new Date(auction.endsAt.getTime() + 30000);
      auction.extended = true;
      this._broadcast(auctionId, 'auction_extended', { addedSeconds: 30, newEndTime: auction.endsAt });
    }

    // Broadcast bid placed to all
    this._broadcast(auctionId, 'bid_placed', {
      bid,
      newPrice: amount,
      bidderId: userId,
      bidderName: username,
    });

    // Notify outbid user
    if (prevLeader && prevLeader !== userId) {
      this.io.to(`user_${prevLeader}`).emit('outbid', {
        bid,
        newPrice: amount,
        newBidder: username,
      });
    }

    // Price update summary
    this._broadcast(auctionId, 'price_update', {
      currentPrice: amount,
      bidsCount: auction.totalBids,
    });

    this.auctions.set(auctionId, auction);
    return { success: true, bid };
  }

  // ── Timer Engine ────────────────────────────────────────────────
  _startTimer(auctionId) {
    const interval = setInterval(() => {
      const auction = this.auctions.get(auctionId);
      if (!auction) { clearInterval(interval); return; }

      const secondsLeft = Math.max(0, Math.floor((auction.endsAt.getTime() - Date.now()) / 1000));
      
      // Broadcast timer
      this._broadcast(auctionId, 'timer_update', {
        secondsLeft,
        endsAt: auction.endsAt,
      });

      // Auctioneer auto-phrases
      if (secondsLeft === 30) {
        this._broadcast(auctionId, 'auctioneer_says', {
          message: `Going once... Going twice... ${auction.currentPrice ? `$${auction.currentPrice.toLocaleString()}` : 'Opening bid'} — anyone else?`,
        });
      }
      if (secondsLeft === 10) {
        this._broadcast(auctionId, 'auctioneer_says', {
          message: `FAIR WARNING! ${auction.leadingBidderName || 'Current bidder'} at $${(auction.currentPrice || 0).toLocaleString()} — SOLD in 10 seconds!`,
        });
      }

      // Auction ends
      if (secondsLeft <= 0) {
        clearInterval(interval);
        this.timers.delete(auctionId);
        this._endAuction(auctionId);
      }
    }, 1000);

    this.timers.set(auctionId, interval);
  }

  // ── End Auction ─────────────────────────────────────────────────
  _endAuction(auctionId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) return;

    const reserveMet = !auction.reservePrice || auction.currentPrice >= auction.reservePrice;
    const hasBids = auction.totalBids > 0;

    if (hasBids && reserveMet) {
      auction.status = 'sold';
      const result = {
        winnerId: auction.leadingBidder,
        winnerName: auction.leadingBidderName,
        finalPrice: auction.currentPrice,
        totalBids: auction.totalBids,
        itemName: auction.item?.name,
      };
      auction.result = result;
      this._broadcast(auctionId, 'auction_sold', result);
      this._broadcast(auctionId, 'auctioneer_says', {
        message: `🔨 SOLD! ${auction.leadingBidderName} wins for $${auction.currentPrice.toLocaleString()}! Magnificent!`,
      });
    } else {
      auction.status = 'passed';
      this._broadcast(auctionId, 'auction_passed', {
        reason: hasBids ? 'Reserve not met' : 'No bids received',
      });
    }

    this.auctions.set(auctionId, auction);
  }

  // ── Helpers ─────────────────────────────────────────────────────
  _broadcast(auctionId, event, data) {
    this.io.to(`auction_${auctionId}`).emit(event, data);
  }

  _publicState(auction) {
    return {
      auctionId: auction.id,
      status: auction.status,
      item: auction.item,
      currentPrice: auction.currentPrice,
      startingPrice: auction.startingPrice,
      reservePrice: undefined, // Hidden
      reserveMet: auction.reserveMet,
      bidIncrement: auction.bidIncrement,
      buyItNowPrice: auction.buyItNowPrice,
      secondsLeft: Math.max(0, Math.floor((auction.endsAt.getTime() - Date.now()) / 1000)),
      endsAt: auction.endsAt,
      totalBids: auction.totalBids,
      leadingBidder: auction.leadingBidder,
      leadingBidderName: auction.leadingBidderName,
      bids: auction.bids.slice(0, 50),
      autoExtend: auction.autoExtend,
      auctioneerName: auction.auctioneerName,
    };
  }

  getAuction(id) { return this.auctions.get(id); }
  getAllActive() {
    return [...this.auctions.values()].filter((a) => a.status === 'active');
  }
}
