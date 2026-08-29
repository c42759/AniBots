# ShopkeeperNPC.gd
# Interactive Chibi Scientist Shopkeeper "Clara (Master Artificer)" in the Workshop
class_name ShopkeeperNPC
extends CharacterBody2D

signal open_shop_requested

@export var npc_name: String = "Clara (Master Artificer)"
@onready var prompt_bubble: PanelContainer = find_child("PromptBubble", true, false)
@onready var interaction_area: Area2D = find_child("InteractionArea", true, false)

var player_in_range: bool = false
var current_player_node: Node2D = null

func _ready() -> void:
	if prompt_bubble:
		prompt_bubble.hide()
	if interaction_area:
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
		if prompt_bubble:
			prompt_bubble.show()

func _on_body_exited(body: Node2D) -> void:
	if body is Player:
		player_in_range = false
		if prompt_bubble:
			prompt_bubble.hide()

func interact(player: Node2D) -> void:
	current_player_node = player
	if prompt_bubble:
		prompt_bubble.hide()
	SignalBus.play_sfx_requested.emit("click")
	_start_dialogue_flow()

func _start_dialogue_flow() -> void:
	var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
	if not dialogue_box:
		open_shop_requested.emit()
		return
		
	var greeting = "Welcome to the Lab, Handler! Need fresh hardware components for your AniBot, or looking to repair battle-worn parts?"
	var choices = [
		"1. Browse Parts Catalog (Buy Parts)",
		"2. Quick Repair All Parts (5 Scrap)",
		"3. What are AniBots?",
		"4. Goodbye."
	]
	
	dialogue_box.show_dialogue(npc_name, greeting, choices)
	dialogue_box.choice_made.connect(_on_choice_made, CONNECT_ONE_SHOT)

func _on_choice_made(choice_idx: int) -> void:
	var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
	
	match choice_idx:
		0: # Open Shop
			if dialogue_box:
				dialogue_box.close_dialogue()
			open_shop_requested.emit()
			
		1: # Repair
			var result = SaveManager.repair_all_parts(5)
			if dialogue_box:
				if result.get("success", false):
					dialogue_box.show_dialogue(npc_name, "All systems nominal! Repaired %d parts for %d Scrap." % [result.get("repaired_count", 0), result.get("cost_scrap", 0)], ["Thanks, Clara!"])
				else:
					dialogue_box.show_dialogue(npc_name, "Your equipped and spare parts are already in pristine condition!", ["Understood."])
					
		2: # Lore
			if dialogue_box:
				var lore_text = "AniBots are autonomous robotic combat frames powered by Anima Chips. Each bot consists of 5 modular components: Head, Torso, Left Arm, Right Arm, and Legs. Matching part series with chip affinity boosts your combat latency!"
				dialogue_box.show_dialogue(npc_name, lore_text, ["Got it, thanks!"])
				
		3: # Goodbye
			if dialogue_box:
				dialogue_box.close_dialogue()

func _draw() -> void:
	var idle_bob = sin(Time.get_ticks_msec() * 0.004) * 1.5
	
	# 1. Drop Shadow
	draw_circle(Vector2(0, 18), 12.0, Color(0, 0, 0, 0.28))
	
	# 2. Stubby Chibi Shoes
	draw_circle(Vector2(-6, 14), 3.5, Color("#455A64"))
	draw_rect(Rect2(-8.5, 12, 5, 5), Color("#455A64"))
	draw_circle(Vector2(6, 14), 3.5, Color("#455A64"))
	draw_rect(Rect2(3.5, 12, 5, 5), Color("#455A64"))
	
	# 3. Chibi Pants
	draw_rect(Rect2(-7.5, 4 + idle_bob, 15, 8), Color("#37474F"))
	
	# 4. White Scientist Lab Coat & Inner Teal Shirt
	draw_rect(Rect2(-9.0, -6 + idle_bob, 18, 12), Color("#FAFAFA")) # White Lab Coat
	draw_rect(Rect2(-3.0, -6 + idle_bob, 6, 12), Color("#00897B")) # Teal Inner Shirt
	# Coat buttons & lapels
	draw_line(Vector2(-7, -6 + idle_bob), Vector2(-3, 1 + idle_bob), Color("#CFD8DC"), 2.0)
	draw_line(Vector2(7, -6 + idle_bob), Vector2(3, 1 + idle_bob), Color("#CFD8DC"), 2.0)
	draw_circle(Vector2(0, 3 + idle_bob), 1.5, Color("#90A4AE")) # Pocket pen
	
	# Chibi Arms with Lab Coat Sleeves
	draw_circle(Vector2(-11, -1 + idle_bob), 3.0, Color("#FAFAFA"))
	draw_circle(Vector2(-11, 6 + idle_bob), 2.5, Color("#F0D5BE"))
	draw_circle(Vector2(11, -1 + idle_bob), 3.0, Color("#FAFAFA"))
	draw_circle(Vector2(11, 6 + idle_bob), 2.5, Color("#F0D5BE"))
	
	# 5. Oversized Chibi Head
	var head_center = Vector2(0, -17 + idle_bob)
	draw_circle(head_center, 14.5, Color("#F0D5BE"))
	draw_circle(head_center + Vector2(0, 2), 14.0, Color("#F0D5BE"))
	
	# Cheeks Blush
	draw_circle(head_center + Vector2(-9.5, 2.5), 3.0, Color(1.0, 0.5, 0.6, 0.45))
	draw_circle(head_center + Vector2(9.5, 2.5), 3.0, Color(1.0, 0.5, 0.6, 0.45))
	
	# Big Expressive Anime Eyes (Emerald Iris)
	var eye_y = head_center.y - 0.5
	draw_circle(Vector2(-5.5, eye_y), 3.6, Color("#1A1A24"))
	draw_circle(Vector2(5.5, eye_y), 3.6, Color("#1A1A24"))
	draw_circle(Vector2(-5.5, eye_y + 1.0), 2.5, Color("#00BFA5"))
	draw_circle(Vector2(5.5, eye_y + 1.0), 2.5, Color("#00BFA5"))
	draw_circle(Vector2(-4.8, eye_y - 1.2), 1.2, Color.WHITE)
	draw_circle(Vector2(6.2, eye_y - 1.2), 1.2, Color.WHITE)
	
	# Cute Round Scientist Glasses
	draw_arc(Vector2(-5.5, eye_y), 4.5, 0, TAU, 16, Color("#FFD54F"), 1.8)
	draw_arc(Vector2(5.5, eye_y), 4.5, 0, TAU, 16, Color("#FFD54F"), 1.8)
	draw_line(Vector2(-1.0, eye_y), Vector2(1.0, eye_y), Color("#FFD54F"), 1.8)
	
	# Smile
	draw_arc(head_center + Vector2(0, 5.5), 2.5, 0.2 * PI, 0.8 * PI, 8, Color("#8D4343"), 1.8)
	
	# 6. Teal Hair with Updo Bun
	var hair_col = Color("#00838F")
	var highlight_col = Color("#4DD0E1")
	draw_circle(head_center + Vector2(0, -4), 15.0, hair_col)
	draw_circle(head_center + Vector2(0, -18), 7.5, hair_col) # High Bun
	draw_circle(head_center + Vector2(0, -18), 2.5, highlight_col)
	# Side bangs
	draw_circle(head_center + Vector2(-12, -4), 5.0, hair_col)
	draw_circle(head_center + Vector2(12, -4), 5.0, hair_col)
