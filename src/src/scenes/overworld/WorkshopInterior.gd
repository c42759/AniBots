# WorkshopInterior.gd
# Manages the Workshop & Laboratory interior scene, Shopkeeper interaction, and exit warp
extends Node2D

@onready var player: Player = find_child("Player", true, false)
@onready var shopkeeper: ShopkeeperNPC = find_child("ShopkeeperNPC", true, false)
@onready var parts_shop: Control = find_child("PartsShop", true, false)
@onready var anibot_assembly: Control = find_child("AnibotAssembly", true, false)
@onready var dialogue_box = find_child("DialogueBox", true, false)
@onready var exit_door_area: Area2D = find_child("ExitDoorArea", true, false)
@onready var credits_label: Label = find_child("CreditsLabel", true, false)
@onready var scrap_label: Label = find_child("ScrapLabel", true, false)
@onready var bot_name_label: Label = find_child("BotNameLabel", true, false)
@onready var garage_btn: Button = find_child("GarageButton", true, false)
@onready var menu_btn: Button = find_child("MenuButton", true, false)
@onready var pause_modal: PanelContainer = find_child("PauseModal", true, false)
@onready var resume_btn: Button = find_child("ResumeButton", true, false)
@onready var save_game_btn: Button = find_child("SaveGameButton", true, false)
@onready var save_quit_btn: Button = find_child("SaveQuitButton", true, false)
@onready var quit_btn: Button = find_child("QuitButton", true, false)
@onready var save_toast: PanelContainer = find_child("SaveToast", true, false)
@onready var toast_label: Label = find_child("ToastLabel", true, false)

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
	
	# Spawn player just inside the door
	if player:
		player.global_position = Vector2(600, 520)
		
	_update_hud()
	if player:
		player.global_position = Vector2(600, 520)
		
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
		SaveManager.active_save_data["player"]["position"] = {"x": 160.0, "y": 270.0}
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
		SaveManager.active_save_data["player"]["position"] = {"x": 160.0, "y": 270.0}
		SaveManager.save_active_game()
	GameManager.return_to_main_menu()

func _on_quit_pressed() -> void:
	SignalBus.play_sfx_requested.emit("click")
	GameManager.return_to_main_menu()

func _on_exit_door_entered(body: Node2D) -> void:
	if body is Player:
		SignalBus.play_sfx_requested.emit("click")
		# Save overworld position right outside the door
		GameManager.saved_overworld_position = Vector2(160, 270)
		SceneRouter.fade_to_scene("res://src/scenes/overworld/StarterCity.tscn")

func _draw() -> void:
	# 1. Outer Dark Background
	draw_rect(Rect2(-100, -100, 1400, 1000), Color("#1A1A24"))
	
	# 2. Workshop Room Floor (Warm Rich Parquet Flooring: 200, 80, 800, 520)
	var floor_rect = Rect2(200, 80, 800, 520)
	draw_rect(floor_rect, Color("#D7CCC8")) # Warm beige foundation
	draw_rect(Rect2(210, 90, 780, 500), Color("#EFEBE9")) # Clean lab tiles
	
	# Parquet Tile Lines
	for x in range(210, 990, 60):
		for y in range(90, 590, 60):
			draw_rect(Rect2(x, y, 58, 58), Color(0.3, 0.2, 0.1, 0.05))
			draw_rect(Rect2(x, y, 58, 58), Color("#BCAAA4", 0.4), false, 1.0)
			
	# Back Wall Trim
	draw_rect(Rect2(200, 80, 800, 40), Color("#5D4037")) # Dark wood upper wall
	draw_rect(Rect2(200, 116, 800, 8), Color("#8D6E63")) # Baseboard
	
	# 3. Holographic Anibot Repair Pod (Top-Left corner: 250, 130)
	draw_rect(Rect2(250, 130, 100, 90), Color("#37474F")) # Pod base
	draw_rect(Rect2(256, 136, 88, 78), Color("#00E5FF", 0.25)) # Cyan glass glow
	draw_rect(Rect2(256, 136, 88, 78), Color("#00E5FF"), false, 2.0)
	draw_circle(Vector2(300, 175), 18.0, Color("#00E5FF", 0.6)) # Pod Core
	draw_line(Vector2(250, 220), Vector2(350, 220), Color("#FFD54F"), 3.0) # Pod Caution tape
	
	# 4. Workbench & Tool Rack (Top-Right: 750, 130)
	draw_rect(Rect2(730, 130, 230, 80), Color("#6D4C41")) # Heavy wooden workbench
	draw_rect(Rect2(736, 136, 218, 68), Color("#8D6E63"))
	# Tech monitor on bench
	draw_rect(Rect2(760, 144, 40, 26), Color("#263238"))
	draw_rect(Rect2(762, 146, 36, 22), Color("#40C4FF")) # Blue screen
	# Toolbox
	draw_rect(Rect2(830, 150, 30, 20), Color("#D32F2F"))
	draw_circle(Vector2(845, 150), 3.0, Color("#FFEB3B"))
	# Wrench & Cog decor
	draw_circle(Vector2(910, 160), 10.0, Color("#90A4AE"))
	draw_circle(Vector2(910, 160), 5.0, Color("#6D4C41"))
	
	# 5. Blueprints Blackboard on back wall (460, 88)
	draw_rect(Rect2(460, 86, 180, 30), Color("#01579B"))
	draw_rect(Rect2(460, 86, 180, 30), Color("#BCAAA4"), false, 2.0)
	draw_line(Vector2(480, 100), Vector2(530, 100), Color.WHITE, 1.2)
	draw_line(Vector2(550, 100), Vector2(620, 100), Color.WHITE, 1.2)
	
	# 6. Front Door Exit Mat (540, 560)
	draw_rect(Rect2(540, 560, 120, 35), Color("#B71C1C")) # Welcome Mat
	draw_rect(Rect2(544, 564, 112, 27), Color("#D32F2F"))
	draw_rect(Rect2(544, 564, 112, 27), Color("#FFD54F"), false, 2.0)
