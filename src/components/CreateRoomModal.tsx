'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: any, username: string) => void;
}

export default function CreateRoomModal({ isOpen, onClose, onCreateRoom }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('skribblio_username') || '' : '';
  });
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [maxRounds, setMaxRounds] = useState(3);
  const [roundDuration, setRoundDuration] = useState(80);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim() || !username.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const roomData = {
      name: roomName.trim(),
      isPrivate,
      maxPlayers,
      maxRounds,
      roundDuration,
    };

    onCreateRoom(roomData, username.trim());
    
    // Reset form
    setRoomName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modern-card max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🎨 Create Room
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              👤 Your Username *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              placeholder="Enter your username"
              maxLength={20}
              required
            />
          </div>

          {/* Room Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🏠 Room Name *
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              placeholder="Enter room name"
              maxLength={30}
              required
            />
          </div>

          {/* Privacy Setting */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all duration-200"
              />
              <span className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                🔐 Private Room
              </span>
            </label>
            <p className="text-xs text-amber-600 mt-2 ml-8">
              Private rooms won't appear in the public room list
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Max Players */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                👥 Max Players
              </label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all duration-200"
              >
                {[2, 3, 4, 5, 6, 7, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Max Rounds */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                🔄 Rounds
              </label>
              <select
                value={maxRounds}
                onChange={(e) => setMaxRounds(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all duration-200"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Round Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                ⏱️ Duration
              </label>
              <select
                value={roundDuration}
                onChange={(e) => setRoundDuration(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all duration-200"
              >
                {[30, 45, 60, 80, 100, 120, 150, 180].map(num => (
                  <option key={num} value={num}>{num}s</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
