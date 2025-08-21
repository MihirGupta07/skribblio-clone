'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Room, Player, ChatMessage, DrawingStroke, GameState } from '../types/game';
import SocketManager from '../lib/socket';
import { Socket } from 'socket.io-client';

interface GameContextType {
  room: Room | null;
  player: Player | null;
  chat: ChatMessage[];
  strokes: DrawingStroke[];
  isConnected: boolean;
  socket: Socket | null;
  drawerWord: string | null;
  joinRoom: (roomId: string, username: string) => void;
  createRoom: (roomData: any, username: string) => void;
  leaveRoom: () => void;
  sendChatMessage: (message: string) => void;
  sendDrawingStroke: (stroke: Omit<DrawingStroke, 'id' | 'timestamp'>) => void;
  clearCanvas: () => void;
  startGame: () => void;
  selectWord: (word: string) => void;
  kickPlayer: (playerId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameState {
  room: Room | null;
  player: Player | null;
  chat: ChatMessage[];
  strokes: DrawingStroke[];
  isConnected: boolean;
  socket: Socket | null;
  drawerWord: string | null;
}

type GameAction =
  | { type: 'SET_SOCKET'; payload: Socket }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ROOM'; payload: Room }
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'ADD_DRAWING_STROKE'; payload: DrawingStroke }
  | { type: 'CLEAR_STROKES' }
  | { type: 'SET_DRAWER_WORD'; payload: string }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  room: null,
  player: null,
  chat: [],
  strokes: [],
  isConnected: false,
  socket: null,
  drawerWord: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_ROOM':
      return { ...state, room: action.payload };
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chat: [...state.chat, action.payload] };
    case 'ADD_DRAWING_STROKE':
      return { ...state, strokes: [...state.strokes, action.payload] };
    case 'CLEAR_STROKES':
      return { ...state, strokes: [] };
    case 'SET_DRAWER_WORD':
      return { ...state, drawerWord: action.payload };
    case 'RESET_GAME':
      return { ...initialState, socket: state.socket, isConnected: state.isConnected };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const socketManager = SocketManager.getInstance();
    const socket = socketManager.connect();
    dispatch({ type: 'SET_SOCKET', payload: socket });

    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socket.on('room_created', (room: Room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    });

    socket.on('room_joined', (room: Room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    });

    socket.on('room_updated', (room: Room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    });

    socket.on('chat_message', (message: ChatMessage) => {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
    });

    socket.on('drawing_stroke', (stroke: DrawingStroke) => {
      dispatch({ type: 'ADD_DRAWING_STROKE', payload: stroke });
    });

    socket.on('canvas_cleared', () => {
      dispatch({ type: 'CLEAR_STROKES' });
    });

    socket.on('game_started', (room: Room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
      dispatch({ type: 'CLEAR_STROKES' });
    });

    socket.on('word_selected', (room: Room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    });

    socket.on('drawer_word', (data: { word: string }) => {
      dispatch({ type: 'SET_DRAWER_WORD', payload: data.word });
    });

    socket.on('round_ended', (room: Room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
      dispatch({ type: 'CLEAR_STROKES' });
    });

    socket.on('kicked_from_room', () => {
      dispatch({ type: 'RESET_GAME' });
      alert('You have been kicked from the room');
    });

    socket.on('join_failed', (data: { message: string }) => {
      alert(data.message);
    });

    socket.on('game_start_failed', (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      socketManager.disconnect();
    };
  }, []);

  // Load player from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('skribblio_username');
    if (savedUsername) {
      const player: Player = {
        id: Math.random().toString(36).substr(2, 9),
        username: savedUsername,
        score: 0,
        isDrawing: false,
        isHost: false,
        isConnected: true,
        lastActivity: Date.now(),
        hasGuessed: false,
      };
      dispatch({ type: 'SET_PLAYER', payload: player });
    }
  }, []);

  const joinRoom = (roomId: string, username: string) => {
    if (!state.socket) return;
    
    localStorage.setItem('skribblio_username', username);
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      score: 0,
      isDrawing: false,
      isHost: false,
      isConnected: true,
      lastActivity: Date.now(),
      hasGuessed: false,
    };
    
    dispatch({ type: 'SET_PLAYER', payload: player });
    state.socket.emit('join_room', { roomId, player });
  };

  const createRoom = (roomData: any, username: string) => {
    if (!state.socket) return;
    
    localStorage.setItem('skribblio_username', username);
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      score: 0,
      isDrawing: false,
      isHost: true,
      isConnected: true,
      lastActivity: Date.now(),
      hasGuessed: false,
    };
    
    dispatch({ type: 'SET_PLAYER', payload: player });
    state.socket.emit('create_room', { 
      room: {
        ...roomData,
        id: Math.random().toString(36).substr(2, 9)
      }, 
      player 
    });
  };

  const leaveRoom = () => {
    if (!state.socket || !state.player) return;
    
    state.socket.emit('leave_room', { 
      playerId: state.player.id, 
      username: state.player.username 
    });
    dispatch({ type: 'RESET_GAME' });
  };

  const sendChatMessage = (message: string) => {
    if (!state.socket || !state.player) return;
    
    state.socket.emit('chat_message', {
      playerId: state.player.id,
      message: message.trim()
    });
  };

  const sendDrawingStroke = (stroke: Omit<DrawingStroke, 'id' | 'timestamp'>) => {
    if (!state.socket || !state.player) return;
    

    state.socket.emit('drawing_stroke', {
      playerId: state.player.id,
      stroke
    });
    
    // Don't add locally - let server send it back to ensure all players get the same stroke
  };

  const clearCanvas = () => {
    if (!state.socket || !state.player) return;
    
    state.socket.emit('clear_canvas', { playerId: state.player.id });
    dispatch({ type: 'CLEAR_STROKES' });
  };

  const startGame = () => {
    if (!state.socket || !state.player) return;
    
    state.socket.emit('start_game', { playerId: state.player.id });
  };

  const selectWord = (word: string) => {
    if (!state.socket || !state.player) return;
    
    state.socket.emit('select_word', { 
      playerId: state.player.id, 
      word 
    });
  };

  const kickPlayer = (playerId: string) => {
    if (!state.socket || !state.player) return;
    
    state.socket.emit('kick_player', { 
      hostId: state.player.id, 
      targetPlayerId: playerId 
    });
  };

  return (
    <GameContext.Provider value={{
      room: state.room,
      player: state.player,
      chat: state.chat,
      strokes: state.strokes,
      isConnected: state.isConnected,
      socket: state.socket,
      drawerWord: state.drawerWord,
      joinRoom,
      createRoom,
      leaveRoom,
      sendChatMessage,
      sendDrawingStroke,
      clearCanvas,
      startGame,
      selectWord,
      kickPlayer,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
