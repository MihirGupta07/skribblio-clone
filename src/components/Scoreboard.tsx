'use client';

import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

export default function Scoreboard() {
  const { room } = useGame();

  if (!room) return null;

  // Sort players by score (descending)
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-600" size={20} />;
      case 2:
        return <Medal className="text-gray-500" size={20} />;
      case 3:
        return <Award className="text-orange-600" size={20} />;
      default:
        return <span className="text-gray-600 font-bold text-lg">{rank}</span>;
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {sortedPlayers.map((player, index) => {
        const rank = index + 1;
        return (
          <div
            key={player.id}
            className={`modern-card p-5 transition-all duration-200 ${getRankColors(rank)} ${
              rank <= 3 ? 'shadow-lg' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                rank === 1 ? 'bg-gradient-to-r from-yellow-300 to-amber-400' :
                rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                rank === 3 ? 'bg-gradient-to-r from-orange-300 to-orange-400' :
                'bg-gradient-to-r from-blue-100 to-indigo-100'
              } ${rank <= 3 ? 'text-white shadow-lg' : 'text-gray-600'}`}>
                {getRankIcon(rank)}
              </div>

              {/* Player Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                player.isHost 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}>
                {player.username.charAt(0).toUpperCase()}
              </div>

              {/* Player Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold text-lg ${
                    rank === 1 ? 'text-yellow-700' :
                    rank === 2 ? 'text-gray-700' :
                    rank === 3 ? 'text-orange-700' :
                    'text-gray-800'
                  }`}>
                    {player.username}
                  </span>
                  {player.isHost && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <Crown size={12} />
                      Host
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {player.score} point{player.score !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  rank === 1 ? 'text-yellow-600' : 
                  rank === 2 ? 'text-gray-600' : 
                  rank === 3 ? 'text-orange-600' : 'text-gray-800'
                }`}>
                  {player.score}
                </div>
                {rank <= 3 && (
                  <div className="text-xs font-medium text-gray-500 mt-1">
                    #{rank} Place
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Game Status */}
      <div className="text-center pt-4 border-t border-gray-200">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
          room.gameState === 'game_end' 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
        }`}>
          {room.gameState === 'game_end' ? '🎉' : '🎮'}
          {room.gameState === 'game_end' 
            ? 'Game Complete!' 
            : `Round ${room.currentRound}/${room.maxRounds}`
          }
        </div>
      </div>
    </div>
  );
}
