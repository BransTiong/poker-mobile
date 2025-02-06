# Game Logic Documentation

## 1. Game Creation

### 1.1 User Initiates Game Creation
- The user clicks a "Create Game" component.
- A form is presented where the user selects:
  - Small Blind and Big Blind values.
  - Minimum and Maximum Buy-in amounts.
  - Additional settings might include whether the game is public or private.

### 1.2 Table Initialization
- A new game/table instance is created in the system.
- The host's configuration settings (blinds, buy-in limits) are saved.
- The game state is set to "Waiting" until enough players join.
- A unique game ID is generated.

### 1.3 Provably Fair Setup
- **Server Seed Generation:**
  - Generate a secure random server seed (e.g., using expo-crypto or Node.js crypto on the backend).
  - Compute its hash (using SHA-256) and store/display the hashed server seed for later verification.
- **Client Seed (Optional):**
  - The game creator (or each player) might optionally supply a client seed.
- **Combined Seed:**
  - Optionally combine the server and client seed (e.g., via concatenation) to serve as the random seed for shuffling.
  - Store the (secret) server seed securely and expose only the hash to players for transparency.

## 2. Player Joining & Pre-Game Lobby

### 2.1 Lobby State
- Other players can join the table using the game ID.
- Each joining player performs a buy-in (subject to min/max limits).
- Players' profiles and buy-in amounts (chips) are tracked.

### 2.2 Readiness Check
- When a sufficient number of players have joined (or the host manually starts the game), the game state changes to "Starting".

## 3. Deck Shuffling with Provably Fair Algorithm

### 3.1 Deck Initialization
- Create a standard deck of 52 cards in a defined order.

### 3.2 Shuffling Process
- Use the combined seed (from the server and optional client seed) to seed a pseudo-random number generator (e.g., a seeded version of the Fisher-Yates shuffle).
- Shuffle the deck using this seeded algorithm.
- Log or store the resulting deck order for internal state.
- Note: Only reveal the hashed version of the server seed at this stage. Once the game ends, the server seed is disclosed so players can verify the shuffle.

## 4. Game Start & Card Dealing

### 4.1 Pre-Flop (Hole Cards Distribution)
- Deal 2 cards to each player as their hole cards.
- Remove the dealt cards from the deck.
- Update each player's game state with their private cards.
- Start the first betting round (pre-flop betting).

### 4.2 Betting Round 1 (Pre-Flop)
- Players perform actions: fold, check, call, bet, or raise.
- The pot is built based on the bets.
- Use timers or turn-based logic to ensure smooth play.

## 5. Flop, Turn, and River Rounds

### 5.1 The Flop
- Reveal the top 3 community cards from the deck.
- Update the game state to include these cards on the table.
- Start the second betting round.

### 5.2 Betting Round 2 (Post-Flop)
- Players bet based on the new community cards.
- Continue with standard betting logic.

### 5.3 The Turn
- Reveal the 4th community card.
- Update the community cards state.
- Start the third betting round.

### 5.4 Betting Round 3 (Post-Turn)
- More betting occurs among the players.

### 5.5 The River
- Reveal the 5th and final community card.
- Update the game state with the complete board.
- Start the final betting round.

### 5.6 Betting Round 4 (Final Betting Round)
- Last chance for players to bet or fold before showdown.

## 6. Showdown & Determining the Winner

### 6.1 Reveal Cards
- All remaining players reveal their hole cards.
- Combine hole cards with community cards to form the best possible hand for each player.

### 6.2 Hand Evaluation
- Use a hand evaluation algorithm or library to rank hands.
- Determine the winning player(s) based on standard Texas Hold'em rules.
- If there is a tie, split the pot accordingly.

### 6.3 Pot Distribution & Rake
- Distribute the pot to the winning player(s), deducting any house rake if applicable.
- Update players' chip balances accordingly.
- Save the hand history (including the revealed server seed, so players can later verify the fairness of the shuffle).

## 7. Post-Game & Verification

### 7.1 Reveal Server Seed
- After the hand concludes, reveal the original server seed.
- Allow players to verify the provably fair algorithm by re-hashing the server seed and comparing it to the hash that was shown before the game.

### 7.2 Game End State
- Mark the game as "Finished".
- Save game logs and hand history for future reference.
- Optionally, allow players to review their hand histories and stats.

### 7.3 Cleanup & Reset
- Reset the game state for the table or prepare for the next hand/tournament.
- Optionally, players can decide to leave the table or continue playing additional hands.

## 8. Error Handling & Edge Cases

### 8.1 Disconnected Players
- Implement auto-fold or timer-based actions if a player disconnects during betting rounds.

### 8.2 Insufficient Chips
- Ensure that players cannot bet more than their current chip balance.
- Handle scenarios when players run out of chips (e.g., they are automatically marked as "all-in").

### 8.3 Provably Fair Verification Failures
- If any inconsistencies are found during post-game verification, log detailed error information for debugging and player support.

### 8.4 Race Conditions in Multi-Player Actions
- Use transactions or locks in your backend to ensure that simultaneous actions are handled correctly.

## Summary

This game flow covers the entire life cycle of a hand in your poker app:
- **Game Creation & Configuration:** Player sets blinds, buy-in, and game settings.
- **Player Joining:** Players enter the lobby and buy in.
- **Provably Fair Deck Shuffling:** The deck is shuffled using a seeded algorithm based on a server seed (with the hash published for later verification).
- **Dealing & Betting Rounds:** Cards are dealt, and betting rounds follow the order: pre-flop, flop, turn, and river.
- **Showdown:** Remaining players reveal their cards, hands are evaluated, and the pot is distributed.
- **Post-Game Verification:** The server seed is revealed to allow fairness verification.
- **Error Handling:** Special cases (disconnects, insufficient chips, etc.) are managed.

This flow should serve as a comprehensive guide for developing the poker game logic and ensuring both fairness and a smooth user experience. Let me know if you need further details or adjustments!