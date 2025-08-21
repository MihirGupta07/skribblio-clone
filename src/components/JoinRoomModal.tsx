'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string, username: string) => void;
  roomId?: string;
}

export default function JoinRoomModal({ isOpen, onClose, onJoinRoom, roomId = '' }: JoinRoomModalProps) {
  const [currentRoomId, setCurrentRoomId] = useState(roomId);
  const [username, setUsername] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('skribblio_username') || '' : '';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRoomId.trim() || !username.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onJoinRoom(currentRoomId.trim(), username.trim());
    onClose();
  };

  // Update roomId when prop changes
  React.useEffect(() => {
    setCurrentRoomId(roomId);
  }, [roomId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modern-card max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🚀 Join Room
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              placeholder="Enter your username"
              maxLength={20}
              required
            />
          </div>

          {/* Room ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🔑 Room Code *
            </label>
            <input
              type="text"
              value={currentRoomId}
              onChange={(e) => setCurrentRoomId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 font-mono text-center text-lg tracking-wider"
              placeholder="Enter room code"
              required
            />
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 text-lg">💡</div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Need a room code?
                </p>
                <p className="text-xs text-blue-600">
                  Ask the room host to share their room code with you, or browse public rooms on the main page.
                </p>
              </div>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
