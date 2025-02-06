# Poker Mobile App - MVP Development Plan

#INSTRUCTIONS
- USE TYPESCRIPT
- USE REACT NATIVE
- USE EXPO


## 1. Project Overview

A mobile poker game built with React Native, allowing users to:
- Sign up and create accounts.
- Track deposits, profits/losses, and games played.
- Play poker with a provably fair card distribution system.
- The house can take a percentage from rakes or set it to zero for specific games.
- Uses dummy money instead of real crypto transactions.

## 2. Tech Stack

- **Frontend**: React Native (Expo/CLI)
- **Backend**: Node.js (Express or Nest.js)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time Communication**: WebSockets (Socket.io)
- **Provably Fair**: SHA-256 hashing for deck shuffling
- **Hosting**: AWS (ECS Fargate for backend, S3 for assets)

## 3. Features & Modules (MVP)

### 3.1 User Authentication
- User registration (email/password, Google login)
- Login & logout
- Forgot password
- Profile management (Username, Avatar)

### 3.2 Dummy Wallet System
- Users start with a default balance (e.g., 10,000 chips).
- Earn chips by winning games.
- Chips cannot be withdrawn or converted into real money.
- Balance updates after every game.

### 3.3 Game System
- **Lobby System**
  - List of active games
  - Create a private or public game
  - Join a game with buy-in
  - Spectator mode (optional)
- **Game Modes**
  - Texas Hold'em (only for MVP)
  - Sit & Go / Cash Games
- **Game Flow**
  - Shuffle deck using provably fair algorithm
  - Assign blinds & dealer
  - Distribute cards
  - Betting rounds (Pre-flop, Flop, Turn, River)
  - Determine winners using hand rankings
  - Rake calculation & distribution (if applicable)
- **Provably Fair System**
  - Deck is shuffled with a pre-hashed SHA-256 seed.
  - Seed revealed at the end of the game for fairness verification.
  - Players can verify fairness independently.

### 3.4 Rake & House System
- Default rake % (adjustable per game).
- Zero rake option for specific games.
- Dummy money transactions (no real payments).

### 3.5 Game History & Analytics
- User's game history (hands played, wins, losses).
- Hand replay system (optional).
- Player stats (Win/Loss ratio, Hands played).

### 3.6 Multiplayer & Social
- Live chat per table.
- Friends list & private tables.

## 5. Game Logic & Implementation

### 5.1 Deck Shuffling Algorithm (Provably Fair)
1. Generate a SHA-256 hashed seed before the game starts.
2. Shuffle the deck using the hashed seed.
3. Reveal the original seed at the end for fairness verification.
4. Players can verify that the deck was not tampered with.

### 5.2 Betting System
- Players can Check, Bet, Raise, Fold.
- Automatic action for disconnected players (Fold/Check).
- Pot size and rake are calculated in real-time.

### 5.3 Hand Evaluation
- Using a poker hand evaluation library (like pokersolver for JavaScript).
- Determine the best hand based on community and hole cards.

## 7. Development Milestones (MVP)

### Sprint 1: User Accounts & Wallets
- User authentication (Signup/Login)
- Dummy money wallet system
- User dashboard for balance tracking

### Sprint 2: Game Core System
- Create/join game functionality
- Deck shuffling & card distribution
- Betting rounds with rake calculations

### Sprint 3: Real-time Multiplayer
- WebSockets for game state updates
- Action synchronization between players
- Handling disconnections & re-entries

### Sprint 4: Fairness & Verification
- Implement provably fair system
- Expose hashed seed verification method
- Display fairness verification for players

### Sprint 5: Game History & Stats
- Store hand history & past games
- Show player stats & rankings

### Sprint 6: UI/UX Improvements
- Responsive & mobile-friendly UI
- Custom table themes & avatars
- Leaderboards & social features