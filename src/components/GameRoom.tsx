'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import DrawingCanvas from './DrawingCanvas';
import Chat from './Chat';
import PlayerList from './PlayerList';
import WordSelection from './WordSelection';
import GameTimer from './GameTimer';
import Scoreboard from './Scoreboard';
import { LogOut, Copy, Crown, Play } from 'lucide-react';

export default function GameRoom() {
  const { room, player, leaveRoom, startGame } = useGame();
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCloseScoreboard = () => {
    setShowScoreboard(false);
    // Auto-leave room when game is finished and modal is manually closed
    if (room?.gameState === 'game_end') {
      leaveRoom();
    }
  };

  // Show scoreboard temporarily when round ends
  useEffect(() => {
    if (room?.gameState === 'round_end' || room?.gameState === 'game_end') {
      setShowScoreboard(true);
      const timer = setTimeout(() => {
        handleCloseScoreboard();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [room?.gameState, handleCloseScoreboard]);

  const copyRoomCode = async () => {
    if (room?.id) {
      try {
        await navigator.clipboard.writeText(room.id);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy room code');
      }
    }
  };

  const isHost = player?.isHost;
  const canStartGame = isHost && room?.gameState === 'waiting' && (room?.players.length || 0) >= 2;

  if (!room || !player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="gradient-bg border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gradient">{room.name}</h1>
              <div className="flex items-center gap-3 modern-card px-4 py-2">
                <span className="text-sm font-medium text-gray-600">Room Code:</span>
                <code className="bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 rounded-lg text-sm font-mono font-semibold text-indigo-700 border border-indigo-200">
                  {room.id}
                </code>
                <button
                  onClick={copyRoomCode}
                  className="p-2 hover:bg-indigo-50 rounded-lg transition-all duration-200 text-indigo-600"
                  title="Copy room code"
                >
                  <Copy size={16} />
                </button>
                {copySuccess && (
                  <span className="text-emerald-600 text-sm font-medium animate-pulse">✓ Copied!</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Round Info */}
              {room.gameState !== 'waiting' && (
                <div className="modern-card px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                  <span className="text-sm font-semibold text-purple-700">
                    Round {room.currentRound}/{room.maxRounds}
                  </span>
                </div>
              )}

              {/* Start Game Button */}
              {canStartGame && (
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Play size={18} />
                  Start Game
                </button>
              )}

              {/* Scoreboard Toggle */}
              <button
                onClick={() => setShowScoreboard(!showScoreboard)}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                📊 Scores
              </button>

              {/* Leave Room */}
              <button
                onClick={leaveRoom}
                className="px-4 py-3 bg-gradient-to-r from-red-400 to-pink-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <LogOut size={16} />
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Game State Indicators */}
        {room.gameState === 'waiting' && (
          <div className="modern-card p-6 mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-amber-800 mb-3">
                Waiting for players...
              </h2>
              <p className="text-amber-700 text-lg mb-4">
                {room.players.length < 2 
                  ? `Need at least 2 players to start (${room.players.length}/2)`
                  : isHost 
                    ? 'All players ready! Click "Start Game" when ready!'
                    : 'Waiting for host to start the game'
                }
              </p>
              {isHost && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-200 to-yellow-200 px-4 py-2 rounded-full text-sm font-semibold text-amber-800">
                  <Crown size={16} />
                  You are the host
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Timer */}
        {(room.gameState === 'drawing' || room.gameState === 'word_selection') && (
          <div className="mb-6">
            <GameTimer />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Panel - Player List */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <PlayerList />
          </div>

          {/* Center Panel - Drawing Canvas */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            {room.gameState === 'word_selection' && 
             player.id === room.currentDrawerId && (
              <div className="mb-6">
                <WordSelection />
              </div>
            )}
            
            <DrawingCanvas 
              width={800} 
              height={600} 
            />
          </div>

          {/* Right Panel - Chat */}
          <div className="xl:col-span-1 order-3 xl:order-3 min-h-[600px]">
            <Chat />
          </div>
        </div>
      </div>

      {/* Scoreboard Modal */}
      {showScoreboard && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseScoreboard}
        >
          <div 
            className="modern-card max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <h2 className="text-xl font-bold">
                {room.gameState === 'game_end' ? '🏆 Final Scores' : '📊 Scoreboard'}
              </h2>
              <button
                onClick={handleCloseScoreboard}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <Scoreboard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
