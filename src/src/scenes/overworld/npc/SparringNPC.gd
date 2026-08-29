# SparringNPC.gd
# Interactive NPC that initiates sparring combat test against a training dummy
class_name SparringNPC
extends CharacterBody2D

@export var npc_name: String = "Bolt (Sparring Coordinator)"
@onready var prompt_bubble: PanelContainer = %PromptBubble
@onready var interaction_area: Area2D = %InteractionArea

var player_in_range: bool = false
var current_player_node: Node2D = null

func _ready() -> void:
	prompt_bubble.hide()
	interaction_area.body_entered.connect(_on_body_entered)
	interaction_area.body_exited.connect(_on_body_exited)

func _unhandled_input(event: InputEvent) -> void:
	if player_in_range and event.is_action_pressed("interact"):
		var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
		if dialogue_box and not dialogue_box.visible:
			get_viewport().set_input_as_handled()
			interact(current_player_node if current_player_node else self)

func _on_body_entered(body: Node2D) -> void:
	if body is Player:
		player_in_range = true
		current_player_node = body
		prompt_bubble.show()

func _on_body_exited(body: Node2D) -> void:
	if body is Player:
		player_in_range = false
		prompt_bubble.hide()

func interact(player: Node2D) -> void:
	current_player_node = player
	prompt_bubble.hide()
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
				"name": "Training Drone MK-1",
				"chip_id": "chip_dummy",
				"bot_id": "bot_dummy_01",
				"parts": {
					"head": {"part_id": "part_head_dummy", "condition": 100.0, "current_cache": 2},
					"left_arm": {"part_id": "part_arm_l_dummy_blunt", "condition": 100.0},
					"right_arm": {"part_id": "part_arm_r_dummy_blaster", "condition": 100.0},
					"torso": {"part_id": "part_torso_dummy", "condition": 100.0},
					"legs": {"part_id": "part_legs_dummy", "condition": 100.0}
				}
			}
			var p_pos = current_player_node.global_position if current_player_node else Vector2(320, 240)
			GameManager.trigger_sparring_combat(opponent_data, p_pos)
			
		1: # Explain Rules
			if dialogue_box:
				var rules_text = "Combat runs on a 3-Phase ATB Relay:\n- WAIT: Leg speed charges your Action Bar.\n- RUN: Dash to the center combat line.\n- ACTION: Trigger Head/Arm payloads.\n- COOLDOWN: Return to base (heavy weapons take longer!).\n\nTip: Destroy the enemy Head part to achieve System Failure and win!"
				dialogue_box.show_dialogue(npc_name, rules_text, ["Got it, thanks!"])
				
		2: # Maybe later
			if dialogue_box:
				dialogue_box.show_dialogue(npc_name, "Understood. The sparring ring is open whenever you're ready to calibrate!", [])

func _draw() -> void:
	var idle_bob = sin(Time.get_ticks_msec() * 0.004) * 1.5
	
	# 1. Drop Shadow
	draw_circle(Vector2(0, 18), 12.0, Color(0, 0, 0, 0.28))
	
	# 2. Stubby Chibi Shoes
	draw_circle(Vector2(-6, 14), 3.5, Color("#D32F2F"))
	draw_rect(Rect2(-8.5, 12, 5, 5), Color("#D32F2F"))
	draw_circle(Vector2(6, 14), 3.5, Color("#D32F2F"))
	draw_rect(Rect2(3.5, 12, 5, 5), Color("#D32F2F"))
	
	# 3. Chibi Pants
	draw_rect(Rect2(-7.5, 4 + idle_bob, 15, 8), Color("#37474F"))
	
	# 4. Chibi Torso & Vest
	draw_rect(Rect2(-8.5, -6 + idle_bob, 17, 11), Color("#0288D1")) # Blue shirt
	draw_rect(Rect2(-9.5, -6 + idle_bob, 4, 11), Color("#FBC02D")) # Yellow vest lapel
	draw_rect(Rect2(5.5, -6 + idle_bob, 4, 11), Color("#FBC02D"))
	
	# Chibi Arms & Hands
	draw_circle(Vector2(-10.5, -1 + idle_bob), 2.8, Color("#0288D1"))
	draw_circle(Vector2(-10.5, 5 + idle_bob), 2.5, Color("#F0D5BE"))
	draw_circle(Vector2(10.5, -1 + idle_bob), 2.8, Color("#0288D1"))
	draw_circle(Vector2(10.5, 5 + idle_bob), 2.5, Color("#F0D5BE"))
	
	# 5. Oversized Chibi Head
	var head_center = Vector2(0, -17 + idle_bob)
	draw_circle(head_center, 14.5, Color("#F0D5BE"))
	draw_circle(head_center + Vector2(0, 2), 14.0, Color("#F0D5BE")) # Cheeks
	
	# Cheeks Blush
	draw_circle(head_center + Vector2(-9.5, 2.5), 3.0, Color(1.0, 0.5, 0.6, 0.45))
	draw_circle(head_center + Vector2(9.5, 2.5), 3.0, Color(1.0, 0.5, 0.6, 0.45))
	
	# Anime Eyes with sparkles
	var eye_y = head_center.y - 0.5
	draw_circle(Vector2(-5.5, eye_y), 3.6, Color("#1A1A24"))
	draw_circle(Vector2(5.5, eye_y), 3.6, Color("#1A1A24"))
	draw_circle(Vector2(-5.5, eye_y + 1.0), 2.5, Color("#E65100")) # Amber iris
	draw_circle(Vector2(5.5, eye_y + 1.0), 2.5, Color("#E65100"))
	draw_circle(Vector2(-4.8, eye_y - 1.2), 1.2, Color.WHITE)
	draw_circle(Vector2(6.2, eye_y - 1.2), 1.2, Color.WHITE)
	
	# Friendly Smile
	draw_arc(head_center + Vector2(0, 5.5), 2.5, 0.2 * PI, 0.8 * PI, 8, Color("#8D4343"), 1.8)
	
	# 6. Chibi Trainer Cap with Visor
	draw_circle(head_center + Vector2(0, -6), 14.8, Color("#D32F2F"))
	draw_rect(Rect2(head_center.x - 14, head_center.y - 14, 28, 9), Color("#D32F2F"))
	# White front cap panel with Pokéball-style insignia
	draw_circle(head_center + Vector2(0, -9), 5.5, Color.WHITE)
	draw_circle(head_center + Vector2(0, -9), 2.0, Color("#D32F2F"))
	# Cap Visor
	draw_rect(Rect2(head_center.x - 13, head_center.y - 6, 26, 4), Color("#B71C1C"))
