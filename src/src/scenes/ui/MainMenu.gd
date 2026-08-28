# MainMenu.gd
extends Control

@onready var new_game_btn: Button = %NewGameButton
@onready var continue_btn: Button = %ContinueButton
@onready var settings_btn: Button = %SettingsButton
@onready var quit_btn: Button = %QuitButton

@onready var save_slot_selector: Control = %SaveSlotSelector
@onready var settings_menu: Control = %SettingsMenu

func _ready() -> void:
	new_game_btn.pressed.connect(_on_new_game_pressed)
	continue_btn.pressed.connect(_on_continue_pressed)
	settings_btn.pressed.connect(_on_settings_pressed)
	quit_btn.pressed.connect(_on_quit_pressed)
	
	save_slot_selector.back_pressed.connect(_on_submenu_closed)
	settings_menu.back_pressed.connect(_on_submenu_closed)
	
	save_slot_selector.hide()
	settings_menu.hide()

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
