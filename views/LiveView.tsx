import React, { useEffect, useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useLiveApi } from '../hooks/use-live-api';

export const LiveView: React.FC = () => {
  const { isConnected, isConnecting, connect, disconnect, volume, error } = useLiveApi();
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isConnecting) {
      const interval = setInterval(() => {
        setDots(prev => prev.length < 3 ? prev + '.' : '');
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [isConnecting]);

  // Visualize volume as a pulsating circle
  const scale = 1 + (volume / 255) * 0.6;
  // Golden/Amber Glow
  const glow = `0 0 ${20 + volume}px ${(volume > 10 ? 'rgba(202, 138, 4, 0.5)' : 'rgba(202, 138, 4, 0.1)')}`;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 relative overflow-hidden">
      
      <div className="z-10 flex flex-col items-center space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-stone-800 tracking-tight serif">靈性之聲</h2>
          <p className="text-stone-500 max-w-md mx-auto text-sm serif italic">
            與靈性對話。帷幕已薄。
          </p>
        </div>

        {/* Visualizer / Status Indicator */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {isConnected ? (
             /* Active Visualizer */
             <div 
               className="w-40 h-40 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-full shadow-2xl transition-transform duration-75"
               style={{ 
                 transform: `scale(${scale})`,
                 boxShadow: glow
               }}
             />
          ) : (
            /* Idle State */
            <div className="w-40 h-40 bg-stone-100 rounded-full flex items-center justify-center border-2 border-stone-200 shadow-inner">
              <MicOff className="w-12 h-12 text-stone-300" />
            </div>
          )}
          
          {/* Decorative Rings */}
          <div className="absolute inset-0 border border-stone-200 rounded-full opacity-20 scale-110" />
          <div className="absolute inset-0 border border-stone-200 rounded-full opacity-10 scale-125" />
        </div>

        {/* Status Text */}
        <div className="h-8">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-full text-xs border border-red-100">
              <AlertCircle size={14} />
              <span className="font-medium">{error}</span>
            </div>
          )}
          {isConnecting && (
            <span className="text-yellow-600 font-medium tracking-widest text-xs">連線中{dots}</span>
          )}
          {isConnected && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-100 animate-pulse">
              <span className="w-2 h-2 bg-green-600 rounded-full" />
              <span className="text-xs font-medium">會話進行中</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <button
          onClick={isConnected ? disconnect : connect}
          disabled={isConnecting}
          className={`
            relative group px-8 py-3 rounded-full font-serif font-bold text-lg transition-all duration-300 shadow-md
            ${isConnected 
              ? 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-300' 
              : 'bg-stone-800 text-stone-50 hover:scale-105 hover:shadow-lg'}
            ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isConnected ? '結束儀式' : '開始諮詢'}
        </button>
      </div>
    </div>
  );
};