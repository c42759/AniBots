# ShopkeeperNPC3D.gd
# 3D Interactive Scientist Shopkeeper "Clara (Master Artificer)" in the Workshop
class_name ShopkeeperNPC3D
extends StaticBody3D

signal open_shop_requested

@export var npc_name: String = "Clara (Master Artificer)"
@onready var character_model: CompositeCharacter3D = %CompositeCharacter3D
@onready var prompt_mesh: MeshInstance3D = %PromptBubbleMesh

var player_in_range: bool = false
var current_player_node: Node3D = null

func _ready() -> void:
	if prompt_mesh:
		prompt_mesh.hide()
		
	# Configure Clara's Scientist Lab Coat & Teal Hair
	character_model.apply_appearance({
		"hair_style": "hair_03",
		"hair_color": Color("#00838F"), # Teal hair bun
		"skin_color": Color("#F0D5BE"),
		"shirt_style": "shirt_jacket",
		"shirt_color": Color("#FAFAFA"), # White Lab Coat
		"bottom_style": "bottom_cargo",
		"bottom_color": Color("#37474F"),
		"shoe_style": "shoes_sneakers",
		"shoe_color": Color("#455A64")
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
