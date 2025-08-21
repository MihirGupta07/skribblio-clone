'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { Users, Lock, Play, Trophy } from 'lucide-react';

interface PublicRoom {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  gameState: string;
}

interface RoomListProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

export default function RoomList({ onCreateRoom, onJoinRoom }: RoomListProps) {
  const { socket } = useGame();
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handlePublicRooms = (rooms: PublicRoom[]) => {
      setPublicRooms(rooms);
      setRefreshing(false);
    };

    socket.on('public_rooms', handlePublicRooms);
    
    // Initial load
    refreshRooms();

    return () => {
      socket.off('public_rooms', handlePublicRooms);
    };
  }, [socket]);

  const refreshRooms = () => {
    if (socket) {
      setRefreshing(true);
      socket.emit('get_public_rooms');
    }
  };

  const handleJoinRoom = (roomId: string) => {
    onJoinRoom(roomId);
  };

  const handleJoinPrivateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim());
      setRoomCode('');
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'waiting': return 'text-blue-600';
      case 'drawing': return 'text-green-600';
      case 'word_selection': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStateText = (state: string) => {
    switch (state) {
      case 'waiting': return 'Waiting';
      case 'drawing': return 'Playing';
      case 'word_selection': return 'Starting';
      case 'game_end': return 'Ended';
      default: return state;
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Join Private Room */}
      <div className="modern-card p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          🔐 Join Private Room
        </h2>
        
        <form onSubmit={handleJoinPrivateRoom} className="flex gap-3">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!roomCode.trim()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <Lock className="w-5 h-5" />
            Join Private
          </button>
        </form>
      </div>

      {/* Public Rooms */}
      <div className="modern-card overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🌐 Public Rooms
          </h2>
          <button
            onClick={refreshRooms}
            disabled={refreshing}
            className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm"
          >
            {refreshing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </div>
            ) : (
              '🔄 Refresh'
            )}
          </button>
        </div>
        
        <div className="p-6">
          {publicRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No public rooms available</h3>
              <p className="text-gray-500 mb-4">Be the first to create a room and start playing!</p>
              <button
                onClick={onCreateRoom}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🎨 Create Room
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {publicRooms.map((room) => (
                <div
                  key={room.id}
                  className="modern-card p-5 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-indigo-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-2">{room.name}</h3>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-full border border-blue-200">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium text-indigo-700">
                            {room.playerCount}/{room.maxPlayers}
                          </span>
                        </span>
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium ${
                          room.gameState === 'waiting' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          room.gameState === 'drawing' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          room.gameState === 'game_end' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {room.gameState === 'game_end' ? <Trophy className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {getStateText(room.gameState)}
                        </span>
                      </div>
                    </div>
                    
                    {room.gameState !== 'game_end' && <button
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={room.playerCount >= room.maxPlayers || room.gameState === 'game_end'}
                      className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none ${
                        room.playerCount >= room.maxPlayers
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                      }`}
                    >
                      {room.playerCount >= room.maxPlayers ? '🚫 Full' : '🚀 Join'}
                    </button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Note: Plus icon component (you may need to import from lucide-react)
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
