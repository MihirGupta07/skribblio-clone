'use client';

import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';

export default function WordSelection() {
  const { room, player, selectWord } = useGame();
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (room?.gameState !== 'word_selection') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-select first word if time runs out
          if (room.wordOptions && room.wordOptions.length > 0) {
            selectWord(room.wordOptions[0]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.gameState, room?.wordOptions, selectWord]);

  // Reset timer when word selection starts
  useEffect(() => {
    if (room?.gameState === 'word_selection') {
      setTimeLeft(10);
    }
  }, [room?.gameState]);

  if (room?.gameState !== 'word_selection' || player?.id !== room?.currentDrawerId) {
    return null;
  }

  const handleWordSelect = (word: string) => {
    selectWord(word);
  };

  return (
    <div className="modern-card overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center">
        <h2 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
          🎨 Choose a word to draw
        </h2>
        <div className="flex items-center justify-center gap-3">
          <span className="text-purple-100">Time left:</span>
          <div className={`px-4 py-2 rounded-full font-bold text-lg ${
            timeLeft <= 3 
              ? 'bg-red-500 text-white animate-pulse' 
              : timeLeft <= 5
                ? 'bg-amber-500 text-white'
                : 'bg-white text-purple-600'
          }`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {room.wordOptions?.map((word, index) => (
            <button
              key={word}
              onClick={() => handleWordSelect(word)}
              className="modern-card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-200 transform hover:scale-105 group"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-800 mb-2 group-hover:text-indigo-900">
                  {word}
                </div>
                <div className="text-sm font-medium text-indigo-600 bg-white px-3 py-1 rounded-full inline-block">
                  {word.length} letter{word.length !== 1 ? 's' : ''}
                </div>
                <div className="mt-3 text-xs text-indigo-500 opacity-75 group-hover:opacity-100 transition-opacity">
                  Click to select
                </div>
              </div>
            </button>
          ))}
        </div>

        {timeLeft <= 5 && (
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
              timeLeft <= 3 
                ? 'bg-red-100 text-red-700 animate-pulse' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {timeLeft <= 3 ? '🚨' : '⚠️'}
              {timeLeft <= 3 
                ? `Hurry up! Auto-selecting in ${timeLeft}...`
                : `Choose quickly! ${timeLeft} seconds left`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
