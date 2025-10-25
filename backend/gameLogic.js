// Teen Patti Game Logic

// Card ranks and suits
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

// Hand rankings (higher is better)
const HAND_RANKINGS = {
  HIGH_CARD: 0,
  PAIR: 1,
  COLOR: 2,
  SEQUENCE: 3,
  PURE_SEQUENCE: 4,
  TRIO: 5
};

export class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }

  getValue() {
    return RANKS.indexOf(this.rank);
  }
}

export class Deck {
  constructor() {
    this.cards = [];
    this.reset();
  }

  reset() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push(new Card(rank, suit));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    return this.cards.pop();
  }
}

export class Player {
  constructor(id, name, socketId, chips = 1000000) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
    this.cards = [];
    this.chips = chips;
    this.currentBet = 0;
    this.totalBet = 0;
    this.isActive = true;
    this.isFolded = false;
    this.isBlind = true;
    this.hasSeenCards = false;
  }

  addCard(card) {
    this.cards.push(card);
  }

  seeCards() {
    this.hasSeenCards = true;
    this.isBlind = false;
  }

  fold() {
    this.isFolded = true;
    this.isActive = false;
  }

  bet(amount) {
    const betAmount = Math.min(amount, this.chips);
    this.chips -= betAmount;
    this.currentBet = betAmount;
    this.totalBet += betAmount;
    return betAmount;
  }

  reset() {
    this.cards = [];
    this.currentBet = 0;
    this.totalBet = 0;
    this.isActive = true;
    this.isFolded = false;
    this.isBlind = true;
    this.hasSeenCards = false;
  }
}

export class Game {
  constructor(roomId, minPlayers = 2, maxPlayers = 6) {
    this.roomId = roomId;
    this.players = [];
    this.deck = new Deck();
    this.pot = 0;
    this.currentBet = 0;
    this.minBet = 10;
    this.currentPlayerIndex = 0;
    this.dealerIndex = 0;
    this.gameStarted = false;
    this.minPlayers = minPlayers;
    this.maxPlayers = maxPlayers;
    this.roundNumber = 0;
  }

  addPlayer(player) {
    if (this.players.length >= this.maxPlayers) {
      return false;
    }
    this.players.push(player);
    return true;
  }

  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
      return true;
    }
    return false;
  }

  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  canStartGame() {
    return this.players.length >= this.minPlayers && !this.gameStarted;
  }

  startGame() {
    if (!this.canStartGame()) {
      return false;
    }

    this.gameStarted = true;
    this.deck.reset();
    this.pot = 0;
    this.currentBet = this.minBet;
    this.roundNumber = 0;

    // Reset all players
    this.players.forEach(player => player.reset());

    // Deal 3 cards to each player
    for (let i = 0; i < 3; i++) {
      this.players.forEach(player => {
        player.addCard(this.deck.deal());
      });
    }

    // Collect ante from all players
    this.players.forEach(player => {
      const ante = player.bet(this.minBet);
      this.pot += ante;
    });

    // Set first player after dealer
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;

    return true;
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getActivePlayers() {
    return this.players.filter(p => p.isActive && !p.isFolded);
  }

  nextPlayer() {
    let count = 0;
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      count++;
      if (count > this.players.length) break;
    } while (this.players[this.currentPlayerIndex].isFolded);

    this.roundNumber++;
  }

  playerAction(playerId, action, amount = 0) {
    const player = this.getPlayer(playerId);
    if (!player || player.id !== this.getCurrentPlayer().id) {
      return { success: false, error: 'Not your turn' };
    }

    switch (action) {
      case 'fold':
        player.fold();
        this.nextPlayer();
        return { success: true };

      case 'see':
        player.seeCards();
        return { success: true };

      case 'bet':
      case 'chaal':
        const minBetAmount = player.isBlind ? this.currentBet : this.currentBet * 2;
        const maxBetAmount = player.isBlind ? this.currentBet * 2 : this.currentBet * 4;
        
        if (amount < minBetAmount || amount > maxBetAmount) {
          return { success: false, error: `Bet must be between ${minBetAmount} and ${maxBetAmount}` };
        }

        const betAmount = player.bet(amount);
        this.pot += betAmount;
        this.currentBet = Math.max(this.currentBet, amount);
        this.nextPlayer();
        return { success: true };

      case 'pack':
        player.fold();
        this.nextPlayer();
        return { success: true };

      default:
        return { success: false, error: 'Invalid action' };
    }
  }

  checkWinner() {
    const activePlayers = this.getActivePlayers();
    
    if (activePlayers.length === 1) {
      return activePlayers[0];
    }

    if (activePlayers.length === 0) {
      return null;
    }

    return null;
  }

  compareHands(player1, player2) {
    const hand1 = this.evaluateHand(player1.cards);
    const hand2 = this.evaluateHand(player2.cards);

    if (hand1.rank !== hand2.rank) {
      return hand1.rank > hand2.rank ? player1 : player2;
    }

    // Compare high cards
    for (let i = 0; i < hand1.values.length; i++) {
      if (hand1.values[i] !== hand2.values[i]) {
        return hand1.values[i] > hand2.values[i] ? player1 : player2;
      }
    }

    return null; // Tie
  }

  evaluateHand(cards) {
    const sortedCards = [...cards].sort((a, b) => b.getValue() - a.getValue());
    const values = sortedCards.map(c => c.getValue());
    const suits = sortedCards.map(c => c.suit);

    // Check for Trio (Three of a kind)
    if (values[0] === values[1] && values[1] === values[2]) {
      return { rank: HAND_RANKINGS.TRIO, values };
    }

    // Check for sequence
    const isSequence = this.isSequence(values);
    const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

    // Pure Sequence (Straight Flush)
    if (isSequence && isFlush) {
      return { rank: HAND_RANKINGS.PURE_SEQUENCE, values };
    }

    // Sequence (Straight)
    if (isSequence) {
      return { rank: HAND_RANKINGS.SEQUENCE, values };
    }

    // Color (Flush)
    if (isFlush) {
      return { rank: HAND_RANKINGS.COLOR, values };
    }

    // Pair
    if (values[0] === values[1] || values[1] === values[2] || values[0] === values[2]) {
      return { rank: HAND_RANKINGS.PAIR, values };
    }

    // High Card
    return { rank: HAND_RANKINGS.HIGH_CARD, values };
  }

  isSequence(values) {
    // Check for A-2-3
    if (values[0] === 12 && values[1] === 1 && values[2] === 0) {
      return true;
    }

    // Check for regular sequence
    return values[0] === values[1] + 1 && values[1] === values[2] + 1;
  }

  endGame(winner) {
    if (winner) {
      winner.chips += this.pot;
    }

    this.gameStarted = false;
    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
    
    return {
      winner: winner ? winner.id : null,
      pot: this.pot,
      playerChips: this.players.map(p => ({ id: p.id, chips: p.chips }))
    };
  }

  getGameState() {
    return {
      roomId: this.roomId,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        currentBet: p.currentBet,
        totalBet: p.totalBet,
        isFolded: p.isFolded,
        isBlind: p.isBlind,
        hasSeenCards: p.hasSeenCards,
        cardCount: p.cards.length
      })),
      pot: this.pot,
      currentBet: this.currentBet,
      currentPlayerIndex: this.currentPlayerIndex,
      gameStarted: this.gameStarted,
      roundNumber: this.roundNumber
    };
  }

  getPlayerCards(playerId) {
    const player = this.getPlayer(playerId);
    return player ? player.cards : [];
  }
}
