# Tic Tac Toe - JavaScript Web Game

A fun, interactive Tic Tac Toe game built with vanilla JavaScript. Play against a friend on the same device, challenge an AI opponent, or play online multiplayer with Firebase.

## Features

- 🎮 **Three Game Modes**:
  - vs Friend (local, same device)
  - vs AI (Easy, Medium, Hard difficulty)
  - Online Multiplayer (real-time with Firebase)

- 🤖 **Smart AI**:
  - Easy: Random moves with occasional winning plays
  - Medium: Blocks opponent, takes winning moves
  - Hard: Unbeatable AI using Minimax algorithm with alpha-beta pruning

- 🎨 **Beautiful UI**: Colorful, responsive design with smooth animations

- 📱 **Mobile Friendly**: Fully responsive on all devices

## Setup

### Local Play (No Configuration Needed)
Friend and AI modes work out of the box:
```bash
git clone <repo-url>
cd tic-tac-toe-js
# Open index.html in your browser
```

### Online Multiplayer Setup
To enable online multiplayer:

1. **Get Firebase Credentials**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project (or use existing)
   - Click "Web App" to get your config

2. **Create config.js**:
   ```bash
   cp config.example.js config.js
   ```

3. **Add your Firebase credentials to config.js**:
   ```javascript
   window.FIREBASE_CONFIG = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Open index.html** in your browser

⚠️ **Important**: `config.js` is in `.gitignore` and should NEVER be committed to version control.

## Security & Privacy

### ⚠️ Current Limitations (MVP/Learning Project)

This is a learning/hobby project. The online multiplayer currently has these limitations:

1. **No Player Authentication**: Players are identified only by room code
   - Anyone with the room code can join
   - No way to verify player identity
   - Same player could potentially join as both X and O

2. **No Server-Side Move Validation**: All game logic runs client-side
   - Players with knowledge of JavaScript can manipulate game state
   - Possible to make moves out of turn (local verification only)
   - Not suitable for competitive/ranked play

3. **No Encryption**: Moves are sent unencrypted through Firebase
   - Room data is readable by anyone who knows the room code

4. **Weak Room Codes**: 6-character alphanumeric codes
   - ~2 billion possible combinations
   - Theoretically guessable with patience

5. **No Rate Limiting**: Users can spam create rooms or make moves

### ✅ What IS Protected

- **XSS Protection**: Safe text rendering (no `.innerHTML`)
- **HTTPS/TLS**: Firebase enforces encrypted transport
- **Firebase Security**: Only valid Firebase operations allowed
- **No Sensitive Data**: Only board state (X/O) is stored

### 🔐 For Production Use

To make this suitable for competitive/ranked play:

- ✅ Implement Firebase Authentication (Google, GitHub, etc.)
- ✅ Add Firebase Security Rules to restrict access
- ✅ Deploy Cloud Functions for server-side move validation
- ✅ Implement rate limiting and abuse detection
- ✅ Add player history and rating system
- ✅ Monitor and log suspicious activity

## Game Rules

Standard Tic Tac Toe:
- Players take turns marking spaces (X and O)
- First player to get 3 marks in a row (horizontal, vertical, or diagonal) wins
- If all 9 spaces are filled with no winner, game is a draw

## File Structure

```
├── index.html          # Main HTML file
├── game.js            # Core game logic and state management
├── offline.js         # Local (friend & AI) game logic
├── ai.js              # AI algorithms (Easy, Medium, Hard)
├── firebase.js        # Firebase database operations
├── style.css          # Styling and animations
├── config.example.js  # Template for Firebase config (copy to config.js)
├── .gitignore         # Ignore sensitive files
└── README.md          # This file
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: Firebase Realtime Database
- **AI**: Minimax algorithm with alpha-beta pruning

## Contributing

Feel free to fork, improve, and submit pull requests!

## License

MIT License - Feel free to use this project for learning and personal projects.

---

**Made with ❤️ for learning and fun!**

**Security Questions?** See the Security & Privacy section above for details on current limitations and production recommendations.
