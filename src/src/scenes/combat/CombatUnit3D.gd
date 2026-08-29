# CombatUnit3D.gd
# Manages an individual 3D Anibot combatant in the 3-Phase ATB Relay Arena
class_name CombatUnit3D
extends Node3D

signal phase_changed(unit: CombatUnit3D, new_phase: int)
signal command_ready(unit: CombatUnit3D)
signal reached_center_line(unit: CombatUnit3D)
signal returned_to_base(unit: CombatUnit3D)
signal part_damaged(unit: CombatUnit3D, slot: int, current_hp: int, max_hp: int)
signal unit_defeated(unit: CombatUnit3D)

@export var is_player: bool = true
@export var base_line_x: float = -7.5
@export var center_line_x: float = -1.2

@onready var model: AniBotModel3D = %AniBotModel3D

var unit_name: String = "Anibot"
var chip_id: String = "chip_artificer"
var parts_data: Dictionary = {}

# Current In-Battle State
var current_phase: int = Types.CombatPhase.WAIT
var action_bar: float = 0.0 # 0 to 100
var track_progress: float = 0.0 # 0.0 (base) to 1.0 (center)
var is_active_in_battle: bool = true

var selected_action_part: Dictionary = {}
var selected_action_slot: int = -1

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

func setup_unit(bot_config: Dictionary, is_player_side: bool) -> void:
	is_player = is_player_side
	unit_name = bot_config.get("bot_name", "Training Drone" if not is_player_side else "Genesis-1")
	chip_id = bot_config.get("chip_id", "chip_artificer")
	parts_data = bot_config.get("parts", {})
	
	_calculate_stats_and_hp()
	
	# Position at starting base line
	position.x = base_line_x
	position.y = 0.0
	position.z = 0.0
	rotation_degrees.y = 90.0 if is_player else -90.0
	
	current_phase = Types.CombatPhase.WAIT
	action_bar = randf_range(0.0, 20.0) # initial desync
	
	if not model:
		model = %AniBotModel3D
	if model:
		model.setup_model(bot_config, is_player_side)

func _calculate_stats_and_hp() -> void:
	for slot in [Types.PartSlot.HEAD, Types.PartSlot.TORSO, Types.PartSlot.LEFT_ARM, Types.PartSlot.RIGHT_ARM, Types.PartSlot.LEGS]:
		var slot_key = _slot_to_key(slot)
		var part_ref = parts_data.get(slot_key, {})
		var p_id = part_ref.get("part_id", "")
		var catalog_entry = Types.PARTS_CATALOG.get(p_id, {})
		var cond = part_ref.get("condition", 100.0) / 100.0
		var base_hp = catalog_entry.get("base_integrity", 50)
		var max_hp = int(base_hp * cond)
		
		part_max_integrities[slot] = max_hp
		part_integrities[slot] = max_hp
		
		if slot == Types.PartSlot.HEAD:
			head_cache_remaining = part_ref.get("current_cache", catalog_entry.get("cache", 3))

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
		"selected_action_slot": selected_action_slot
	}

func restore_state(state: Dictionary) -> void:
	if state.is_empty():
		return
	var raw_integrities = state.get("part_integrities", state.get("integrities", part_integrities))
	for k in raw_integrities:
		var slot_int = int(k)
		part_integrities[slot_int] = raw_integrities[k]
		
	var raw_max = state.get("part_max_integrities", part_max_integrities)
	for k in raw_max:
		var slot_int = int(k)
		part_max_integrities[slot_int] = raw_max[k]
		
	head_cache_remaining = state.get("head_cache_remaining", head_cache_remaining)
	overclock_gauge = state.get("overclock_gauge", overclock_gauge)
	action_bar = state.get("action_bar", action_bar)
	current_phase = state.get("current_phase", current_phase)
	track_progress = state.get("track_progress", 0.0)
	position.x = state.get("position_x", base_line_x)
	is_active_in_battle = state.get("is_active_in_battle", true)
	selected_action_part = state.get("selected_action_part", {})
	selected_action_slot = state.get("selected_action_slot", -1)
	
	if part_integrities.get(Types.PartSlot.HEAD, 60) <= 0:
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
	var legs_entry = _get_part_catalog(Types.PartSlot.LEGS)
	var clock_speed = legs_entry.get("clock_speed", 1.5)
	
	if part_integrities[Types.PartSlot.LEGS] <= 0:
		clock_speed *= 0.4
		
	if chip_id == "chip_spark":
		clock_speed *= 1.10
		
	var fill_rate = clock_speed * 32.0
	action_bar += fill_rate * delta
	
	if action_bar >= 100.0:
		action_bar = 100.0
		current_phase = Types.CombatPhase.COMMAND
		phase_changed.emit(self, current_phase)
		command_ready.emit(self)

func _tick_run_phase(delta: float) -> void:
	var run_speed = 0.85
	if part_integrities[Types.PartSlot.LEGS] <= 0:
		run_speed = 0.4
		
	track_progress += run_speed * delta
	position.x = lerp(base_line_x, center_line_x, track_progress)
	
	if track_progress >= 1.0:
		track_progress = 1.0
		position.x = center_line_x
		reached_center_line.emit(self)

func _tick_cooldown_phase(delta: float) -> void:
	var part_latency = selected_action_part.get("latency", 3.0)
	var torso_entry = _get_part_catalog(Types.PartSlot.TORSO)
	var cooling_mult = torso_entry.get("cooling", 1.0)
	
	if chip_id == "chip_orion":
		cooling_mult *= 1.15
		
	var return_speed = (cooling_mult / max(part_latency, 1.0)) * 0.7
	track_progress -= return_speed * delta
	position.x = lerp(base_line_x, center_line_x, track_progress)
	
	action_bar = clampf(track_progress * 100.0, 0.0, 100.0)
	
	if track_progress <= 0.0:
		track_progress = 0.0
		position.x = base_line_x
		action_bar = 0.0
		current_phase = Types.CombatPhase.WAIT
		phase_changed.emit(self, current_phase)
		returned_to_base.emit(self)

func assign_command(slot: int, is_overclock: bool) -> void:
	selected_action_slot = slot
	if is_overclock:
		selected_action_part = {
			"name": "Overclock Ultimate",
			"payload": 65,
			"precision": 95,
			"latency": 3.0,
			"is_ult": true
		}
		overclock_gauge = 0.0
	else:
		selected_action_part = _get_part_catalog(slot)
		if slot == Types.PartSlot.HEAD:
			head_cache_remaining = max(0, head_cache_remaining - 1)
			
	current_phase = Types.CombatPhase.RUN
	phase_changed.emit(self, current_phase)

func take_damage(incoming_payload: int, target_slot: int = -1) -> Dictionary:
	var torso_entry = _get_part_catalog(Types.PartSlot.TORSO)
	var firewall = torso_entry.get("firewall", 8)
	
	var damage = max(int(incoming_payload - (firewall * 0.5)), 5)
	
	if target_slot == -1:
		var valid_slots = []
		for s in [Types.PartSlot.HEAD, Types.PartSlot.LEFT_ARM, Types.PartSlot.RIGHT_ARM, Types.PartSlot.LEGS, Types.PartSlot.TORSO]:
			if part_integrities[s] > 0:
				valid_slots.append(s)
		target_slot = valid_slots[randi() % valid_slots.size()] if valid_slots.size() > 0 else Types.PartSlot.HEAD

	part_integrities[target_slot] = max(0, part_integrities[target_slot] - damage)
	part_damaged.emit(self, target_slot, part_integrities[target_slot], part_max_integrities[target_slot])
	
	var mult = 2.0 if chip_id == "chip_draco" else 1.0
	overclock_gauge = clampf(overclock_gauge + (25.0 * mult), 0.0, 100.0)
	
	var is_destroyed = (part_integrities[target_slot] <= 0)
	var is_head_destroyed = (part_integrities[Types.PartSlot.HEAD] <= 0)
	
	if is_head_destroyed:
		is_active_in_battle = false
		unit_defeated.emit(self)
		if model:
			model.play_defeat()
	else:
		if model:
			model.play_hit_reaction(false)
			
	return {
		"damage": damage,
		"slot_hit": target_slot,
		"destroyed": is_destroyed,
		"head_destroyed": is_head_destroyed
	}

func _get_part_catalog(slot: int) -> Dictionary:
	var slot_key = _slot_to_key(slot)
	var p_id = parts_data.get(slot_key, {}).get("part_id", "")
	return Types.PARTS_CATALOG.get(p_id, {})

func _slot_to_key(slot: int) -> String:
	match slot:
		Types.PartSlot.HEAD: return "head"
		Types.PartSlot.TORSO: return "torso"
		Types.PartSlot.LEFT_ARM: return "left_arm"
		Types.PartSlot.RIGHT_ARM: return "right_arm"
		Types.PartSlot.LEGS: return "legs"
	return "head"
