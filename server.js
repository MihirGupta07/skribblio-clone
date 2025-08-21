const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const socketPort = process.env.SOCKET_PORT || 3001;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Game state management
const rooms = new Map();
const playerRooms = new Map(); // playerId -> roomId mapping
const roundTimers = new Map(); // roomId -> timeoutId mapping

// Word list for the game
const WORD_LIST = [
  'cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star', 'fish', 'bird',
  'flower', 'book', 'phone', 'computer', 'pizza', 'apple', 'music', 'camera',
  'rainbow', 'mountain', 'ocean', 'butterfly', 'elephant', 'guitar', 'bicycle',
  'cake', 'balloon', 'rocket', 'castle', 'diamond', 'fire', 'cloud', 'heart',
  'smile', 'pencil', 'chair', 'table', 'window', 'door', 'key', 'clock',
  'sandwich', 'ice cream', 'strawberry', 'banana', 'orange', 'grapes', 'watermelon'
];

function getRandomWords(count = 3) {
  const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function createRoom(roomData, hostId) {
  const room = {
    id: roomData.id,
    name: roomData.name,
    isPrivate: roomData.isPrivate || false,
    hostId: hostId,
    players: [],
    maxPlayers: roomData.maxPlayers || 8,
    currentRound: 0,
    maxRounds: roomData.maxRounds || 3,
    currentDrawerId: null,
    currentWord: '',
    wordOptions: [],
    gameState: 'waiting',
    roundStartTime: 0,
    roundDuration: roomData.roundDuration || 80,
    createdAt: Date.now(),
    strokes: [],
    chat: []
  };
  
  rooms.set(room.id, room);
  return room;
}

function addPlayerToRoom(roomId, player) {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  if (room.players.length >= room.maxPlayers) return null;
  
  const newPlayer = {
    ...player,
    score: 0,
    isDrawing: false,
    isHost: room.players.length === 0,
    isConnected: true,
    lastActivity: Date.now(),
    hasGuessed: false
  };
  
  room.players.push(newPlayer);
  playerRooms.set(player.id, roomId);
  
  if (newPlayer.isHost) {
    room.hostId = player.id;
  }
  
  return room;
}

function removePlayerFromRoom(playerId) {
  const roomId = playerRooms.get(playerId);
  if (!roomId) return null;
  
  const room = rooms.get(roomId);
  if (!room) return null;
  
  room.players = room.players.filter(p => p.id !== playerId);
  playerRooms.delete(playerId);
  
  // If host left, assign new host
  if (room.hostId === playerId && room.players.length > 0) {
    room.players[0].isHost = true;
    room.hostId = room.players[0].id;
  }
  
  // If no players left, delete room
  if (room.players.length === 0) {
    clearRoundTimer(roomId);
    rooms.delete(roomId);
    return null;
  }
  
  return room;
}

function clearRoundTimer(roomId) {
  const timerId = roundTimers.get(roomId);
  if (timerId) {
    clearTimeout(timerId);
    roundTimers.delete(roomId);
  }
}

function setRoundTimer(roomId, duration, io) {
  // Clear any existing timer
  clearRoundTimer(roomId);
  
  const timerId = setTimeout(() => {
    const room = rooms.get(roomId);
    if (room && room.gameState === 'drawing') {
      // Mark that we're ending the round to prevent multiple timeouts
      room.gameState = 'round_ending';
      
      // Add system message about time running out
      const timeoutMessage = {
        id: Date.now().toString(),
        playerId: 'system',
        username: 'System',
        message: `Time's up! The word was "${room.currentWord}"`,
        timestamp: Date.now(),
        isGuess: false,
        isSystemMessage: true
      };
      room.chat.push(timeoutMessage);
      io.to(roomId).emit('chat_message', timeoutMessage);
      
      // Start new round after a short delay
      setTimeout(() => {
        const updatedRoom = startNewRound(room);
        io.to(roomId).emit('round_ended', updatedRoom);
      }, 2000);
    }
    roundTimers.delete(roomId);
  }, duration * 1000);
  
  roundTimers.set(roomId, timerId);
}

function startNewRound(room) {
  // Clear any existing timer for this room
  clearRoundTimer(room.id);
  
  if (room.currentRound >= room.maxRounds) {
    room.gameState = 'game_end';
    return room;
  }
  
  room.currentRound++;
  
  // Find next drawer
  const currentDrawerIndex = room.players.findIndex(p => p.id === room.currentDrawerId);
  const nextDrawerIndex = (currentDrawerIndex + 1) % room.players.length;
  
  room.players.forEach(p => {
    p.isDrawing = false;
    p.hasGuessed = false;
  });
  
  room.currentDrawerId = room.players[nextDrawerIndex].id;
  room.players[nextDrawerIndex].isDrawing = true;
  
  room.wordOptions = getRandomWords(3);
  room.currentWord = '';
  room.gameState = 'word_selection';
  room.roundStartTime = Date.now();
  room.strokes = [];
  
  return room;
}

function maskWord(word, revealed = []) {
  return word.split('').map((char, index) => {
    if (char === ' ') return ' ';
    if (revealed.includes(index)) return char;
    return '_';
  }).join(' ');
}

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(handler);
  
  // Create Socket.IO server
  const io = new Server(socketPort, {
    cors: {
      origin: `http://localhost:${port}`,
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', (data) => {
      const room = createRoom(data.room, data.player.id);
      addPlayerToRoom(room.id, data.player);
      
      socket.join(room.id);
      socket.emit('room_created', room);
      io.to(room.id).emit('room_updated', room);
    });

    socket.on('join_room', (data) => {
      const room = addPlayerToRoom(data.roomId, data.player);
      if (!room) {
        socket.emit('join_failed', { message: 'Room not found or full' });
        return;
      }
      
      socket.join(data.roomId);
      socket.emit('room_joined', room);
      io.to(data.roomId).emit('room_updated', room);
      
      // Send chat message
      const joinMessage = {
        id: Date.now().toString(),
        playerId: 'system',
        username: 'System',
        message: `${data.player.username} joined the room`,
        timestamp: Date.now(),
        isGuess: false,
        isSystemMessage: true
      };
      room.chat.push(joinMessage);
      io.to(data.roomId).emit('chat_message', joinMessage);
    });

    socket.on('start_game', (data) => {
      const roomId = playerRooms.get(data.playerId);
      const room = rooms.get(roomId);
      
      if (!room || room.hostId !== data.playerId) return;
      
      if (room.players.length < 2) {
        socket.emit('game_start_failed', { message: 'Need at least 2 players' });
        return;
      }
      
      startNewRound(room);
      io.to(roomId).emit('game_started', room);
    });

    socket.on('select_word', (data) => {
      const roomId = playerRooms.get(data.playerId);
      const room = rooms.get(roomId);
      
      if (!room || room.currentDrawerId !== data.playerId) return;
      
      room.currentWord = data.word;
      room.gameState = 'drawing';
      room.roundStartTime = Date.now();
      
      // Start the round timer
      setRoundTimer(roomId, room.roundDuration, io);
      
      // Send masked word to guessers
      const maskedWord = maskWord(room.currentWord);
      io.to(roomId).emit('word_selected', {
        ...room,
        currentWord: maskedWord // Hide real word from non-drawers
      });
      
      // Send real word only to drawer
      socket.emit('drawer_word', { word: room.currentWord });
    });

    socket.on('drawing_stroke', (data) => {
      const roomId = playerRooms.get(data.playerId);
      const room = rooms.get(roomId);
      
      if (!room || room.currentDrawerId !== data.playerId || room.gameState !== 'drawing') return;
      
      const stroke = {
        ...data.stroke,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      
      room.strokes.push(stroke);
      // Send to ALL players in the room (including the drawer for consistency)
      io.to(roomId).emit('drawing_stroke', stroke);
    });

    socket.on('clear_canvas', (data) => {
      const roomId = playerRooms.get(data.playerId);
      const room = rooms.get(roomId);
      
      if (!room || room.currentDrawerId !== data.playerId || room.gameState !== 'drawing') return;
      
      room.strokes = [];
      io.to(roomId).emit('canvas_cleared');
    });

    socket.on('chat_message', (data) => {
      const roomId = playerRooms.get(data.playerId);
      const room = rooms.get(roomId);
      
      if (!room) return;
      
      const player = room.players.find(p => p.id === data.playerId);
      if (!player) return;
      
      const message = {
        id: Date.now().toString(),
        playerId: data.playerId,
        username: player.username,
        message: data.message,
        timestamp: Date.now(),
        isGuess: false,
        isCorrect: false
      };
      
      // Check if it's a correct guess
      if (room.gameState === 'drawing' && 
          data.playerId !== room.currentDrawerId && 
          !player.hasGuessed &&
          data.message.toLowerCase().trim() === room.currentWord.toLowerCase()) {
        
        message.isGuess = true;
        message.isCorrect = true;
        player.hasGuessed = true;
        
        // Calculate score based on time remaining
        const timeElapsed = (Date.now() - room.roundStartTime) / 1000;
        const timeRemaining = Math.max(0, room.roundDuration - timeElapsed);
        const score = Math.round((timeRemaining / room.roundDuration) * 100);
        player.score += score;
        
        // Also give points to drawer
        const drawer = room.players.find(p => p.id === room.currentDrawerId);
        if (drawer) {
          drawer.score += Math.round(score * 0.5);
        }
        
        // Check if all players have guessed
        const allGuessed = room.players.filter(p => p.id !== room.currentDrawerId)
                                       .every(p => p.hasGuessed);
        
        if (allGuessed) {
          // Clear the round timer since round is ending early
          clearRoundTimer(roomId);
          // Mark that we're ending the round to prevent any race conditions
          room.gameState = 'round_ending';
          setTimeout(() => {
            const updatedRoom = startNewRound(room);
            io.to(roomId).emit('round_ended', updatedRoom);
          }, 2000);
        }
      } else if (room.gameState === 'drawing' && 
                 data.playerId !== room.currentDrawerId &&
                 !player.hasGuessed) {
        message.isGuess = true;
      }
      
      room.chat.push(message);
      io.to(roomId).emit('chat_message', message);
      io.to(roomId).emit('room_updated', room);
    });

    socket.on('kick_player', (data) => {
      const roomId = playerRooms.get(data.hostId);
      const room = rooms.get(roomId);
      
      if (!room || room.hostId !== data.hostId) return;
      
      const kickedPlayerSocket = [...io.sockets.sockets.values()]
        .find(s => playerRooms.get(data.targetPlayerId) === roomId);
      
      if (kickedPlayerSocket) {
        kickedPlayerSocket.leave(roomId);
        kickedPlayerSocket.emit('kicked_from_room');
      }
      
      removePlayerFromRoom(data.targetPlayerId);
      io.to(roomId).emit('room_updated', room);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Handle player disconnect - could implement reconnection logic here
    });



    socket.on('leave_room', (data) => {
      const room = removePlayerFromRoom(data.playerId);
      if (room) {
        socket.leave(room.id);
        
        const leaveMessage = {
          id: Date.now().toString(),
          playerId: 'system',
          username: 'System',
          message: `${data.username} left the room`,
          timestamp: Date.now(),
          isGuess: false,
          isSystemMessage: true
        };
        room.chat.push(leaveMessage);
        io.to(room.id).emit('chat_message', leaveMessage);
        io.to(room.id).emit('room_updated', room);
      }
    });

    // Get public rooms
    socket.on('get_public_rooms', () => {
      const publicRooms = Array.from(rooms.values())
        .filter(room => !room.isPrivate && room.players.length < room.maxPlayers)
        .map(room => ({
          id: room.id,
          name: room.name,
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          gameState: room.gameState
        }));
      
      socket.emit('public_rooms', publicRooms);
    });
  });

  // Start the HTTP server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on port ${socketPort}`);
  });
});
