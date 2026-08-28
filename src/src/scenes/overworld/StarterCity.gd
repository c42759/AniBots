# StarterCity.gd
# Manages overworld city environment, HUD, and player positioning
extends Node2D

@onready var player: Player = %Player
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
@onready var door_area: Area2D = %WorkshopDoorArea
@onready var door_prompt: PanelContainer = %DoorPrompt

var player_at_workshop_door: bool = false
var toast_tween: Tween = null

func _ready() -> void:
	dialogue_box.add_to_group("dialogue_box")
	pause_modal.hide()
	anibot_assembly.hide()
	if save_toast: save_toast.hide()
	if door_prompt: door_prompt.hide()
	
	# Position player from last saved location
	player.global_position = GameManager.saved_overworld_position
	
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

func _on_door_entered(body: Node2D) -> void:
	if body is Player:
		player_at_workshop_door = true
		if door_prompt: door_prompt.show()

func _on_door_exited(body: Node2D) -> void:
	if body is Player:
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
			"y": player.global_position.y
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
			"y": player.global_position.y
		}
		SaveManager.save_active_game()
	GameManager.return_to_main_menu()

func _on_quit_pressed() -> void:
	SignalBus.play_sfx_requested.emit("click")
	GameManager.return_to_main_menu()

func _draw() -> void:
	# 1. Lush Green Emerald Ground (BDSP Sinnoh Palette)
	draw_rect(Rect2(-300, -300, 1800, 1400), Color("#43A047")) # Base lush meadow
	draw_rect(Rect2(0, 0, 1200, 800), Color("#4CAF50")) # Town boundary
	
	# Checkerboard Grass Pattern (BDSP Style)
	for gx in range(0, 1200, 80):
		for gy in range(0, 800, 80):
			if (gx / 80 + gy / 80) % 2 == 0:
				draw_rect(Rect2(gx, gy, 80, 80), Color("#43A047", 0.35))
	
	# 2. Warm Cobblestone Paved Roads & Plaza
	var road_col = Color("#D7CCC8") # Soft cobblestone cream
	var road_border_col = Color("#BCAAA4")
	
	# North-South Main Street
	draw_rect(Rect2(420, 20, 360, 760), road_border_col)
	draw_rect(Rect2(428, 20, 344, 760), road_col)
	
	# East-West Main Street
	draw_rect(Rect2(20, 320, 1160, 180), road_border_col)
	draw_rect(Rect2(20, 328, 1160, 164), road_col)
	
	# Center Circular Plaza with Fountain/Tile Inset
	draw_circle(Vector2(600, 410), 130.0, road_border_col)
	draw_circle(Vector2(600, 410), 122.0, road_col)
	draw_circle(Vector2(600, 410), 80.0, Color("#80DEEA")) # Plaza Water Fountain / Pool
	draw_circle(Vector2(600, 410), 74.0, Color("#00BCD4")) # Inner water
	draw_circle(Vector2(600, 410), 30.0, Color("#B2EBF2")) # Center fountain spray
	draw_circle(Vector2(600, 410), 12.0, Color("#E0F7FA"))
	
	# Cobblestone Tile Pavers Texture
	for px in range(440, 760, 40):
		for py in range(40, 760, 40):
			if Vector2(px, py).distance_to(Vector2(600, 410)) > 90:
				draw_rect(Rect2(px, py, 36, 36), Color(0, 0, 0, 0.04), false, 1.5)

	# 3. Sparring Combat Ring (Southeast zone)
	draw_rect(Rect2(820, 500, 340, 260), Color("#263238")) # Raised Ring base
	draw_rect(Rect2(830, 510, 320, 240), Color("#37474F")) # Ring mat
	draw_rect(Rect2(830, 510, 320, 240), Color("#00E5FF"), false, 4.0) # Glowing neon border
	draw_line(Vector2(990, 510), Vector2(990, 750), Color("#FFD600"), 3.0) # Center line
	draw_circle(Vector2(990, 630), 28.0, Color(1, 0.84, 0, 0.2)) # Center ring badge
	
	# Corner Turnbuckles / Energy Posts
	draw_circle(Vector2(830, 510), 8.0, Color("#00E5FF"))
	draw_circle(Vector2(1150, 510), 8.0, Color("#FF1744"))
	draw_circle(Vector2(830, 750), 8.0, Color("#00E5FF"))
	draw_circle(Vector2(1150, 750), 8.0, Color("#FF1744"))

	# 4. Cute Cartoon Trees & Flower Patches
	_draw_chibi_flower_patch(Vector2(120, 80))
	_draw_chibi_flower_patch(Vector2(240, 260))
	_draw_chibi_flower_patch(Vector2(920, 100))
	_draw_chibi_flower_patch(Vector2(1040, 260))
	_draw_chibi_flower_patch(Vector2(120, 620))
	_draw_chibi_flower_patch(Vector2(260, 700))
	
	# Cartoon Puffy Trees with Shadows
	_draw_chibi_tree(Vector2(80, 240))
	_draw_chibi_tree(Vector2(320, 100))
	_draw_chibi_tree(Vector2(880, 80))
	_draw_chibi_tree(Vector2(1100, 220))
	_draw_chibi_tree(Vector2(80, 520))
	_draw_chibi_tree(Vector2(320, 720))

func _draw_chibi_tree(pos: Vector2) -> void:
	# Shadow
	draw_circle(pos + Vector2(0, 14), 22.0, Color(0, 0, 0, 0.22))
	# Trunk (Chubby wooden stump)
	draw_rect(Rect2(pos.x - 7, pos.y - 4, 14, 18), Color("#795548"))
	draw_rect(Rect2(pos.x - 5, pos.y - 2, 10, 16), Color("#8D6E63"))
	# Puffy Canopy (Multiple overlapping bright green circles)
	draw_circle(pos + Vector2(0, -22), 26.0, Color("#2E7D32")) # Back shadow leaf
	draw_circle(pos + Vector2(-14, -18), 20.0, Color("#388E3C"))
	draw_circle(pos + Vector2(14, -18), 20.0, Color("#388E3C"))
	draw_circle(pos + Vector2(0, -26), 22.0, Color("#4CAF50")) # Main bright top
	draw_circle(pos + Vector2(-6, -30), 8.0, Color("#81C784")) # Sun highlight

func _draw_chibi_flower_patch(pos: Vector2) -> void:
	# Small dirt mound
	draw_circle(pos, 22.0, Color("#66BB6A", 0.7))
	# Colorful chibi flower blossoms
	var flower_colors = [Color("#FF5252"), Color("#FFEB3B"), Color("#40C4FF"), Color("#FFFFFF"), Color("#E040FB")]
	var offsets = [Vector2(-10, -8), Vector2(8, -10), Vector2(-6, 8), Vector2(10, 6), Vector2(0, -1)]
	for i in range(5):
		var f_pos = pos + offsets[i]
		draw_circle(f_pos, 4.0, flower_colors[i])
		draw_circle(f_pos, 1.8, Color("#FFF59D")) # Flower center
	
	# Road divider lines
	for y in range(60, 760, 60):
		draw_rect(Rect2(596, y, 8, 30), Color("#ECEFF1"))
	for x in range(60, 1140, 60):
		draw_rect(Rect2(x, 406, 30, 8), Color("#ECEFF1"))
