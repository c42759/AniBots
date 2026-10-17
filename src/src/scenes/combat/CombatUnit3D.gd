# CombatUnit3D.gd
# Manages an individual 3D AniBot combatant in the 3-Phase ATB Relay Arena
# Implements OVERVIEW.md & PARTS.md formulas:
# - Condition vs Integrity scaling
# - Torso Max Loadout Overweight (+50% Cooldown Latency) & Torso Rupture (0 HP loses Firewall & Cooling, Arms stay usable)
# - Leg Mobility Protocols & Terrain Interaction Matrix (0 HP = 40% Crippled crawl speed)
# - Anima Chip Affinity Synergy (+10% Payload & Precision)
# - Autonomous Utility AI Target Priority Matrix + Cached (SHOOTING) vs Dynamic (MELEE) Lock-On
class_name CombatUnit3D
extends Node3D

signal phase_changed(unit: CombatUnit3D, new_phase: int)
signal command_ready(unit: CombatUnit3D)
signal reached_center_line(unit: CombatUnit3D)
signal returned_to_base(unit: CombatUnit3D)
signal part_damaged(unit: CombatUnit3D, slot: int, current_hp: int, max_hp: int)
signal unit_defeated(unit: CombatUnit3D)

@export var is_player: bool = true
@export var base_line_x: float = -6.2
@export var center_line_x: float = -1.2

@onready var model: AniBotModel3D = %AniBotModel3D

var unit_name: String = "Anibot"
var chip_id: String = "chip_artificer"
var parts_data: Dictionary = {}
var arena_terrain: int = Types.TerrainType.CITY

# Current In-Battle State
var current_phase: int = Types.CombatPhase.WAIT
var action_bar: float = 0.0 # 0 to 100
var track_progress: float = 0.0 # 0.0 (base) to 1.0 (center)
var is_active_in_battle: bool = true

var selected_action_part: Dictionary = {}
var selected_action_slot: int = -1
var cached_target_slot: int = -1 # Used for SHOOTING Wait-Phase Cached Lock-On
var guaranteed_crit_next: bool = false # Set by SUPPORT scanners (e.g. Astro-Scope, Zenith Cowl)
var override_guard_active: bool = false # Set by DEFENSE Shields (Override Protocol)

# Part Dynamic Integrities (HP)
var part_integrities: Dictionary = {
	Types.PartSlot.HEAD: 60,
	Types.PartSlot.TORSO: 150,
	Types.PartSlot.LEFT_ARM: 50,
	Types.PartSlot.RIGHT_ARM: 50,
	Types.PartSlot.LEGS: 90
}
var part_max_integrities: Dictionary = {}
var head_cache_remaining: int = 3
var overclock_gauge: float = 0.0 # 0 to 100

func setup_unit(bot_config: Dictionary, is_player_side: bool, terrain: int = Types.TerrainType.CITY) -> void:
	Types.ensure_catalogs_loaded()
	is_player = is_player_side
	arena_terrain = terrain
	unit_name = bot_config.get("bot_name", "Training Drone" if not is_player_side else "Genesis-1")
	chip_id = bot_config.get("chip_id", "chip_artificer")
	parts_data = bot_config.get("parts", {})
	
	_calculate_stats_and_hp()
	
	position.x = base_line_x
	position.y = 0.0
	position.z = 0.0
	rotation_degrees.y = 90.0 if is_player else -90.0
	
	current_phase = Types.CombatPhase.WAIT
	action_bar = randf_range(0.0, 20.0)
	guaranteed_crit_next = false
	override_guard_active = false
	cached_target_slot = -1
	
	if not model:
		model = %AniBotModel3D
	if model:
		model.setup_model(bot_config, is_player_side)

func _calculate_stats_and_hp() -> void:
	for slot in [Types.PartSlot.HEAD, Types.PartSlot.TORSO, Types.PartSlot.LEFT_ARM, Types.PartSlot.RIGHT_ARM, Types.PartSlot.LEGS]:
		var slot_key := _slot_to_key(slot)
		var part_ref: Dictionary = parts_data.get(slot_key, {})
		var p_id: String = part_ref.get("part_id", "")
		var catalog_entry: Dictionary = Types.PARTS_CATALOG.get(p_id, {})
		var cond: float = float(part_ref.get("condition", 100.0))
		var base_hp: int = int(catalog_entry.get("base_integrity", 50))
		var max_hp: int = Types.calculate_battle_integrity(base_hp, cond)
		
		part_max_integrities[slot] = max_hp
		part_integrities[slot] = max_hp
		
		if slot == Types.PartSlot.HEAD:
			head_cache_remaining = int(part_ref.get("current_cache", catalog_entry.get("cache", 3)))

func is_overweight() -> bool:
	var h := _get_part_catalog(Types.PartSlot.HEAD)
	var la := _get_part_catalog(Types.PartSlot.LEFT_ARM)
	var ra := _get_part_catalog(Types.PartSlot.RIGHT_ARM)
	var t := _get_part_catalog(Types.PartSlot.TORSO)
	return Types.is_build_overweight(h, la, ra, t)

func get_effective_firewall() -> int:
	# OVERVIEW.md: If Torso is destroyed (0 HP), loses Firewall armor mitigation for remainder of battle
	if int(part_integrities.get(Types.PartSlot.TORSO, 0)) <= 0:
		return 0
	var torso_entry := _get_part_catalog(Types.PartSlot.TORSO)
	var legs_entry := _get_part_catalog(Types.PartSlot.LEGS)
	var t_mod := Types.get_terrain_modifiers(str(legs_entry.get("protocol", "BIPEDAL")), arena_terrain, chip_id)
	var base_fw := int(torso_entry.get("firewall", 8)) + int(t_mod.get("armor_bonus", 0))
	if override_guard_active:
		base_fw += 12
	return base_fw

func get_effective_cooling() -> float:
	# OVERVIEW.md: If Torso is destroyed (0 HP), loses Cooling bonuses for remainder of battle
	if int(part_integrities.get(Types.PartSlot.TORSO, 0)) <= 0:
		return 0.0
	var torso_entry := _get_part_catalog(Types.PartSlot.TORSO)
	var cool := float(torso_entry.get("cooling", 1.0))
	if chip_id == "chip_torrent":
		cool *= 1.4
	return cool

func get_effective_evasion() -> int:
	if int(part_integrities.get(Types.PartSlot.LEGS, 0)) <= 0:
		return 0
	var legs_entry := _get_part_catalog(Types.PartSlot.LEGS)
	var t_mod := Types.get_terrain_modifiers(str(legs_entry.get("protocol", "BIPEDAL")), arena_terrain, chip_id)
	var eva := int(legs_entry.get("packet_loss", 10)) + int(t_mod.get("evasion_bonus", 0))
	if chip_id == "chip_vulpes_zerda":
		eva += 20
	elif chip_id == "chip_shinobi" and current_phase == Types.CombatPhase.RUN:
		eva += 25
	return clampi(eva, 0, 65)

# --- Autonomous Utility AI Target Selection (OVERVIEW.md Section: Targeting & Autonomous Utility AI) ---
func evaluate_utility_ai_target_slot(opponent: CombatUnit3D) -> int:
	var chip_info: Dictionary = Types.CHIPS_CATALOG.get(chip_id, {})
	var priority: String = str(chip_info.get("target_priority", "BALANCED")).to_upper()
	
	var best_slot: int = Types.PartSlot.HEAD
	var best_score: float = -9999.0
	
	for slot in [Types.PartSlot.HEAD, Types.PartSlot.LEFT_ARM, Types.PartSlot.RIGHT_ARM, Types.PartSlot.LEGS, Types.PartSlot.TORSO]:
		var hp: int = int(opponent.part_integrities.get(slot, 0))
		if hp <= 0:
			continue
		var max_hp: int = maxi(1, int(opponent.part_max_integrities.get(slot, 50)))
		var hp_ratio: float = float(hp) / float(max_hp)
		var opp_part_cat: Dictionary = opponent._get_part_catalog(slot)
		var opp_payload: float = float(opp_part_cat.get("payload", 0))
		
		var score: float = randf_range(0.0, 15.0)
		
		match priority:
			"LOWEST_ARMOR", "LOWEST_INTEGRITY", "VULNERABLE_PARTS":
				# Sniper/Orion logic: Eliminates weakest/lowest HP component or Head
				score += (1.0 - hp_ratio) * 60.0
				if slot == Types.PartSlot.HEAD:
					score += 25.0
			"HIGHEST_PAYLOAD", "HIGHEST_THREAT":
				# Spark/Aggressive logic: Targets high-damage offensive arms/head
				score += opp_payload * 1.4
			"FASTEST_ENEMY", "RUNNING_TARGETS":
				# Disrupts mobility Legs or Head
				if slot == Types.PartSlot.LEGS:
					score += 45.0
				elif slot == Types.PartSlot.HEAD:
					score += 25.0
			"HIGHEST_ARMOR", "HIGHEST_HP":
				if slot == Types.PartSlot.TORSO:
					score += 40.0
			_:
				if slot == Types.PartSlot.HEAD:
					score += 22.0
				elif slot == Types.PartSlot.LEFT_ARM or slot == Types.PartSlot.RIGHT_ARM:
					score += 18.0
					
		if score > best_score:
			best_score = score
			best_slot = slot
			
	return best_slot

func get_broken_slots() -> Array:
	var broken: Array = []
	for slot in [Types.PartSlot.HEAD, Types.PartSlot.TORSO, Types.PartSlot.LEFT_ARM, Types.PartSlot.RIGHT_ARM, Types.PartSlot.LEGS]:
		if int(part_integrities.get(slot, 0)) <= 0:
			broken.append(slot)
	return broken

func export_state() -> Dictionary:
	return {
		"unit_name": unit_name,
		"chip_id": chip_id,
		"parts_data": parts_data,
		"part_integrities": part_integrities.duplicate(),
		"part_max_integrities": part_max_integrities.duplicate(),
		"head_cache_remaining": head_cache_remaining,
		"overclock_gauge": overclock_gauge,
		"action_bar": action_bar,
		"current_phase": current_phase,
		"track_progress": track_progress,
		"position_x": position.x,
		"is_active_in_battle": is_active_in_battle,
		"selected_action_part": selected_action_part,
		"selected_action_slot": selected_action_slot,
		"cached_target_slot": cached_target_slot,
		"guaranteed_crit_next": guaranteed_crit_next,
		"override_guard_active": override_guard_active
	}

func restore_state(state: Dictionary) -> void:
	if state.is_empty():
		return
	var raw_integrities: Dictionary = state.get("part_integrities", state.get("integrities", part_integrities))
	for k in raw_integrities:
		var slot_int := int(k)
		part_integrities[slot_int] = int(raw_integrities[k])
		
	var raw_max: Dictionary = state.get("part_max_integrities", part_max_integrities)
	for k in raw_max:
		var slot_int := int(k)
		part_max_integrities[slot_int] = int(raw_max[k])
		
	head_cache_remaining = int(state.get("head_cache_remaining", head_cache_remaining))
	overclock_gauge = float(state.get("overclock_gauge", overclock_gauge))
	action_bar = float(state.get("action_bar", action_bar))
	current_phase = int(state.get("current_phase", current_phase))
	track_progress = float(state.get("track_progress", 0.0))
	position.x = float(state.get("position_x", base_line_x))
	is_active_in_battle = bool(state.get("is_active_in_battle", true))
	selected_action_part = state.get("selected_action_part", {})
	selected_action_slot = int(state.get("selected_action_slot", -1))
	cached_target_slot = int(state.get("cached_target_slot", -1))
	guaranteed_crit_next = bool(state.get("guaranteed_crit_next", false))
	override_guard_active = bool(state.get("override_guard_active", false))
	
	if int(part_integrities.get(Types.PartSlot.HEAD, 60)) <= 0:
		is_active_in_battle = false
		if model:
			model.play_defeat()

func update_combat_tick(delta: float) -> void:
	if not is_active_in_battle:
		return

	match current_phase:
		Types.CombatPhase.WAIT:
			_tick_wait_phase(delta)
		Types.CombatPhase.COMMAND:
			pass
		Types.CombatPhase.RUN:
			_tick_run_phase(delta)
		Types.CombatPhase.COOLDOWN:
			_tick_cooldown_phase(delta)

func _tick_wait_phase(delta: float) -> void:
	override_guard_active = false
	var legs_entry := _get_part_catalog(Types.PartSlot.LEGS)
	var clock_speed := float(legs_entry.get("clock_speed", 1.5))
	var t_mod := Types.get_terrain_modifiers(str(legs_entry.get("protocol", "BIPEDAL")), arena_terrain, chip_id)
	clock_speed *= float(t_mod.get("speed_mult", 1.0))
	
	if int(part_integrities.get(Types.PartSlot.LEGS, 0)) <= 0:
		clock_speed *= 0.4 # Crippled crawl speed (PARTS.md Section 1)
		
	if chip_id == "chip_spark":
		clock_speed *= 1.25 # Overcharged Dynamo
	elif chip_id == "chip_draco":
		clock_speed *= 0.85
		
	var fill_rate := clock_speed * 32.0
	action_bar += fill_rate * delta
	
	if action_bar >= 100.0:
		action_bar = 100.0
		current_phase = Types.CombatPhase.COMMAND
		phase_changed.emit(self, current_phase)
		command_ready.emit(self)

func _tick_run_phase(delta: float) -> void:
	var exec_time := maxf(0.8, float(selected_action_part.get("execution_time", 2.0)))
	var run_speed := 1.7 / exec_time
	var legs_entry := _get_part_catalog(Types.PartSlot.LEGS)
	var t_mod := Types.get_terrain_modifiers(str(legs_entry.get("protocol", "BIPEDAL")), arena_terrain, chip_id)
	run_speed *= float(t_mod.get("speed_mult", 1.0))
	
	if int(part_integrities.get(Types.PartSlot.LEGS, 0)) <= 0:
		run_speed *= 0.4
		
	track_progress += run_speed * delta
	position.x = lerp(base_line_x, center_line_x, track_progress)
	
	if track_progress >= 1.0:
		track_progress = 1.0
		position.x = center_line_x
		reached_center_line.emit(self)

func _tick_cooldown_phase(delta: float) -> void:
	var base_latency := float(selected_action_part.get("latency", 3.0))
	var eff_cooling := get_effective_cooling()
	var eff_latency := Types.calculate_effective_latency(base_latency, eff_cooling, is_overweight())
	
	var return_speed := 1.8 / maxf(1.0, eff_latency)
	if int(part_integrities.get(Types.PartSlot.LEGS, 0)) <= 0:
		return_speed *= 0.5
		
	track_progress -= return_speed * delta
	position.x = lerp(base_line_x, center_line_x, track_progress)
	
	action_bar = clampf(track_progress * 100.0, 0.0, 100.0)
	
	if track_progress <= 0.0:
		track_progress = 0.0
		position.x = base_line_x
		action_bar = 0.0
		override_guard_active = false
		current_phase = Types.CombatPhase.WAIT
		phase_changed.emit(self, current_phase)
		returned_to_base.emit(self)

func assign_command(slot: int, is_overclock: bool, opponent: CombatUnit3D = null) -> void:
	selected_action_slot = slot
	var chip_info: Dictionary = Types.CHIPS_CATALOG.get(chip_id, {})
	var chip_aff: String = str(chip_info.get("affinity", "MELEE"))
	
	if is_overclock:
		var ults: Array = chip_info.get("ultimates", [])
		var ult_name := "Overclock Blitz"
		var ult_pwr := 70
		if ults.size() > 0:
			ult_name = str(ults[0].get("name", "Overclock Blitz"))
			ult_pwr = maxi(55, int(ults[0].get("power", 70)))
		selected_action_part = {
			"name": ult_name,
			"type": Types.AttackType.SHOOTING,
			"payload": ult_pwr,
			"precision": 100,
			"execution_time": 1.4,
			"latency": 2.2,
			"is_ult": true
		}
		overclock_gauge = 0.0
	else:
		var raw_part := _get_part_catalog(slot).duplicate()
		var atk_type := int(raw_part.get("type", Types.AttackType.MELEE))
		var legs_cat := _get_part_catalog(Types.PartSlot.LEGS)
		var base_pwr := int(raw_part.get("payload", 25))
		if atk_type == Types.AttackType.MELEE:
			base_pwr = maxi(0, base_pwr + int(legs_cat.get("direct_connect", 0)))
		elif atk_type == Types.AttackType.SHOOTING:
			base_pwr = maxi(0, base_pwr + int(legs_cat.get("remote_uplink", 0)))
			
		var syn := Types.apply_affinity_synergy(atk_type, chip_aff, base_pwr, int(raw_part.get("precision", 85)))
		raw_part["payload"] = syn["payload"]
		raw_part["precision"] = syn["precision"]
		selected_action_part = raw_part
		
		if slot == Types.PartSlot.HEAD:
			head_cache_remaining = maxi(0, head_cache_remaining - 1)
			
	# Target Caching Logic (PARTS.md Section 2):
	# SHOOTING locks target at Wait Phase completion; MELEE evaluates dynamically at center line
	if opponent:
		if int(selected_action_part.get("type", Types.AttackType.MELEE)) == Types.AttackType.SHOOTING:
			cached_target_slot = evaluate_utility_ai_target_slot(opponent)
		else:
			cached_target_slot = -1
			
	if int(selected_action_part.get("type", Types.AttackType.MELEE)) == Types.AttackType.DEFENSE:
		override_guard_active = true
		SignalBus.combat_override_activated.emit(unit_name)
		
	current_phase = Types.CombatPhase.RUN
	phase_changed.emit(self, current_phase)

func _get_part_catalog(slot: int) -> Dictionary:
	var slot_key := _slot_to_key(slot)
	var p_id: String = parts_data.get(slot_key, {}).get("part_id", "")
	return Types.PARTS_CATALOG.get(p_id, {})

func _slot_to_key(slot: int) -> String:
	match slot:
		Types.PartSlot.HEAD: return "head"
		Types.PartSlot.TORSO: return "torso"
		Types.PartSlot.LEFT_ARM: return "left_arm"
		Types.PartSlot.RIGHT_ARM: return "right_arm"
		Types.PartSlot.LEGS: return "legs"
	return "head"
