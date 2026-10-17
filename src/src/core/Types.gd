# Types.gd
# Central data structures, enums, hardware math formulas, and catalog definitions for AniBots
class_name Types
extends RefCounted

enum PartSlot {
	HEAD,
	TORSO,
	LEFT_ARM,
	RIGHT_ARM,
	LEGS
}

enum AttackType {
	SHOOTING,
	MELEE,
	SUPPORT,
	TRAP,
	DEFENSE
}

enum ChipSeries {
	ANTIQUITY,
	KINETIC,
	ASTRAL,
	ANCIENT
}

enum CombatPhase {
	WAIT,       # Charging Action Bar at starting line
	COMMAND,    # Menu open for Handler input
	RUN,        # Sprinting towards center combat line
	COOLDOWN    # Returning from center line to starting line
}

enum TerrainType {
	CITY,       # Paved Asphalt: +10% Bipedal, +25% Wheeled, -20% Aquatic
	RUBBLE,     # Junkyard: -20% Wheeled, +15% Tracks Armor, -30% Aquatic, +15% Multi-Leg
	MUD,        # Swamp/Sand: -15% Bipedal, -40% Wheeled, Tracks/Hover Immune
	FLOODED,    # Water Base: -25% Bipedal, -50% Wheeled, -20% Tracks, +30% Aquatic, Hover Immune
	ROCKY       # Slopes: -10% Bipedal, -30% Wheeled, -40% Aquatic, +25% Multi-Leg, Hover Immune
}

const TERRAIN_NAMES: Dictionary = {
	TerrainType.CITY: "Neo Metropolis Street (Paved Asphalt)",
	TerrainType.RUBBLE: "District 4 Scrap Yard (Rubble)",
	TerrainType.MUD: "Oakhaven Trench (Mud & Sand)",
	TerrainType.FLOODED: "Hydro-Sub Canal (Flooded Arena)",
	TerrainType.ROCKY: "Rust-Ridge Cliffs (Rocky Slopes)"
}

# Base Catalog of Anima Chips (Starters + Zerdata + Fallbacks, extended dynamically from anima_chips.json)
const BASE_CHIPS_CATALOG: Dictionary = {
	"chip_vulpes_zerda": {
		"id": "chip_vulpes_zerda",
		"name": "Vulpes Zerda (G0-004)",
		"series": ChipSeries.ANCIENT,
		"series_str": "ANCIENT",
		"diode_color": "#FFA500",
		"personality": "Perceptive, agile sound scout; intensely loyal partner of Kura Ato",
		"personality_engram": "Fennec Acoustic Scout",
		"quote": "I hear every pulse of their motors... Kura, strike on my signal!",
		"affinity": "AGILITY",
		"bonus_text": "+30% Evasion & Echo Counter on dodged strikes",
		"starter_frame": "Zerdata",
		"target_priority": "FASTEST_ENEMY",
		"passive_trait": {
			"name": "Echo Counter",
			"description": "Detects high-frequency motor vibrations (+30% Evasion and automatic sonic counter on dodge)."
		},
		"ultimates": [
			{"name": "Acoustic Step", "level": 1, "cost": 50, "power": 75, "effect": "Dodges incoming attack and strikes structural weak point"},
			{"name": "Zerda Apex Burst", "level": 10, "cost": 100, "power": 120, "effect": "Executes 4 rapid sonic strikes while immune to damage"}
		]
	},
	"chip_artificer": {
		"id": "chip_artificer",
		"name": "Artificer Chip",
		"series": ChipSeries.ANTIQUITY,
		"series_str": "ANTIQUITY",
		"diode_color": "#E5A93C",
		"personality": "Analytical and methodically calculated system architect",
		"personality_engram": "System Optimizer",
		"quote": "Combat is merely an unoptimized logic routine. Executing system refactor.",
		"affinity": "TRAP",
		"bonus_text": "+10% Trap & Status Efficiency, -20% combo latency",
		"starter_frame": "Genesis-1",
		"target_priority": "BALANCED",
		"passive_trait": {
			"name": "Automated Pipeline",
			"description": "Center-line traps gain +25% trigger radius, and arm attacks have 20% reduced latency."
		},
		"ultimates": [
			{"name": "System Override", "level": 1, "cost": 50, "power": 55, "effect": "Stuns target and resets their action pipeline"},
			{"name": "Master Algorithm", "level": 20, "cost": 100, "power": 110, "effect": "Calculates fatal flaw, disabling strongest arm"}
		]
	},
	"chip_spark": {
		"id": "chip_spark",
		"name": "Spark Chip",
		"series": ChipSeries.KINETIC,
		"series_str": "KINETIC",
		"diode_color": "#00E5FF",
		"personality": "Hyperactive and aggressively fast dynamo",
		"personality_engram": "Hyperactive Speedster",
		"quote": "Faster! Faster! I'm already charged! Let me out there now!",
		"affinity": "SPEED",
		"bonus_text": "+25% Wait Phase Charge Speed & +15% Stun Chance",
		"starter_frame": "Circuit-Breaker",
		"target_priority": "HIGHEST_PAYLOAD",
		"passive_trait": {
			"name": "Overcharged Dynamo",
			"description": "Boosts ATB Wait Phase charging speed by +25% and grants electrical weapons +15% stun chance."
		},
		"ultimates": [
			{"name": "Lightning Blitz", "level": 1, "cost": 50, "power": 65, "effect": "Instant electric strike ignoring evasion"},
			{"name": "Superconductor Overclock", "level": 20, "cost": 100, "power": 105, "effect": "Overclocks all active weapons without latency"}
		]
	},
	"chip_orion": {
		"id": "chip_orion",
		"name": "Orion Chip",
		"series": ChipSeries.ASTRAL,
		"series_str": "ASTRAL",
		"diode_color": "#7C4DFF",
		"personality": "Stoic celestial hunter with pinpoint precision",
		"personality_engram": "Celestial Marksman",
		"quote": "Target weakness isolated. Elevation and wind locked. Executing clean termination.",
		"affinity": "SHOOTING",
		"bonus_text": "+25% Precision & +20% Critical Hit Damage",
		"starter_frame": "Nova-Seeker",
		"target_priority": "LOWEST_ARMOR",
		"passive_trait": {
			"name": "Hunter's Starlight",
			"description": "Grants +25% Precision and +20% Critical Hit damage to long-range shooting parts."
		},
		"ultimates": [
			{"name": "Starlight Piercer", "level": 1, "cost": 50, "power": 75, "effect": "Guaranteed critical hit to enemy Head"},
			{"name": "Supernova Railgun", "level": 20, "cost": 100, "power": 120, "effect": "Relativistic cosmic round penetrating enemy frame"}
		]
	},
	"chip_phalanx": {
		"id": "chip_phalanx",
		"name": "Phalanx Chip",
		"series": ChipSeries.ANTIQUITY,
		"series_str": "ANTIQUITY",
		"diode_color": "#B8860B",
		"personality": "Disciplined Spartan Guardian",
		"personality_engram": "Spartan Guardian",
		"quote": "Shields locked. Formation unbreakable. None shall breach our line.",
		"affinity": "DEFENSE",
		"bonus_text": "+30% Shield Mitigation & Auto-Intercept",
		"starter_frame": "Aegis-Wall",
		"target_priority": "DEFENDER_INTERCEPT",
		"ultimates": [
			{"name": "Aegis Shield Wall", "level": 1, "cost": 50, "power": 60, "effect": "Projects defensive barrier and bashes front-runner"}
		]
	},
	"chip_ronin": {
		"id": "chip_ronin",
		"name": "Ronin Chip",
		"series": ChipSeries.ANTIQUITY,
		"series_str": "ANTIQUITY",
		"diode_color": "#D4AF37",
		"personality": "Philosophical Wanderer",
		"personality_engram": "Philosophical Wanderer",
		"quote": "Steel blade cuts the wind / In the silence of the dawn / One strike ends the path.",
		"affinity": "MELEE",
		"bonus_text": "+15% Evasion & +10% Melee Critical Rate",
		"starter_frame": "Muramasa-X",
		"target_priority": "ONE_ON_ONE_DUEL",
		"ultimates": [
			{"name": "Falling Petal Slash", "level": 1, "cost": 50, "power": 65, "effect": "Lightning-fast iaijutsu strike bypassing evasion"}
		]
	}
}

# Base Catalog of Modular AniParts (Starters + Zerdata + Training Drone, extended from anibots.json)
const BASE_PARTS_CATALOG: Dictionary = {
	# --- Zerdata (Vulpes Zerda G0-004) Parts ---
	"part_head_zerda_radar_ears": {
		"id": "part_head_zerda_radar_ears",
		"name": "Acoustic Dish Ears",
		"slot": PartSlot.HEAD,
		"type": AttackType.SUPPORT,
		"base_integrity": 65,
		"payload": 0,
		"precision": 100,
		"execution_time": 1.2,
		"latency": 2.0,
		"weight": 6,
		"cache": 4,
		"price": 450,
		"description": "Parabolic fennec radar array locking weak points for 100% crit & +30% evasion."
	},
	"part_torso_zerda_core": {
		"id": "part_torso_zerda_core",
		"name": "Echo-Sync Chassis",
		"slot": PartSlot.TORSO,
		"type": AttackType.DEFENSE,
		"base_integrity": 165,
		"max_loadout": 34,
		"firewall": 11,
		"cooling": 2.4,
		"price": 520,
		"description": "Generation-0 heat dispersion ducts and engram synchronization core."
	},
	"part_arm_l_sonic_emitter": {
		"id": "part_arm_l_sonic_emitter",
		"name": "Sonic Pulse Cannon",
		"slot": PartSlot.LEFT_ARM,
		"type": AttackType.SHOOTING,
		"base_integrity": 60,
		"payload": 36,
		"precision": 92,
		"execution_time": 1.6,
		"latency": 2.4,
		"weight": 8,
		"cache": -1,
		"price": 390,
		"description": "Focused acoustic shockwave emitter that disrupts enemy sensors."
	},
	"part_arm_r_resonator_claw": {
		"id": "part_arm_r_resonator_claw",
		"name": "Resonant Strike Claw",
		"slot": PartSlot.RIGHT_ARM,
		"type": AttackType.MELEE,
		"base_integrity": 60,
		"payload": 34,
		"precision": 94,
		"execution_time": 1.4,
		"latency": 2.0,
		"weight": 7,
		"cache": -1,
		"price": 380,
		"description": "High-frequency vibration parrying claw with minimal cooldown."
	},
	"part_legs_zerda_springers": {
		"id": "part_legs_zerda_springers",
		"name": "Vulpine Dash Sprinters",
		"slot": PartSlot.LEGS,
		"type": AttackType.SUPPORT,
		"base_integrity": 95,
		"clock_speed": 2.1,
		"direct_connect": 10,
		"remote_uplink": 10,
		"packet_loss": 24,
		"protocol": "BIPEDAL",
		"price": 420,
		"description": "Agile fennec digitigrade springers engineered for high evasion."
	},

	# --- Artificer / Genesis-1 Parts ---
	"part_head_logic_bomb": {
		"id": "part_head_logic_bomb",
		"name": "Logic Bomb",
		"slot": PartSlot.HEAD,
		"type": AttackType.TRAP,
		"base_integrity": 70,
		"payload": 42,
		"precision": 90,
		"execution_time": 2.2,
		"latency": 3.5,
		"weight": 10,
		"cache": 3,
		"price": 250,
		"description": "Places explosive logic trap on the center combat line."
	},
	"part_arm_l_wrench": {
		"id": "part_arm_l_wrench",
		"name": "Ratchet Wrench",
		"slot": PartSlot.LEFT_ARM,
		"type": AttackType.MELEE,
		"base_integrity": 65,
		"payload": 28,
		"precision": 85,
		"execution_time": 2.0,
		"latency": 2.8,
		"weight": 8,
		"cache": -1,
		"price": 200,
		"description": "Quick, reliable close-range wrench strike."
	},
	"part_arm_r_ratchet": {
		"id": "part_arm_r_ratchet",
		"name": "Heavy Ratchet",
		"slot": PartSlot.RIGHT_ARM,
		"type": AttackType.MELEE,
		"base_integrity": 65,
		"payload": 32,
		"precision": 80,
		"execution_time": 2.2,
		"latency": 3.0,
		"weight": 9,
		"cache": -1,
		"price": 220,
		"description": "Solid concussive blow that dents armor."
	},
	"part_torso_genesis": {
		"id": "part_torso_genesis",
		"name": "Genesis Chassis",
		"slot": PartSlot.TORSO,
		"type": AttackType.DEFENSE,
		"base_integrity": 180,
		"max_loadout": 35,
		"firewall": 12,
		"cooling": 1.5,
		"price": 400,
		"description": "Balanced chassis with solid firewall armor."
	},
	"part_legs_steady_tread": {
		"id": "part_legs_steady_tread",
		"name": "Steady-Tread",
		"slot": PartSlot.LEGS,
		"type": AttackType.SUPPORT,
		"base_integrity": 110,
		"clock_speed": 1.4,
		"direct_connect": 5,
		"remote_uplink": 0,
		"packet_loss": 10,
		"protocol": "BIPEDAL",
		"price": 280,
		"description": "Armored bipedal legs with dependable grip."
	},

	# --- Spark / Circuit-Breaker Parts ---
	"part_head_surge_node": {
		"id": "part_head_surge_node",
		"name": "Surge Node",
		"slot": PartSlot.HEAD,
		"type": AttackType.SHOOTING,
		"base_integrity": 50,
		"payload": 35,
		"precision": 85,
		"execution_time": 1.8,
		"latency": 4.0,
		"weight": 8,
		"cache": 4,
		"price": 300,
		"description": "Fires paralyzing shock that delays target ATB."
	},
	"part_arm_l_static_whip": {
		"id": "part_arm_l_static_whip",
		"name": "Static Whip",
		"slot": PartSlot.LEFT_ARM,
		"type": AttackType.MELEE,
		"base_integrity": 55,
		"payload": 24,
		"precision": 90,
		"execution_time": 1.6,
		"latency": 2.2,
		"weight": 6,
		"cache": -1,
		"price": 280,
		"description": "Ultra-fast electrical whip with minimal latency."
	},
	"part_arm_r_volt_caster": {
		"id": "part_arm_r_volt_caster",
		"name": "Volt Caster",
		"slot": PartSlot.RIGHT_ARM,
		"type": AttackType.SHOOTING,
		"base_integrity": 55,
		"payload": 30,
		"precision": 82,
		"execution_time": 2.0,
		"latency": 3.2,
		"weight": 8,
		"cache": -1,
		"price": 300,
		"description": "Medium-range rapid plasma bolt projector."
	},
	"part_torso_circuit": {
		"id": "part_torso_circuit",
		"name": "Circuit Chassis",
		"slot": PartSlot.TORSO,
		"type": AttackType.DEFENSE,
		"base_integrity": 140,
		"max_loadout": 28,
		"firewall": 8,
		"cooling": 2.2,
		"price": 450,
		"description": "Lightweight chassis optimized for high cooling."
	},
	"part_legs_current_wheels": {
		"id": "part_legs_current_wheels",
		"name": "Current-Wheels",
		"slot": PartSlot.LEGS,
		"type": AttackType.SUPPORT,
		"base_integrity": 80,
		"clock_speed": 2.2,
		"direct_connect": 0,
		"remote_uplink": 5,
		"packet_loss": 20,
		"protocol": "WHEELED",
		"price": 320,
		"description": "Blazing fast wheeled base with high evasion."
	},

	# --- Orion / Nova-Seeker Parts ---
	"part_head_astro_scope": {
		"id": "part_head_astro_scope",
		"name": "Astro-Scope",
		"slot": PartSlot.HEAD,
		"type": AttackType.SUPPORT,
		"base_integrity": 60,
		"payload": 0,
		"precision": 100,
		"execution_time": 1.5,
		"latency": 2.5,
		"weight": 6,
		"cache": 3,
		"price": 350,
		"description": "Locks targeting onto enemy weak spots for 100% crit."
	},
	"part_arm_l_pulsar_rifle": {
		"id": "part_arm_l_pulsar_rifle",
		"name": "Pulsar Rifle",
		"slot": PartSlot.LEFT_ARM,
		"type": AttackType.SHOOTING,
		"base_integrity": 60,
		"payload": 38,
		"precision": 92,
		"execution_time": 3.2,
		"latency": 4.8,
		"weight": 12,
		"cache": -1,
		"price": 380,
		"description": "High-powered laser rifle with high precision."
	},
	"part_arm_r_comet_snipe": {
		"id": "part_arm_r_comet_snipe",
		"name": "Comet Cannon",
		"slot": PartSlot.RIGHT_ARM,
		"type": AttackType.SHOOTING,
		"base_integrity": 60,
		"payload": 48,
		"precision": 88,
		"execution_time": 3.8,
		"latency": 5.5,
		"weight": 14,
		"cache": -1,
		"price": 420,
		"description": "Massive long-range anti-material sniper arm."
	},
	"part_torso_nova": {
		"id": "part_torso_nova",
		"name": "Nova Chassis",
		"slot": PartSlot.TORSO,
		"type": AttackType.DEFENSE,
		"base_integrity": 160,
		"max_loadout": 38,
		"firewall": 10,
		"cooling": 1.8,
		"price": 500,
		"description": "Reinforced chassis with high weight tolerance."
	},
	"part_legs_hover_drive": {
		"id": "part_legs_hover_drive",
		"name": "Hover-Drive",
		"slot": PartSlot.LEGS,
		"type": AttackType.SUPPORT,
		"base_integrity": 95,
		"clock_speed": 1.7,
		"direct_connect": -5,
		"remote_uplink": 15,
		"packet_loss": 12,
		"protocol": "HOVER",
		"price": 380,
		"description": "Anti-grav thrusters ignoring terrain penalties."
	},

	# --- Defense / Guardian Shield Parts ---
	"part_arm_l_aegis_shield": {
		"id": "part_arm_l_aegis_shield",
		"name": "Aegis Tower Shield",
		"slot": PartSlot.LEFT_ARM,
		"type": AttackType.DEFENSE,
		"base_integrity": 110,
		"payload": 15,
		"precision": 95,
		"execution_time": 1.4,
		"latency": 2.4,
		"weight": 12,
		"cache": -1,
		"price": 340,
		"description": "Broadcasts Override Protocol to intercept attacks aimed at allies."
	},

	# --- Training Dummy Parts ---
	"part_head_dummy": {
		"id": "part_head_dummy",
		"name": "Training Sensor",
		"slot": PartSlot.HEAD,
		"type": AttackType.SHOOTING,
		"base_integrity": 45,
		"payload": 15,
		"precision": 75,
		"execution_time": 2.5,
		"latency": 3.5,
		"weight": 5,
		"cache": 2,
		"price": 150,
		"description": "Standard sparring target sensor."
	},
	"part_arm_l_dummy_blunt": {
		"id": "part_arm_l_dummy_blunt",
		"name": "Padded Arm",
		"slot": PartSlot.LEFT_ARM,
		"type": AttackType.MELEE,
		"base_integrity": 40,
		"payload": 16,
		"precision": 75,
		"execution_time": 2.2,
		"latency": 2.8,
		"weight": 5,
		"cache": -1,
		"price": 150,
		"description": "Foam-padded training strike arm."
	},
	"part_arm_r_dummy_blaster": {
		"id": "part_arm_r_dummy_blaster",
		"name": "Paint Blaster",
		"slot": PartSlot.RIGHT_ARM,
		"type": AttackType.SHOOTING,
		"base_integrity": 40,
		"payload": 18,
		"precision": 70,
		"execution_time": 2.6,
		"latency": 3.2,
		"weight": 6,
		"cache": -1,
		"price": 150,
		"description": "Low-power sparring paint projectile."
	},
	"part_torso_dummy": {
		"id": "part_torso_dummy",
		"name": "Steel Practice Frame",
		"slot": PartSlot.TORSO,
		"type": AttackType.DEFENSE,
		"base_integrity": 120,
		"max_loadout": 25,
		"firewall": 5,
		"cooling": 1.0,
		"price": 200,
		"description": "Heavy practice dummy torso."
	},
	"part_legs_dummy": {
		"id": "part_legs_dummy",
		"name": "Fixed Tracks",
		"slot": PartSlot.LEGS,
		"type": AttackType.SUPPORT,
		"base_integrity": 70,
		"clock_speed": 1.2,
		"direct_connect": 0,
		"remote_uplink": 0,
		"packet_loss": 5,
		"protocol": "TRACKS",
		"price": 180,
		"description": "Standard sparring movement treads."
	}
}

static var CHIPS_CATALOG: Dictionary = BASE_CHIPS_CATALOG.duplicate(true)
static var PARTS_CATALOG: Dictionary = BASE_PARTS_CATALOG.duplicate(true)
static var ANIBOTS_FRAMES_CATALOG: Dictionary = {}
static var _catalogs_hydrated: bool = false

static func ensure_catalogs_loaded() -> void:
	if _catalogs_hydrated:
		return
	_catalogs_hydrated = true
	
	# 1. Load anima_chips.json if present
	var chips_path := "res://assets/data/anima_chips.json"
	if FileAccess.file_exists(chips_path):
		var f := FileAccess.open(chips_path, FileAccess.READ)
		if f:
			var parsed = JSON.parse_string(f.get_as_text())
			f.close()
			if typeof(parsed) == TYPE_ARRAY:
				for entry in parsed:
					if typeof(entry) == TYPE_DICTIONARY and entry.has("id"):
						var cid: String = entry["id"]
						var s_str: String = str(entry.get("series", "ANTIQUITY")).to_upper()
						var s_enum: int = ChipSeries.ANTIQUITY
						match s_str:
							"KINETIC": s_enum = ChipSeries.KINETIC
							"ASTRAL": s_enum = ChipSeries.ASTRAL
							"ANCIENT": s_enum = ChipSeries.ANCIENT
						var ults: Array = []
						for u in entry.get("ultimate_abilities", []):
							ults.append({
								"name": u.get("name", "Overclock Blitz"),
								"level": u.get("unlock_level", 1),
								"cost": u.get("gauge_cost", 50),
								"power": u.get("power", 65),
								"effect": u.get("description", "")
							})
						if ults.is_empty():
							ults.append({"name": "Overclock Blitz", "level": 1, "cost": 50, "power": 65, "effect": "High-output core discharge"})
						CHIPS_CATALOG[cid] = {
							"id": cid,
							"name": entry.get("name", cid),
							"series": s_enum,
							"series_str": s_str,
							"diode_color": entry.get("diode_color", "#00E5FF"),
							"personality": entry.get("personality", ""),
							"personality_engram": entry.get("personality_engram", "AI Core"),
							"quote": entry.get("quote", ""),
							"affinity": entry.get("affinity", "MELEE"),
							"bonus_text": entry.get("bonus_text", "+10% Affinity Synergy"),
							"starter_frame": entry.get("starter_frame", "Custom Frame"),
							"target_priority": entry.get("target_priority", "BALANCED"),
							"passive_trait": entry.get("passive_trait", {}),
							"ultimates": ults
						}

	# 2. Load anibots.json (38 frames / 190 parts) if present
	var bots_path := "res://assets/data/anibots.json"
	if FileAccess.file_exists(bots_path):
		var bf := FileAccess.open(bots_path, FileAccess.READ)
		if bf:
			var b_parsed = JSON.parse_string(bf.get_as_text())
			bf.close()
			if typeof(b_parsed) == TYPE_ARRAY:
				for bot_entry in b_parsed:
					if typeof(bot_entry) == TYPE_DICTIONARY and bot_entry.has("id"):
						var bid: String = bot_entry["id"]
						ANIBOTS_FRAMES_CATALOG[bid] = bot_entry
						var b_parts: Dictionary = bot_entry.get("parts", {})
						for slot_key in b_parts:
							var p: Dictionary = b_parts[slot_key]
							if p.has("id"):
								var pid: String = p["id"]
								var slot_enum := _parse_slot_str(str(p.get("slot", slot_key)))
								var atk_enum := _parse_attack_type_str(str(p.get("type", "MELEE")), slot_enum)
								var base_hp: int = int(p.get("integrity", p.get("base_integrity", 60)))
								var pwr: int = int(p.get("payload", 0))
								var calc_price: int = clampi(base_hp * 2 + pwr * 4 + int(p.get("firewall", 0)) * 12, 180, 750)
								PARTS_CATALOG[pid] = {
									"id": pid,
									"name": p.get("name", pid),
									"slot": slot_enum,
									"type": atk_enum,
									"series": bot_entry.get("series", "STANDARD"),
									"frame_name": bot_entry.get("name", "AniBot"),
									"base_integrity": base_hp,
									"payload": pwr,
									"precision": int(p.get("precision", 85)),
									"execution_time": float(p.get("execution_time", 2.0)),
									"latency": float(p.get("latency", 3.0)),
									"weight": int(p.get("weight", 8)),
									"cache": int(p.get("cache", 3 if slot_enum == PartSlot.HEAD else -1)),
									"max_loadout": int(p.get("max_loadout", 34)),
									"firewall": int(p.get("firewall", 10)),
									"cooling": float(p.get("cooling", 1.5)),
									"clock_speed": float(p.get("clock_speed", 1.5)),
									"direct_connect": int(p.get("direct_connect", 0)),
									"remote_uplink": int(p.get("remote_uplink", 0)),
									"packet_loss": int(p.get("packet_loss", 10)),
									"protocol": str(p.get("protocol", "BIPEDAL")),
									"price": calc_price,
									"description": str(p.get("description", "Modular AniPart component."))
								}

static func _parse_slot_str(s: String) -> int:
	match s.to_upper():
		"HEAD": return PartSlot.HEAD
		"TORSO", "CHASSIS": return PartSlot.TORSO
		"LEFT_ARM": return PartSlot.LEFT_ARM
		"RIGHT_ARM": return PartSlot.RIGHT_ARM
		"LEGS": return PartSlot.LEGS
	return PartSlot.HEAD

static func _parse_attack_type_str(t: String, slot_enum: int) -> int:
	match t.to_upper():
		"SHOOTING", "RANGED", "SNIPER": return AttackType.SHOOTING
		"MELEE": return AttackType.MELEE
		"SUPPORT", "LEGS": return AttackType.SUPPORT
		"TRAP": return AttackType.TRAP
		"DEFENSE", "CHASSIS", "SHIELD": return AttackType.DEFENSE
	if slot_enum == PartSlot.TORSO:
		return AttackType.DEFENSE
	if slot_enum == PartSlot.LEGS:
		return AttackType.SUPPORT
	return AttackType.MELEE

# ============================================================================
# AUTHORITATIVE HARDWARE & COMBAT FORMULAS (OVERVIEW.md & PARTS.md)
# ============================================================================

# 1. Condition vs Integrity Scaling (PARTS.md Section 1)
static func calculate_battle_integrity(base_integrity: int, condition_percent: float) -> int:
	if condition_percent <= 0.0:
		return 0 # Bricked: Cannot be equipped
	return maxi(1, int(round(float(base_integrity) * (clampf(condition_percent, 0.0, 100.0) / 100.0))))

# 2. Torso Max Loadout Bandwidth Validation (PARTS.md Section 1)
static func is_build_overweight(head: Dictionary, left_arm: Dictionary, right_arm: Dictionary, torso: Dictionary) -> bool:
	var total_weight: int = int(head.get("weight", 0)) + int(left_arm.get("weight", 0)) + int(right_arm.get("weight", 0))
	return total_weight > int(torso.get("max_loadout", 30))

# 3. Effective Weapon Latency / Cooldown Time (PARTS.md Section 1)
static func calculate_effective_latency(base_latency: float, torso_cooling: float, is_overweight: bool = false) -> float:
	var net_latency: float = maxf(1.0, base_latency - torso_cooling)
	var overweight_multiplier: float = 1.5 if is_overweight else 1.0
	return net_latency * overweight_multiplier

# 4. Anima Chip Affinity Synergy (+10% Stat Boost - PARTS.md Section 5)
static func check_affinity_match(part_attack_type: int, chip_affinity: String) -> bool:
	var aff := chip_affinity.to_upper()
	match part_attack_type:
		AttackType.MELEE:
			return aff in ["MELEE", "DUAL_WIELD", "CRITICAL", "COUNTER", "SPEED", "AGILITY"]
		AttackType.SHOOTING:
			return aff in ["SHOOTING", "SNIPER", "BURST_DAMAGE", "PRECISION", "SPEED"]
		AttackType.DEFENSE:
			return aff in ["DEFENSE", "GUARDIAN", "INTERCEPT", "MARTYR"]
		AttackType.SUPPORT:
			return aff in ["SUPPORT", "CONTROL", "TACTICAL", "COMMAND", "AGILITY", "MOBILITY"]
		AttackType.TRAP:
			return aff in ["TRAP", "CONTROL", "TACTICAL"]
	return false

static func apply_affinity_synergy(part_attack_type: int, chip_affinity: String, base_payload: int, base_precision: int) -> Dictionary:
	var matches: bool = check_affinity_match(part_attack_type, chip_affinity)
	var multiplier: float = 1.10 if matches else 1.0
	return {
		"matches": matches,
		"payload": int(round(float(base_payload) * multiplier)),
		"precision": clampi(int(round(float(base_precision) * multiplier)), 1, 100),
		"overclock_boost": multiplier
	}

# 5. Terrain Interaction Matrix (PARTS.md Section 4)
static func get_terrain_modifiers(protocol_str: String, terrain: int, chip_id: String = "") -> Dictionary:
	var proto := protocol_str.to_upper()
	if chip_id == "chip_pegasus":
		proto = "HOVER" # Celestial Hover negates all terrain penalties
	var speed_mult: float = 1.0
	var evasion_bonus: int = 0
	var armor_bonus: int = 0
	
	match terrain:
		TerrainType.CITY:
			if proto == "BIPEDAL": speed_mult = 1.10
			elif proto == "WHEELED": speed_mult = 1.25
			elif proto == "AQUATIC": speed_mult = 0.80
		TerrainType.RUBBLE:
			if proto == "WHEELED": speed_mult = 0.80
			elif proto == "TRACKS": armor_bonus = 3
			elif proto == "AQUATIC": speed_mult = 0.70
			elif proto == "MULTI_LEG": evasion_bonus = 10
		TerrainType.MUD:
			if proto == "BIPEDAL": speed_mult = 0.85
			elif proto == "WHEELED": speed_mult = 0.60
			# TRACKS and HOVER are immune
		TerrainType.FLOODED:
			if proto == "BIPEDAL": speed_mult = 0.75
			elif proto == "WHEELED": speed_mult = 0.50
			elif proto == "TRACKS": speed_mult = 0.80
			elif proto == "MULTI_LEG": speed_mult = 0.90
			elif proto == "AQUATIC":
				speed_mult = 1.30
				evasion_bonus = 15
		TerrainType.ROCKY:
			if proto == "BIPEDAL": speed_mult = 0.90
			elif proto == "WHEELED": speed_mult = 0.70
			elif proto == "AQUATIC": speed_mult = 0.60
			elif proto == "MULTI_LEG":
				evasion_bonus = 15
				armor_bonus = 4
				
	if chip_id == "chip_ranger" and speed_mult < 1.0:
		speed_mult = 1.0 # Terrain Mastery negates penalties
		
	return {
		"speed_mult": speed_mult,
		"evasion_bonus": evasion_bonus,
		"armor_bonus": armor_bonus
	}

# Character Customization Options
const CUSTOMIZATION_DATA: Dictionary = {
	"hair_styles": [
		{"id": "hair_01", "name": "Spiky Punk"},
		{"id": "hair_02", "name": "Side Part"},
		{"id": "hair_03", "name": "Ponytail"},
		{"id": "hair_04", "name": "Buzz Cut"},
		{"id": "hair_05", "name": "Messy Anime"}
	],
	"hair_colors": [
		{"name": "Midnight Black", "color": Color("#1A1A1A")},
		{"name": "Chestnut Brown", "color": Color("#5D4037")},
		{"name": "Golden Blonde", "color": Color("#FBC02D")},
		{"name": "Crimson Red", "color": Color("#D32F2F")},
		{"name": "Neon Cyan", "color": Color("#00BCD4")},
		{"name": "Electric Purple", "color": Color("#7B1FA2")},
		{"name": "Silver Ash", "color": Color("#CFD8DC")}
	],
	"skin_colors": [
		{"name": "Fair", "color": Color("#FFDFC4")},
		{"name": "Peach", "color": Color("#F0D5BE")},
		{"name": "Warm Sand", "color": Color("#E0AC69")},
		{"name": "Bronze", "color": Color("#C68642")},
		{"name": "Deep Mocha", "color": Color("#8D5524")},
		{"name": "Espresso", "color": Color("#3D2314")}
	],
	"shirt_styles": [
		{"id": "shirt_tshirt", "name": "Classic T-Shirt"},
		{"id": "shirt_jacket", "name": "Handler Bomber Jacket"},
		{"id": "shirt_hoodie", "name": "Urban Tech Hoodie"}
	],
	"shirt_colors": [
		{"name": "Cobalt Blue", "color": Color("#1976D2")},
		{"name": "Crimson", "color": Color("#C62828")},
		{"name": "Forest Green", "color": Color("#2E7D32")},
		{"name": "Jet Black", "color": Color("#212121")},
		{"name": "Solar Orange", "color": Color("#EF6C00")},
		{"name": "Pure White", "color": Color("#ECEFF1")}
	],
	"bottom_styles": [
		{"id": "bottom_shorts", "name": "Athletic Shorts"},
		{"id": "bottom_cargo", "name": "Tactical Cargo"},
		{"id": "bottom_jeans", "name": "Fitted Denim"}
	],
	"bottom_colors": [
		{"name": "Slate Grey", "color": Color("#37474F")},
		{"name": "Navy Blue", "color": Color("#1A237E")},
		{"name": "Olive Drab", "color": Color("#33691E")},
		{"name": "Charcoal", "color": Color("#263238")},
		{"name": "Khaki Sand", "color": Color("#8D6E63")}
	],
	"shoe_styles": [
		{"id": "shoes_sneakers", "name": "High-Top Sneakers"},
		{"id": "shoes_boots", "name": "Combat Boots"},
		{"id": "shoes_sandals", "name": "Tech Runners"}
	],
	"shoe_colors": [
		{"name": "Clean White", "color": Color("#FAFAFA")},
		{"name": "Shadow Black", "color": Color("#212121")},
		{"name": "Vibrant Red", "color": Color("#E53935")},
		{"name": "Electric Yellow", "color": Color("#FDD835")},
		{"name": "Teal Blue", "color": Color("#00897B")}
	]
}
