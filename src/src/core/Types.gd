# Types.gd
# Central data structures, enums, and catalog definitions for AniBots
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
	ASTRAL
}

enum CombatPhase {
	WAIT,       # Charging Action Bar at starting line
	COMMAND,    # Menu open for Handler input
	RUN,        # Sprinting towards center combat line
	COOLDOWN    # Returning from center line to starting line
}

# Catalog of Anima Chips
const CHIPS_CATALOG: Dictionary = {
	"chip_artificer": {
		"id": "chip_artificer",
		"name": "Artificer Chip",
		"series": ChipSeries.ANTIQUITY,
		"personality": "Analytical and methodically calculated",
		"affinity": "TRAP",
		"bonus_text": "+10% Trap & Status Efficiency",
		"starter_frame": "Genesis-1",
		"target_priority": "BALANCED",
		"ultimates": [
			{"name": "System Override", "level": 1, "cost": 50, "power": 45, "effect": "Stuns target and delays ATB"}
		]
	},
	"chip_spark": {
		"id": "chip_spark",
		"name": "Spark Chip",
		"series": ChipSeries.KINETIC,
		"personality": "Hyperactive and aggressively fast",
		"affinity": "SPEED",
		"bonus_text": "+10% Wait Phase Charge Speed",
		"starter_frame": "Circuit-Breaker",
		"target_priority": "HIGHEST_PAYLOAD",
		"ultimates": [
			{"name": "Lightning Blitz", "level": 1, "cost": 50, "power": 60, "effect": "Instant strike ignoring evasion"}
		]
	},
	"chip_orion": {
		"id": "chip_orion",
		"name": "Orion Chip",
		"series": ChipSeries.ASTRAL,
		"personality": "Stoic hunter with pinpoint precision",
		"affinity": "SNIPER",
		"bonus_text": "+15% Critical Accuracy Bonus",
		"starter_frame": "Nova-Seeker",
		"target_priority": "LOWEST_ARMOR",
		"ultimates": [
			{"name": "Starlight Piercer", "level": 1, "cost": 50, "power": 75, "effect": "Guaranteed critical hit to Head"}
		]
	}
}

# Catalog of Modular AniParts
const PARTS_CATALOG: Dictionary = {
	# --- Artificer / Genesis-1 Parts ---
	"part_head_logic_bomb": {
		"id": "part_head_logic_bomb",
		"name": "Logic Bomb",
		"slot": PartSlot.HEAD,
		"type": AttackType.TRAP,
		"base_integrity": 70,
		"payload": 40,
		"precision": 90,
		"execution_time": 2.2,
		"latency": 3.5,
		"weight": 10,
		"cache": 3,
		"description": "Places explosive logic trap on center line."
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
		"description": "Anti-grav thrusters ignoring terrain penalties."
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
		"description": "Standard sparring movement treads."
	},

	# --- Compatibility Aliases ---
	"part_head_artificer": {
		"id": "part_head_logic_bomb",
		"name": "Logic Bomb",
		"slot": PartSlot.HEAD,
		"type": AttackType.TRAP,
		"base_integrity": 70,
		"payload": 40,
		"precision": 90,
		"execution_time": 2.2,
		"latency": 3.5,
		"weight": 10,
		"cache": 3,
		"description": "Places explosive logic trap on center line."
	},
	"part_head_duelist": {
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
		"description": "Fires paralyzing shock that delays target ATB."
	},
	"part_torso_artificer": {
		"id": "part_torso_genesis",
		"name": "Genesis Chassis",
		"slot": PartSlot.TORSO,
		"type": AttackType.DEFENSE,
		"base_integrity": 180,
		"max_loadout": 35,
		"firewall": 12,
		"cooling": 1.5,
		"description": "Balanced chassis with solid firewall armor."
	},
	"part_torso_duelist": {
		"id": "part_torso_circuit",
		"name": "Circuit Chassis",
		"slot": PartSlot.TORSO,
		"type": AttackType.DEFENSE,
		"base_integrity": 140,
		"max_loadout": 28,
		"firewall": 8,
		"cooling": 2.2,
		"description": "Lightweight chassis optimized for high cooling."
	},
	"part_arm_l_artificer": {
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
		"description": "Quick, reliable close-range wrench strike."
	},
	"part_arm_l_duelist": {
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
		"description": "Ultra-fast electrical whip with minimal latency."
	},
	"part_arm_r_artificer": {
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
		"description": "Solid concussive blow that dents armor."
	},
	"part_arm_r_duelist": {
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
		"description": "Medium-range rapid plasma bolt projector."
	},
	"part_legs_artificer": {
		"id": "part_legs_steady_tread",
		"name": "Steady-Tread",
		"slot": PartSlot.LEGS,
		"type": AttackType.SUPPORT,
		"base_integrity": 110,
		"clock_speed": 1.4,
		"protocol": "BIPEDAL",
		"description": "Armored bipedal legs with dependable grip."
	},
	"part_legs_duelist": {
		"id": "part_legs_current_wheels",
		"name": "Current-Wheels",
		"slot": PartSlot.LEGS,
		"type": AttackType.SUPPORT,
		"base_integrity": 80,
		"clock_speed": 2.2,
		"protocol": "WHEELED",
		"description": "Blazing fast wheeled base with high evasion."
	}
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
