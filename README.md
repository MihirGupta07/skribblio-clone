# Skribblio Clone

A real-time multiplayer drawing and guessing game built with Next.js, Socket.IO, and Firebase.

## Features

✨ **Core Features**
- Create and join rooms (public & private)
- Real-time drawing with multiple tools and colors
- Live chat with word masking and guess detection
- Word selection from multiple options
- Round-based gameplay with scoring
- Timer system with visual countdown
- Player management with kick/host controls
- AFK detection and reconnection handling
- Responsive design for mobile and tablet

🎮 **Game Mechanics**
- Turn-based drawing system
- Automatic word selection from curated list
- Score calculation based on guess timing
- Round rotation among players
- Game state management (waiting, word selection, drawing, round end)
- Leaderboard and final scores

🔧 **Technical Features**
- Real-time communication with Socket.IO
- Firebase Firestore for persistence
- Guest authentication with localStorage
- Canvas-based drawing with stroke sharing
- Mobile-optimized touch controls
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Real-time**: Socket.IO
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **Drawing**: HTML5 Canvas
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (optional, for persistence)

### Installation

1. **Clone and setup**
   ```bash
   cd skribblio-clone
   npm install
   ```

2. **Configure Firebase (Optional)**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Copy your config and create `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

   This starts both the Next.js app (port 3000) and Socket.IO server (port 3001).

4. **Open your browser**
   - Navigate to http://localhost:3000
   - Create a room or join an existing one
   - Start drawing and guessing!

## How to Play

### Creating a Room
1. Click "Create Room" on the homepage
2. Enter your username and room settings
3. Choose to make it public or private
4. Set max players, rounds, and round duration
5. Share the room code with friends for private rooms

### Joining a Game
1. Find a public room or enter a private room code
2. Enter your username
3. Wait for the host to start the game

### Playing
1. **Drawing Turn**: Choose from 3 word options and draw it
2. **Guessing Turn**: Watch others draw and type your guesses in chat
3. **Scoring**: Faster correct guesses earn more points
4. **Winning**: Player with the most points after all rounds wins!

### Controls
- **Drawing Tools**: Pen, eraser, different colors and brush sizes
- **Chat**: Type guesses or messages (drawer can't chat during their turn)
- **Host Controls**: Start game, kick players
- **Mobile**: Touch-optimized drawing and interface

## Game Settings

- **Players**: 2-12 players per room
- **Rounds**: 1-10 rounds per game
- **Round Time**: 30-180 seconds per round
- **Room Types**: Public (visible to all) or Private (invite only)

## Development

### Project Structure
```
src/
├── app/                # Next.js app router
├── components/         # React components
├── contexts/           # React contexts (game state)
├── lib/               # Utilities (socket, firebase)
└── types/             # TypeScript type definitions
```

### Key Components
- `GameContext`: Global game state management
- `DrawingCanvas`: Real-time collaborative drawing
- `Chat`: Live chat with guess detection
- `PlayerList`: Player management and scoring
- `GameRoom`: Main game interface

### Socket Events
- Room management: `create_room`, `join_room`, `leave_room`
- Game flow: `start_game`, `select_word`, `round_ended`
- Drawing: `drawing_stroke`, `clear_canvas`
- Chat: `chat_message` with guess detection

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
SOCKET_PORT=3001
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000 3001
CMD ["npm", "start"]
```

## Customization

### Adding Words
Edit the `WORD_LIST` array in `server.js` to add custom words:
```javascript
const WORD_LIST = [
  'cat', 'dog', 'house', 'tree',
  // Add your words here
];
```

### Styling
The app uses Tailwind CSS. Customize colors, fonts, and layout in:
- `tailwind.config.js`
- Component className props
- `src/app/globals.css`

### Game Rules
Modify game mechanics in `server.js`:
- Scoring algorithm
- Round duration
- Player limits
- Drawing tools

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by Skribbl.io
- Built with modern web technologies
- Icons by Lucide React
- Fonts by Google Fonts