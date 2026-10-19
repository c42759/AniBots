'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import anibotsData from '../../data/anibots.json';
import {
  PartSlot,
  SlotNames,
  AttackType,
  CombatPhase,
  parseAttackType,
  createCombatUnitState,
  evaluateUtilityAITargetSlot,
  evaluateAIPartChoice,
  resolveCenterLineClash,
  getBotAvatarUrl,
  TERRAINS,
  getTerrainModifiers,
} from '../../utils/combatEngine';
import { battleAudio } from '../../utils/battleAudio';
import { BattleCanvas } from './BattleCanvas';

export const BattleArenaScene = ({
  playerConfig,
  opponentConfig,
  terrain,
  autoBattle,
  onToggleAutoBattle,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onBattleEnd,
}) => {
  // Initial unit models
  const initialPlayerUnit = useMemo(() => createCombatUnitState(playerConfig.botConfig, playerConfig.chipConfig, true), [playerConfig]);
  const initialEnemyUnit = useMemo(() => createCombatUnitState(opponentConfig.botConfig, opponentConfig.chipConfig, false), [opponentConfig]);
  const activeTerrain = useMemo(() => terrain || opponentConfig?.terrain || TERRAINS[0], [terrain, opponentConfig]);

  // Mutable simulation refs for 60 FPS Canvas rendering without React lag
  const playerUnitRef = useRef(initialPlayerUnit);
  const enemyUnitRef = useRef(initialEnemyUnit);
  const trapsRef = useRef({ playerTrap: null, enemyTrap: null });
  const fxRef = useRef({ shake: 0, particles: [], popups: [] });

  // Discrete React state for HUD ribbons and command menu
  const [playerHud, setPlayerHud] = useState(() => ({
    name: initialPlayerUnit.name,
    chip: initialPlayerUnit.chip,
    parts: initialPlayerUnit.parts,
    integrities: { ...initialPlayerUnit.integrities },
    maxIntegrities: { ...initialPlayerUnit.maxIntegrities },
    overclockGauge: initialPlayerUnit.overclockGauge,
    headCacheRemaining: initialPlayerUnit.headCacheRemaining,
  }));

  const [enemyHud, setEnemyHud] = useState(() => ({
    name: initialEnemyUnit.name,
    chip: initialEnemyUnit.chip,
    integrities: { ...initialEnemyUnit.integrities },
    maxIntegrities: { ...initialEnemyUnit.maxIntegrities },
    overclockGauge: initialEnemyUnit.overclockGauge,
  }));

  const [combatLogs, setCombatLogs] = useState([
    `[RELAY ARENA] 1v1 Sparring Duel initiated: ${playerConfig.botConfig.name} vs ${opponentConfig.botConfig.name}!`,
    `[TERRAIN] Neo Metropolis Street (Paved Asphalt). Ready your AniBots!`,
  ]);

  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [damagedPartFlash, setDamagedPartFlash] = useState(null);

  const logsEndRef = useRef(null);
  const battleOverRef = useRef(false);
  const autoBattleRef = useRef(autoBattle);
  const countdownActiveRef = useRef(true);
  const hitStopRef = useRef(0);
  const damageFlashTimerRef = useRef(null);

  const triggerDamageFlash = useCallback((isDefenderPlayer, slot) => {
    if (damageFlashTimerRef.current) clearTimeout(damageFlashTimerRef.current);
    setDamagedPartFlash({ isPlayer: isDefenderPlayer, slot });
    damageFlashTimerRef.current = setTimeout(() => {
      setDamagedPartFlash(null);
    }, 1400);
  }, []);

  useEffect(() => {
    return () => {
      if (damageFlashTimerRef.current) clearTimeout(damageFlashTimerRef.current);
    };
  }, []);

  // Pre-Battle Countdown Timer
  useEffect(() => {
    battleAudio.playClick();
    const t1 = setTimeout(() => {
      setCountdown(2);
      battleAudio.playClick();
    }, 850);
    const t2 = setTimeout(() => {
      setCountdown(1);
      battleAudio.playClick();
    }, 1700);
    const t3 = setTimeout(() => {
      setCountdown('BATTLE!');
      battleAudio.playLaser();
    }, 2550);
    const t4 = setTimeout(() => {
      setCountdown(null);
      countdownActiveRef.current = false;
    }, 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    autoBattleRef.current = autoBattle;
  }, [autoBattle]);

  const addLog = useCallback((msg) => {
    setCombatLogs((prev) => [...prev.slice(-40), msg]);
  }, []);

  const syncHud = useCallback(() => {
    setPlayerHud({
      name: playerUnitRef.current.name,
      chip: playerUnitRef.current.chip,
      parts: playerUnitRef.current.parts,
      integrities: { ...playerUnitRef.current.integrities },
      maxIntegrities: { ...playerUnitRef.current.maxIntegrities },
      overclockGauge: playerUnitRef.current.overclockGauge,
      headCacheRemaining: playerUnitRef.current.headCacheRemaining,
    });
    setEnemyHud({
      name: enemyUnitRef.current.name,
      chip: enemyUnitRef.current.chip,
      integrities: { ...enemyUnitRef.current.integrities },
      maxIntegrities: { ...enemyUnitRef.current.maxIntegrities },
      overclockGauge: enemyUnitRef.current.overclockGauge,
    });
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLogs]);

  const handleMatchEnd = useCallback((playerWon) => {
    battleOverRef.current = true;
    if (playerWon) battleAudio.playVictory();
    else battleAudio.playDefeat();

    setTimeout(() => {
      onBattleEnd({
        playerWon,
        playerUnit: playerUnitRef.current,
        enemyUnit: enemyUnitRef.current,
      });
    }, 1800);
  }, [onBattleEnd]);

  // Center-Line Clash Resolution
  const handleReachedCenterLine = useCallback((attacker, isPlayer) => {
    const defender = isPlayer ? enemyUnitRef.current : playerUnitRef.current;
    const traps = trapsRef.current;
    const centerX = 360; // relative canvas mid

    // 1. Trap check
    const activeTrap = isPlayer ? traps.playerTrap : traps.enemyTrap;
    if (activeTrap) {
      battleAudio.playTrapExplosion();
      fxRef.current.shake = 1.0;

      // Add shockwave ring particle
      fxRef.current.particles.push({
        x: centerX,
        y: 135,
        vx: 0,
        vy: 0,
        type: 'ring',
        radius: 35,
        color: '#f59e0b',
        life: 1.0,
      });

      const trapDmg = activeTrap.payload || 38;
      attacker.integrities[PartSlot.LEGS] = Math.max(0, (attacker.integrities[PartSlot.LEGS] || 0) - trapDmg);

      if (isPlayer) traps.playerTrap = null;
      else traps.enemyTrap = null;

      addLog(`💥 TRAP TRIGGERED! ${attacker.name} hit by ${activeTrap.name} (-${trapDmg} Legs HP)! Sprint aborted.`);
      fxRef.current.popups.push({
        x: centerX,
        y: 110,
        damage: trapDmg,
        slotName: 'LEGS',
        isCrit: true,
        life: 1.0,
      });

      triggerDamageFlash(isPlayer, PartSlot.LEGS);
      syncHud();
      if (attacker.integrities[PartSlot.HEAD] <= 0) {
        handleMatchEnd(!isPlayer);
      }
      return;
    }

    const part = attacker.selectedActionPart || {};
    const actType = parseAttackType(part.type, attacker.selectedActionSlot);

    // 1.5. NO FEATURE: Part destroyed mid-sprint before reaching center line (Medabots canonical rule)
    if (!attacker.isUlt && (attacker.integrities[attacker.selectedActionSlot] ?? 0) <= 0) {
      const destroyedSlotName = SlotNames[attacker.selectedActionSlot] || 'PART';
      addLog(`⚠️ NO FEATURE! ${attacker.name}'s [${part.name || destroyedSlotName}] was destroyed mid-sprint! Action failed.`);
      battleAudio.playClick();
      fxRef.current.popups.push({
        x: centerX,
        y: 110,
        damage: 'NO FEATURE',
        slotName: destroyedSlotName,
        isCrit: false,
        life: 1.2,
      });
      for (let i = 0; i < 6; i++) {
        fxRef.current.particles.push({
          x: centerX + (Math.random() - 0.5) * 20,
          y: 135 + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2,
          type: 'spark',
          size: 3,
          color: '#71717a',
          life: 0.8,
        });
      }
      syncHud();
      return;
    }

    // 2. Logic Trap Placement
    if (!attacker.isUlt && actType === AttackType.TRAP) {
      if (isPlayer) traps.enemyTrap = part;
      else traps.playerTrap = part;
      addLog(`⚙️ ${attacker.name} deployed [${part.name}] on the Center Line!`);
      battleAudio.playClick();
      return;
    }

    // 3. Support Scanner Buff
    if (!attacker.isUlt && actType === AttackType.SUPPORT && (part.payload || 0) <= 0) {
      attacker.guaranteedCritNext = true;
      addLog(`📡 ${attacker.name} activated [${part.name}]! Next attack is 100% Critical!`);
      battleAudio.playClick();
      syncHud();
      return;
    }

    // 4. Attack Strike Resolution
    const targetSlot = evaluateUtilityAITargetSlot(attacker.chip, defender);

    const result = resolveCenterLineClash({
      attacker,
      defender,
      actionPart: part,
      isUlt: attacker.isUlt,
      targetSlotOverride: targetSlot,
    });

    // Sound FX & animations
    if (result.isCrit || attacker.isUlt) battleAudio.playCrit();
    else if (actType === AttackType.MELEE) battleAudio.playSlash();
    else battleAudio.playHit();

    fxRef.current.shake = result.isCrit ? 0.9 : 0.5;

    // Add Canvas Combat Particles (Central clash plane)
    const targetX = isPlayer ? 390 : 330;
    const targetY = 135;

    if (actType === AttackType.MELEE || attacker.isUlt) {
      fxRef.current.particles.push({
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        type: 'slash',
        radius: 28,
        angle: isPlayer ? -0.8 : 2.2,
        color: result.isCrit ? '#f59e0b' : '#38bdf8',
        life: 1.0,
      });
    }

    // Hit sparks
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      fxRef.current.particles.push({
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: 'spark',
        size: 2.5,
        color: result.isCrit ? '#fbbf24' : '#ef4444',
        life: 1.0,
      });
    }

    // Canvas Floating Damage
    fxRef.current.popups.push({
      x: targetX,
      y: targetY - 20,
      damage: result.damage,
      slotName: result.targetSlotName,
      isCrit: result.isCrit,
      life: 1.0,
    });

    triggerDamageFlash(!isPlayer, result.targetSlot);

    const ocTelemetry = result.isUlt
      ? ' [⚡ OVERCLOCK EXPENDED]'
      : ` [+5% OC to ${result.attackerName}, +${result.defenderOcGain}% OC to ${result.defenderName}]`;

    addLog(
      `⚔️ ${result.attackerName} strikes with ${result.actionName}${result.isCrit && !result.isUlt ? ' [CRITICAL!]' : ''}! Dealt ${result.damage} damage to ${result.defenderName}'s ${result.targetSlotName}!${result.wasDiverted ? ' [AUTONOMOUS HEAD GUARD: Intercepted by limb]' : ''}${ocTelemetry}`
    );

    syncHud();

    if (result.isHeadDestroyed) {
      addLog(`💀 CRITICAL SYSTEM FAILURE! ${result.defenderName}'s Head destroyed!`);
      handleMatchEnd(isPlayer);
    }
  }, [addLog, handleMatchEnd, syncHud, triggerDamageFlash]);

  // Execute Command & Initiate Sprint
  const executeCommand = useCallback((unit, slot, isUlt) => {
    let partData = {};
    if (isUlt) {
      const ult = unit.chip?.ultimate_abilities?.[0] || {};
      const cost = ult.gauge_cost || 50;
      unit.overclockGauge = Math.max(0, unit.overclockGauge - cost);
      syncHud();
      partData = {
        name: ult.name || 'Overclock Blitz',
        payload: ult.power || 75,
        type: 'SHOOTING',
        execution_time: 1.2,
        latency: 2.2,
      };
      addLog(`⚡ ${unit.name} UNLEASHES ULTIMATE: [${partData.name}]! (-${cost}% Overclock)`);
      battleAudio.playLaser();
    } else {
      let raw = {};
      if (slot === PartSlot.HEAD) raw = unit.parts.head;
      else if (slot === PartSlot.LEFT_ARM) raw = unit.parts.leftArm;
      else if (slot === PartSlot.RIGHT_ARM) raw = unit.parts.rightArm;
      else raw = unit.parts.legs;

      partData = { ...raw };
      if (slot === PartSlot.HEAD && unit.headCacheRemaining > 0) {
        unit.headCacheRemaining -= 1;
      }
      addLog(`${unit.name} commits to ${partData.name}! Sprinting to Center Line...`);
      battleAudio.playClick();
    }

    unit.selectedActionSlot = slot;
    unit.selectedActionPart = partData;
    unit.isUlt = isUlt;
    unit.currentPhase = CombatPhase.RUN;
    unit.trackProgress = 0;
  }, [addLog]);

  // Decoupled 60 FPS Physics Simulation Loop (Zero React Rerenders in Motion!)
  useEffect(() => {
    let lastTime = performance.now();
    let animId;

    const physicsLoop = (currentTime) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Pause ATB during pre-battle 3-2-1 countdown
      if (countdownActiveRef.current) {
        animId = requestAnimationFrame(physicsLoop);
        return;
      }

      // Hit-stop impact pause: freeze movement for 1.4s so players see what just happened
      if (hitStopRef.current > 0) {
        hitStopRef.current -= delta;
        animId = requestAnimationFrame(physicsLoop);
        return;
      }

      if (!battleOverRef.current) {
        tickUnit(playerUnitRef.current, delta, true);
        tickUnit(enemyUnitRef.current, delta, false);
      }

      animId = requestAnimationFrame(physicsLoop);
    };

    const tickUnit = (unit, delta, isPlayer) => {
      if (unit.integrities[PartSlot.HEAD] <= 0) return;

      switch (unit.currentPhase) {
        case CombatPhase.WAIT: {
          const legs = unit.parts.legs;
          let clockSpeed = legs?.clock_speed || 1.5;
          const tMod = getTerrainModifiers(legs?.protocol, activeTerrain.id, unit.chip?.id);
          clockSpeed *= tMod.speedMult;
          if (unit.integrities[PartSlot.LEGS] <= 0) clockSpeed *= 0.4;
          if (unit.chip?.id === 'chip_spark') clockSpeed *= 1.25;

          const fillRate = clockSpeed * 28.0;
          unit.actionBar = Math.min(100, unit.actionBar + fillRate * delta);

          if (unit.actionBar >= 100) {
            if (isPlayer) {
              if (autoBattleRef.current) {
                const choice = evaluateAIPartChoice(unit, enemyUnitRef.current, Boolean(trapsRef.current.enemyTrap));
                executeCommand(unit, choice.slot, choice.isUlt);
              } else {
                unit.currentPhase = CombatPhase.COMMAND;
                syncHud();
                setCommandMenuOpen(true);
                battleAudio.playClick();
                addLog(`[ATB CHARGED] ${unit.name} ready for command!`);
              }
            } else {
              const choice = evaluateAIPartChoice(unit, playerUnitRef.current, Boolean(trapsRef.current.playerTrap));
              executeCommand(unit, choice.slot, choice.isUlt);
            }
          }
          break;
        }

        case CombatPhase.COMMAND:
          break;

        case CombatPhase.RUN: {
          const execTime = Math.max(0.8, unit.selectedActionPart?.execution_time || 2.0);
          let runSpeed = 0.8 / execTime;
          const tMod = getTerrainModifiers(unit.parts.legs?.protocol, activeTerrain.id, unit.chip?.id);
          runSpeed *= tMod.speedMult;
          if (unit.integrities[PartSlot.LEGS] <= 0) runSpeed *= 0.4;

          unit.trackProgress = Math.min(1.0, unit.trackProgress + runSpeed * delta);
          if (unit.trackProgress >= 1.0) {
            handleReachedCenterLine(unit, isPlayer);
            unit.trackProgress = 1.0;
            unit.currentPhase = CombatPhase.COOLDOWN;
            hitStopRef.current = 1.4; // 1.4s hit-stop impact freeze
          }
          break;
        }

        case CombatPhase.COOLDOWN: {
          const baseLatency = Math.max(1.5, unit.selectedActionPart?.latency || 3.0);
          const cooling = unit.integrities[PartSlot.TORSO] > 0 ? unit.parts.torso?.cooling || 1.0 : 0.0;
          const effLatency = Math.max(1.5, baseLatency - cooling) * (unit.isOverweight ? 1.5 : 1.0);
          let returnSpeed = 0.55 / effLatency;
          if (unit.integrities[PartSlot.LEGS] <= 0) returnSpeed *= 0.5;

          unit.trackProgress = Math.max(0.0, unit.trackProgress - returnSpeed * delta);
          unit.actionBar = Math.min(100, (1.0 - unit.trackProgress) * 100);

          if (unit.trackProgress <= 0.0) {
            unit.trackProgress = 0.0;
            unit.actionBar = 100.0;
            unit.overrideGuardActive = false;

            if (isPlayer) {
              if (autoBattleRef.current) {
                const choice = evaluateAIPartChoice(unit, enemyUnitRef.current, Boolean(trapsRef.current.enemyTrap));
                executeCommand(unit, choice.slot, choice.isUlt);
              } else {
                unit.currentPhase = CombatPhase.COMMAND;
                syncHud();
                setCommandMenuOpen(true);
                battleAudio.playClick();
                addLog(`[RECHARGED AT BASE] ${unit.name} returned home & ready for command!`);
              }
            } else {
              const choice = evaluateAIPartChoice(unit, playerUnitRef.current, Boolean(trapsRef.current.playerTrap));
              executeCommand(unit, choice.slot, choice.isUlt);
            }
          }
          break;
        }

        default:
          break;
      }
    };

    animId = requestAnimationFrame(physicsLoop);
    return () => cancelAnimationFrame(animId);
  }, [executeCommand, handleReachedCenterLine, addLog, syncHud]);

  // Player manual command handlers
  const handleSelectAction = (slot, isUlt) => {
    setCommandMenuOpen(false);
    executeCommand(playerUnitRef.current, slot, isUlt);
    syncHud();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-5 bg-background font-mono text-xs overflow-hidden select-none">
      {/* Top Match HUD Bar */}
      <div className="flex items-center justify-between border-b border-border pb-2 bg-surface/80 px-3 py-1.5 z-20">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-accent animate-pulse" />
          <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
            1v1 Combat Relay // {activeTerrain.icon} {activeTerrain.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Battle Button */}
          <button
            onClick={onToggleAutoBattle}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
              autoBattle
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-background text-muted border-border hover:text-foreground'
            }`}
          >
            Auto Battle: {autoBattle ? 'ON' : 'OFF'}
          </button>

          {/* Sound Mute Button */}
          <button
            onClick={onToggleMute}
            className="px-2 py-1 text-[10px] uppercase border border-border bg-background text-muted hover:text-foreground cursor-pointer"
          >
            {isMuted ? '🔇 Muted' : '🔊 SFX'}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            className="px-2 py-1 text-[10px] uppercase border border-border bg-background text-muted hover:text-foreground cursor-pointer"
          >
            {isFullscreen ? 'Exit Full' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>

      {/* Main Relay Battlefield View (16:9 Aspect Canvas Arena) */}
      <div className="relative flex-1 flex flex-col justify-between my-2 border border-border bg-black overflow-hidden">
        {/* Pre-Battle Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/50 backdrop-blur-[2px] pointer-events-none select-none">
            <div className="text-center animate-in zoom-in-75 duration-200">
              <span className="text-[11px] uppercase tracking-widest text-muted block mb-1">
                SYSTEM LINK ESTABLISHED // STANDBY
              </span>
              <div
                className={`font-black tracking-wider drop-shadow-[0_0_25px_rgba(255,79,51,0.8)] ${
                  countdown === 'BATTLE!'
                    ? 'text-5xl sm:text-7xl text-accent animate-bounce'
                    : 'text-6xl sm:text-8xl text-foreground'
                }`}
              >
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* Both Units Top Stats Ribbon */}
        <div className="grid grid-cols-2 gap-4 z-10 p-3 pointer-events-none">
          {/* Player Unit Card */}
          <div className="border border-border bg-background/90 p-2 text-[10px]">
            <div className="flex items-center justify-between border-b border-border pb-1 mb-1.5">
              <div className="flex items-center gap-2">
                <img
                  src={getBotAvatarUrl(playerConfig.botConfig, anibotsData)}
                  alt={playerHud.name}
                  className="w-7 h-7 rounded-sm object-cover border border-border shrink-0 bg-surface"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="font-bold text-foreground text-xs">{playerHud.name}</span>
              </div>
              <span className="text-accent uppercase font-semibold">
                Core: {playerHud.chip?.name?.replace(' Chip', '')}
              </span>
            </div>
            {/* 5-Slot HP Bars */}
            <div className="grid grid-cols-5 gap-1 text-[9px] text-center">
              {[PartSlot.HEAD, PartSlot.TORSO, PartSlot.LEFT_ARM, PartSlot.RIGHT_ARM, PartSlot.LEGS].map((slot) => {
                const hp = playerHud.integrities[slot] || 0;
                const max = playerHud.maxIntegrities[slot] || 1;
                const pct = Math.round((hp / max) * 100);
                const isHead = slot === PartSlot.HEAD;
                const isDamagedFlash =
                  damagedPartFlash &&
                  damagedPartFlash.isPlayer === true &&
                  damagedPartFlash.slot === slot;
                return (
                  <div
                    key={slot}
                    className={`border p-1 transition-all ${
                      isDamagedFlash
                        ? 'animate-pulse bg-red-600 border-red-500 text-white shadow-[0_0_12px_#ef4444] font-black'
                        : 'border-border/80 bg-surface'
                    }`}
                  >
                    <span className={`block text-[8px] ${isDamagedFlash ? 'text-white' : 'text-muted'}`}>{SlotNames[slot]}</span>
                    <div className="w-full bg-border h-1.5 mt-0.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          hp <= 0 ? 'bg-zinc-600' : isHead ? 'bg-accent' : pct > 40 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`font-mono text-[8px] font-semibold ${isDamagedFlash ? 'text-white' : 'text-foreground'}`}>{hp}</span>
                  </div>
                );
              })}
            </div>
            {/* Overclock Gauge */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[9px] text-amber-500 font-bold uppercase">Overclock</span>
              <div className="flex-1 bg-border h-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-200"
                  style={{ width: `${playerHud.overclockGauge}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-amber-500">{Math.round(playerHud.overclockGauge)}%</span>
            </div>
          </div>

          {/* Enemy Unit Card */}
          <div className="border border-border bg-background/90 p-2 text-[10px]">
            <div className="flex items-center justify-between border-b border-border pb-1 mb-1.5">
              <div className="flex items-center gap-2">
                <img
                  src={getBotAvatarUrl(opponentConfig.botConfig, anibotsData)}
                  alt={enemyHud.name}
                  className="w-7 h-7 rounded-sm object-cover border border-border shrink-0 bg-surface"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="font-bold text-accent text-xs">{enemyHud.name}</span>
              </div>
              <span className="text-muted uppercase font-semibold">
                Core: {enemyHud.chip?.name?.replace(' Chip', '')}
              </span>
            </div>
            {/* 5-Slot HP Bars */}
            <div className="grid grid-cols-5 gap-1 text-[9px] text-center">
              {[PartSlot.HEAD, PartSlot.TORSO, PartSlot.LEFT_ARM, PartSlot.RIGHT_ARM, PartSlot.LEGS].map((slot) => {
                const hp = enemyHud.integrities[slot] || 0;
                const max = enemyHud.maxIntegrities[slot] || 1;
                const pct = Math.round((hp / max) * 100);
                const isHead = slot === PartSlot.HEAD;
                const isDamagedFlash =
                  damagedPartFlash &&
                  damagedPartFlash.isPlayer === false &&
                  damagedPartFlash.slot === slot;
                return (
                  <div
                    key={slot}
                    className={`border p-1 transition-all ${
                      isDamagedFlash
                        ? 'animate-pulse bg-red-600 border-red-500 text-white shadow-[0_0_12px_#ef4444] font-black'
                        : 'border-border/80 bg-surface'
                    }`}
                  >
                    <span className={`block text-[8px] ${isDamagedFlash ? 'text-white' : 'text-muted'}`}>{SlotNames[slot]}</span>
                    <div className="w-full bg-border h-1.5 mt-0.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          hp <= 0 ? 'bg-zinc-600' : isHead ? 'bg-accent' : pct > 40 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`font-mono text-[8px] font-semibold ${isDamagedFlash ? 'text-white' : 'text-foreground'}`}>{hp}</span>
                  </div>
                );
              })}
            </div>
            {/* Overclock Gauge */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[9px] text-amber-500 font-bold uppercase">Overclock</span>
              <div className="flex-1 bg-border h-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-200"
                  style={{ width: `${enemyHud.overclockGauge}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-amber-500">{Math.round(enemyHud.overclockGauge)}%</span>
            </div>
          </div>
        </div>

        {/* Central GPU Hardware-Accelerated 2D Canvas Area */}
        <div className="absolute inset-0 z-0">
          <BattleCanvas
            playerUnitRef={playerUnitRef}
            enemyUnitRef={enemyUnitRef}
            trapsRef={trapsRef}
            fxRef={fxRef}
            terrain={activeTerrain}
          />
        </div>

        {/* Command Selection Modal for Player */}
        {commandMenuOpen && !autoBattle && (
          <div className="absolute inset-x-4 bottom-3 z-30 bg-background/95 border-2 border-accent p-3 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2">
              <span className="font-bold text-accent uppercase text-[11px] tracking-wider">
                {'Tactical Command Menu // Select Action Payload'}
              </span>
              <span className="text-[10px] text-muted font-mono uppercase">
                Autonomous Target Lock: {playerHud.chip?.name || 'Anima Core'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Head Cache action */}
              <button
                disabled={(playerHud.integrities?.[PartSlot.HEAD] ?? 0) <= 0 || (playerHud.headCacheRemaining ?? 0) <= 0}
                onClick={() => handleSelectAction(PartSlot.HEAD, false)}
                className="p-2 border border-border bg-surface hover:border-accent text-left disabled:opacity-40 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground truncate">{playerHud.parts?.head?.name}</span>
                  <span className="text-[9px] text-accent">Uses: {playerHud.headCacheRemaining}</span>
                </div>
                <div className="text-[9px] text-muted mt-1">
                  Type: {playerHud.parts?.head?.type} | Pwr: {playerHud.parts?.head?.payload || 0}
                </div>
              </button>

              {/* Left Arm action */}
              <button
                disabled={(playerHud.integrities?.[PartSlot.LEFT_ARM] ?? 0) <= 0}
                onClick={() => handleSelectAction(PartSlot.LEFT_ARM, false)}
                className="p-2 border border-border bg-surface hover:border-accent text-left disabled:opacity-40 transition-colors cursor-pointer"
              >
                <div className="font-bold text-foreground truncate">{playerHud.parts?.leftArm?.name}</div>
                <div className="text-[9px] text-muted mt-1">
                  Pwr: {playerHud.parts?.leftArm?.payload} | Lat: {playerHud.parts?.leftArm?.latency}s
                </div>
              </button>

              {/* Right Arm action */}
              <button
                disabled={(playerHud.integrities?.[PartSlot.RIGHT_ARM] ?? 0) <= 0}
                onClick={() => handleSelectAction(PartSlot.RIGHT_ARM, false)}
                className="p-2 border border-border bg-surface hover:border-accent text-left disabled:opacity-40 transition-colors cursor-pointer"
              >
                <div className="font-bold text-foreground truncate">{playerHud.parts?.rightArm?.name}</div>
                <div className="text-[9px] text-muted mt-1">
                  Pwr: {playerHud.parts?.rightArm?.payload} | Lat: {playerHud.parts?.rightArm?.latency}s
                </div>
              </button>

              {/* Overclock Ultimate */}
              <button
                disabled={(playerHud.overclockGauge ?? 0) < 100}
                onClick={() => handleSelectAction(PartSlot.HEAD, true)}
                className="p-2 border border-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-black text-left disabled:opacity-30 transition-colors cursor-pointer font-bold"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-amber-500 hover:text-black">⚡ OVERCLOCK ULTIMATE</span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Cost: {playerHud.chip?.ultimate_abilities?.[0]?.gauge_cost || 50}%
                  </span>
                </div>
                <div className="text-[9px] mt-1 text-muted">
                  {(playerHud.overclockGauge ?? 0) >= 100
                    ? 'READY TO FIRE! (Requires 100%)'
                    : `Gauge: ${Math.round(playerHud.overclockGauge ?? 0)}% (Requires 100%)`}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Real-time Telemetry & Combat Log */}
      <div className="h-20 border border-border bg-background p-2 overflow-y-auto text-[10px] space-y-0.5 z-10">
        {combatLogs.map((log, idx) => (
          <div key={idx} className="text-muted leading-tight font-mono">
            <span className="text-foreground/80">{log}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
