# StarterCity.gd
# Manages 3D overworld city environment (Neo Metropolis District 4), textured surfaces,
# stylized 3D eco-trees, Sparring Ring platform, HUD, and player positioning
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
var fountain_water_mat: StandardMaterial3D = null

func _ready() -> void:
	dialogue_box.add_to_group("dialogue_box")
	pause_modal.hide()
	anibot_assembly.hide()
	if save_toast: save_toast.hide()
	if door_prompt: door_prompt.hide()
	
	_apply_environment_textures_and_props()
	
	# Position player from last saved location (handling Vector2 or Vector3)
	var saved_pos = GameManager.saved_overworld_position
	if saved_pos is Vector3:
		player.global_position = saved_pos
	elif saved_pos is Vector2:
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
	SignalBus.anibot_chip_swapped.connect(func(_b, _c): _update_hud())
	
	if door_area:
		door_area.body_entered.connect(_on_door_entered)
		door_area.body_exited.connect(_on_door_exited)

func _process(delta: float) -> void:
	if fountain_water_mat:
		fountain_water_mat.uv1_offset.x += delta * 0.12
		fountain_water_mat.uv1_offset.y += delta * 0.08

func _apply_environment_textures_and_props() -> void:
	# 1. Eco-City Turf Ground
	var ground_mesh := get_node_or_null("Terrain/GroundPlane") as MeshInstance3D
	if ground_mesh:
		ground_mesh.material_override = EnvironmentTextureService.create_tiled_material(
			"grass_eco_turf.png", Vector3(18, 18, 1), 0.82, 0.0, false, 11, 0.35
		)
		
	# 2. Cobblestone Roads (NS & EW)
	var road_mat := EnvironmentTextureService.create_tiled_material(
		"road_cobblestone.png", Vector3(0.45, 0.45, 0.45), 0.55, 0.15, true, 22, 0.45
	)
	var road_ns := get_node_or_null("Terrain/Road_NS") as MeshInstance3D
	if road_ns: road_ns.material_override = road_mat
	var road_ew := get_node_or_null("Terrain/Road_EW") as MeshInstance3D
	if road_ew: road_ew.material_override = road_mat
	
	# 3. Central Plaza Fountain Rim & Animated Bioluminescent Water
	var rim_mesh := get_node_or_null("Terrain/FountainRim") as MeshInstance3D
	if rim_mesh:
		rim_mesh.material_override = EnvironmentTextureService.create_tiled_material(
			"plaza_stone.png", Vector3(0.6, 0.6, 0.6), 0.45, 0.10, true, 31, 0.35
		)
	var water_mesh := get_node_or_null("Terrain/FountainWater") as MeshInstance3D
	if water_mesh:
		fountain_water_mat = EnvironmentTextureService.create_tiled_material(
			"fountain_water.png", Vector3(3.0, 3.0, 1.0), 0.12, 0.40, false, 41, 0.30
		)
		fountain_water_mat.emission_enabled = true
		fountain_water_mat.emission_texture = EnvironmentTextureService.get_texture("fountain_water.png")
		fountain_water_mat.emission_energy_multiplier = 0.75
		water_mesh.material_override = fountain_water_mat
		
	# 4. Ato Family Workshop Walls & Solar Roof
	var walls_mesh := get_node_or_null("WorkshopBuilding/WallsMesh") as MeshInstance3D
	if walls_mesh:
		walls_mesh.material_override = EnvironmentTextureService.create_tiled_material(
			"workshop_wall_stucco.png", Vector3(0.35, 0.35, 0.35), 0.65, 0.10, true, 51, 0.30
		)
	var roof_mesh := get_node_or_null("WorkshopBuilding/RoofMesh") as MeshInstance3D
	if roof_mesh:
		roof_mesh.material_override = EnvironmentTextureService.create_tiled_material(
			"workshop_roof_solar.png", Vector3(0.5, 0.5, 0.5), 0.25, 0.65, true, 61, 0.25
		)
		
	# 5. Southeast Sparring Ring Platform & Eco-Trees (GAME.md Section 5.1)
	var ring_platform := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 4.2
	cyl.bottom_radius = 4.4
	cyl.height = 0.08
	ring_platform.mesh = cyl
	ring_platform.position = Vector3(9.5, 0.04, 7.5)
	ring_platform.material_override = EnvironmentTextureService.create_arena_terrain_material(Types.TerrainType.CITY)
	add_child(ring_platform)
	
	# Corner Neon Pylons around Sparring Ring
	var pylon_mat := StandardMaterial3D.new()
	pylon_mat.albedo_color = Color("#00E5FF")
	pylon_mat.emission_enabled = true
	pylon_mat.emission = Color("#00E5FF")
	pylon_mat.emission_energy_multiplier = 2.5
	for angle_deg in [45.0, 135.0, 225.0, 315.0]:
		var rad := deg_to_rad(angle_deg)
		var pylon := MeshInstance3D.new()
		var p_cyl := CylinderMesh.new()
		p_cyl.top_radius = 0.12
		p_cyl.bottom_radius = 0.16
		p_cyl.height = 1.4
		pylon.mesh = p_cyl
		pylon.position = Vector3(9.5 + cos(rad) * 4.0, 0.7, 7.5 + sin(rad) * 4.0)
		pylon.material_override = pylon_mat
		add_child(pylon)
		
	# Stylized Eco-City Trees
	var trunk_mat := EnvironmentTextureService.create_tiled_material("workbench_metal.png", Vector3(1, 2, 1), 0.8, 0.0, false, 91, 0.3)
	var canopy_mat := EnvironmentTextureService.create_tiled_material("grass_eco_turf.png", Vector3(2, 2, 2), 0.7, 0.0, true, 11, 0.4)
	var tree_positions := [
		Vector3(-12, 0, 8), Vector3(-6, 0, 11), Vector3(12, 0, -9),
		Vector3(7, 0, -11), Vector3(-15, 0, -2), Vector3(14, 0, 2)
	]
	for t_pos in tree_positions:
		var tree := Node3D.new()
		tree.position = t_pos
		var trunk := MeshInstance3D.new()
		var t_cyl := CylinderMesh.new()
		t_cyl.top_radius = 0.25
		t_cyl.bottom_radius = 0.35
		t_cyl.height = 1.6
		trunk.mesh = t_cyl
		trunk.position.y = 0.8
		trunk.material_override = trunk_mat
		tree.add_child(trunk)
		
		var foliage := MeshInstance3D.new()
		var sph := SphereMesh.new()
		sph.radius = 1.35
		sph.height = 2.4
		foliage.mesh = sph
		foliage.position.y = 2.4
		foliage.material_override = canopy_mat
		tree.add_child(foliage)
		add_child(tree)

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
