# SparringNPC3D.gd
# 3D Interactive NPC ("Bolt" & Rival "Luk" Sparring Coordinator) supporting 1v1, 3v3 Squad Relay, and Terrain Selection
class_name SparringNPC3D
extends StaticBody3D

@export var npc_name: String = "Bolt (Sparring Coordinator)"
@onready var character_model: CompositeCharacter3D = %CompositeCharacter3D
@onready var prompt_mesh: MeshInstance3D = %PromptBubbleMesh

var player_in_range: bool = false
var current_player_node: Node3D = null
var selected_terrain: int = Types.TerrainType.CITY

func _ready() -> void:
	if prompt_mesh:
		prompt_mesh.hide()
	
	character_model.apply_appearance({
		"hair_style": "hair_01",
		"hair_color": Color("#D32F2F"),
		"skin_color": Color("#F0D5BE"),
		"shirt_style": "shirt_jacket",
		"shirt_color": Color("#0288D1"),
		"bottom_style": "bottom_cargo",
		"bottom_color": Color("#37474F"),
		"shoe_style": "shoes_boots",
		"shoe_color": Color("#D32F2F")
	})

func _on_interaction_area_body_entered(body: Node3D) -> void:
	if body is Player3D:
		player_in_range = true
		current_player_node = body
		if prompt_mesh:
			prompt_mesh.show()

func _on_interaction_area_body_exited(body: Node3D) -> void:
	if body is Player3D:
		player_in_range = false
		if prompt_mesh:
			prompt_mesh.hide()

func interact(player: Node3D) -> void:
	current_player_node = player
	if prompt_mesh:
		prompt_mesh.hide()
	SignalBus.play_sfx_requested.emit("click")
	_start_dialogue_flow()

func _start_dialogue_flow() -> void:
	var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
	if not dialogue_box:
		return
	
	var t_name: String = Types.TERRAIN_NAMES.get(selected_terrain, "Neo Metropolis Street")
	var welcome_text := "Yo Kura! Ready to calibrate Zerdata and your squad on the Relay Track?\nCurrent Arena Terrain: [%s]" % t_name
	var choices := [
		"1. 3v3 Squad Relay Battle vs Rival Luk Tirio!",
		"2. 1v1 Duel vs Training Drone (Metabee KBT)",
		"3. Cycle Arena Terrain (%s)" % t_name,
		"4. Explain Relay Combat, Utility AI & Degradation Rules",
		"5. Maybe later."
	]
	
	dialogue_box.show_dialogue(npc_name, welcome_text, choices)
	dialogue_box.choice_made.connect(_on_choice_made, CONNECT_ONE_SHOT)

func _on_choice_made(choice_idx: int) -> void:
	var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
	
	match choice_idx:
		0: # 3v3 Squad Relay Battle vs Rival Luk
			if dialogue_box:
				dialogue_box.close_dialogue()
			var opponent_data := {
				"bot_name": "Muramasa-X (Leader)",
				"bot_model": "metabee",
				"chip_id": "chip_ronin",
				"bot_id": "bot_luk_leader",
				"parts": {
					"head": {"part_id": "part_head_surge_node", "condition": 95.0, "current_cache": 3},
					"left_arm": {"part_id": "part_arm_l_static_whip", "condition": 95.0},
					"right_arm": {"part_id": "part_arm_r_volt_caster", "condition": 90.0},
					"torso": {"part_id": "part_torso_circuit", "condition": 100.0},
					"legs": {"part_id": "part_legs_current_wheels", "condition": 95.0}
				},
				"wingmen": [
					{
						"bot_name": "Aegis-Bastion",
						"chip_id": "chip_phalanx",
						"parts": {
							"head": {"part_id": "part_head_logic_bomb", "condition": 90.0, "current_cache": 2},
							"left_arm": {"part_id": "part_arm_l_aegis_shield", "condition": 95.0},
							"right_arm": {"part_id": "part_arm_r_ratchet", "condition": 90.0},
							"torso": {"part_id": "part_torso_genesis", "condition": 100.0},
							"legs": {"part_id": "part_legs_steady_tread", "condition": 90.0}
						}
					},
					{
						"bot_name": "Hawk-Sniper",
						"chip_id": "chip_orion",
						"parts": {
							"head": {"part_id": "part_head_astro_scope", "condition": 85.0, "current_cache": 2},
							"left_arm": {"part_id": "part_arm_l_pulsar_rifle", "condition": 85.0},
							"right_arm": {"part_id": "part_arm_r_comet_snipe", "condition": 85.0},
							"torso": {"part_id": "part_torso_nova", "condition": 90.0},
							"legs": {"part_id": "part_legs_hover_drive", "condition": 90.0}
						}
					}
				]
			}
			var p_pos := current_player_node.global_position if current_player_node else Vector3.ZERO
			GameManager.trigger_sparring_combat(opponent_data, p_pos, true, selected_terrain)
			
		1: # 1v1 Duel vs Training Drone
			if dialogue_box:
				dialogue_box.close_dialogue()
			var drone_data := {
				"bot_name": "Metabee (KBT)",
				"bot_model": "metabee",
				"chip_id": "chip_artificer",
				"bot_id": "bot_metabee_01",
				"parts": {
					"head": {"part_id": "part_head_dummy", "condition": 100.0, "current_cache": 3},
					"left_arm": {"part_id": "part_arm_l_dummy_blunt", "condition": 100.0},
					"right_arm": {"part_id": "part_arm_r_dummy_blaster", "condition": 100.0},
					"torso": {"part_id": "part_torso_dummy", "condition": 100.0},
					"legs": {"part_id": "part_legs_dummy", "condition": 100.0}
				}
			}
			var p_pos := current_player_node.global_position if current_player_node else Vector3.ZERO
			GameManager.trigger_sparring_combat(drone_data, p_pos, false, selected_terrain)
			
		2: # Cycle Arena Terrain
			selected_terrain = (selected_terrain + 1) % 5
			_start_dialogue_flow()
			
		3: # Explain Rules
			if dialogue_box:
				var rules_text := "3-Phase ATB Relay Rules:\n- WAIT: Leg Clock Speed & Terrain Protocol charge your ATB.\n- SPRINT: Fastest bot to the Center Line strikes first!\n- TARGETING AI: Shooting locks target at Wait completion; Melee retargets dynamically at the Center Line.\n- OVERRIDE & TRAPS: Defense Shields intercept attacks; Logic Bombs detonate on enemy sprint.\n- DEGRADATION: Destroyed parts (0 HP) lose 10-15% permanent Condition! Win to salvage 1 enemy part + Scrap!"
				dialogue_box.show_dialogue(npc_name, rules_text, ["Got it, thanks!"])
				
		4: # Maybe later
			if dialogue_box:
				dialogue_box.show_dialogue(npc_name, "The District 4 Sparring Ring is always open when you want to test a new build!", [])
