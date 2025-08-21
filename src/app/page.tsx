/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import RoomList from '../components/RoomList';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';
import GameRoom from '../components/GameRoom';

export default function Home() {
  const { room, joinRoom, createRoom } = useGame();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleCreateRoom = (roomData: any, username: string) => {
    createRoom(roomData, username);
    setShowCreateModal(false);
  };

  const handleJoinRoom = (roomId: string, username?: string) => {
    if (username) {
      joinRoom(roomId, username);
    } else {
      // If no username provided, show join modal
      setJoinRoomId(roomId);
      setShowJoinModal(true);
    }
  };

  const handleJoinRoomWithUsername = (roomId: string, username: string) => {
    joinRoom(roomId, username);
    setShowJoinModal(false);
    setJoinRoomId('');
  };

  // If user is in a room, show the game room
  if (room) {
    return <GameRoom />;
  }

  // Otherwise show the room list
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-bg py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            Skribbl.io Clone
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Draw, guess, and have fun with friends in this multiplayer drawing game! 
            Create a room or join an existing one to start playing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🎨 Create Room
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Join Room
            </button>
          </div>
        </div>
      </div>

      {/* Room List Section */}
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <RoomList
            onCreateRoom={() => setShowCreateModal(true)}
            onJoinRoom={handleJoinRoom}
          />
        </div>
      </div>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinRoomId('');
        }}
        onJoinRoom={handleJoinRoomWithUsername}
        roomId={joinRoomId}
      />
    </div>
  );
}