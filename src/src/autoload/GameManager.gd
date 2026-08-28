# GameManager.gd
# Central gameplay flow and session manager
extends Node

enum GameState {
	MAIN_MENU,
	CUSTOMIZATION,
	OVERWORLD_CITY,
	BATTLE
}

var current_state: GameState = GameState.MAIN_MENU
var selected_new_game_slot: int = 1
var saved_overworld_position: Vector2 = Vector2(320, 240)
var active_combat_opponent: Dictionary = {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

func start_new_game_flow(slot_id: int) -> void:
	selected_new_game_slot = slot_id
	current_state = GameState.CUSTOMIZATION
	SceneRouter.change_scene("res://src/scenes/ui/CharacterCustomizer.tscn")

func finalize_character_creation(player_name: String, appearance: Dictionary, starter_chip_id: String) -> void:
	SaveManager.create_new_save(selected_new_game_slot, player_name, appearance, starter_chip_id)
	current_state = GameState.OVERWORLD_CITY
	saved_overworld_position = Vector2(320, 240)
	SceneRouter.change_scene("res://src/scenes/overworld/StarterCity.tscn")

func enter_overworld_from_save(slot_id: int) -> void:
	var success = SaveManager.load_save(slot_id)
	if success:
		current_state = GameState.OVERWORLD_CITY
		var pos_dict = SaveManager.active_save_data.get("player", {}).get("position", {"x": 320.0, "y": 240.0})
		saved_overworld_position = Vector2(pos_dict.get("x", 320.0), pos_dict.get("y", 240.0))
		SceneRouter.change_scene("res://src/scenes/overworld/StarterCity.tscn")

func trigger_sparring_combat(opponent_data: Dictionary, player_current_pos: Vector2) -> void:
	saved_overworld_position = player_current_pos
	active_combat_opponent = opponent_data
	current_state = GameState.BATTLE
	SignalBus.combat_started.emit(opponent_data)
	SceneRouter.change_scene("res://src/scenes/combat/BattleArena.tscn")

func complete_combat(player_won: bool, rewards: Dictionary) -> void:
	current_state = GameState.OVERWORLD_CITY
	if player_won:
		var scrap_reward: int = rewards.get("scrap", 15)
		SaveManager.add_scrap(scrap_reward)
		SaveManager.save_active_game()
	
	SignalBus.combat_ended.emit(player_won, rewards)
	SceneRouter.change_scene("res://src/scenes/overworld/StarterCity.tscn")

func return_to_main_menu() -> void:
	if SaveManager.is_game_loaded:
		SaveManager.save_active_game()
	current_state = GameState.MAIN_MENU
	SceneRouter.change_scene("res://src/scenes/ui/MainMenu.tscn")
