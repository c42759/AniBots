# ShopkeeperNPC3D.gd
# 3D Interactive Master Mechanic & Artificer in the Ato Family Workshop
class_name ShopkeeperNPC3D
extends StaticBody3D

signal open_shop_requested

@export var npc_name: String = "Clara & Master Jax (Ato Workshop)"
@onready var character_model: CompositeCharacter3D = %CompositeCharacter3D
@onready var prompt_mesh: MeshInstance3D = %PromptBubbleMesh

var player_in_range: bool = false
var current_player_node: Node3D = null

func _ready() -> void:
	if prompt_mesh:
		prompt_mesh.hide()
		
	character_model.apply_appearance({
		"hair_style": "hair_03",
		"hair_color": Color("#00838F"),
		"skin_color": Color("#F0D5BE"),
		"shirt_style": "shirt_jacket",
		"shirt_color": Color("#FAFAFA"),
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
		
	var eco := SaveManager.get_economy()
	var greeting := "Welcome to the Ato Family Workshop, Kura! [Credits: %d | Scrap: %d | Patch Kits: %d]\nReady to buy parts, synthesize a 40%% prototype, or overhaul worn gear to 100%%?" % [
		int(eco.get("credits", 0)),
		int(eco.get("scrap", 0)),
		int(eco.get("patch_kits", 0))
	]
	var choices := [
		"1. Open Workshop Catalog & Scrap Synthesis",
		"2. Full Workshop Overhaul -> 100% Condition (5 Scrap/part)",
		"3. Synthesize Random Prototype Part at 40% Condition (50 Scrap)",
		"4. Buy Field-Patch Kit [85% Cap] (80 Credits)",
		"5. Lore: Generation-0 Ancient Chips & NUA Architecture",
		"6. Goodbye."
	]
	
	dialogue_box.show_dialogue(npc_name, greeting, choices)
	dialogue_box.choice_made.connect(_on_choice_made, CONNECT_ONE_SHOT)

func _on_choice_made(choice_idx: int) -> void:
	var dialogue_box = get_tree().get_first_node_in_group("dialogue_box")
	
	match choice_idx:
		0: # Open Shop UI
			if dialogue_box:
				dialogue_box.close_dialogue()
			open_shop_requested.emit()
			
		1: # Full 100% Overhaul
			var result := SaveManager.repair_all_parts(5)
			if dialogue_box:
				if result.get("success", false):
					SignalBus.play_sfx_requested.emit("confirm")
					dialogue_box.show_dialogue(npc_name, "Full Workshop Overhaul complete! Restored %d parts to pristine 100%% Condition for %d Scrap." % [result.get("repaired_count", 0), result.get("cost_scrap", 0)], ["Thanks!"])
				else:
					dialogue_box.show_dialogue(npc_name, "All squad and spare parts are already at 100%% pristine Condition (or insufficient Scrap)!", ["Understood."])
					
		2: # Scrap Synthesis (40% Test Drive)
			var synth := SaveManager.synthesize_random_part(50)
			if dialogue_box:
				if synth.get("success", false):
					SignalBus.play_sfx_requested.emit("confirm")
					dialogue_box.show_dialogue(npc_name, "FABRICATION SUCCESS! Forged [%s] at 40%% 'Test Drive' Condition for 50 Scrap!\nTake it into battle to test it out, then overhaul it to 100%% or recycle it!" % synth.get("part_name", "Prototype Part"), ["Awesome!"])
				else:
					SignalBus.play_sfx_requested.emit("cancel")
					dialogue_box.show_dialogue(npc_name, str(synth.get("reason", "Insufficient Scrap!")), ["Got it."])
					
		3: # Buy Field-Patch Kit
			if SaveManager.purchase_patch_kit(80):
				SignalBus.play_sfx_requested.emit("confirm")
				if dialogue_box:
					dialogue_box.show_dialogue(npc_name, "Purchased 1 Field-Patch Kit for 80 Credits! You can apply it in the Garage [TAB] to restore any damaged part up to the 85%% field cap.", ["Thanks!"])
			else:
				SignalBus.play_sfx_requested.emit("cancel")
				if dialogue_box:
					dialogue_box.show_dialogue(npc_name, "Insufficient Credits! Field-Patch Kits cost 80 Credits.", ["I'll earn more."])
					
		4: # Lore
			if dialogue_box:
				var lore_text := "Every AniBot is built around the Neutral Under-Skeleton Anchor (NUA) inside the Torso—no external Tinpet required! Omni-Relay couplers connect Head, Left/Right Arms, and Legs.\nAnd your Zerdata runs on Vulpes Zerda (G0-004)—one of only 10 surviving Ancient Series cores from 2750 AD!"
				dialogue_box.show_dialogue(npc_name, lore_text, ["Fascinating!"])
				
		5: # Goodbye
			if dialogue_box:
				dialogue_box.close_dialogue()
