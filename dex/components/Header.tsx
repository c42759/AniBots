'use client';

import React, { useState } from 'react';
import { toggleSound, isSoundEnabled } from '../utils/audio';

interface HeaderProps {
  botCount: number;
  chipCount: number;
}

export const Header: React.FC<HeaderProps> = ({ botCount, chipCount }) => {
  const [audioActive, setAudioActive] = useState<boolean>(isSoundEnabled());

  const handleSoundToggle = () => {
    const nextState = toggleSound();
    setAudioActive(nextState);
  };

  return (
    <header className="w-full border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20 border border-cyan-300/40">
            <span className="text-white font-black text-xl tracking-tighter">AN</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                ANIDEX
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase tracking-widest">
                v2.0 HUD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              ANIBOTS &amp; ANIMA CHIPS TACTICAL DATABASE
            </p>
          </div>
        </div>

        {/* Database Status Metrics & Sound Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-400">FRAMES:</span>
              <span className="text-amber-400 font-bold">{botCount}</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-700"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-slate-400">CORES:</span>
              <span className="text-cyan-400 font-bold">{chipCount}</span>
            </div>
          </div>

          <button
            onClick={handleSoundToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
              audioActive
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60'
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle Audio Feedback"
          >
            <span>{audioActive ? '🔊 FX ON' : '🔇 FX OFF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
