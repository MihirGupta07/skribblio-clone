'use client';

import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Crown, Palette, UserX } from 'lucide-react';

export default function PlayerList() {
  const { room, player, kickPlayer } = useGame();

  if (!room) return null;

  const isHost = player?.isHost;

  const handleKickPlayer = (playerId: string) => {
    if (window.confirm('Are you sure you want to kick this player?')) {
      kickPlayer(playerId);
    }
  };

  return (
    <div className="modern-card h-full overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          👥 Players ({room.players.length}/{room.maxPlayers})
        </h3>
      </div>
      
      <div className="p-4 space-y-4 bg-gradient-to-b from-blue-50/30 to-white">
        {room.players.map((roomPlayer) => (
          <div
            key={roomPlayer.id}
            className={`modern-card p-4 transition-all duration-200 ${
              roomPlayer.id === player?.id 
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md' 
                : 'bg-white border-gray-200 hover:border-indigo-200'
            } ${
              roomPlayer.isDrawing ? 'ring-2 ring-emerald-400 shadow-lg' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                  roomPlayer.isDrawing 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                    : roomPlayer.isHost 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}>
                  {roomPlayer.username.charAt(0).toUpperCase()}
                </div>
                
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className={`font-bold truncate text-base ${
                      roomPlayer.id === player?.id ? 'text-indigo-700' : 'text-gray-800'
                    }`}>
                      {roomPlayer.username}
                      {roomPlayer.id === player?.id && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">You</span>
                      )}
                    </span>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    {roomPlayer.isHost && (
                      <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                        <Crown size={10} />
                        Host
                      </div>
                    )}
                    {roomPlayer.isDrawing && (
                      <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium animate-pulse">
                        <Palette size={10} />
                        Drawing
                      </div>
                    )}
                    {!roomPlayer.isConnected && (
                      <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        Offline
                      </div>
                    )}
                    {room.gameState === 'drawing' && roomPlayer.hasGuessed && (
                      <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        ✓ Guessed!
                      </div>
                    )}
                  </div>
                  
                  {/* Score */}
                  <div className="text-base font-bold text-gray-700">
                    {roomPlayer.score} pts
                  </div>
                </div>
              </div>

              {/* Kick Button */}
              {isHost && roomPlayer.id !== player?.id && (
                <button
                  onClick={() => handleKickPlayer(roomPlayer.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Kick player"
                >
                  <UserX size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Game Status */}
      {room.gameState === 'drawing' && (
        <div className="px-4 pb-4">
          <div className="modern-card p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-emerald-800">
                {room.players.find(p => p.isDrawing)?.username} is drawing
              </p>
            </div>
            {room.currentWord && player?.id !== room.currentDrawerId && player?.hasGuessed && (
              <div className="bg-white px-4 py-2 rounded-xl border border-emerald-300">
                <p className="font-mono text-lg font-bold text-gray-800 tracking-wider">
                  {room.currentWord}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
