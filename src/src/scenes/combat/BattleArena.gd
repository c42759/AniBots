# BattleArena.gd
# Orchestrates 3-Phase ATB Relay combat arena between Player and Opponent
extends Node2D

@onready var player_unit: CombatUnit = %PlayerUnit
@onready var enemy_unit: CombatUnit = %EnemyUnit
@onready var combat_ui = %CombatUI

var is_battle_over: bool = false
var arena_center_x: float = 640.0
var player_base_x: float = 220.0
var enemy_base_x: float = 1060.0

func _ready() -> void:
	_init_arena_combatants()
	
	player_unit.command_ready.connect(_on_player_command_ready)
	player_unit.reached_center_line.connect(_on_player_reached_center)
	player_unit.unit_defeated.connect(_on_player_defeated)
	
	enemy_unit.command_ready.connect(_on_enemy_command_ready)
	enemy_unit.reached_center_line.connect(_on_enemy_reached_center)
	enemy_unit.unit_defeated.connect(_on_enemy_defeated)
	
	combat_ui.command_chosen.connect(_on_player_action_chosen)
	combat_ui.return_to_overworld_requested.connect(_on_return_to_overworld)

func _init_arena_combatants() -> void:
	var player_bot_config = SaveManager.get_active_anibot()
	if player_bot_config.is_empty():
		# Fallback starter
		player_bot_config = {
			"bot_name": "Genesis-1",
			"chip_id": "chip_artificer",
			"parts": {
				"head": {"part_id": "part_head_logic_bomb", "condition": 100.0, "current_cache": 3},
				"left_arm": {"part_id": "part_arm_l_wrench", "condition": 100.0},
				"right_arm": {"part_id": "part_arm_r_ratchet", "condition": 100.0},
				"torso": {"part_id": "part_torso_genesis", "condition": 100.0},
				"legs": {"part_id": "part_legs_steady_tread", "condition": 100.0}
			}
		}
		
	var opponent_config = GameManager.active_combat_opponent
	if opponent_config.is_empty():
		opponent_config = {
			"bot_name": "Training Drone",
			"chip_id": "chip_dummy",
			"parts": {
				"head": {"part_id": "part_head_dummy", "condition": 100.0, "current_cache": 2},
				"left_arm": {"part_id": "part_arm_l_dummy_blunt", "condition": 100.0},
				"right_arm": {"part_id": "part_arm_r_dummy_blaster", "condition": 100.0},
				"torso": {"part_id": "part_torso_dummy", "condition": 100.0},
				"legs": {"part_id": "part_legs_dummy", "condition": 100.0}
			}
		}
	
	player_unit.base_line_x = player_base_x
	player_unit.center_line_x = arena_center_x - 40.0
	player_unit.setup_unit(player_bot_config, true)
	
	enemy_unit.base_line_x = enemy_base_x
	enemy_unit.center_line_x = arena_center_x + 40.0
	enemy_unit.setup_unit(opponent_config, false)
	
	combat_ui.setup_hud(player_unit, enemy_unit)

func _process(delta: float) -> void:
	if is_battle_over:
		return
		
	player_unit.update_combat_tick(delta)
	enemy_unit.update_combat_tick(delta)
	combat_ui.update_bars(player_unit, enemy_unit)

func _on_player_command_ready(unit: CombatUnit) -> void:
	if is_battle_over:
		return
	combat_ui.open_command_menu(unit)
	combat_ui.set_combat_log("ATB charged! Command %s action!" % unit.unit_name)

func _on_player_action_chosen(slot: int, is_overclock: bool) -> void:
	player_unit.assign_command(slot, is_overclock)
	var act_name = player_unit.selected_action_part.get("name", "Attack")
	combat_ui.set_combat_log("%s selected %s! Sprinting to Center Line..." % [player_unit.unit_name, act_name])

func _on_player_reached_center(unit: CombatUnit) -> void:
	if is_battle_over:
		return
	
	var part = unit.selected_action_part
	var pwr = part.get("payload", 30)
	var is_ult = part.get("is_ult", false)
	
	SignalBus.play_sfx_requested.emit("laser" if is_ult else "attack_hit")
	
	var hit_result = enemy_unit.take_damage(pwr)
	combat_ui.update_unit_damage(enemy_unit)
	
	var slot_name = _slot_name_str(hit_result["slot_hit"])
	var log_msg = "%s strikes with %s! Dealt %d damage to %s's %s!" % [
		unit.unit_name,
		part.get("name", "Attack"),
		hit_result["damage"],
		enemy_unit.unit_name,
		slot_name
	]
	
	if hit_result["destroyed"]:
		log_msg += " [%s DISABLED!]" % slot_name
	if hit_result["head_destroyed"]:
		log_msg += " [CRITICAL: HEAD DESTROYED!]"
		
	combat_ui.set_combat_log(log_msg)
	
	# Unit starts returning back to base
	unit.current_phase = Types.CombatPhase.COOLDOWN

func _on_enemy_command_ready(unit: CombatUnit) -> void:
	if is_battle_over:
		return
		
	# Simple Training Drone AI: Choose a working arm or head
	var possible_slots = []
	if unit.part_integrities[Types.PartSlot.LEFT_ARM] > 0:
		possible_slots.append(Types.PartSlot.LEFT_ARM)
	if unit.part_integrities[Types.PartSlot.RIGHT_ARM] > 0:
		possible_slots.append(Types.PartSlot.RIGHT_ARM)
	if unit.part_integrities[Types.PartSlot.HEAD] > 0 and unit.head_cache_remaining > 0:
		possible_slots.append(Types.PartSlot.HEAD)
		
	var chosen_slot = possible_slots[randi() % possible_slots.size()] if possible_slots.size() > 0 else Types.PartSlot.TORSO
	unit.assign_command(chosen_slot, false)
	combat_ui.set_combat_log("%s charges to Center Line with %s!" % [unit.unit_name, unit.selected_action_part.get("name", "Attack")])

func _on_enemy_reached_center(unit: CombatUnit) -> void:
	if is_battle_over:
		return
		
	var part = unit.selected_action_part
	var pwr = part.get("payload", 20)
	
	SignalBus.play_sfx_requested.emit("attack_hit")
	
	var hit_result = player_unit.take_damage(pwr)
	combat_ui.update_unit_damage(player_unit)
	
	var slot_name = _slot_name_str(hit_result["slot_hit"])
	var log_msg = "%s hits with %s! Dealt %d damage to your %s!" % [
		unit.unit_name,
		part.get("name", "Attack"),
		hit_result["damage"],
		slot_name
	]
	
	if hit_result["destroyed"]:
		log_msg += " [PART BROKEN!]"
	if hit_result["head_destroyed"]:
		log_msg += " [SYSTEM FAILURE DETECTED!]"
		
	combat_ui.set_combat_log(log_msg)
	unit.current_phase = Types.CombatPhase.COOLDOWN

func _on_enemy_defeated(_unit: CombatUnit) -> void:
	if is_battle_over:
		return
	is_battle_over = true
	SignalBus.play_sfx_requested.emit("explosion")
	combat_ui.show_battle_results(true, {"scrap": 20})

func _on_player_defeated(_unit: CombatUnit) -> void:
	if is_battle_over:
		return
	is_battle_over = true
	SignalBus.play_sfx_requested.emit("explosion")
	combat_ui.show_battle_results(false, {})

func _on_return_to_overworld() -> void:
	var won = (enemy_unit.part_integrities[Types.PartSlot.HEAD] <= 0)
	GameManager.complete_combat(won, {"scrap": 20})

func _slot_name_str(slot: int) -> String:
	match slot:
		Types.PartSlot.HEAD: return "Head"
		Types.PartSlot.TORSO: return "Torso Chassis"
		Types.PartSlot.LEFT_ARM: return "Left Arm"
		Types.PartSlot.RIGHT_ARM: return "Right Arm"
		Types.PartSlot.LEGS: return "Legs"
	return "Part"

func _draw() -> void:
	# Draw High-Tech Battle Arena Floor
	draw_rect(Rect2(0, 0, 1280, 720), Color("#101520")) # Dark background
	
	# Track Lanes
	draw_rect(Rect2(120, 300, 1040, 160), Color("#182030"))
	draw_rect(Rect2(120, 300, 1040, 160), Color("#263248"), false, 2.0)
	
	# Grid markings on track
	for x in range(160, 1120, 80):
		draw_line(Vector2(x, 300), Vector2(x, 460), Color(0.2, 0.28, 0.4, 0.4), 1.0)
		
	# Player Base Line (Left)
	draw_line(Vector2(player_base_x, 280), Vector2(player_base_x, 480), Color("#00E5FF"), 3.0)
	draw_circle(Vector2(player_base_x, 380), 6.0, Color("#00E5FF"))
	
	# Enemy Base Line (Right)
	draw_line(Vector2(enemy_base_x, 280), Vector2(enemy_base_x, 480), Color("#FF1744"), 3.0)
	draw_circle(Vector2(enemy_base_x, 380), 6.0, Color("#FF1744"))
	
	# Center Combat Engagement Line (Center)
	draw_line(Vector2(arena_center_x, 260), Vector2(arena_center_x, 500), Color("#FFD600"), 4.0)
	draw_rect(Rect2(arena_center_x - 30, 320, 60, 120), Color(1.0, 0.84, 0.0, 0.12))
