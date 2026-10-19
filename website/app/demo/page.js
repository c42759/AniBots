'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { BotSelectionScene } from '../../components/demo/BotSelectionScene';
import { OpponentSelectionScene } from '../../components/demo/OpponentSelectionScene';
import { BattleArenaScene } from '../../components/demo/BattleArenaScene';
import { OutcomeScene } from '../../components/demo/OutcomeScene';
import { battleAudio } from '../../utils/battleAudio';

export default function DemoPage() {
  const [scene, setScene] = useState('SELECT_PLAYER'); // 'SELECT_PLAYER' | 'SELECT_OPPONENT' | 'BATTLE' | 'OUTCOME'
  const [playerBot, setPlayerBot] = useState(null);
  const [opponentBot, setOpponentBot] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  const [autoBattle, setAutoBattle] = useState(false);
  const [isMuted, setIsMuted] = useState(battleAudio.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
              AniBots 1v1 Battle Demo
            </h1>
          </div>
          <div className="flex items-center gap-2">
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
          {scene === 'SELECT_PLAYER' && (
            <BotSelectionScene
              onSelectBot={(selected) => {
                setPlayerBot(selected);
                setScene('SELECT_OPPONENT');
              }}
            />
          )}

          {scene === 'SELECT_OPPONENT' && (
            <OpponentSelectionScene
              playerBot={playerBot}
              onSelectOpponent={(opponent) => {
                setOpponentBot(opponent);
                setScene('BATTLE');
              }}
              onBack={() => setScene('SELECT_PLAYER')}
            />
          )}

          {scene === 'BATTLE' && (
            <BattleArenaScene
              playerConfig={playerBot}
              opponentConfig={opponentBot}
              terrain={opponentBot?.terrain}
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
              onRebuildBot={() => setScene('SELECT_PLAYER')}
            />
          )}
        </div>

        {/* Game instructions / Controls Note */}
        <div className="w-full max-w-5xl mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-muted border-t border-border pt-3">
          <div>
            <strong className="text-foreground">Speed ATB:</strong> Clock speed dictates wait phase. Fastest bot reaching center line acts first.
          </div>
          <div>
            <strong className="text-foreground">Win Condition:</strong> Destroy the enemy Head (System Failure) to achieve victory.
          </div>
          <div>
            <strong className="text-foreground">Auto Battle:</strong> Toggle the Auto Battle button during combat to let Anima Chip AI pilot moves automatically.
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
