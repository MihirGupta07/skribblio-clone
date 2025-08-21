'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { Clock } from 'lucide-react';

export default function GameTimer() {
  const { room, player, drawerWord, socket } = useGame();
  const [timeLeft, setTimeLeft] = useState(0);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    if (!room || (room.gameState !== 'drawing' && room.gameState !== 'word_selection' && room.gameState !== 'round_ending')) {
      hasEndedRef.current = false;
      return;
    }
    
    console.log(room.currentWord);
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = (now - room.roundStartTime) / 1000;
      const remaining = Math.max(0, room.roundDuration - elapsed);
      setTimeLeft(Math.ceil(remaining));

      // Check if time is up - let server handle the timeout
      if (remaining <= 0 && !hasEndedRef.current && room.gameState === 'drawing') {
        hasEndedRef.current = true;
        // Don't send round_timeout event - let server handle it
      }
    };

    // Reset the end flag when starting a new round
    hasEndedRef.current = false;

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [room, socket, player]);

  if (!room || (room.gameState !== 'drawing' && room.gameState !== 'word_selection' && room.gameState !== 'round_ending')) {
    return null;
  }

  const percentage = room.roundDuration > 0 ? (timeLeft / room.roundDuration) * 100 : 0;
  const isWarning = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  const getTimerColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (isCritical) return 'text-red-600';
    if (isWarning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDrawer = player?.id === room?.currentDrawerId;

  return (
    <div className="modern-card p-4 text-center">
      <div className="flex items-center justify-center gap-4 mb-3">
        {/* Your Word Display for Drawer */}
        {room.gameState === 'drawing'  && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-medium text-gray-600 mb-1">Your word is:</p>
            <p className="text-lg font-bold text-indigo-700">
              {isDrawer ? drawerWord : room.currentWord}
            </p>
          </div>
        )}

        {/* Timer Display */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isCritical ? 'bg-red-100' : isWarning ? 'bg-amber-100' : 'bg-emerald-100'
          }`}>
            <Clock size={18} className={getTextColor()} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Time Remaining</div>
            <span className={`text-xl font-bold ${getTextColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ease-linear ${getTimerColor()} ${
            isCritical ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-white mix-blend-difference">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Timer Warning */}
      {isWarning && (
        <div className="mt-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium text-sm ${
            isCritical 
              ? 'bg-red-100 text-red-700 animate-pulse' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {isCritical ? '🚨' : '⚠️'}
            {isCritical ? 'Time\'s almost up!' : 'Hurry up!'}
          </div>
        </div>
      )}
    </div>
  );
}
