# BattleArena.gd
# Orchestrates 3-Phase ATB Relay combat arena in 3D (supporting 1v1 and 3v3 Squad Relay lanes,
# Center-Line Trap hazards, Support Scanners, Override Defense Interception, and Post-Battle Salvage/Degradation)
extends Node3D

@onready var player_unit: CombatUnit3D = %PlayerUnit
@onready var enemy_unit: CombatUnit3D = %EnemyUnit
@onready var combat_ui = %CombatUI
@onready var arena_camera: Camera3D = $Camera3D

var is_battle_over: bool = false
var arena_center_x: float = 0.0
var player_base_x: float = -6.2
var enemy_base_x: float = 6.2
var arena_terrain: int = Types.TerrainType.CITY

# 3v3 Wingman Visual Rigs (Lanes Z = -2.2 and Z = +2.2)
var player_wingmen_nodes: Array[Node3D] = []
var enemy_wingmen_nodes: Array[Node3D] = []

# Center-Line Active Traps (TRAP payload mechanic from PARTS.md Section 2.5)
var center_line_trap_for_enemy: Dictionary = {} # Placed by Player, triggers when Enemy crosses center line
var center_line_trap_for_player: Dictionary = {} # Placed by Enemy, triggers when Player crosses center line
var trap_mesh_indicator: MeshInstance3D = null

func _ready() -> void:
	Types.ensure_catalogs_loaded()
	arena_terrain = GameManager.active_battle_terrain
	_setup_trap_indicator()
	_init_arena_combatants()
	_update_camera_framing(1.0)
	
	player_unit.command_ready.connect(_on_player_command_ready)
	player_unit.reached_center_line.connect(_on_player_reached_center)
	player_unit.unit_defeated.connect(_on_player_defeated)
	
	enemy_unit.command_ready.connect(_on_enemy_command_ready)
	enemy_unit.reached_center_line.connect(_on_enemy_reached_center)
	enemy_unit.unit_defeated.connect(_on_enemy_defeated)
	
	combat_ui.command_chosen.connect(_on_player_action_chosen)
	combat_ui.return_to_overworld_requested.connect(_on_return_to_overworld)

func _setup_trap_indicator() -> void:
	# Apply dynamic 5-Terrain Arena Floor Texture & Relay Track Chevron Texture
	var arena_floor := get_node_or_null("ArenaFloor") as MeshInstance3D
	if arena_floor:
		arena_floor.material_override = EnvironmentTextureService.create_arena_terrain_material(arena_terrain)
	var track_lane := get_node_or_null("TrackLane") as MeshInstance3D
	if track_lane:
		track_lane.material_override = EnvironmentTextureService.create_relay_track_material()
		
	trap_mesh_indicator = MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.7
	cyl.bottom_radius = 0.7
	cyl.height = 0.08
	trap_mesh_indicator.mesh = cyl
	trap_mesh_indicator.position = Vector3(0.0, 0.05, 0.0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("#FF6D00")
	mat.emission_enabled = true
	mat.emission = Color("#FF3D00")
	mat.emission_energy_multiplier = 3.0
	trap_mesh_indicator.material_override = mat
	trap_mesh_indicator.hide()
	add_child(trap_mesh_indicator)

func _spawn_3v3_wingmen(player_roster: Array, opponent_config: Dictionary) -> void:
	for n in player_wingmen_nodes:
		if is_instance_valid(n): n.queue_free()
	for n in enemy_wingmen_nodes:
		if is_instance_valid(n): n.queue_free()
	player_wingmen_nodes.clear()
	enemy_wingmen_nodes.clear()
	
	if not GameManager.active_battle_is_3v3:
		return
		
	var z_lanes := [-2.2, 2.2]
	for i in range(2):
		var p_idx := (SaveManager.get_selected_bot_index() + i + 1) % maxi(1, player_roster.size())
		if p_idx < player_roster.size() and player_roster.size() > 1:
			var p_wing := AniBotModel3D.new()
			add_child(p_wing)
			p_wing.position = Vector3(player_base_x - 0.6, 0.0, z_lanes[i])
			p_wing.rotation_degrees.y = 90.0
			p_wing.setup_model(player_roster[p_idx], true)
			player_wingmen_nodes.append(p_wing)
			
	var e_wings: Array = opponent_config.get("wingmen", [])
	for i in range(mini(2, e_wings.size())):
		var e_wing := AniBotModel3D.new()
		add_child(e_wing)
		e_wing.position = Vector3(enemy_base_x + 0.6, 0.0, z_lanes[i])
		e_wing.rotation_degrees.y = -90.0
		e_wing.setup_model(e_wings[i], false)
		enemy_wingmen_nodes.append(e_wing)

func _init_arena_combatants() -> void:
	var session: Dictionary = GameManager.active_battle_session
	var player_roster := SaveManager.get_squad_roster()
	var player_bot_config := SaveManager.get_active_anibot()
	if player_bot_config.is_empty():
		player_bot_config = DatabaseService.create_bot_loadout("bot_starter_01", "chip_vulpes_zerda")
		
	var opponent_config: Dictionary = GameManager.active_combat_opponent
	if opponent_config.is_empty():
		opponent_config = {
			"bot_name": "Metabee (KBT)",
			"bot_model": "metabee",
			"chip_id": "chip_artificer",
			"parts": {
				"head": {"part_id": "part_head_dummy", "condition": 100.0, "current_cache": 2},
				"left_arm": {"part_id": "part_arm_l_dummy_blunt", "condition": 100.0},
				"right_arm": {"part_id": "part_arm_r_dummy_blaster", "condition": 100.0},
				"torso": {"part_id": "part_torso_dummy", "condition": 100.0},
				"legs": {"part_id": "part_legs_dummy", "condition": 100.0}
			}
		}
	
	_spawn_3v3_wingmen(player_roster, opponent_config)
	
	player_unit.base_line_x = player_base_x
	player_unit.center_line_x = -1.2
	player_unit.setup_unit(player_bot_config, true, arena_terrain)
	
	enemy_unit.base_line_x = enemy_base_x
	enemy_unit.center_line_x = 1.2
	enemy_unit.setup_unit(opponent_config, false, arena_terrain)
	
	var p_base_node := get_node_or_null("PlayerBaseLine") as Node3D
	if p_base_node:
		p_base_node.position.x = player_base_x
	var e_base_node := get_node_or_null("EnemyBaseLine") as Node3D
	if e_base_node:
		e_base_node.position.x = enemy_base_x
	
	var t_label: String = Types.TERRAIN_NAMES.get(arena_terrain, "Neo Metropolis Street")
	var mode_tag := "3v3 Squad Relay" if GameManager.active_battle_is_3v3 else "1v1 Sparring Duel"
	
	if session.is_empty() or not session.get("is_active", false):
		GameManager.active_battle_session = {
			"is_active": true,
			"terrain": arena_terrain,
			"trap_for_enemy": {},
			"trap_for_player": {},
			"player": player_unit.export_state(),
			"enemy": enemy_unit.export_state(),
			"last_clash": {},
			"combat_log": "[%s | %s] Ready your AniBot!" % [mode_tag, t_label]
		}
		GameManager.active_battle_session["player"]["config"] = player_bot_config
		GameManager.active_battle_session["enemy"]["config"] = opponent_config
	else:
		var p_state: Dictionary = session.get("player", {})
		var e_state: Dictionary = session.get("enemy", {})
		var last_clash: Dictionary = session.get("last_clash", {})
		var attacker_is_player: bool = bool(last_clash.get("attacker_is_player", true))
		center_line_trap_for_enemy = session.get("trap_for_enemy", {})
		center_line_trap_for_player = session.get("trap_for_player", {})
		_update_trap_visual()
		
		player_unit.restore_state(p_state)
		enemy_unit.restore_state(e_state)
		
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
		combat_ui.set_combat_log(str(session["combat_log"]))
		
	if int(enemy_unit.part_integrities.get(Types.PartSlot.HEAD, 60)) <= 0:
		_on_enemy_defeated(enemy_unit)
	elif int(player_unit.part_integrities.get(Types.PartSlot.HEAD, 60)) <= 0:
		_on_player_defeated(player_unit)
	else:
		if player_unit.current_phase == Types.CombatPhase.COMMAND:
			_on_player_command_ready(player_unit)
		elif enemy_unit.current_phase == Types.CombatPhase.COMMAND:
			_on_enemy_command_ready(enemy_unit)

func _update_trap_visual() -> void:
	if trap_mesh_indicator:
		trap_mesh_indicator.visible = (not center_line_trap_for_enemy.is_empty() or not center_line_trap_for_player.is_empty())

func _process(delta: float) -> void:
	if is_battle_over:
		return
		
	player_unit.update_combat_tick(delta)
	enemy_unit.update_combat_tick(delta)
	_update_camera_framing(delta)
	combat_ui.update_bars(player_unit, enemy_unit)

func _update_camera_framing(delta: float) -> void:
	if not arena_camera or not player_unit or not enemy_unit:
		return
	# Keep both AniBots (and base lines) framed inside the safe central band between top HUD and bottom Command Panel
	var px: float = player_unit.position.x
	var ex: float = enemy_unit.position.x
	var span_x: float = absf(ex - px)
	var mid_x: float = (px + ex) * 0.35 # Subtle pan toward active side while keeping arena centered
	
	# At initial base positions (span = 12.4m), z = 11.8, y = 7.2 ensures >19m horizontal frustum width at Z=0
	# When both units converge near center (span = 2.4m), camera gently moves closer to z = 9.6, y = 6.0
	var span_ratio: float = clampf((span_x - 2.4) / 10.0, 0.0, 1.0)
	if GameManager.active_battle_is_3v3:
		span_ratio = maxf(span_ratio, 0.75) # Keep wingmen visible in 3v3
	var target_z: float = lerpf(9.6, 11.8, span_ratio)
	var target_y: float = lerpf(6.0, 7.2, span_ratio)
	var target_pos := Vector3(mid_x, target_y, target_z)
	
	var weight: float = clampf(delta * 5.0, 0.0, 1.0)
	arena_camera.position = arena_camera.position.lerp(target_pos, weight)
	arena_camera.look_at(Vector3(mid_x * 0.5, 0.6, 0.0), Vector3.UP)

func _save_session_state() -> void:
	var p_export := player_unit.export_state()
	p_export["config"] = GameManager.active_battle_session.get("player", {}).get("config", SaveManager.get_active_anibot())
	var e_export := enemy_unit.export_state()
	e_export["config"] = GameManager.active_battle_session.get("enemy", {}).get("config", GameManager.active_combat_opponent)
	GameManager.active_battle_session["player"] = p_export
	GameManager.active_battle_session["enemy"] = e_export
	GameManager.active_battle_session["trap_for_enemy"] = center_line_trap_for_enemy
	GameManager.active_battle_session["trap_for_player"] = center_line_trap_for_player

func _on_player_command_ready(unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
	var chip_quote: String = str(Types.CHIPS_CATALOG.get(unit.chip_id, {}).get("quote", ""))
	combat_ui.open_command_menu(unit)
	combat_ui.set_combat_log("ATB Charged! %s: \"%s\"" % [unit.unit_name, chip_quote if not chip_quote.is_empty() else "Ready for command!"])

func _on_player_action_chosen(slot: int, is_overclock: bool) -> void:
	player_unit.assign_command(slot, is_overclock, enemy_unit)
	var act_name: String = str(player_unit.selected_action_part.get("name", "Attack"))
	var lock_mode := "Wait-Phase Target Locked" if player_unit.cached_target_slot != -1 else "Dynamic Center-Line Retargeting"
	combat_ui.set_combat_log("%s -> %s [%s]! Sprinting to Center Line..." % [player_unit.unit_name, act_name, lock_mode])

func _on_player_reached_center(unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
		
	# Check if Enemy placed a Center-Line Trap
	if not center_line_trap_for_player.is_empty():
		var trap_dmg := int(center_line_trap_for_player.get("payload", 38))
		var trap_name := str(center_line_trap_for_player.get("name", "Logic Trap"))
		center_line_trap_for_player = {}
		_update_trap_visual()
		SignalBus.play_sfx_requested.emit("explosion")
		unit.part_integrities[Types.PartSlot.LEGS] = maxi(0, int(unit.part_integrities[Types.PartSlot.LEGS]) - trap_dmg)
		combat_ui.update_unit_damage(unit)
		combat_ui.spawn_floating_damage(trap_dmg, true)
		combat_ui.set_combat_log("TRAP DETONATED! %s stepped on %s (-%d Legs HP) & command interrupted!" % [unit.unit_name, trap_name, trap_dmg])
		unit.current_phase = Types.CombatPhase.COOLDOWN
		return
		
	var part := unit.selected_action_part
	var is_ult: bool = bool(part.get("is_ult", false))
	var atk_type: int = int(part.get("type", Types.AttackType.MELEE))
	
	# Handle TRAP placement on Center Line (PARTS.md Section 2.5)
	if not is_ult and atk_type == Types.AttackType.TRAP:
		center_line_trap_for_enemy = part.duplicate()
		_update_trap_visual()
		SignalBus.play_sfx_requested.emit("confirm")
		combat_ui.set_combat_log("%s planted [%s] on the Center Combat Line! Returning to base..." % [unit.unit_name, part.get("name", "Logic Bomb")])
		unit.current_phase = Types.CombatPhase.COOLDOWN
		return
		
	# Handle SUPPORT scanner / buff (PARTS.md Section 2.4)
	if not is_ult and atk_type == Types.AttackType.SUPPORT and int(part.get("payload", 0)) <= 0:
		unit.guaranteed_crit_next = true
		unit.overclock_gauge = clampf(unit.overclock_gauge + 30.0, 0.0, 100.0)
		SignalBus.play_sfx_requested.emit("charge")
		combat_ui.set_combat_log("%s activated [%s]! Weak-point lock acquired: Next attack is 100%% Critical +30%% Overclock!" % [unit.unit_name, part.get("name", "Scanner")])
		unit.current_phase = Types.CombatPhase.COOLDOWN
		return
		
	var target_slot: int = unit.cached_target_slot if unit.cached_target_slot != -1 else unit.evaluate_utility_ai_target_slot(enemy_unit)
	_save_session_state()
	GameManager.trigger_clash(true, part, is_ult, target_slot)

func _on_enemy_command_ready(unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
		
	if unit.overclock_gauge >= 100.0:
		unit.assign_command(Types.PartSlot.HEAD, true, player_unit)
		combat_ui.set_combat_log("%s UNLEASHES OVERCLOCK ULTIMATE!" % unit.unit_name)
		return

	var possible_slots: Array = []
	if int(unit.part_integrities.get(Types.PartSlot.HEAD, 0)) > 0 and unit.head_cache_remaining > 0:
		possible_slots.append(Types.PartSlot.HEAD)
	if int(unit.part_integrities.get(Types.PartSlot.LEFT_ARM, 0)) > 0:
		possible_slots.append(Types.PartSlot.LEFT_ARM)
	if int(unit.part_integrities.get(Types.PartSlot.RIGHT_ARM, 0)) > 0:
		possible_slots.append(Types.PartSlot.RIGHT_ARM)

	var chosen_slot: int = Types.PartSlot.LEFT_ARM
	if possible_slots.size() > 0:
		if unit.chip_id == "chip_artificer" and Types.PartSlot.HEAD in possible_slots and center_line_trap_for_player.is_empty():
			chosen_slot = Types.PartSlot.HEAD
		else:
			chosen_slot = int(possible_slots[randi() % possible_slots.size()])

	unit.assign_command(chosen_slot, false, player_unit)
	combat_ui.set_combat_log("%s charges to Center Line with %s!" % [unit.unit_name, unit.selected_action_part.get("name", "Attack")])

func _on_enemy_reached_center(unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
		
	# Check if Player placed a Center-Line Logic Trap!
	if not center_line_trap_for_enemy.is_empty():
		var trap_dmg := int(center_line_trap_for_enemy.get("payload", 42))
		var trap_name := str(center_line_trap_for_enemy.get("name", "Logic Bomb"))
		center_line_trap_for_enemy = {}
		_update_trap_visual()
		SignalBus.play_sfx_requested.emit("explosion")
		var hit_slot := Types.PartSlot.LEGS if int(unit.part_integrities.get(Types.PartSlot.LEGS, 0)) > 0 else Types.PartSlot.HEAD
		unit.part_integrities[hit_slot] = maxi(0, int(unit.part_integrities[hit_slot]) - trap_dmg)
		combat_ui.update_unit_damage(unit)
		combat_ui.spawn_floating_damage(trap_dmg, false)
		combat_ui.set_combat_log("CENTER-LINE TRAP DETONATED! %s hit by %s (-%d HP) & sprint aborted!" % [unit.unit_name, trap_name, trap_dmg])
		if int(unit.part_integrities.get(Types.PartSlot.HEAD, 0)) <= 0:
			_on_enemy_defeated(unit)
			return
		unit.current_phase = Types.CombatPhase.COOLDOWN
		return
		
	var part := unit.selected_action_part
	var is_ult: bool = bool(part.get("is_ult", false))
	var atk_type: int = int(part.get("type", Types.AttackType.MELEE))
	
	if not is_ult and atk_type == Types.AttackType.TRAP:
		center_line_trap_for_player = part.duplicate()
		_update_trap_visual()
		combat_ui.set_combat_log("%s deployed a Center-Line Trap [%s]!" % [unit.unit_name, part.get("name", "Trap")])
		unit.current_phase = Types.CombatPhase.COOLDOWN
		return
		
	var target_slot: int = unit.cached_target_slot if unit.cached_target_slot != -1 else unit.evaluate_utility_ai_target_slot(player_unit)
	# If Player activated DEFENSE Override Protocol, divert enemy attack onto Player's Shield Arm or Torso!
	if player_unit.override_guard_active:
		if int(player_unit.part_integrities.get(Types.PartSlot.LEFT_ARM, 0)) > 0:
			target_slot = Types.PartSlot.LEFT_ARM
		elif int(player_unit.part_integrities.get(Types.PartSlot.TORSO, 0)) > 0:
			target_slot = Types.PartSlot.TORSO
	_save_session_state()
	GameManager.trigger_clash(false, part, is_ult, target_slot)

func _on_enemy_defeated(_unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
	is_battle_over = true
	SignalBus.play_sfx_requested.emit("explosion")
	
	var opp_cfg: Dictionary = GameManager.active_battle_session.get("enemy", {}).get("config", GameManager.active_combat_opponent)
	var outcome := SaveManager.apply_post_battle_degradation_and_salvage(
		true,
		player_unit.get_broken_slots(),
		opp_cfg,
		enemy_unit.get_broken_slots()
	)
	var rewards := {
		"scrap": 25,
		"credits": 150,
		"salvaged_part": outcome.get("salvaged_part", {}),
		"degraded_parts": outcome.get("degraded_parts", [])
	}
	combat_ui.show_battle_results(true, rewards)

func _on_player_defeated(_unit: CombatUnit3D) -> void:
	if is_battle_over:
		return
	is_battle_over = true
	SignalBus.play_sfx_requested.emit("explosion")
	
	var outcome := SaveManager.apply_post_battle_degradation_and_salvage(
		false,
		player_unit.get_broken_slots(),
		{},
		[]
	)
	combat_ui.show_battle_results(false, {"degraded_parts": outcome.get("degraded_parts", [])})

func _on_return_to_overworld() -> void:
	var won := (int(enemy_unit.part_integrities.get(Types.PartSlot.HEAD, 0)) <= 0)
	GameManager.complete_combat(won, {"scrap": 25, "credits": 150})
