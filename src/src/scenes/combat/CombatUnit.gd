# CombatUnit.gd
# Manages an individual Anibot combatant in the 3-Phase ATB Relay Arena
class_name CombatUnit
extends Node2D

signal phase_changed(unit: CombatUnit, new_phase: int)
signal command_ready(unit: CombatUnit)
signal reached_center_line(unit: CombatUnit)
signal returned_to_base(unit: CombatUnit)
signal part_damaged(unit: CombatUnit, slot: int, current_hp: int, max_hp: int)
signal unit_defeated(unit: CombatUnit)

@export var is_player: bool = true
@export var base_line_x: float = 200.0
@export var center_line_x: float = 640.0

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
	position.y = 380.0
	current_phase = Types.CombatPhase.WAIT
	action_bar = randf_range(0.0, 20.0) # small initial desync
	queue_redraw()

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

func update_combat_tick(delta: float) -> void:
	if not is_active_in_battle:
		return

	match current_phase:
		Types.CombatPhase.WAIT:
			_tick_wait_phase(delta)
		Types.CombatPhase.COMMAND:
			# Waiting for player UI input or AI choice
			pass
		Types.CombatPhase.RUN:
			_tick_run_phase(delta)
		Types.CombatPhase.COOLDOWN:
			_tick_cooldown_phase(delta)

func _tick_wait_phase(delta: float) -> void:
	var legs_entry = _get_part_catalog(Types.PartSlot.LEGS)
	var clock_speed = legs_entry.get("clock_speed", 1.5)
	
	# If legs destroyed, clock speed is halved
	if part_integrities[Types.PartSlot.LEGS] <= 0:
		clock_speed *= 0.4
		
	# Chip bonus check
	if chip_id == "chip_spark":
		clock_speed *= 1.10
		
	var fill_rate = clock_speed * 32.0
	action_bar += fill_rate * delta
	
	if action_bar >= 100.0:
		action_bar = 100.0
		current_phase = Types.CombatPhase.COMMAND
		phase_changed.emit(self, current_phase)
		command_ready.emit(self)
	
	queue_redraw()

func _tick_run_phase(delta: float) -> void:
	var legs_entry = _get_part_catalog(Types.PartSlot.LEGS)
	var run_speed = 0.8
	if part_integrities[Types.PartSlot.LEGS] <= 0:
		run_speed = 0.35 # Crippled run speed
		
	track_progress += run_speed * delta
	
	# Interpolate position on arena track
	position.x = lerp(base_line_x, center_line_x, track_progress)
	
	if track_progress >= 1.0:
		track_progress = 1.0
		position.x = center_line_x
		reached_center_line.emit(self)
	
	queue_redraw()

func _tick_cooldown_phase(delta: float) -> void:
	var part_latency = selected_action_part.get("latency", 3.0)
	var torso_entry = _get_part_catalog(Types.PartSlot.TORSO)
	var cooling = torso_entry.get("cooling", 1.0)
	
	var return_speed = (1.2 / maxf(part_latency - (cooling * 0.4), 0.8))
	track_progress -= return_speed * delta
	
	position.x = lerp(base_line_x, center_line_x, track_progress)
	
	if track_progress <= 0.0:
		track_progress = 0.0
		position.x = base_line_x
		action_bar = 0.0
		current_phase = Types.CombatPhase.WAIT
		phase_changed.emit(self, current_phase)
		returned_to_base.emit(self)
		
	queue_redraw()

func assign_command(slot: int, is_overclock: bool = false) -> void:
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
	
	# Effective damage with armor mitigation
	var damage = max(int(incoming_payload - (firewall * 0.5)), 5)
	
	# Determine target slot if random
	if target_slot == -1:
		var valid_slots = []
		for s in [Types.PartSlot.HEAD, Types.PartSlot.LEFT_ARM, Types.PartSlot.RIGHT_ARM, Types.PartSlot.LEGS, Types.PartSlot.TORSO]:
			if part_integrities[s] > 0:
				valid_slots.append(s)
		target_slot = valid_slots[randi() % valid_slots.size()] if valid_slots.size() > 0 else Types.PartSlot.HEAD

	part_integrities[target_slot] = max(0, part_integrities[target_slot] - damage)
	part_damaged.emit(self, target_slot, part_integrities[target_slot], part_max_integrities[target_slot])
	
	# Charge Overclock gauge on damage taken
	overclock_gauge = clampf(overclock_gauge + 20.0, 0.0, 100.0)
	
	# Check Win/Loss conditions:
	# If Head reaches 0 -> System Failure!
	if part_integrities[Types.PartSlot.HEAD] <= 0:
		is_active_in_battle = false
		unit_defeated.emit(self)
	
	queue_redraw()
	return {
		"slot_hit": target_slot,
		"damage": damage,
		"destroyed": part_integrities[target_slot] <= 0,
		"head_destroyed": part_integrities[Types.PartSlot.HEAD] <= 0
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

func _draw() -> void:
	# Super-Deformed (SD) Chibi Anibot Renderer
	var main_col = Color("#00E5FF") if is_player else Color("#FF1744")
	var dark_col = Color("#00838F") if is_player else Color("#B71C1C")
	var accent_col = Color("#FFD600") if is_player else Color("#FF9100")
	var dir_mul = 1.0 if is_player else -1.0
	
	var is_running = current_phase == Types.CombatPhase.RUN or current_phase == Types.CombatPhase.COOLDOWN
	var run_bob = abs(sin(Time.get_ticks_msec() * 0.015)) * -4.0 if is_running else sin(Time.get_ticks_msec() * 0.005) * 1.5
	var leg_step = sin(Time.get_ticks_msec() * 0.02) * 5.0 if is_running else 0.0
	
	# 1. Soft Dynamic Drop Shadow
	draw_circle(Vector2(0, 24), 20.0, Color(0, 0, 0, 0.28))
	
	# 2. Chunky SD Legs / Treads
	var legs_ok = part_integrities[Types.PartSlot.LEGS] > 0
	var leg_col = main_col if legs_ok else Color("#455A64")
	draw_circle(Vector2(-10, 15 + leg_step), 7.0, leg_col) # Left chunky wheel/foot
	draw_rect(Rect2(-17, 10 + leg_step, 14, 10), dark_col)
	draw_circle(Vector2(10, 15 - leg_step), 7.0, leg_col) # Right chunky wheel/foot
	draw_rect(Rect2(3, 10 - leg_step, 14, 10), dark_col)
	
	# 3. Compact Chunky Torso Chassis
	var torso_ok = part_integrities[Types.PartSlot.TORSO] > 0
	var torso_col = main_col if torso_ok else Color("#455A64")
	draw_circle(Vector2(0, -2 + run_bob), 18.0, torso_col) # Rounded chunky chassis
	draw_rect(Rect2(-16, -14 + run_bob, 32, 22), dark_col)
	
	# Glowing Power Core Diode in Center
	var core_glow = Color("#FFFF00") if is_active_in_battle else Color("#263238")
	draw_circle(Vector2(0, -3 + run_bob), 5.5, core_glow)
	draw_circle(Vector2(0, -3 + run_bob), 2.5, Color.WHITE)
	
	# 4. Oversized Chunky Weapon Arms
	var l_arm_ok = part_integrities[Types.PartSlot.LEFT_ARM] > 0
	var r_arm_ok = part_integrities[Types.PartSlot.RIGHT_ARM] > 0
	var l_col = main_col if l_arm_ok else Color("#455A64")
	var r_col = main_col if r_arm_ok else Color("#455A64")
	
	# Back Arm (Chunky Gauntlet)
	draw_circle(Vector2(-22, -4 + run_bob), 6.0, l_col)
	draw_rect(Rect2(-28, -6 + run_bob, 12, 18), dark_col)
	draw_circle(Vector2(-22, 10 + run_bob), 4.5, accent_col)
	
	# Front Arm (Oversized Cannon / Wrench)
	draw_circle(Vector2(22, -4 + run_bob), 6.0, r_col)
	draw_rect(Rect2(16, -6 + run_bob, 14, 18), dark_col)
	draw_circle(Vector2(23, 10 + run_bob), 5.5, accent_col) # Muzzle/Fist
	
	# 5. Oversized Chibi Mecha Head
	var head_ok = part_integrities[Types.PartSlot.HEAD] > 0
	var head_col = main_col if head_ok else Color("#37474F")
	var head_pos = Vector2(0, -24 + run_bob)
	draw_circle(head_pos, 16.0, head_col) # Big round SD head
	draw_rect(Rect2(head_pos.x - 14, head_pos.y - 12, 28, 22), dark_col)
	
	# Big Glowing Anime Visor Optics
	var visor_col = Color("#00E676") if is_player else Color("#FFEA00")
	if not is_active_in_battle or not head_ok:
		visor_col = Color("#263238")
	draw_rect(Rect2(head_pos.x - 11 + dir_mul * 2, head_pos.y - 4, 18, 9), visor_col)
	draw_circle(Vector2(head_pos.x - 6 + dir_mul * 2, head_pos.y), 2.5, Color.WHITE) # Visor shine
	draw_circle(Vector2(head_pos.x + 2 + dir_mul * 2, head_pos.y), 2.5, Color.WHITE)
	
	# Cute Mecha Antennae / Ears
	draw_line(head_pos + Vector2(-12, -12), head_pos + Vector2(-18, -26), dark_col, 3.5)
	draw_circle(head_pos + Vector2(-18, -26), 3.0, accent_col)
	draw_line(head_pos + Vector2(12, -12), head_pos + Vector2(18, -26), dark_col, 3.5)
	draw_circle(head_pos + Vector2(18, -26), 3.0, accent_col)
