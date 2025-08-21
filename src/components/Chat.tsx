'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { Send } from 'lucide-react';

export default function Chat() {
  const { chat, sendChatMessage, room, player } = useGame();
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message);
      setMessage('');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isDrawer = player?.id === room?.currentDrawerId;
  const isDrawing = room?.gameState === 'drawing';

  return (
    <div className="modern-card h-full flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          💬 Chat
        </h3>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-96 bg-gradient-to-b from-blue-50/30 to-white">
        {chat.map((msg) => {
          // Hide correct guesses from other players (unless you're the drawer or sender)
          const shouldHideMessage = msg.isCorrect && 
            msg.playerId !== player?.id && 
            player?.id !== room?.currentDrawerId;

          return (
            <div key={msg.id} className="flex flex-col">
              <div className={`flex items-start gap-3 ${
                msg.isSystemMessage ? 'justify-center' : ''
              }`}>
                {msg.isSystemMessage ? (
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-full text-sm text-gray-600 italic font-medium border border-gray-200">
                    📢 {msg.message}
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className={`p-3 rounded-2xl ${
                      msg.playerId === player?.id 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white ml-4' 
                        : 'bg-white border border-gray-200 mr-4'
                    } shadow-sm`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${
                          msg.playerId === player?.id ? 'text-white' : 'text-gray-700'
                        }`}>
                          {msg.username}
                        </span>
                        <span className={`text-xs ${
                          msg.playerId === player?.id ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {formatTimestamp(msg.timestamp)}
                        </span>
                        {msg.isGuess && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            msg.isCorrect 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {msg.isCorrect ? '✓ Correct!' : '🤔 Guess'}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${
                        msg.isCorrect 
                          ? 'font-bold text-emerald-600' 
                          : msg.playerId === player?.id 
                            ? 'text-white' 
                            : 'text-gray-800'
                      }`}>
                        {shouldHideMessage ? '[Correct guess hidden]' : msg.message}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {isDrawer && isDrawing ? (
          <div className="text-center bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl py-3 px-4">
            <span className="text-amber-700 text-sm font-medium">
              🎨 You can't chat while drawing
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isDrawing ? "💡 Type your guess..." : "💬 Type a message..."}
              className="flex-1 px-2 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              maxLength={100}
              disabled={!room}
            />
            <button
              type="submit"
              disabled={!message.trim() || !room}
              className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <Send size={16} />
            </button>
          </form>
        )}
      </div>

      {/* Game Instructions */}
      {room && (
        <div className="px-4 pb-3">
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              room.gameState === 'waiting' ? 'bg-amber-100 text-amber-700' :
              room.gameState === 'word_selection' ? 'bg-purple-100 text-purple-700' :
              room.gameState === 'drawing' && !isDrawer ? 'bg-emerald-100 text-emerald-700' :
              room.gameState === 'drawing' && isDrawer ? 'bg-blue-100 text-blue-700' :
              room.gameState === 'round_end' ? 'bg-orange-100 text-orange-700' :
              room.gameState === 'game_end' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {room.gameState === 'waiting' && (
                <>⏳ Waiting for game to start...</>
              )}
              {room.gameState === 'word_selection' && (
                <>🎨 Drawer is selecting a word...</>
              )}
              {room.gameState === 'drawing' && !isDrawer && (
                <>🔍 Guess the drawing!</>
              )}
              {room.gameState === 'drawing' && isDrawer && (
                <>✏️ Draw your word!</>
              )}
              {room.gameState === 'round_end' && (
                <>🏁 Round ended!</>
              )}
              {room.gameState === 'game_end' && (
                <>🎉 Game finished!</>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
