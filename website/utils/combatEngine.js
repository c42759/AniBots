/**
 * combatEngine.js
 * Authoritative AniBots combat simulation engine (1v1 Relay Arena).
 * Parity with Godot core engine: Types.gd, BattleArena.gd, CombatUnit3D.gd, CombatClash3D.gd.
 */

export const PartSlot = {
  HEAD: 0,
  TORSO: 1,
  LEFT_ARM: 2,
  RIGHT_ARM: 3,
  LEGS: 4,
};

export const SlotNames = {
  [PartSlot.HEAD]: 'HEAD',
  [PartSlot.TORSO]: 'TORSO',
  [PartSlot.LEFT_ARM]: 'LEFT_ARM',
  [PartSlot.RIGHT_ARM]: 'RIGHT_ARM',
  [PartSlot.LEGS]: 'LEGS',
};

export const AttackType = {
  SHOOTING: 0,
  MELEE: 1,
  SUPPORT: 2,
  TRAP: 3,
  DEFENSE: 4,
};

export const CombatPhase = {
  WAIT: 0,      // Charging ATB Action Bar at Base Line
  COMMAND: 1,   // Awaiting action command
  RUN: 2,       // Sprinting to Center Line
  COOLDOWN: 3,  // Returning from Center Line to Base Line
};

export const TerrainType = {
  CITY: 'CITY',
  RUBBLE: 'RUBBLE',
  MUD: 'MUD',
  FLOODED: 'FLOODED',
  ROCKY: 'ROCKY',
};

export const TERRAINS = [
  {
    id: 'CITY',
    name: 'City / Paved Asphalt',
    shortName: 'City Asphalt',
    description: 'High-traction paved city streets. Optimized for Bipedal (+10%) and Wheeled (+25%) frames.',
    icon: '🏙️',
    texture: '/images/terrains/terrain_city.jpg',
    themeColor: '#38bdf8',
  },
  {
    id: 'RUBBLE',
    name: 'Rubble / Junkyard',
    shortName: 'Scrapyard Rubble',
    description: 'Debris-littered junkyard ruins. Wheeled slowed (-20%), Tracks gain armor (+3), Multi-Leg stable (+10% eva).',
    icon: '🏚️',
    texture: '/images/terrains/terrain_rubble.jpg',
    themeColor: '#f59e0b',
  },
  {
    id: 'MUD',
    name: 'Mud / Swamp / Sand',
    shortName: 'Swamp Mud',
    description: 'Deep toxic bog and sludge trench. Severe penalty for Wheeled (-40%) and Bipedal (-15%). Tracks & Hover immune.',
    icon: '🪵',
    texture: '/images/terrains/terrain_mud.jpg',
    themeColor: '#84cc16',
  },
  {
    id: 'FLOODED',
    name: 'Flooded / Water Base',
    shortName: 'Flooded Aquatic',
    description: 'Submerged grid platform. Heavy drag for standard frames; Aquatic frames surge (+30% speed, +15% eva).',
    icon: '🌊',
    texture: '/images/terrains/terrain_flooded.jpg',
    themeColor: '#06b6d4',
  },
  {
    id: 'ROCKY',
    name: 'Rocky Peaks / Slopes',
    shortName: 'Rocky Slopes',
    description: 'Craggy basalt and magma fissures. Multi-Leg units excel (+15% eva, +4 armor); Aquatic and Wheeled penalized.',
    icon: '⛰️',
    texture: '/images/terrains/terrain_rocky.jpg',
    themeColor: '#f97316',
  },
];

/**
 * Terrain Interaction Matrix modifiers (PARTS.md Section 4).
 */
export function getTerrainModifiers(protocolStr = 'BIPEDAL', terrainId = 'CITY', chipId = '') {
  let proto = String(protocolStr || 'BIPEDAL').toUpperCase();
  if (chipId === 'chip_pegasus') {
    proto = 'HOVER'; // Celestial Hover negates all terrain penalties
  }
  let speedMult = 1.0;
  let evasionBonus = 0;
  let armorBonus = 0;

  switch (terrainId) {
    case TerrainType.CITY:
      if (proto === 'BIPEDAL') speedMult = 1.10;
      else if (proto === 'WHEELED') speedMult = 1.25;
      else if (proto === 'AQUATIC') speedMult = 0.80;
      break;

    case TerrainType.RUBBLE:
      if (proto === 'WHEELED') speedMult = 0.80;
      else if (proto === 'TRACKS') armorBonus = 3;
      else if (proto === 'AQUATIC') speedMult = 0.70;
      else if (proto === 'MULTI_LEG') evasionBonus = 10;
      break;

    case TerrainType.MUD:
      if (proto === 'BIPEDAL') speedMult = 0.85;
      else if (proto === 'WHEELED') speedMult = 0.60;
      // TRACKS and HOVER immune
      break;

    case TerrainType.FLOODED:
      if (proto === 'BIPEDAL') speedMult = 0.75;
      else if (proto === 'WHEELED') speedMult = 0.50;
      else if (proto === 'TRACKS') speedMult = 0.80;
      else if (proto === 'MULTI_LEG') speedMult = 0.90;
      else if (proto === 'AQUATIC') {
        speedMult = 1.30;
        evasionBonus = 15;
      }
      break;

    case TerrainType.ROCKY:
      if (proto === 'BIPEDAL') speedMult = 0.90;
      else if (proto === 'WHEELED') speedMult = 0.70;
      else if (proto === 'AQUATIC') speedMult = 0.60;
      else if (proto === 'MULTI_LEG') {
        evasionBonus = 15;
        armorBonus = 4;
      }
      break;

    default:
      break;
  }

  if (chipId === 'chip_ranger' && speedMult < 1.0) {
    speedMult = 1.0; // Ranger chip terrain mastery
  }

  return { speedMult, evasionBonus, armorBonus };
}

/**
 * Integrity calculation based on condition percentage (PARTS.md Section 1).
 */
export function calculateBattleIntegrity(baseIntegrity, conditionPercent = 100) {
  if (conditionPercent <= 0) return 0;
  const clamped = Math.max(0, Math.min(100, conditionPercent));
  return Math.max(1, Math.round(baseIntegrity * (clamped / 100)));
}

/**
 * Bandwidth check: Head + LeftArm + RightArm weight vs Torso max loadout (PARTS.md Section 1).
 */
export function isBuildOverweight(head, leftArm, rightArm, torso) {
  const totalWeight = (head?.weight || 0) + (leftArm?.weight || 0) + (rightArm?.weight || 0);
  const maxLoad = torso?.max_loadout || 30;
  return totalWeight > maxLoad;
}

/**
 * Effective latency after Torso cooling and overweight penalty.
 */
export function calculateEffectiveLatency(baseLatency, torsoCooling = 1.0, isOverweight = false) {
  const netLatency = Math.max(1.0, baseLatency - torsoCooling);
  return isOverweight ? netLatency * 1.5 : netLatency;
}

/**
 * Anima Chip Affinity match check (+10% synergy bonus).
 */
export function checkAffinityMatch(partAttackType, chipAffinity = 'MELEE') {
  const aff = String(chipAffinity).toUpperCase();
  switch (partAttackType) {
    case AttackType.MELEE:
      return ['MELEE', 'DUAL_WIELD', 'CRITICAL', 'COUNTER', 'SPEED', 'AGILITY'].includes(aff);
    case AttackType.SHOOTING:
      return ['SHOOTING', 'SNIPER', 'BURST_DAMAGE', 'PRECISION', 'SPEED'].includes(aff);
    case AttackType.DEFENSE:
      return ['DEFENSE', 'GUARDIAN', 'INTERCEPT', 'MARTYR'].includes(aff);
    case AttackType.SUPPORT:
      return ['SUPPORT', 'CONTROL', 'TACTICAL', 'COMMAND', 'AGILITY', 'MOBILITY'].includes(aff);
    case AttackType.TRAP:
      return ['TRAP', 'CONTROL', 'TACTICAL'].includes(aff);
    default:
      return false;
  }
}

/**
 * Parse string attack type to enum.
 */
export function parseAttackType(typeStr, slot) {
  const t = String(typeStr || '').toUpperCase();
  if (['SHOOTING', 'RANGED', 'SNIPER'].includes(t)) return AttackType.SHOOTING;
  if (['MELEE'].includes(t)) return AttackType.MELEE;
  if (['SUPPORT'].includes(t)) return AttackType.SUPPORT;
  if (['TRAP'].includes(t)) return AttackType.TRAP;
  if (['DEFENSE', 'CHASSIS', 'SHIELD'].includes(t)) return AttackType.DEFENSE;
  if (slot === PartSlot.TORSO) return AttackType.DEFENSE;
  if (slot === PartSlot.LEGS) return AttackType.SUPPORT;
  return AttackType.MELEE;
}

/**
 * Initialize a combat unit state from bot config and chip.
 */
export function createCombatUnitState(botConfig, chipConfig, isPlayerSide) {
  const parts = botConfig.parts || {};
  const head = parts.head || {};
  const torso = parts.torso || {};
  const leftArm = parts.left_arm || {};
  const rightArm = parts.right_arm || {};
  const legs = parts.legs || {};

  const integrities = {
    [PartSlot.HEAD]: calculateBattleIntegrity(head.integrity || 60, head.condition || 100),
    [PartSlot.TORSO]: calculateBattleIntegrity(torso.integrity || 150, torso.condition || 100),
    [PartSlot.LEFT_ARM]: calculateBattleIntegrity(leftArm.integrity || 55, leftArm.condition || 100),
    [PartSlot.RIGHT_ARM]: calculateBattleIntegrity(rightArm.integrity || 55, rightArm.condition || 100),
    [PartSlot.LEGS]: calculateBattleIntegrity(legs.integrity || 90, legs.condition || 100),
  };

  const maxIntegrities = { ...integrities };

  const overweight = isBuildOverweight(head, leftArm, rightArm, torso);

  return {
    isPlayer: isPlayerSide,
    name: botConfig.name || (isPlayerSide ? 'Genesis-1' : 'Metabee'),
    modelCode: botConfig.model_code || 'ANIBOT',
    archetype: botConfig.archetype || 'Custom Unit',
    chip: chipConfig,
    parts: {
      head,
      torso,
      leftArm,
      rightArm,
      legs,
    },
    integrities,
    maxIntegrities,
    headCacheRemaining: head.cache !== undefined ? head.cache : 3,
    overclockGauge: 0, // 0 - 100
    isOverweight: overweight,
    currentPhase: CombatPhase.WAIT,
    actionBar: Math.random() * 15, // slight random start stagger
    trackProgress: 0, // 0 = Base Line, 1 = Center Line
    selectedActionSlot: -1,
    selectedActionPart: null,
    isUlt: false,
    cachedTargetSlot: -1,
    guaranteedCritNext: false,
    overrideGuardActive: false,
  };
}

/**
 * Evaluate Utility AI target slot selection (OVERVIEW.md Targeting).
 */
export function evaluateUtilityAITargetSlot(chip, defenderUnit) {
  const priority = String(chip?.target_priority || 'BALANCED').toUpperCase();
  const defHP = defenderUnit.integrities;

  // Active slots with HP > 0
  const activeSlots = [PartSlot.HEAD, PartSlot.LEFT_ARM, PartSlot.RIGHT_ARM, PartSlot.LEGS, PartSlot.TORSO].filter(
    (slot) => (defHP[slot] || 0) > 0
  );

  if (activeSlots.length === 0) return PartSlot.HEAD;

  if (priority.includes('FASTEST') || priority.includes('SPEED') || priority.includes('AGILE')) {
    if (activeSlots.includes(PartSlot.LEGS)) return PartSlot.LEGS;
  }

  if (priority.includes('PAYLOAD') || priority.includes('DISRUPT') || priority.includes('ARM')) {
    // Target arm with highest payload
    const lPayload = defenderUnit.parts.leftArm?.payload || 0;
    const rPayload = defenderUnit.parts.rightArm?.payload || 0;
    if (lPayload >= rPayload && activeSlots.includes(PartSlot.LEFT_ARM)) return PartSlot.LEFT_ARM;
    if (activeSlots.includes(PartSlot.RIGHT_ARM)) return PartSlot.RIGHT_ARM;
  }

  if (priority.includes('LOWEST_ARMOR') || priority.includes('SNIPER') || priority.includes('WEAK')) {
    // Target slot with lowest remaining HP
    activeSlots.sort((a, b) => defHP[a] - defHP[b]);
    return activeSlots[0];
  }

  // Balanced default: target arms or head
  const weighted = [];
  if (activeSlots.includes(PartSlot.LEFT_ARM)) weighted.push(PartSlot.LEFT_ARM, PartSlot.LEFT_ARM);
  if (activeSlots.includes(PartSlot.RIGHT_ARM)) weighted.push(PartSlot.RIGHT_ARM, PartSlot.RIGHT_ARM);
  if (activeSlots.includes(PartSlot.HEAD)) weighted.push(PartSlot.HEAD);
  if (activeSlots.includes(PartSlot.TORSO)) weighted.push(PartSlot.TORSO);
  if (activeSlots.includes(PartSlot.LEGS)) weighted.push(PartSlot.LEGS);

  return weighted[Math.floor(Math.random() * weighted.length)];
}

/**
 * Evaluate AI unit's choice of command.
 */
export function evaluateAIPartChoice(botUnit, opponentUnit, centerLineTrapActive) {
  // If Overclock Gauge is full (100%), execute Ultimate!
  if (botUnit.overclockGauge >= 100) {
    return { slot: PartSlot.HEAD, isUlt: true };
  }

  const possibleSlots = [];
  if (botUnit.integrities[PartSlot.HEAD] > 0 && botUnit.headCacheRemaining > 0) {
    possibleSlots.push(PartSlot.HEAD);
  }
  if (botUnit.integrities[PartSlot.LEFT_ARM] > 0) {
    possibleSlots.push(PartSlot.LEFT_ARM);
  }
  if (botUnit.integrities[PartSlot.RIGHT_ARM] > 0) {
    possibleSlots.push(PartSlot.RIGHT_ARM);
  }

  if (possibleSlots.length === 0) {
    return { slot: PartSlot.LEGS, isUlt: false }; // fallback tackle
  }

  // Artificer / Trap AI preference: place trap if empty
  const headPart = botUnit.parts.head;
  const headType = parseAttackType(headPart?.type, PartSlot.HEAD);
  if (
    botUnit.chip?.id === 'chip_artificer' &&
    headType === AttackType.TRAP &&
    !centerLineTrapActive &&
    possibleSlots.includes(PartSlot.HEAD)
  ) {
    return { slot: PartSlot.HEAD, isUlt: false };
  }

  // Random choice from surviving offensive weapons
  const chosen = possibleSlots[Math.floor(Math.random() * possibleSlots.length)];
  return { slot: chosen, isUlt: false };
}

/**
 * Medabots-style part targeting with autonomous Head Protection:
 * Based on Chip Level 30 reflex engrams, defender evasion, and attacker precision.
 * Arms, Torso, and Legs radiate/intercept attacks to protect the vulnerable Head.
 */
export function calculateTargetPartWithHeadProtection(attacker, defender, requestedTargetSlot) {
  const defHP = defender.integrities;
  const activeArmsAndTorso = [PartSlot.LEFT_ARM, PartSlot.RIGHT_ARM, PartSlot.TORSO].filter(
    (s) => (defHP[s] || 0) > 0
  );
  const activeLegs = (defHP[PartSlot.LEGS] || 0) > 0;

  // If Head is the only part left, all attacks must hit Head
  if (activeArmsAndTorso.length === 0 && !activeLegs) {
    return { targetSlot: PartSlot.HEAD, wasDiverted: false };
  }

  // Precision / Sniper scaling: Reduces interception, but defender still retains a 20-35% deflection chance!
  const hasSniperBypass = attacker.guaranteedCritNext || attacker.isUlt || attacker.chip?.id === 'chip_orion';
  const defenderEvasion = defender.parts.legs?.packet_loss || 15;
  const attackerPrecision = attacker.selectedActionPart?.precision || 90;

  // If specifically targeting HEAD:
  if (requestedTargetSlot === PartSlot.HEAD) {
    if (activeArmsAndTorso.length > 0) {
      // Autonomous defense reflex (calibrated for Chip Level 30)
      let interceptChance = Math.min(0.90, Math.max(0.35, 0.70 + (defenderEvasion * 0.005) - (attackerPrecision * 0.003)));
      if (hasSniperBypass) {
        interceptChance = Math.max(0.20, interceptChance - 0.45);
      }
      if (Math.random() < interceptChance) {
        const interceptor = activeArmsAndTorso[Math.floor(Math.random() * activeArmsAndTorso.length)];
        return { targetSlot: interceptor, wasDiverted: true };
      }
    }
    return { targetSlot: PartSlot.HEAD, wasDiverted: false };
  }

  // If a specific non-Head slot was requested and is alive:
  if (requestedTargetSlot !== undefined && requestedTargetSlot !== -1 && (defHP[requestedTargetSlot] || 0) > 0) {
    return { targetSlot: requestedTargetSlot, wasDiverted: false };
  }

  // Otherwise, Medabots weighted random distribution:
  // Legs: 35%, Left Arm: 25%, Right Arm: 25%, Torso: 10%, Head: 5%
  const pool = [];
  if (activeLegs) {
    for (let i = 0; i < 35; i++) pool.push(PartSlot.LEGS);
  }
  if ((defHP[PartSlot.LEFT_ARM] || 0) > 0) {
    for (let i = 0; i < 25; i++) pool.push(PartSlot.LEFT_ARM);
  }
  if ((defHP[PartSlot.RIGHT_ARM] || 0) > 0) {
    for (let i = 0; i < 25; i++) pool.push(PartSlot.RIGHT_ARM);
  }
  if ((defHP[PartSlot.TORSO] || 0) > 0) {
    for (let i = 0; i < 10; i++) pool.push(PartSlot.TORSO);
  }
  if ((defHP[PartSlot.HEAD] || 0) > 0) {
    const headWeight = activeArmsAndTorso.length > 0 ? 5 : 50;
    for (let i = 0; i < headWeight; i++) pool.push(PartSlot.HEAD);
  }

  if (pool.length === 0) return { targetSlot: PartSlot.HEAD, wasDiverted: false };
  return { targetSlot: pool[Math.floor(Math.random() * pool.length)], wasDiverted: false };
}

/**
 * Resolve combat clash at Center Line.
 */
export function resolveCenterLineClash({
  attacker,
  defender,
  actionPart,
  isUlt,
  targetSlotOverride,
}) {
  const pwr = actionPart.payload || (isUlt ? 70 : 25);

  // Check Defender Torso Firewall (0 if Torso is 0 HP!)
  const defTorsoHP = defender.integrities[PartSlot.TORSO] || 0;
  let firewall = 0;
  if (defTorsoHP > 0) {
    firewall = defender.parts.torso?.firewall || 8;
    if (defender.overrideGuardActive) {
      firewall += 12;
    }
  }

  let finalPwr = pwr;
  const isCrit = attacker.guaranteedCritNext || isUlt;
  if (attacker.guaranteedCritNext) {
    attacker.guaranteedCritNext = false;
    finalPwr = Math.round(finalPwr * 1.45);
  } else if (isUlt) {
    finalPwr = Math.round(finalPwr * 1.3);
  }

  const damage = Math.max(5, Math.floor(finalPwr - firewall * 0.5));

  // Determine target slot using Medabots Head Protection & Diversion formula
  const { targetSlot, wasDiverted } = calculateTargetPartWithHeadProtection(
    attacker,
    defender,
    targetSlotOverride
  );

  const curHP = defender.integrities[targetSlot] || 0;
  const newHP = Math.max(0, curHP - damage);
  defender.integrities[targetSlot] = newHP;

  // Overclock charges
  if (isUlt) {
    attacker.overclockGauge = 0;
  } else {
    attacker.overclockGauge = Math.min(100, attacker.overclockGauge + 20);
  }
  defender.overclockGauge = Math.min(100, defender.overclockGauge + 25);

  const isHeadDestroyed = (defender.integrities[PartSlot.HEAD] || 0) <= 0;
  const isPartDestroyed = newHP <= 0;

  return {
    damage,
    targetSlot,
    targetSlotName: SlotNames[targetSlot],
    wasDiverted,
    isCrit,
    isUlt,
    isPartDestroyed,
    isHeadDestroyed,
    attackerName: attacker.name,
    defenderName: defender.name,
    actionName: actionPart.name || 'Strike',
  };
}

/**
 * Resolve avatar image URL for an AniBot (preset or blank-slate custom).
 * For blank-slate custom bots, the avatar is derived from the head slot origin chassis.
 */
export function getBotAvatarUrl(botConfig, anibotsList = []) {
  if (!botConfig) return '/images/anibots/SCB-01.jpg';
  if (botConfig.image) return botConfig.image;
  const modelCode = botConfig.model_code || botConfig.modelCode;
  if (modelCode && modelCode !== 'MOD-CUSTOM') {
    return `/images/anibots/${modelCode}.jpg`;
  }

  // Blank-slate custom bot: base avatar on head slot selected
  const headBotName = botConfig.parts?.head?.botName;
  if (headBotName && anibotsList.length > 0) {
    const matched = anibotsList.find((b) => b.name === headBotName);
    if (matched?.image) return matched.image;
    if (matched?.model_code) return `/images/anibots/${matched.model_code}.jpg`;
  }

  return '/images/anibots/SCB-01.jpg';
}

/**
 * Fast headless 1v1 battle simulation for statistical analysis and benchmarking.
 * Simulates full ATB clock speed, limb combat, traps, autonomous defense, and head destruction.
 * Returns: { winner: 'A' | 'B' | 'TIE', ticks: number, hpA: object, hpB: object }
 */
export function simulateHeadlessBattle(botA, chipA, botB, chipB, options = {}) {
  const delta = options.delta || 0.05;
  const maxTicks = options.maxTicks || 2000; // ~100s simulated combat timeout

  const uA = createCombatUnitState(botA, chipA, true);
  const uB = createCombatUnitState(botB, chipB, false);

  const traps = { trapA: null, trapB: null };

  const stepUnit = (unit, opponent, isA) => {
    if (unit.integrities[PartSlot.HEAD] <= 0) return;

    switch (unit.currentPhase) {
      case CombatPhase.WAIT: {
        const legs = unit.parts.legs;
        let clockSpeed = legs?.clock_speed || 1.5;
        if (unit.integrities[PartSlot.LEGS] <= 0) clockSpeed *= 0.4;
        if (unit.chip?.id === 'chip_spark') clockSpeed *= 1.25;

        unit.actionBar = Math.min(100, unit.actionBar + (clockSpeed * 28.0) * delta);

        if (unit.actionBar >= 100) {
          const choice = evaluateAIPartChoice(unit, opponent, Boolean(isA ? traps.trapB : traps.trapA));
          let partData = {};
          if (choice.isUlt) {
            const ult = unit.chip?.ultimate_abilities?.[0] || {};
            partData = {
              name: ult.name || 'Overclock Blitz',
              payload: ult.power || 75,
              type: 'SHOOTING',
              execution_time: 1.2,
              latency: 2.2,
            };
          } else {
            let raw = {};
            if (choice.slot === PartSlot.HEAD) raw = unit.parts.head;
            else if (choice.slot === PartSlot.LEFT_ARM) raw = unit.parts.leftArm;
            else if (choice.slot === PartSlot.RIGHT_ARM) raw = unit.parts.rightArm;
            else raw = unit.parts.legs;

            partData = { ...raw };
            if (choice.slot === PartSlot.HEAD && unit.headCacheRemaining > 0) {
              unit.headCacheRemaining -= 1;
            }
          }

          unit.selectedActionSlot = choice.slot;
          unit.selectedActionPart = partData;
          unit.isUlt = choice.isUlt;
          unit.currentPhase = CombatPhase.RUN;
          unit.trackProgress = 0;
        }
        break;
      }

      case CombatPhase.RUN: {
        const execTime = Math.max(0.8, unit.selectedActionPart?.execution_time || 2.0);
        let runSpeed = 0.8 / execTime;
        if (unit.integrities[PartSlot.LEGS] <= 0) runSpeed *= 0.4;

        unit.trackProgress = Math.min(1.0, unit.trackProgress + runSpeed * delta);
        if (unit.trackProgress >= 1.0) {
          const activeTrap = isA ? traps.trapA : traps.trapB;
          if (activeTrap) {
            const trapDmg = activeTrap.payload || 38;
            unit.integrities[PartSlot.LEGS] = Math.max(0, (unit.integrities[PartSlot.LEGS] || 0) - trapDmg);
            if (isA) traps.trapA = null;
            else traps.trapB = null;
          } else if (!unit.isUlt && (unit.integrities[unit.selectedActionSlot] ?? 0) <= 0) {
            // NO FEATURE: Action aborted because executing part was destroyed mid-transit
          } else {
            const part = unit.selectedActionPart || {};
            const actType = parseAttackType(part.type, unit.selectedActionSlot);

            if (!unit.isUlt && actType === AttackType.TRAP) {
              if (isA) traps.trapB = part;
              else traps.trapA = part;
            } else if (!unit.isUlt && actType === AttackType.SUPPORT && (part.payload || 0) <= 0) {
              unit.guaranteedCritNext = true;
              unit.overclockGauge = Math.min(100, unit.overclockGauge + 30);
            } else {
              const targetSlot = evaluateUtilityAITargetSlot(unit.chip, opponent);
              resolveCenterLineClash({
                attacker: unit,
                defender: opponent,
                actionPart: part,
                isUlt: unit.isUlt,
                targetSlotOverride: targetSlot,
              });
            }
          }

          unit.trackProgress = 1.0;
          unit.currentPhase = CombatPhase.COOLDOWN;
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
        if (unit.trackProgress <= 0.0) {
          unit.trackProgress = 0.0;
          unit.actionBar = 0.0;
          unit.overrideGuardActive = false;
          unit.currentPhase = CombatPhase.WAIT;
        }
        break;
      }

      default:
        break;
    }
  };

  let ticks = 0;
  while (ticks++ < maxTicks) {
    stepUnit(uA, uB, true);
    if (uB.integrities[PartSlot.HEAD] <= 0) {
      return { winner: 'A', ticks, hpA: uA.integrities, hpB: uB.integrities };
    }
    stepUnit(uB, uA, false);
    if (uA.integrities[PartSlot.HEAD] <= 0) {
      return { winner: 'B', ticks, hpA: uA.integrities, hpB: uB.integrities };
    }
  }

  // Timeout tiebreak by head HP then total HP
  const headA = uA.integrities[PartSlot.HEAD] || 0;
  const headB = uB.integrities[PartSlot.HEAD] || 0;
  if (headA > headB) return { winner: 'A', ticks, hpA: uA.integrities, hpB: uB.integrities };
  if (headB > headA) return { winner: 'B', ticks, hpA: uA.integrities, hpB: uB.integrities };
  return { winner: 'TIE', ticks, hpA: uA.integrities, hpB: uB.integrities };
}


