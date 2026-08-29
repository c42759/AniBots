# GameManager.gd
# Central gameplay flow and session manager
extends Node

enum GameState {
	MAIN_MENU,
	CUSTOMIZATION,
	OVERWORLD_CITY,
	BATTLE,
	CLASH_CUTSCENE
}

var current_state: GameState = GameState.MAIN_MENU
var selected_new_game_slot: int = 1
var saved_overworld_position: Vector3 = Vector3(0.0, 0.0, 3.0)
var active_combat_opponent: Dictionary = {}
var active_battle_session: Dictionary = {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

func start_new_game_flow(slot_id: int) -> void:
	selected_new_game_slot = slot_id
	current_state = GameState.CUSTOMIZATION
	SceneRouter.change_scene("res://src/scenes/ui/CharacterCustomizer.tscn")

func finalize_character_creation(player_name: String, appearance: Dictionary, starter_chip_id: String) -> void:
	SaveManager.create_new_save(selected_new_game_slot, player_name, appearance, starter_chip_id)
	current_state = GameState.OVERWORLD_CITY
	saved_overworld_position = Vector3(0.0, 0.0, 3.0)
	SceneRouter.change_scene("res://src/scenes/overworld/StarterCity.tscn")

func enter_overworld_from_save(slot_id: int) -> void:
	var success = SaveManager.load_save(slot_id)
	if success:
		current_state = GameState.OVERWORLD_CITY
		var pos_dict = SaveManager.active_save_data.get("player", {}).get("position", {"x": 0.0, "y": 0.0, "z": 3.0})
		if pos_dict.has("z"):
			saved_overworld_position = Vector3(pos_dict.get("x", 0.0), pos_dict.get("y", 0.0), pos_dict.get("z", 3.0))
		else:
			# Legacy 2D coords
			saved_overworld_position = Vector3((pos_dict.get("x", 600.0) - 600.0) * 0.03, 0.0, (pos_dict.get("y", 410.0) - 410.0) * 0.03)
		SceneRouter.change_scene("res://src/scenes/overworld/StarterCity.tscn")

func trigger_sparring_combat(opponent_data: Dictionary, player_current_pos: Variant) -> void:
	if player_current_pos is Vector3:
		saved_overworld_position = player_current_pos
	elif player_current_pos is Vector2:
		saved_overworld_position = Vector3(player_current_pos.x, 0.0, player_current_pos.y)
		
	active_combat_opponent = opponent_data
	active_battle_session = {} # Fresh session
	current_state = GameState.BATTLE
	SignalBus.combat_started.emit(opponent_data)
	SceneRouter.change_scene("res://src/scenes/combat/BattleArena.tscn")

func trigger_clash(attacker_is_player: bool, action_part: Dictionary, is_ult: bool) -> void:
	current_state = GameState.CLASH_CUTSCENE
	active_battle_session["last_clash"] = {
		"attacker_is_player": attacker_is_player,
		"action_part": action_part,
		"is_ult": is_ult
	}
	SceneRouter.change_scene("res://src/scenes/combat/clash/CombatClash3D.tscn")

func return_from_clash_to_arena() -> void:
	current_state = GameState.BATTLE
	SceneRouter.change_scene("res://src/scenes/combat/BattleArena.tscn")

func complete_combat(player_won: bool, rewards: Dictionary) -> void:
	current_state = GameState.OVERWORLD_CITY
	active_battle_session = {}
	if player_won:
		var scrap_reward: int = rewards.get("scrap", 15)
		SaveManager.add_scrap(scrap_reward)
		SaveManager.save_active_game()
	
	SignalBus.combat_ended.emit(player_won, rewards)
	SceneRouter.change_scene("res://src/scenes/overworld/StarterCity.tscn")

func return_to_main_menu() -> void:
	if SaveManager.is_game_loaded:
		SaveManager.save_active_game()
	active_battle_session = {}
	current_state = GameState.MAIN_MENU
	SceneRouter.change_scene("res://src/scenes/ui/MainMenu.tscn")
