'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { ModeSelectionScene } from '../../components/demo/ModeSelectionScene';
import { BotSelectionScene } from '../../components/demo/BotSelectionScene';
import { OpponentSelectionScene } from '../../components/demo/OpponentSelectionScene';
import { BattleArenaScene } from '../../components/demo/BattleArenaScene';
import { OutcomeScene } from '../../components/demo/OutcomeScene';
import { battleAudio } from '../../utils/battleAudio';

export default function DemoPage() {
  const [battleMode, setBattleMode] = useState('1v1'); // '1v1' | '2v2' | '3v3'
  const [scene, setScene] = useState('SELECT_MODE'); // 'SELECT_MODE' | 'SELECT_PLAYER' | 'SELECT_OPPONENT' | 'BATTLE' | 'OUTCOME'
  const [playerTeam, setPlayerTeam] = useState([]);
  const [opponentTeam, setOpponentTeam] = useState([]);
  const [battleResult, setBattleResult] = useState(null);

  const [autoBattle, setAutoBattle] = useState(false);
  const [isMuted, setIsMuted] = useState(battleAudio.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const teamSize = battleMode === '3v3' ? 3 : battleMode === '2v2' ? 2 : 1;
  const gameContainerRef = useRef(null);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleMute = () => {
    const next = battleAudio.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SiteHeader currentSection="demo" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-center">
        {/* Page Subtitle */}
        <div className="w-full max-w-5xl mb-3 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-accent font-bold uppercase tracking-wider text-[11px]">Browser Combat Testbed</span>
            <h1 className="text-lg font-bold tracking-tight text-foreground uppercase">
              AniBots {battleMode} Battle Arena
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                battleAudio.playClick();
                setScene('SELECT_MODE');
              }}
              className="px-3 py-1.5 border border-border bg-surface hover:border-foreground text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              Mode: {battleMode}
            </button>
            <Link
              href="/demo/report/"
              className="px-3 py-1.5 border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <span>📊 Simulation Report</span>
            </Link>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 border border-border bg-surface hover:border-foreground text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{isFullscreen ? 'Exit Full' : '⛶ Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* 16:9 Aspect Ratio Game Container */}
        <div
          ref={gameContainerRef}
          className={`w-full max-w-5xl aspect-video relative border border-border bg-surface overflow-hidden shadow-2xl flex flex-col ${
            isFullscreen ? 'max-w-none max-h-none w-screen h-screen' : ''
          }`}
        >
          {scene === 'SELECT_MODE' && (
            <ModeSelectionScene
              onSelectMode={(mode) => {
                setBattleMode(mode);
                setScene('SELECT_PLAYER');
              }}
            />
          )}

          {scene === 'SELECT_PLAYER' && (
            <BotSelectionScene
              teamSize={teamSize}
              onSelectTeam={(team) => {
                setPlayerTeam(team);
                setScene('SELECT_OPPONENT');
              }}
              onSelectBot={(bot) => {
                setPlayerTeam([bot]);
                setScene('SELECT_OPPONENT');
              }}
              onBack={() => setScene('SELECT_MODE')}
            />
          )}

          {scene === 'SELECT_OPPONENT' && (
            <OpponentSelectionScene
              teamSize={teamSize}
              playerTeam={playerTeam}
              playerBot={playerTeam[0]}
              onSelectOpponents={(opponents) => {
                setOpponentTeam(opponents);
                setScene('BATTLE');
              }}
              onSelectOpponent={(opponent) => {
                setOpponentTeam([opponent]);
                setScene('BATTLE');
              }}
              onBack={() => setScene('SELECT_PLAYER')}
            />
          )}

          {scene === 'BATTLE' && (
            <BattleArenaScene
              playerTeam={playerTeam}
              playerConfig={playerTeam[0]}
              opponentTeam={opponentTeam}
              opponentConfig={opponentTeam[0]}
              terrain={opponentTeam[0]?.terrain}
              teamSize={teamSize}
              autoBattle={autoBattle}
              onToggleAutoBattle={() => setAutoBattle((v) => !v)}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onBattleEnd={(result) => {
                setBattleResult(result);
                setScene('OUTCOME');
              }}
            />
          )}

          {scene === 'OUTCOME' && (
            <OutcomeScene
              playerWon={battleResult?.playerWon}
              playerUnit={battleResult?.playerUnit}
              enemyUnit={battleResult?.enemyUnit}
              onRematch={() => setScene('BATTLE')}
              onNewOpponent={() => setScene('SELECT_OPPONENT')}
              onRebuildBot={() => setScene('SELECT_MODE')}
            />
          )}
        </div>

        {/* Game instructions / Controls Note */}
        <div className="w-full max-w-5xl mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-muted border-t border-border pt-3">
          <div>
            <strong className="text-foreground">Speed ATB:</strong> Clock speed dictates wait phase. Fastest bot reaching center line acts first.
          </div>
          <div>
            <strong className="text-foreground">Leader Win Condition:</strong> Destroy the enemy Leader Head (👑 Unit 1) to achieve instant victory!
          </div>
          <div>
            <strong className="text-foreground">Multi-Lane Relay:</strong> Bots are deployed on stacked parallel tracks. Support bots stay disabled if eliminated.
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
