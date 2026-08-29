# WorkshopInterior.gd
# Manages 3D Workshop & Laboratory interior scene, Shopkeeper interaction, and exit warp
extends Node3D

@onready var player: Player3D = %Player
@onready var shopkeeper: ShopkeeperNPC3D = %ShopkeeperNPC
@onready var parts_shop: Control = %PartsShop
@onready var anibot_assembly: Control = %AnibotAssembly
@onready var dialogue_box = %DialogueBox
@onready var exit_door_area: Area3D = %ExitDoorArea
@onready var credits_label: Label = %CreditsLabel
@onready var scrap_label: Label = %ScrapLabel
@onready var bot_name_label: Label = %BotNameLabel
@onready var garage_btn: Button = %GarageButton
@onready var menu_btn: Button = %MenuButton
@onready var pause_modal: PanelContainer = %PauseModal
@onready var resume_btn: Button = %ResumeButton
@onready var save_game_btn: Button = %SaveGameButton
@onready var save_quit_btn: Button = %SaveQuitButton
@onready var quit_btn: Button = %QuitButton
@onready var save_toast: PanelContainer = %SaveToast
@onready var toast_label: Label = %ToastLabel

var toast_tween: Tween = null

func _ready() -> void:
	if dialogue_box:
		dialogue_box.add_to_group("dialogue_box")
	if parts_shop:
		parts_shop.hide()
		parts_shop.closed.connect(_on_shop_closed)
	if anibot_assembly:
		anibot_assembly.hide()
		anibot_assembly.closed.connect(_on_garage_closed)
	if pause_modal:
		pause_modal.hide()
	if save_toast:
		save_toast.hide()
		
	if shopkeeper:
		shopkeeper.open_shop_requested.connect(_on_open_shop_requested)
		
	if exit_door_area:
		exit_door_area.body_entered.connect(_on_exit_door_entered)
		
	if garage_btn:
		garage_btn.pressed.connect(_toggle_garage)
	if menu_btn:
		menu_btn.pressed.connect(_toggle_pause_menu)
	if resume_btn:
		resume_btn.pressed.connect(_toggle_pause_menu)
	if save_game_btn:
		save_game_btn.pressed.connect(_on_save_game_pressed)
	if save_quit_btn:
		save_quit_btn.pressed.connect(_on_save_quit_pressed)
	if quit_btn:
		quit_btn.pressed.connect(_on_quit_pressed)
		
	SignalBus.economy_updated.connect(_update_hud)
	SignalBus.anibot_part_swapped.connect(func(_b, _s, _p): _update_hud())
	
	# Spawn player near entrance door
	if player:
		player.global_position = Vector3(0.0, 0.0, 3.8)
		
	_update_hud()

func _update_hud() -> void:
	if SaveManager.is_game_loaded:
		var eco = SaveManager.get_economy()
		if scrap_label: scrap_label.text = "Scrap: %d" % eco.get("scrap", 0)
		if credits_label: credits_label.text = "Credits: %d" % eco.get("credits", 0)
		
		var bot = SaveManager.get_active_anibot()
		if bot_name_label: bot_name_label.text = "Bot: %s" % bot.get("bot_name", "Anibot")

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_F5:
		get_viewport().set_input_as_handled()
		_on_save_game_pressed()
		return
		
	if event.is_action_pressed("ui_cancel"):
		if parts_shop and parts_shop.visible:
			parts_shop.hide()
			_on_shop_closed()
		elif anibot_assembly and anibot_assembly.visible:
			anibot_assembly.hide()
			_on_garage_closed()
		elif dialogue_box and not dialogue_box.visible:
			_toggle_pause_menu()
	elif event.is_action_pressed("toggle_garage") or (event is InputEventKey and event.pressed and not event.echo and (event.keycode == KEY_TAB or event.keycode == KEY_I)):
		if not (dialogue_box and dialogue_box.visible) and not (parts_shop and parts_shop.visible):
			_toggle_garage()

func _toggle_garage() -> void:
	if not anibot_assembly: return
	if anibot_assembly.visible:
		anibot_assembly.hide()
		_on_garage_closed()
	else:
		SignalBus.play_sfx_requested.emit("click")
		if player: player.is_control_locked = true
		anibot_assembly.open_garage()

func _on_garage_closed() -> void:
	if player: player.is_control_locked = false
	_update_hud()

func _on_open_shop_requested() -> void:
	if parts_shop:
		if player: player.is_control_locked = true
		parts_shop.open_shop()

func _on_shop_closed() -> void:
	if player: player.is_control_locked = false
	_update_hud()

func _toggle_pause_menu() -> void:
	if not pause_modal: return
	if pause_modal.visible:
		pause_modal.hide()
		if player: player.is_control_locked = false
	else:
		pause_modal.show()
		if player: player.is_control_locked = true

func _on_save_game_pressed() -> void:
	if SaveManager.is_game_loaded:
		SaveManager.active_save_data["player"]["position"] = {"x": -10.0, "y": 0.0, "z": -4.0}
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
		SaveManager.active_save_data["player"]["position"] = {"x": -10.0, "y": 0.0, "z": -4.0}
		SaveManager.save_active_game()
	GameManager.return_to_main_menu()

func _on_quit_pressed() -> void:
	SignalBus.play_sfx_requested.emit("click")
	GameManager.return_to_main_menu()

func _on_exit_door_entered(body: Node3D) -> void:
	if body is Player3D:
		SignalBus.play_sfx_requested.emit("click")
		# Save overworld position right outside the lab door in 3D
		GameManager.saved_overworld_position = Vector3(-10.0, 0.0, -4.5)
		SceneRouter.fade_to_scene("res://src/scenes/overworld/StarterCity.tscn")
