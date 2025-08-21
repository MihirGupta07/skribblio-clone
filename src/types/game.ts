export interface Player {
  id: string;
  username: string;
  score: number;
  isDrawing: boolean;
  isHost: boolean;
  isConnected: boolean;
  lastActivity: number;
  hasGuessed: boolean;
}

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  currentRound: number;
  maxRounds: number;
  currentDrawerId: string;
  currentWord: string;
  wordOptions: string[];
  gameState: GameState;
  roundStartTime: number;
  roundDuration: number; // in seconds
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: number;
  isGuess: boolean;
  isCorrect?: boolean;
  isSystemMessage?: boolean;
}

export interface DrawingStroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  tool: DrawingTool;
  timestamp: number;
}

export interface GameSettings {
  roundDuration: number;
  maxRounds: number;
  maxPlayers: number;
  customWords: string[];
  drawingTools: DrawingTool[];
}

export enum GameState {
  WAITING = 'waiting',
  WORD_SELECTION = 'word_selection',
  DRAWING = 'drawing',
  ROUND_ENDING = 'round_ending',
  ROUND_END = 'round_end',
  GAME_END = 'game_end'
}

export enum DrawingTool {
  PEN = 'pen',
  ERASER = 'eraser',
  FILL = 'fill'
}

export interface PlayerAction {
  type: 'join' | 'leave' | 'kick' | 'guess' | 'draw' | 'select_word' | 'chat';
  playerId: string;
  data?: any;
}

export interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
}
