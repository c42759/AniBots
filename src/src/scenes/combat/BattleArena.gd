# BattleArena.gd
# Orchestrates 3-Phase ATB Relay combat arena between Player and Opponent in full 3D
extends Node3D

@onready var player_unit: CombatUnit3D = %PlayerUnit
@onready var enemy_unit: CombatUnit3D = %EnemyUnit
@onready var combat_ui = %CombatUI

var is_battle_over: bool = false
var arena_center_x: float = 0.0
var player_base_x: float = -7.5
var enemy_base_x: float = 7.5

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
	var session = GameManager.active_battle_session
	
	var player_bot_config = SaveManager.get_active_anibot()
	if player_bot_config.is_empty():
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
			"bot_name": "Metabee (KBT)",
			"bot_model": "metabee",
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
	player_unit.center_line_x = -1.2
	player_unit.setup_unit(player_bot_config, true)
	
	enemy_unit.base_line_x = enemy_base_x
	enemy_unit.center_line_x = 1.2
	enemy_unit.setup_unit(opponent_config, false)
	
	if session.is_empty() or not session.get("is_active", false):
		# Brand new battle session
		GameManager.active_battle_session = {
			"is_active": true,
			"player": {
				"config": player_bot_config,
				"integrities": player_unit.part_integrities.duplicate(),
				"part_max_integrities": player_unit.part_max_integrities.duplicate(),
				"head_cache_remaining": player_unit.head_cache_remaining,
				"overclock_gauge": player_unit.overclock_gauge,
				"action_bar": player_unit.action_bar,
				"current_phase": Types.CombatPhase.WAIT,
				"track_progress": 0.0,
				"position_x": player_base_x
			},
			"enemy": {
				"config": opponent_config,
				"integrities": enemy_unit.part_integrities.duplicate(),
				"part_max_integrities": enemy_unit.part_max_integrities.duplicate(),
				"head_cache_remaining": enemy_unit.head_cache_remaining,
				"action_bar": enemy_unit.action_bar,
				"current_phase": Types.CombatPhase.WAIT,
				"track_progress": 0.0,
				"position_x": enemy_base_x
			},
			"last_clash": {},
			"combat_log": "Sparring encounter initiated! Ready your Anibot!"
		}
	else:
		# Restoring session state after returning from a clash cutscene
		var p_state = session.get("player", {})
		var e_state = session.get("enemy", {})
		var last_clash = session.get("last_clash", {})
		var attacker_is_player = last_clash.get("attacker_is_player", true)
		
		player_unit.restore_state(p_state)
		enemy_unit.restore_state(e_state)
		
		# Set attacking unit to return back (COOLDOWN)
		if attacker_is_player:
			player_unit.current_phase = Types.CombatPhase.COOLDOWN
			player_unit.track_progress = 1.0
			player_unit.position.x = player_unit.center_line_x
		else:
			enemy_unit.current_phase = Types.CombatPhase.COOLDOWN
			enemy_unit.track_progress = 1.0
			enemy_unit.position.x = enemy_unit.center_line_x
	
	combat_ui.setup_hud(player_unit, enemy_unit)
	if session.has("combat_log"):
		combat_ui.set_combat_log(session["combat_log"])
		
	# Check immediate win/loss condition
	if enemy_unit.part_integrities.get(Types.PartSlot.HEAD, 60) <= 0:
		_on_enemy_defeated(enemy_unit)
	elif player_unit.part_integrities.get(Types.PartSlot.HEAD, 60) <= 0:
		_on_player_defeated(player_unit)
	else:
		# If either combatant was awaiting command selection, re-open command menu
		if player_unit.current_phase == Types.CombatPhase.COMMAND:
			_on_player_command_ready(player_unit)
		elif enemy_unit.current_phase == Types.CombatPhase.COMMAND:
			_on_enemy_command_ready(enemy_unit)

func _process(delta: float) -> void:
	if is_battle_over:
		return
		
	player_unit.update_combat_tick(delta)
	enemy_unit.update_combat_tick(delta)
	combat_ui.update_bars(player_unit, enemy_unit)

func _save_session_state() -> void:
	GameManager.active_battle_session["player"] = player_unit.export_state()
	GameManager.active_battle_session["enemy"] = enemy_unit.export_state()

func _on_player_command_ready(unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
	combat_ui.open_command_menu(unit)
	combat_ui.set_combat_log("ATB charged! Command %s action!" % unit.unit_name)

func _on_player_action_chosen(slot: int, is_overclock: bool) -> void:
	player_unit.assign_command(slot, is_overclock)
	var act_name = player_unit.selected_action_part.get("name", "Attack")
	combat_ui.set_combat_log("%s selected %s! Sprinting to Center Line..." % [player_unit.unit_name, act_name])

func _on_player_reached_center(unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
	
	_save_session_state()
	var part = unit.selected_action_part
	var is_ult = part.get("is_ult", false)
	GameManager.trigger_clash(true, part, is_ult)

func _on_enemy_command_ready(unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
		
	# Training Drone AI
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

func _on_enemy_reached_center(unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
		
	_save_session_state()
	var part = unit.selected_action_part
	var is_ult = part.get("is_ult", false)
	GameManager.trigger_clash(false, part, is_ult)

func _on_enemy_defeated(_unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
	is_battle_over = true
	SignalBus.play_sfx_requested.emit("explosion")
	combat_ui.show_battle_results(true, {"scrap": 20})

func _on_player_defeated(_unit: CombatUnit3D) -> void:
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
