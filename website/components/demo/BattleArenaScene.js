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
  resolveAffinityTarget,
  getPartAffinities,
} from '../../utils/combatEngine';
import { battleAudio } from '../../utils/battleAudio';
import { BattleCanvas } from './BattleCanvas';

export const BattleArenaScene = ({
  playerConfig,
  playerTeam,
  opponentConfig,
  opponentTeam,
  terrain,
  teamSize = 1,
  autoBattle,
  onToggleAutoBattle,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onBattleEnd,
}) => {
  // Normalize team arrays
  const initialPlayerConfigs = useMemo(() => {
    if (playerTeam && playerTeam.length > 0) return playerTeam;
    return [playerConfig];
  }, [playerTeam, playerConfig]);

  const initialOpponentConfigs = useMemo(() => {
    if (opponentTeam && opponentTeam.length > 0) return opponentTeam;
    return [opponentConfig];
  }, [opponentTeam, opponentConfig]);

  const initialPlayerUnits = useMemo(() => {
    return initialPlayerConfigs.map((cfg, idx) => {
      const u = createCombatUnitState(cfg.botConfig, cfg.chipConfig, true);
      u.isLeader = idx === 0;
      u.teamIndex = idx;
      return u;
    });
  }, [initialPlayerConfigs]);

  const initialEnemyUnits = useMemo(() => {
    return initialOpponentConfigs.map((cfg, idx) => {
      const u = createCombatUnitState(cfg.botConfig, cfg.chipConfig, false);
      u.isLeader = idx === 0;
      u.teamIndex = idx;
      return u;
    });
  }, [initialOpponentConfigs]);

  const activeTerrain = useMemo(() => {
    return terrain || initialOpponentConfigs[0]?.terrain || TERRAINS[0];
  }, [terrain, initialOpponentConfigs]);

  // Simulation Refs
  const playerUnitsRef = useRef(initialPlayerUnits);
  const enemyUnitsRef = useRef(initialEnemyUnits);
  const trapsRef = useRef({ playerTrap: null, enemyTrap: null });
  const fxRef = useRef({ shake: 0, particles: [], popups: [] });

  // HUD State for all team members
  const [playerHudUnits, setPlayerHudUnits] = useState(() => {
    return initialPlayerUnits.map((u) => ({
      name: u.name,
      chip: u.chip,
      parts: u.parts,
      integrities: { ...u.integrities },
      maxIntegrities: { ...u.maxIntegrities },
      overclockGauge: u.overclockGauge,
      headCacheRemaining: u.headCacheRemaining,
      isLeader: u.isLeader,
      teamIndex: u.teamIndex,
    }));
  });

  const [enemyHudUnits, setEnemyHudUnits] = useState(() => {
    return initialEnemyUnits.map((u) => ({
      name: u.name,
      chip: u.chip,
      integrities: { ...u.integrities },
      maxIntegrities: { ...u.maxIntegrities },
      overclockGauge: u.overclockGauge,
      isLeader: u.isLeader,
      teamIndex: u.teamIndex,
    }));
  });

  const [combatLogs, setCombatLogs] = useState(() => [
    `[RELAY ARENA] ${teamSize}v${teamSize} Combat initiated: ${initialPlayerUnits[0].name} Squad vs ${initialEnemyUnits[0].name} Squad!`,
    `[LEADER RULE] Eliminating the enemy Leader Head (👑 Unit 1) wins the match immediately!`,
    `[TERRAIN] ${activeTerrain.name}. Ready your AniBots!`,
  ]);

  const [commandUnitIndex, setCommandUnitIndex] = useState(null); // Which player unit is awaiting command
  const [countdown, setCountdown] = useState(3);
  const [damagedPartFlash, setDamagedPartFlash] = useState(null);

  const logsEndRef = useRef(null);
  const battleOverRef = useRef(false);
  const autoBattleRef = useRef(autoBattle);
  const countdownActiveRef = useRef(true);
  const hitStopRef = useRef(0);
  const damageFlashTimerRef = useRef(null);

  const triggerDamageFlash = useCallback((isDefenderPlayer, unitIdx, slot) => {
    if (damageFlashTimerRef.current) clearTimeout(damageFlashTimerRef.current);
    setDamagedPartFlash({ isPlayer: isDefenderPlayer, unitIdx, slot });
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
    setPlayerHudUnits(
      playerUnitsRef.current.map((u) => ({
        name: u.name,
        chip: u.chip,
        parts: u.parts,
        integrities: { ...u.integrities },
        maxIntegrities: { ...u.maxIntegrities },
        overclockGauge: u.overclockGauge,
        headCacheRemaining: u.headCacheRemaining,
        isLeader: u.isLeader,
        teamIndex: u.teamIndex,
      }))
    );
    setEnemyHudUnits(
      enemyUnitsRef.current.map((u) => ({
        name: u.name,
        chip: u.chip,
        integrities: { ...u.integrities },
        maxIntegrities: { ...u.maxIntegrities },
        overclockGauge: u.overclockGauge,
        isLeader: u.isLeader,
        teamIndex: u.teamIndex,
      }))
    );
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
        playerUnit: playerUnitsRef.current[0],
        playerTeam: playerUnitsRef.current,
        enemyUnit: enemyUnitsRef.current[0],
        enemyTeam: enemyUnitsRef.current,
      });
    }, 1800);
  }, [onBattleEnd]);

  // Center-Line Clash Resolution
  const handleReachedCenterLine = useCallback((attacker, isPlayer, attackerIdx) => {
    const opponentUnits = isPlayer ? enemyUnitsRef.current : playerUnitsRef.current;
    const livingOpponents = opponentUnits.filter((u) => (u.integrities[PartSlot.HEAD] || 0) > 0);

    if (livingOpponents.length === 0) {
      handleMatchEnd(isPlayer);
      return;
    }

    const part = attacker.selectedActionPart || {};
    const actType = parseAttackType(part.type, attacker.selectedActionSlot);

    // Resolve Affinity Targeting across ALL living opponent units
    const targetResult = resolveAffinityTarget(
      part,
      attacker.selectedActionSlot,
      livingOpponents
    );

    let defender = null;
    let targetSlotOverride = undefined;

    if (
      targetResult &&
      (targetResult.targetBot?.integrities?.[PartSlot.HEAD] || 0) > 0 &&
      (targetResult.targetBot?.integrities?.[targetResult.targetSlot] || 0) > 0
    ) {
      defender = targetResult.targetBot;
      targetSlotOverride = targetResult.targetSlot;
      if (targetResult.isAffinityMatch) {
        addLog(
          `🎯 [AFFINITY LOCK] ${attacker.name}'s ${part.name} [${SlotNames[attacker.selectedActionSlot]}] matched & targeted ${defender.name}'s ${SlotNames[targetSlotOverride]}!`
        );
      } else {
        addLog(
          `🎲 [RANDOM RETARGET] No matching affinity found. ${attacker.name}'s ${part.name} randomly targeted ${defender.name}'s ${SlotNames[targetSlotOverride]}!`
        );
      }
    } else {
      defender =
        livingOpponents.find((u) => u.isLeader && (u.integrities?.[PartSlot.HEAD] || 0) > 0) ||
        livingOpponents.find((u) => (u.integrities?.[PartSlot.HEAD] || 0) > 0) ||
        livingOpponents[0];
    }

    const traps = trapsRef.current;
    const centerX = 360;

    // OVERCLOCK CHARGE: Focus reactor (+25% OC) - not an ability, immune to ability traps!
    if (attacker.isChargeOverclock) {
      battleAudio.playLaser();
      const currentOc = attacker.overclockGauge || 0;
      const newOc = Math.min(100, currentOc + 25);
      attacker.overclockGauge = newOc;
      addLog(`⚡ [OVERCLOCK CHARGE] ${attacker.name} charged +25% Overclock! Reactor Gauge: ${Math.round(newOc)}%.`);
      fxRef.current.popups.push({
        x: centerX,
        y: 110,
        damage: '+25% OC',
        slotName: 'REACTOR',
        isCrit: true,
        life: 1.2,
      });
      // Visual charging sparks
      for (let i = 0; i < 10; i++) {
        fxRef.current.particles.push({
          x: centerX,
          y: 125,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          type: 'spark',
          radius: 18,
          color: '#38bdf8',
          life: 1.0,
          size: 3,
        });
      }
      triggerDamageFlash(isPlayer, attackerIdx, PartSlot.TORSO);
      syncHud();
      return;
    }

    // Trap check (only triggers against attack/part abilities)
    const activeTrap = isPlayer ? traps.playerTrap : traps.enemyTrap;
    if (activeTrap) {
      battleAudio.playTrapExplosion();
      fxRef.current.shake = 1.0;
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

      triggerDamageFlash(isPlayer, attackerIdx, PartSlot.LEGS);
      syncHud();

      // Check if Leader Head was destroyed by trap
      if (attacker.isLeader && attacker.integrities[PartSlot.HEAD] <= 0) {
        addLog(`💀 CRITICAL SYSTEM FAILURE! ${attacker.name}'s Leader Head destroyed by trap!`);
        handleMatchEnd(!isPlayer);
      }
      return;
    }

    // Part destroyed mid-sprint
    if (!attacker.isUlt && (attacker.integrities[attacker.selectedActionSlot] ?? 0) <= 0) {
      const destroyedSlotName = SlotNames[attacker.selectedActionSlot] || 'PART';
      addLog(`⚠️ ACTION ABORTED! ${attacker.name}'s ${destroyedSlotName} was destroyed in transit! Strike failed.`);
      battleAudio.playDefeat();
      fxRef.current.popups.push({
        x: centerX,
        y: 110,
        damage: 'BROKEN',
        slotName: destroyedSlotName,
        isCrit: false,
        life: 1.2,
      });
      syncHud();
      return;
    }

    // Support Abilities
    if (actType === AttackType.SUPPORT) {
      battleAudio.playVictory();
      const healAmt = part.payload || 35;
      const targetHealSlot = PartSlot.TORSO;
      attacker.integrities[targetHealSlot] = Math.min(
        attacker.maxIntegrities[targetHealSlot],
        (attacker.integrities[targetHealSlot] || 0) + healAmt
      );
      addLog(`💚 ${attacker.name} activated ${part.name || 'Emergency Repair'}! Restored +${healAmt} HP to Torso.`);
      fxRef.current.popups.push({
        x: isPlayer ? 100 : 620,
        y: 120,
        damage: `+${healAmt} HP`,
        slotName: 'TORSO',
        isCrit: true,
        life: 1.0,
      });
      syncHud();
      return;
    }

    // Trap Deployment
    if (actType === AttackType.TRAP) {
      battleAudio.playClick();
      if (isPlayer) traps.playerTrap = part;
      else traps.enemyTrap = part;
      addLog(`⚡ ${attacker.name} laid ${part.name} across the Center Line! Enemy sprint will detonate on contact.`);
      syncHud();
      return;
    }

    // Execute Offensive Clash against Defender
    const result = resolveCenterLineClash({
      attacker,
      defender,
      actionPart: part,
      isUlt: attacker.isUlt,
      targetSlotOverride,
    });

    if (result.isCrit) {
      battleAudio.playCrit();
      fxRef.current.shake = 1.0;
    } else {
      battleAudio.playLaser();
      fxRef.current.shake = 0.5;
    }

    // Visual particles
    const targetX = isPlayer ? 580 : 140;
    const targetY = 120;
    for (let i = 0; i < 8; i++) {
      fxRef.current.particles.push({
        x: targetX,
        y: targetY,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        type: result.isCrit ? 'slash' : 'spark',
        radius: 20,
        angle: Math.random() * Math.PI * 2,
        color: result.isCrit ? '#f59e0b' : '#ef4444',
        life: 1.0,
        size: 3 + Math.random() * 3,
      });
    }

    fxRef.current.popups.push({
      x: targetX,
      y: targetY - 20,
      damage: result.damage,
      slotName: result.targetSlotName,
      isCrit: result.isCrit,
      life: 1.0,
    });

    triggerDamageFlash(!isPlayer, defender.teamIndex, result.targetSlot);

    const ocTelemetry = result.isUlt
      ? ' [⚡ OVERCLOCK EXPENDED]'
      : ` [+5% OC to ${result.attackerName}, +${result.defenderOcGain}% OC to ${result.defenderName}]`;

    addLog(
      `⚔️ ${result.attackerName} strikes ${result.defenderName} with ${result.actionName}${result.isCrit && !result.isUlt ? ' [CRITICAL!]' : ''}! Dealt ${result.damage} damage to ${result.targetSlotName}!${result.wasDiverted ? ' [AUTONOMOUS HEAD GUARD]' : ''}${ocTelemetry}`
    );

    syncHud();

    // LEADER ELIMINATION WIN/LOSS RULE
    if (result.isHeadDestroyed) {
      if (defender.isLeader) {
        addLog(`💀 CRITICAL SYSTEM FAILURE! ${isPlayer ? 'Enemy' : 'Player'} LEADER [${defender.name}] Head Destroyed!`);
        handleMatchEnd(isPlayer);
      } else {
        addLog(`⚠️ SUPPORT UNIT DISABLED! [${defender.name}] Head destroyed! Unit incapacitated.`);
        // Check if all opponent units are defeated anyway
        const remainingLiving = opponentUnits.filter((u) => (u.integrities[PartSlot.HEAD] || 0) > 0);
        if (remainingLiving.length === 0) {
          handleMatchEnd(isPlayer);
        }
      }
    }
  }, [addLog, handleMatchEnd, syncHud, triggerDamageFlash]);

  // Execute Command & Initiate Sprint
  const executeCommand = useCallback((unit, slot, isUlt, targetUnitIdx = 0, isCharge = false) => {
    let partData = {};
    if (isCharge) {
      partData = {
        name: 'Overclock Charge',
        payload: 0,
        type: 'CHARGE',
        execution_time: 1.0,
        latency: 1.8,
      };
      addLog(`⚡ ${unit.name} concentrates reactor power to Charge Overclock (+25%)!`);
      battleAudio.playLaser();
    } else if (isUlt) {
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
    unit.isChargeOverclock = isCharge;
    unit.targetUnitIndex = targetUnitIdx;
    unit.currentPhase = CombatPhase.RUN;
    unit.trackProgress = 0;
  }, [addLog, syncHud]);

  // Decoupled 60 FPS Physics Simulation Loop
  useEffect(() => {
    let lastTime = performance.now();
    let animId;

    const physicsLoop = (currentTime) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (countdownActiveRef.current) {
        animId = requestAnimationFrame(physicsLoop);
        return;
      }

      if (hitStopRef.current > 0) {
        hitStopRef.current -= delta;
        animId = requestAnimationFrame(physicsLoop);
        return;
      }

      if (!battleOverRef.current) {
        playerUnitsRef.current.forEach((u, idx) => {
          if ((u.integrities[PartSlot.HEAD] || 0) > 0) {
            tickUnit(u, delta, true, idx);
          }
        });
        enemyUnitsRef.current.forEach((u, idx) => {
          if ((u.integrities[PartSlot.HEAD] || 0) > 0) {
            tickUnit(u, delta, false, idx);
          }
        });
      }

      animId = requestAnimationFrame(physicsLoop);
    };

    const tickUnit = (unit, delta, isPlayer, unitIdx) => {
      if ((unit.integrities[PartSlot.HEAD] || 0) <= 0) return;

      switch (unit.currentPhase) {
        case CombatPhase.WAIT: {
          const legs = unit.parts.legs;
          let clockSpeed = legs?.clock_speed || 1.5;
          const tMod = getTerrainModifiers(legs?.protocol, activeTerrain.id, unit.chip?.id);
          clockSpeed *= tMod.speedMult;
          if (unit.integrities[PartSlot.LEGS] <= 0) clockSpeed *= 0.4;
          if (unit.chip?.id === 'chip_spark') clockSpeed *= 1.25;

          const fillRate = clockSpeed * 28.0;
          unit.actionBar = Math.min(100, (unit.actionBar || 0) + fillRate * delta);

          if (unit.actionBar >= 100) {
            if (isPlayer) {
              if (autoBattleRef.current) {
                const livingEnemies = enemyUnitsRef.current.filter((e) => (e.integrities[PartSlot.HEAD] || 0) > 0);
                const targetDef = livingEnemies[0] || enemyUnitsRef.current[0];
                const choice = evaluateAIPartChoice(unit, targetDef, Boolean(trapsRef.current.enemyTrap));
                executeCommand(unit, choice.slot, choice.isUlt, targetDef.teamIndex, choice.isCharge);
              } else {
                unit.currentPhase = CombatPhase.COMMAND;
                syncHud();
                setCommandUnitIndex(unitIdx);
                battleAudio.playClick();
                addLog(`[ATB CHARGED] ${unit.name} ready for command!`);
              }
            } else {
              const livingPlayers = playerUnitsRef.current.filter((p) => (p.integrities[PartSlot.HEAD] || 0) > 0);
              const targetDef = livingPlayers[0] || playerUnitsRef.current[0];
              const choice = evaluateAIPartChoice(unit, targetDef, Boolean(trapsRef.current.playerTrap));
              executeCommand(unit, choice.slot, choice.isUlt, targetDef.teamIndex, choice.isCharge);
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

          unit.trackProgress = Math.min(1.0, (unit.trackProgress || 0) + runSpeed * delta);
          if (unit.trackProgress >= 1.0) {
            handleReachedCenterLine(unit, isPlayer, unitIdx);
            unit.trackProgress = 1.0;
            unit.currentPhase = CombatPhase.COOLDOWN;
            hitStopRef.current = 1.4;
          }
          break;
        }

        case CombatPhase.COOLDOWN: {
          const baseLatency = Math.max(1.5, unit.selectedActionPart?.latency || 3.0);
          const cooling = unit.integrities[PartSlot.TORSO] > 0 ? unit.parts.torso?.cooling || 1.0 : 0.0;
          const effLatency = Math.max(1.5, baseLatency - cooling) * (unit.isOverweight ? 1.5 : 1.0);
          let returnSpeed = 0.55 / effLatency;
          if (unit.integrities[PartSlot.LEGS] <= 0) returnSpeed *= 0.5;

          unit.trackProgress = Math.max(0.0, (unit.trackProgress || 0) - returnSpeed * delta);
          unit.actionBar = Math.min(100, (1.0 - unit.trackProgress) * 100);

          if (unit.trackProgress <= 0.0) {
            unit.trackProgress = 0.0;
            unit.actionBar = 100.0;
            unit.overrideGuardActive = false;

            if (isPlayer) {
              if (autoBattleRef.current) {
                const livingEnemies = enemyUnitsRef.current.filter((e) => (e.integrities[PartSlot.HEAD] || 0) > 0);
                const targetDef = livingEnemies[0] || enemyUnitsRef.current[0];
                const choice = evaluateAIPartChoice(unit, targetDef, Boolean(trapsRef.current.enemyTrap));
                executeCommand(unit, choice.slot, choice.isUlt, targetDef.teamIndex, choice.isCharge);
              } else {
                unit.currentPhase = CombatPhase.COMMAND;
                syncHud();
                setCommandUnitIndex(unitIdx);
                battleAudio.playClick();
                addLog(`[RECHARGED AT BASE] ${unit.name} returned home & ready for command!`);
              }
            } else {
              const livingPlayers = playerUnitsRef.current.filter((p) => (p.integrities[PartSlot.HEAD] || 0) > 0);
              const targetDef = livingPlayers[0] || playerUnitsRef.current[0];
              const choice = evaluateAIPartChoice(unit, targetDef, Boolean(trapsRef.current.playerTrap));
              executeCommand(unit, choice.slot, choice.isUlt, targetDef.teamIndex, choice.isCharge);
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
  }, [executeCommand, handleReachedCenterLine, addLog, syncHud, activeTerrain]);

  // Player manual command handler
  const handleSelectAction = (slot, isUlt, isCharge = false) => {
    if (commandUnitIndex === null) return;
    const unit = playerUnitsRef.current[commandUnitIndex];
    if (!unit) return;

    // Pick target: active enemy leader or first living enemy
    const livingEnemies = enemyUnitsRef.current.filter((e) => (e.integrities[PartSlot.HEAD] || 0) > 0);
    const targetIdx = livingEnemies[0]?.teamIndex ?? 0;

    setCommandUnitIndex(null);
    executeCommand(unit, slot, isUlt, targetIdx, isCharge);
    syncHud();
  };

  const activeCommandUnit = commandUnitIndex !== null ? playerUnitsRef.current[commandUnitIndex] : null;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-2.5 sm:p-4 bg-background font-mono text-xs overflow-hidden select-none">
      {/* Top Telemetry Header Ribbon */}
      <div className="flex items-center justify-between border-b border-border pb-2 z-10 bg-background/80 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-muted">
            Relay Arena • {teamSize}v{teamSize} Match • Terrain: {activeTerrain.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAutoBattle}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold border transition-colors cursor-pointer ${
              autoBattle
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-surface border-border text-muted hover:text-foreground'
            }`}
          >
            {autoBattle ? '🤖 Auto: ON' : '🎮 Auto: OFF'}
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="px-2 py-1 text-[10px] border border-border bg-surface text-muted hover:text-foreground cursor-pointer"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="px-2 py-1 text-[10px] border border-border bg-surface text-muted hover:text-foreground cursor-pointer"
          >
            {isFullscreen ? 'Exit Full' : '⛶'}
          </button>
        </div>
      </div>

      {/* Main Battle Canvas Viewport with Vertically Stacked Lanes */}
      <div className="relative flex-1 my-1 border border-border bg-background overflow-hidden min-h-[220px]">
        <BattleCanvas
          playerUnitsRef={playerUnitsRef}
          enemyUnitsRef={enemyUnitsRef}
          trapsRef={trapsRef}
          fxRef={fxRef}
          terrain={activeTerrain}
          teamSize={teamSize}
        />

        {/* 3-2-1 Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center z-30">
            <div className="text-4xl sm:text-6xl font-black text-accent tracking-widest uppercase animate-bounce">
              {countdown}
            </div>
          </div>
        )}

        {/* Player Squad Ribbons (Left HUD) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20 pointer-events-none max-w-[190px]">
          {playerHudUnits.map((u, i) => {
            const isDead = (u.integrities[PartSlot.HEAD] || 0) <= 0;
            const isCommanding = commandUnitIndex === i;
            return (
              <div
                key={i}
                className={`p-1.5 border backdrop-blur-md transition-all ${
                  isCommanding
                    ? 'border-accent bg-accent/20 ring-1 ring-accent'
                    : isDead
                    ? 'border-border/40 bg-surface/30 opacity-60'
                    : 'border-border bg-surface/80'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1 gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={getBotAvatarUrl(u, anibotsData)}
                      alt={u.name}
                      className="w-5 h-5 rounded-xs object-cover border border-border/80 shrink-0 bg-background"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="font-bold text-foreground truncate flex items-center gap-1">
                      {u.isLeader && <span>👑</span>}
                      {u.name}
                    </span>
                  </div>
                  {isDead ? (
                    <span className="text-[8px] text-rose-400 font-bold shrink-0">DISABLED</span>
                  ) : (
                    <span className="text-[9px] text-accent font-semibold shrink-0">{u.overclockGauge}% OC</span>
                  )}
                </div>
                {/* 5 Part Mini Integrity Bars */}
                <div className="grid grid-cols-5 gap-1">
                  {[PartSlot.HEAD, PartSlot.LEFT_ARM, PartSlot.RIGHT_ARM, PartSlot.TORSO, PartSlot.LEGS].map(
                    (slot) => {
                      const cur = u.integrities[slot] || 0;
                      const max = u.maxIntegrities[slot] || 50;
                      const pct = Math.max(0, Math.min(100, (cur / max) * 100));
                      const isFlash = damagedPartFlash?.isPlayer && damagedPartFlash?.unitIdx === i && damagedPartFlash?.slot === slot;
                      return (
                        <div key={slot} className="flex flex-col gap-0.5">
                          <div className="w-full h-1 bg-background border border-border/60 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isFlash
                                  ? 'bg-rose-500'
                                  : pct > 50
                                  ? 'bg-emerald-400'
                                  : pct > 20
                                  ? 'bg-amber-400'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rival Squad Ribbons (Right HUD) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20 pointer-events-none max-w-[190px]">
          {enemyHudUnits.map((u, i) => {
            const isDead = (u.integrities[PartSlot.HEAD] || 0) <= 0;
            return (
              <div
                key={i}
                className={`p-1.5 border backdrop-blur-md transition-all ${
                  isDead ? 'border-border/40 bg-surface/30 opacity-60' : 'border-border bg-surface/80'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1 gap-1">
                  {isDead ? (
                    <span className="text-[8px] text-rose-400 font-bold shrink-0">DISABLED</span>
                  ) : (
                    <span className="text-[9px] text-rose-400 font-semibold shrink-0">{u.overclockGauge}% OC</span>
                  )}
                  <div className="flex items-center gap-1.5 min-w-0 justify-end">
                    <span className="font-bold text-foreground truncate flex items-center gap-1">
                      {u.name}
                      {u.isLeader && <span>👑</span>}
                    </span>
                    <img
                      src={getBotAvatarUrl(u, anibotsData)}
                      alt={u.name}
                      className="w-5 h-5 rounded-xs object-cover border border-border/80 shrink-0 bg-background"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                </div>
                {/* 5 Part Mini Integrity Bars */}
                <div className="grid grid-cols-5 gap-1">
                  {[PartSlot.HEAD, PartSlot.LEFT_ARM, PartSlot.RIGHT_ARM, PartSlot.TORSO, PartSlot.LEGS].map(
                    (slot) => {
                      const cur = u.integrities[slot] || 0;
                      const max = u.maxIntegrities[slot] || 50;
                      const pct = Math.max(0, Math.min(100, (cur / max) * 100));
                      const isFlash = !damagedPartFlash?.isPlayer && damagedPartFlash?.unitIdx === i && damagedPartFlash?.slot === slot;
                      return (
                        <div key={slot} className="flex flex-col gap-0.5">
                          <div className="w-full h-1 bg-background border border-border/60 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isFlash
                                  ? 'bg-rose-500'
                                  : pct > 50
                                  ? 'bg-rose-400'
                                  : pct > 20
                                  ? 'bg-amber-400'
                                  : 'bg-rose-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Command Dock & Combat Log Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 max-h-[140px] z-10">
        {/* Combat Relay Terminal Logs */}
        <div className="md:col-span-6 bg-surface border border-border p-2 overflow-y-auto max-h-[125px] font-mono text-[10px] leading-relaxed">
          {combatLogs.map((log, index) => (
            <div key={index} className="text-muted hover:text-foreground">
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Interactive Command Panel (When a player unit is charged) */}
        <div className="md:col-span-6 bg-surface border border-border p-2 flex flex-col justify-between">
          {commandUnitIndex !== null && activeCommandUnit ? (
            <div className="flex flex-col justify-between h-full gap-1.5">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-border">
                <span className="font-bold text-accent flex items-center gap-1.5 uppercase">
                  <span>{activeCommandUnit.isLeader ? '👑 Leader Command:' : 'Support Command:'}</span>
                  <span className="text-foreground">{activeCommandUnit.name}</span>
                </span>
                <span className="text-[10px] text-muted">Select Part to Attack</span>
              </div>

              {/* Action Buttons: Head, Left Arm, Right Arm, Charge Overclock, Ultimate */}
              <div className="grid grid-cols-5 gap-1.5">
                {/* Head Part */}
                <button
                  type="button"
                  disabled={
                    (activeCommandUnit.integrities[PartSlot.HEAD] || 0) <= 0 ||
                    activeCommandUnit.headCacheRemaining <= 0
                  }
                  onClick={() => handleSelectAction(PartSlot.HEAD, false)}
                  className="p-1.5 border border-border bg-background hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed text-left cursor-pointer transition-colors"
                >
                  <div className="text-[9px] text-muted uppercase font-bold flex items-center justify-between">
                    <span>Head</span>
                    <span>x{activeCommandUnit.headCacheRemaining}</span>
                  </div>
                  <div className="text-[10px] font-bold text-foreground truncate">
                    {activeCommandUnit.parts.head?.name}
                  </div>
                  <div className="text-[9px] text-accent flex items-center justify-between mt-0.5">
                    <span>Pwr: {activeCommandUnit.parts.head?.payload || 40}</span>
                    <span className="text-[8px] px-1 py-0.2 bg-surface border border-border/80 text-muted uppercase font-mono">
                      {getPartAffinities(activeCommandUnit.parts.head, PartSlot.HEAD)[0]}
                    </span>
                  </div>
                </button>

                {/* Left Arm Part */}
                <button
                  type="button"
                  disabled={(activeCommandUnit.integrities[PartSlot.LEFT_ARM] || 0) <= 0}
                  onClick={() => handleSelectAction(PartSlot.LEFT_ARM, false)}
                  className="p-1.5 border border-border bg-background hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed text-left cursor-pointer transition-colors"
                >
                  <div className="text-[9px] text-muted uppercase font-bold flex items-center justify-between">
                    <span>L-Arm</span>
                    <span className="text-[8px] px-1 py-0.2 bg-surface border border-border/80 text-muted uppercase font-mono">
                      {getPartAffinities(activeCommandUnit.parts.leftArm, PartSlot.LEFT_ARM)[0]}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-foreground truncate">
                    {activeCommandUnit.parts.leftArm?.name}
                  </div>
                  <div className="text-[9px] text-accent mt-0.5">Pwr: {activeCommandUnit.parts.leftArm?.payload || 25}</div>
                </button>

                {/* Right Arm Part */}
                <button
                  type="button"
                  disabled={(activeCommandUnit.integrities[PartSlot.RIGHT_ARM] || 0) <= 0}
                  onClick={() => handleSelectAction(PartSlot.RIGHT_ARM, false)}
                  className="p-1.5 border border-border bg-background hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed text-left cursor-pointer transition-colors"
                >
                  <div className="text-[9px] text-muted uppercase font-bold flex items-center justify-between">
                    <span>R-Arm</span>
                    <span className="text-[8px] px-1 py-0.2 bg-surface border border-border/80 text-muted uppercase font-mono">
                      {getPartAffinities(activeCommandUnit.parts.rightArm, PartSlot.RIGHT_ARM)[0]}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-foreground truncate">
                    {activeCommandUnit.parts.rightArm?.name}
                  </div>
                  <div className="text-[9px] text-accent mt-0.5">Pwr: {activeCommandUnit.parts.rightArm?.payload || 25}</div>
                </button>

                {/* Charge Overclock (Reactor Focus: +25% Overclock Gauge, immune to ability traps) */}
                <button
                  type="button"
                  disabled={
                    (activeCommandUnit.integrities[PartSlot.HEAD] || 0) <= 0 ||
                    activeCommandUnit.overclockGauge >= 100
                  }
                  onClick={() => handleSelectAction(-2, false, true)}
                  className="p-1.5 border border-sky-500/60 bg-sky-500/10 hover:bg-sky-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-left cursor-pointer transition-colors"
                >
                  <div className="text-[9px] text-sky-400 uppercase font-bold">⚡ Charge</div>
                  <div className="text-[10px] font-bold text-sky-300 truncate">Reactor Focus</div>
                  <div className="text-[9px] text-sky-400 mt-0.5">+25% Overclock</div>
                </button>

                {/* Overclock Ultimate */}
                <button
                  type="button"
                  disabled={activeCommandUnit.overclockGauge < 100}
                  onClick={() => handleSelectAction(-1, true)}
                  className="p-1.5 border border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-left cursor-pointer transition-colors"
                >
                  <div className="text-[9px] text-amber-400 uppercase font-bold">⚡ Ultimate</div>
                  <div className="text-[10px] font-bold text-amber-300 truncate">
                    {activeCommandUnit.chip?.ultimate_abilities?.[0]?.name || 'Overclock Blitz'}
                  </div>
                  <div className="text-[9px] text-amber-400">
                    {activeCommandUnit.overclockGauge >= 100 ? 'READY (100%)' : `${activeCommandUnit.overclockGauge}%`}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted text-[11px] py-3">
              <span className="text-accent font-semibold uppercase tracking-wider mb-0.5">
                {autoBattle ? '🤖 Autonomous AI Pilot Active' : '⏱ ATB Clock Charging at Base'}
              </span>
              <span>Fastest AniBot reaching center line acts first. Destroy enemy Leader Head to win!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
