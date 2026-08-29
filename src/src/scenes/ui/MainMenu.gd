# MainMenu.gd
# 3D Showroom Main Menu Controller
extends Control

@onready var new_game_btn: Button = %NewGameButton
@onready var continue_btn: Button = %ContinueButton
@onready var settings_btn: Button = %SettingsButton
@onready var quit_btn: Button = %QuitButton

@onready var save_slot_selector: Control = %SaveSlotSelector
@onready var settings_menu: Control = %SettingsMenu
@onready var showroom_bot: AniBotModel3D = %ShowroomBot

func _ready() -> void:
	new_game_btn.pressed.connect(_on_new_game_pressed)
	continue_btn.pressed.connect(_on_continue_pressed)
	settings_btn.pressed.connect(_on_settings_pressed)
	quit_btn.pressed.connect(_on_quit_pressed)
	
	save_slot_selector.back_pressed.connect(_on_submenu_closed)
	settings_menu.back_pressed.connect(_on_submenu_closed)
	
	save_slot_selector.hide()
	settings_menu.hide()
	
	if showroom_bot:
		showroom_bot.setup_model({
			"bot_name": "Genesis-1",
			"chip_id": "chip_artificer",
			"parts": {
				"head": {"part_id": "part_head_logic_bomb", "condition": 100.0},
				"left_arm": {"part_id": "part_arm_l_wrench", "condition": 100.0},
				"right_arm": {"part_id": "part_arm_r_ratchet", "condition": 100.0},
				"torso": {"part_id": "part_torso_genesis", "condition": 100.0},
				"legs": {"part_id": "part_legs_steady_tread", "condition": 100.0}
			}
		}, true)

func _process(delta: float) -> void:
	if showroom_bot:
		showroom_bot.rotation.y += delta * 0.45

func _on_new_game_pressed() -> void:
	SignalBus.play_sfx_requested.emit("confirm")
	save_slot_selector.open_for_mode(save_slot_selector.Mode.NEW_GAME)

func _on_continue_pressed() -> void:
	SignalBus.play_sfx_requested.emit("confirm")
	save_slot_selector.open_for_mode(save_slot_selector.Mode.CONTINUE_GAME)

func _on_settings_pressed() -> void:
	SignalBus.play_sfx_requested.emit("click")
	settings_menu.show()

func _on_quit_pressed() -> void:
	SignalBus.play_sfx_requested.emit("cancel")
	get_tree().quit()

func _on_submenu_closed() -> void:
	pass
