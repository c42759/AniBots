export interface PartHead {
  id: string;
  name: string;
  slot: 'HEAD';
  type: string;
  integrity: number;
  payload?: number;
  precision?: number;
  execution_time?: number;
  latency?: number;
  weight?: number;
  cache?: number;
  description: string;
}

export interface PartTorso {
  id: string;
  name: string;
  slot: 'TORSO';
  type: string;
  integrity: number;
  max_loadout?: number;
  firewall?: number;
  cooling?: number;
  description: string;
}

export interface PartArm {
  id: string;
  name: string;
  slot: 'LEFT_ARM' | 'RIGHT_ARM';
  type: string;
  integrity: number;
  payload?: number;
  precision?: number;
  execution_time?: number;
  latency?: number;
  weight?: number;
  cache?: number;
  description: string;
}

export interface PartLegs {
  id: string;
  name: string;
  slot: 'LEGS';
  type: string;
  integrity: number;
  clock_speed?: number;
  direct_connect?: number;
  remote_uplink?: number;
  packet_loss?: number;
  protocol?: string;
  description: string;
}

export interface AniBotParts {
  head: PartHead;
  torso: PartTorso;
  left_arm: PartArm;
  right_arm: PartArm;
  legs: PartLegs;
}

export interface AniBot {
  id: string;
  model_code: string;
  name: string;
  series: string;
  archetype: string;
  description: string;
  preferred_chip: string;
  affinity: string;
  affinity_synergy_bonus: string;
  image?: string;
  parts: AniBotParts;
}

export interface PassiveTrait {
  name: string;
  description: string;
}

export interface BaseStats {
  integrity: number;
  target_accuracy: number;
  evasion: number;
  overclock_charge_rate: number;
  compatibility_bonus: string;
}

export interface UltimateAbility {
  skill_id: string;
  name: string;
  unlock_level: number;
  gauge_cost: number;
  power: number;
  description: string;
}

export interface AnimaChip {
  id: string;
  name: string;
  series: string;
  slot: string;
  type: string;
  diode_color: string;
  personality: string;
  personality_engram: string;
  voice_style: string;
  voice_gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | string;
  quote: string;
  affinity: string;
  bonus_text: string;
  target_priority: string;
  starter_frame: string | null;
  image?: string;
  passive_trait: PassiveTrait;
  base_stats: BaseStats;
  ultimate_abilities: UltimateAbility[];
}

export type CategoryMode = 'anibots' | 'chips';
