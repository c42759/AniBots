# StarterCity.gd
# Manages 3D overworld city environment, HUD, and player positioning
extends Node3D

@onready var player: Player3D = %Player
@onready var dialogue_box = %DialogueBox
@onready var scrap_label: Label = %ScrapLabel
@onready var credits_label: Label = %CreditsLabel
@onready var bot_name_label: Label = %BotNameLabel
@onready var pause_modal: PanelContainer = %PauseModal
@onready var resume_btn: Button = %ResumeButton
@onready var save_game_btn: Button = %SaveGameButton
@onready var save_quit_btn: Button = %SaveQuitButton
@onready var quit_btn: Button = %QuitButton
@onready var save_toast: PanelContainer = %SaveToast
@onready var toast_label: Label = %ToastLabel
@onready var anibot_assembly: Control = %AnibotAssembly
@onready var garage_btn: Button = %GarageButton
@onready var door_area: Area3D = %WorkshopDoorArea
@onready var door_prompt: PanelContainer = %DoorPrompt

var player_at_workshop_door: bool = false
var toast_tween: Tween = null

func _ready() -> void:
	dialogue_box.add_to_group("dialogue_box")
	pause_modal.hide()
	anibot_assembly.hide()
	if save_toast: save_toast.hide()
	if door_prompt: door_prompt.hide()
	
	# Position player from last saved location (handling Vector2 or Vector3)
	var saved_pos = GameManager.saved_overworld_position
	if saved_pos is Vector3:
		player.global_position = saved_pos
	elif saved_pos is Vector2:
		# Convert legacy 2D pixel coordinates (e.g. 600, 410) to 3D world meters
		var x_3d = (saved_pos.x - 600.0) * 0.03
		var z_3d = (saved_pos.y - 410.0) * 0.03
		player.global_position = Vector3(x_3d, 0.0, z_3d)
	
	_update_hud()
	resume_btn.pressed.connect(_on_resume_pressed)
	if save_game_btn: save_game_btn.pressed.connect(_on_save_game_pressed)
	save_quit_btn.pressed.connect(_on_save_quit_pressed)
	if quit_btn: quit_btn.pressed.connect(_on_quit_pressed)
	%MenuButton.pressed.connect(_on_menu_button_pressed)
	garage_btn.pressed.connect(_on_garage_button_pressed)
	anibot_assembly.closed.connect(_on_garage_closed)
	SignalBus.anibot_part_swapped.connect(func(_b, _s, _p): _update_hud())
	
	if door_area:
		door_area.body_entered.connect(_on_door_entered)
		door_area.body_exited.connect(_on_door_exited)

func _on_door_entered(body: Node3D) -> void:
	if body is Player3D:
		player_at_workshop_door = true
		if door_prompt: door_prompt.show()

func _on_door_exited(body: Node3D) -> void:
	if body is Player3D:
		player_at_workshop_door = false
		if door_prompt: door_prompt.hide()

func _enter_workshop() -> void:
	SignalBus.play_sfx_requested.emit("click")
	GameManager.saved_overworld_position = player.global_position
	SceneRouter.fade_to_scene("res://src/scenes/overworld/WorkshopInterior.tscn")

func _update_hud() -> void:
	if SaveManager.is_game_loaded:
		var eco = SaveManager.get_economy()
		scrap_label.text = "Scrap: %d" % eco.get("scrap", 0)
		credits_label.text = "Credits: %d" % eco.get("credits", 0)
		
		var bot = SaveManager.get_active_anibot()
		bot_name_label.text = "Bot: %s" % bot.get("bot_name", "Anibot")

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_F5:
		get_viewport().set_input_as_handled()
		_on_save_game_pressed()
		return
		
	if player_at_workshop_door and event.is_action_pressed("interact"):
		if not (dialogue_box and dialogue_box.visible):
			get_viewport().set_input_as_handled()
			_enter_workshop()
			return
			
	if event.is_action_pressed("ui_cancel"):
		if anibot_assembly.visible:
			anibot_assembly.hide()
			_on_garage_closed()
		elif not dialogue_box.visible:
			_toggle_pause_menu()
	elif event.is_action_pressed("toggle_garage") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_TAB or event.keycode == KEY_I)):
		if not dialogue_box.visible and not pause_modal.visible:
			_toggle_garage()

func _toggle_garage() -> void:
	if anibot_assembly.visible:
		anibot_assembly.hide()
		_on_garage_closed()
	else:
		_on_garage_button_pressed()

func _on_garage_button_pressed() -> void:
	SignalBus.play_sfx_requested.emit("click")
	player.is_control_locked = true
	anibot_assembly.open_garage()

func _on_garage_closed() -> void:
	player.is_control_locked = false
	_update_hud()

func _toggle_pause_menu() -> void:
	if pause_modal.visible:
		pause_modal.hide()
		player.is_control_locked = false
	else:
		pause_modal.show()
		player.is_control_locked = true

func _on_menu_button_pressed() -> void:
	SignalBus.play_sfx_requested.emit("click")
	_toggle_pause_menu()

func _on_resume_pressed() -> void:
	SignalBus.play_sfx_requested.emit("confirm")
	pause_modal.hide()
	player.is_control_locked = false

func _on_save_game_pressed() -> void:
	if SaveManager.is_game_loaded:
		SaveManager.active_save_data["player"]["position"] = {
			"x": player.global_position.x,
			"y": player.global_position.y,
			"z": player.global_position.z
		}
		var success = SaveManager.save_active_game()
		if success:
			SignalBus.play_sfx_requested.emit("confirm")
			_show_save_toast("✓ Game Saved to Slot %d!" % SaveManager.current_slot_id)
		else:
			SignalBus.play_sfx_requested.emit("cancel")
			_show_save_toast("⚠ Failed to Save Game!")

func _show_save_toast(message: String) -> void:
	if not save_toast or not toast_label: return
	toast_label.text = message
	save_toast.show()
	save_toast.modulate.a = 1.0
	
	if toast_tween and toast_tween.is_valid():
		toast_tween.kill()
		
	toast_tween = create_tween()
	toast_tween.tween_interval(2.0)
	toast_tween.tween_property(save_toast, "modulate:a", 0.0, 0.5)
	toast_tween.tween_callback(save_toast.hide)

func _on_save_quit_pressed() -> void:
	SignalBus.play_sfx_requested.emit("confirm")
	if SaveManager.is_game_loaded:
		SaveManager.active_save_data["player"]["position"] = {
			"x": player.global_position.x,
			"y": player.global_position.y,
			"z": player.global_position.z
		}
		SaveManager.save_active_game()
	GameManager.return_to_main_menu()

func _on_quit_pressed() -> void:
	SignalBus.play_sfx_requested.emit("click")
	GameManager.return_to_main_menu()
