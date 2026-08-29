# SparringNPC3D.gd
# 3D Interactive NPC that initiates sparring combat test against a training dummy
class_name SparringNPC3D
extends StaticBody3D

@export var npc_name: String = "Bolt (Sparring Coordinator)"
@onready var character_model: CompositeCharacter3D = %CompositeCharacter3D
@onready var prompt_mesh: MeshInstance3D = %PromptBubbleMesh

var player_in_range: bool = false
var current_player_node: Node3D = null

func _ready() -> void:
	if prompt_mesh:
		prompt_mesh.hide()
	
	# Configure Bolt's Trainer Outfit
	character_model.apply_appearance({
		"hair_style": "hair_01",
		"hair_color": Color("#D32F2F"), # Red cap / hair
		"skin_color": Color("#F0D5BE"),
		"shirt_style": "shirt_jacket",
		"shirt_color": Color("#0288D1"), # Blue jacket with yellow trim
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
	
	var welcome_text = "Greetings, Handler! Ready to test your Anibot's combat systems in a live sparring simulation against my Training Drone?"
	var choices = [
		"1. Let's battle! (Start Sparring Match)",
		"2. Explain combat rules.",
		"3. Maybe later."
	]
	
	dialogue_box.show_dialogue(npc_name, welcome_text, choices)
	dialogue_box.choice_made.connect(_on_choice_made, CONNECT_ONE_SHOT)

func _on_choice_made(choice_idx: int) -> void:
	var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
	
	match choice_idx:
		0: # Start Battle
			if dialogue_box:
				dialogue_box.close_dialogue()
			var opponent_data = {
				"bot_name": "Metabee (KBT)",
				"bot_model": "metabee",
				"chip_id": "chip_dummy",
				"bot_id": "bot_metabee_01",
				"parts": {
					"head": {"part_id": "part_head_dummy", "condition": 100.0, "current_cache": 3},
					"left_arm": {"part_id": "part_arm_l_dummy_blunt", "condition": 100.0},
					"right_arm": {"part_id": "part_arm_r_dummy_blaster", "condition": 100.0},
					"torso": {"part_id": "part_torso_dummy", "condition": 100.0},
					"legs": {"part_id": "part_legs_dummy", "condition": 100.0}
				}
			}
			var p_pos = current_player_node.global_position if current_player_node else Vector3(0, 0, 0)
			GameManager.trigger_sparring_combat(opponent_data, Vector2(p_pos.x, p_pos.z))
			
		1: # Explain Rules
			if dialogue_box:
				var rules_text = "Combat runs on a 3-Phase ATB Relay:\n- WAIT: Leg speed charges your Action Bar.\n- RUN: Dash to the center combat line.\n- ACTION: Trigger Head/Arm payloads.\n- COOLDOWN: Return to base (heavy weapons take longer!).\n\nTip: Destroy the enemy Head part to achieve System Failure and win!"
				dialogue_box.show_dialogue(npc_name, rules_text, ["Got it, thanks!"])
				
		2: # Maybe later
			if dialogue_box:
				dialogue_box.show_dialogue(npc_name, "Understood. The sparring ring is open whenever you're ready to calibrate!", [])
