# AniBotModel3D.gd
# Procedural 3D Super-Deformed (SD) Chibi Mecha Model & Animation Rig
class_name AniBotModel3D
extends Node3D

var is_player: bool = true
var bot_data: Dictionary = {}

# Node hierarchy references
var rig_root: Node3D
var hips_node: Node3D
var torso_mesh: MeshInstance3D
var core_mesh: MeshInstance3D
var head_node: Node3D
var head_mesh: MeshInstance3D
var visor_mesh: MeshInstance3D
var l_antenna: MeshInstance3D
var r_antenna: MeshInstance3D
var l_arm_pivot: Node3D
var r_arm_pivot: Node3D
var l_arm_mesh: MeshInstance3D
var r_arm_mesh: MeshInstance3D
var l_weapon_mesh: MeshInstance3D
var r_weapon_mesh: MeshInstance3D
var l_leg_pivot: Node3D
var r_leg_pivot: Node3D
var l_leg_mesh: MeshInstance3D
var r_leg_mesh: MeshInstance3D

# Materials
var mat_primary: StandardMaterial3D
var mat_secondary: StandardMaterial3D
var mat_accent: StandardMaterial3D
var mat_visor: StandardMaterial3D
var mat_core: StandardMaterial3D
var mat_metal: StandardMaterial3D

var idle_tween: Tween
var action_tween: Tween

func _ready() -> void:
	if not rig_root:
		_build_rig()

func setup_model(config: Dictionary, is_player_side: bool) -> void:
	is_player = is_player_side
	bot_data = config
	
	if not rig_root:
		_build_rig()
	
	_apply_materials()
	play_idle()

func _build_rig() -> void:
	rig_root = Node3D.new()
	rig_root.name = "RigRoot"
	add_child(rig_root)
	
	# Shadow Quad on floor
	var shadow = MeshInstance3D.new()
	var quad_mesh = QuadMesh.new()
	quad_mesh.size = Vector2(1.6, 1.6)
	shadow.mesh = quad_mesh
	shadow.rotation_degrees.x = -90.0
	shadow.position.y = 0.02
	var shadow_mat = StandardMaterial3D.new()
	shadow_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	shadow_mat.albedo_color = Color(0.0, 0.0, 0.0, 0.45)
	shadow_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	shadow.material_override = shadow_mat
	rig_root.add_child(shadow)
	
	# Hips / Pelvis
	hips_node = Node3D.new()
	hips_node.name = "Hips"
	hips_node.position = Vector3(0, 0.7, 0)
	rig_root.add_child(hips_node)
	
	# Torso Chassis
	torso_mesh = MeshInstance3D.new()
	var box = BoxMesh.new()
	box.size = Vector3(0.9, 0.75, 0.65)
	torso_mesh.mesh = box
	torso_mesh.position = Vector3(0, 0.35, 0)
	hips_node.add_child(torso_mesh)
	
	# Glowing Power Core Diode on Torso Chest
	core_mesh = MeshInstance3D.new()
	var sphere = SphereMesh.new()
	sphere.radius = 0.16
	sphere.height = 0.32
	core_mesh.mesh = sphere
	core_mesh.position = Vector3(0, 0.38, 0.34)
	hips_node.add_child(core_mesh)
	
	# Head
	head_node = Node3D.new()
	head_node.name = "Head"
	head_node.position = Vector3(0, 0.85, 0)
	hips_node.add_child(head_node)
	
	head_mesh = MeshInstance3D.new()
	var h_box = BoxMesh.new()
	h_box.size = Vector3(0.85, 0.7, 0.75)
	head_mesh.mesh = h_box
	head_mesh.position = Vector3(0, 0.35, 0)
	head_node.add_child(head_mesh)
	
	# Head Visor (Anime glowing optics)
	visor_mesh = MeshInstance3D.new()
	var v_box = BoxMesh.new()
	v_box.size = Vector3(0.65, 0.22, 0.1)
	visor_mesh.mesh = v_box
	visor_mesh.position = Vector3(0, 0.38, 0.39)
	head_node.add_child(visor_mesh)
	
	# Left Antenna
	l_antenna = MeshInstance3D.new()
	var ant_cyl = CylinderMesh.new()
	ant_cyl.top_radius = 0.02
	ant_cyl.bottom_radius = 0.04
	ant_cyl.height = 0.4
	l_antenna.mesh = ant_cyl
	l_antenna.position = Vector3(-0.42, 0.7, 0)
	l_antenna.rotation_degrees = Vector3(0, 0, 25)
	head_node.add_child(l_antenna)
	
	# Right Antenna
	r_antenna = MeshInstance3D.new()
	r_antenna.mesh = ant_cyl
	r_antenna.position = Vector3(0.42, 0.7, 0)
	r_antenna.rotation_degrees = Vector3(0, 0, -25)
	head_node.add_child(r_antenna)
	
	# Left Arm Pivot
	l_arm_pivot = Node3D.new()
	l_arm_pivot.name = "LArmPivot"
	l_arm_pivot.position = Vector3(-0.6, 0.55, 0)
	hips_node.add_child(l_arm_pivot)
	
	l_arm_mesh = MeshInstance3D.new()
	var arm_box = BoxMesh.new()
	arm_box.size = Vector3(0.32, 0.5, 0.32)
	l_arm_mesh.mesh = arm_box
	l_arm_mesh.position = Vector3(0, -0.22, 0)
	l_arm_pivot.add_child(l_arm_mesh)
	
	# Left Weapon/Gauntlet
	l_weapon_mesh = MeshInstance3D.new()
	var wpn_box = BoxMesh.new()
	wpn_box.size = Vector3(0.38, 0.35, 0.5)
	l_weapon_mesh.mesh = wpn_box
	l_weapon_mesh.position = Vector3(0, -0.48, 0.12)
	l_arm_pivot.add_child(l_weapon_mesh)
	
	# Right Arm Pivot
	r_arm_pivot = Node3D.new()
	r_arm_pivot.name = "RArmPivot"
	r_arm_pivot.position = Vector3(0.6, 0.55, 0)
	hips_node.add_child(r_arm_pivot)
	
	r_arm_mesh = MeshInstance3D.new()
	r_arm_mesh.mesh = arm_box
	r_arm_mesh.position = Vector3(0, -0.22, 0)
	r_arm_pivot.add_child(r_arm_mesh)
	
	# Right Weapon/Cannon
	r_weapon_mesh = MeshInstance3D.new()
	var r_wpn_cyl = CylinderMesh.new()
	r_wpn_cyl.top_radius = 0.14
	r_wpn_cyl.bottom_radius = 0.16
	r_wpn_cyl.height = 0.65
	r_weapon_mesh.mesh = r_wpn_cyl
	r_weapon_mesh.rotation_degrees = Vector3(90, 0, 0)
	r_weapon_mesh.position = Vector3(0, -0.45, 0.2)
	r_arm_pivot.add_child(r_weapon_mesh)
	
	# Left Leg Pivot
	l_leg_pivot = Node3D.new()
	l_leg_pivot.name = "LLegPivot"
	l_leg_pivot.position = Vector3(-0.3, 0.0, 0)
	hips_node.add_child(l_leg_pivot)
	
	l_leg_mesh = MeshInstance3D.new()
	var leg_box = BoxMesh.new()
	leg_box.size = Vector3(0.34, 0.65, 0.45)
	l_leg_mesh.mesh = leg_box
	l_leg_mesh.position = Vector3(0, -0.32, 0.05)
	l_leg_pivot.add_child(l_leg_mesh)
	
	# Right Leg Pivot
	r_leg_pivot = Node3D.new()
	r_leg_pivot.name = "RLegPivot"
	r_leg_pivot.position = Vector3(0.3, 0.0, 0)
	hips_node.add_child(r_leg_pivot)
	
	r_leg_mesh = MeshInstance3D.new()
	r_leg_mesh.mesh = leg_box
	r_leg_mesh.position = Vector3(0, -0.32, 0.05)
	r_leg_pivot.add_child(r_leg_mesh)

func _apply_materials() -> void:
	# Create materials with clean metallic and emission parameters
	mat_primary = StandardMaterial3D.new()
	mat_primary.metallic = 0.65
	mat_primary.roughness = 0.35
	
	mat_secondary = StandardMaterial3D.new()
	mat_secondary.metallic = 0.8
	mat_secondary.roughness = 0.25
	
	mat_accent = StandardMaterial3D.new()
	mat_accent.metallic = 0.5
	mat_accent.roughness = 0.4
	
	mat_visor = StandardMaterial3D.new()
	mat_visor.emission_enabled = true
	mat_visor.emission_energy_multiplier = 3.0
	
	mat_core = StandardMaterial3D.new()
	mat_core.emission_enabled = true
	mat_core.emission_energy_multiplier = 4.0
	
	mat_metal = StandardMaterial3D.new()
	mat_metal.albedo_color = Color("#263238")
	mat_metal.metallic = 0.9
	mat_metal.roughness = 0.2
	
	if is_player:
		# Player High-Tech Cyan / White / Gold
		mat_primary.albedo_color = Color("#00E5FF")
		mat_secondary.albedo_color = Color("#ECEFF1")
		mat_accent.albedo_color = Color("#FFD600")
		mat_visor.albedo_color = Color("#00E676")
		mat_visor.emission = Color("#00E676")
		mat_core.albedo_color = Color("#FFEA00")
		mat_core.emission = Color("#FFEA00")
	else:
		# Enemy Crimson / Dark Gunmetal / Orange
		mat_primary.albedo_color = Color("#FF1744")
		mat_secondary.albedo_color = Color("#37474F")
		mat_accent.albedo_color = Color("#FF9100")
		mat_visor.albedo_color = Color("#FFEA00")
		mat_visor.emission = Color("#FFEA00")
		mat_core.albedo_color = Color("#FF3D00")
		mat_core.emission = Color("#FF3D00")
		
	# Apply to meshes
	torso_mesh.material_override = mat_primary
	core_mesh.material_override = mat_core
	head_mesh.material_override = mat_secondary
	visor_mesh.material_override = mat_visor
	l_antenna.material_override = mat_accent
	r_antenna.material_override = mat_accent
	
	l_arm_mesh.material_override = mat_primary
	r_arm_mesh.material_override = mat_primary
	l_weapon_mesh.material_override = mat_accent
	r_weapon_mesh.material_override = mat_secondary
	
	l_leg_mesh.material_override = mat_primary
	r_leg_mesh.material_override = mat_primary

func play_idle() -> void:
	if idle_tween and idle_tween.is_valid():
		idle_tween.kill()
	
	idle_tween = create_tween().set_loops()
	idle_tween.tween_property(hips_node, "position:y", 0.72, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	idle_tween.parallel().tween_property(head_node, "rotation_degrees:x", 2.0, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	idle_tween.parallel().tween_property(l_arm_pivot, "rotation_degrees:x", 5.0, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	idle_tween.parallel().tween_property(r_arm_pivot, "rotation_degrees:x", -5.0, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	
	idle_tween.tween_property(hips_node, "position:y", 0.68, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	idle_tween.parallel().tween_property(head_node, "rotation_degrees:x", -2.0, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	idle_tween.parallel().tween_property(l_arm_pivot, "rotation_degrees:x", -5.0, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	idle_tween.parallel().tween_property(r_arm_pivot, "rotation_degrees:x", 5.0, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

func play_attack(type_str: String = "melee") -> void:
	match type_str.to_lower():
		"shoot", "shooting":
			play_shooting_stance()
		"charge", "trap", "overclock":
			if idle_tween and idle_tween.is_valid():
				idle_tween.kill()
			var tw = create_tween()
			tw.parallel().tween_property(r_arm_pivot, "rotation_degrees:x", -60.0, 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
			tw.parallel().tween_property(l_arm_pivot, "rotation_degrees:x", -60.0, 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
			tw.parallel().tween_property(hips_node, "position:y", 0.55, 0.25)
		_: # melee
			play_windup_melee()

func play_windup_melee() -> void:
	if idle_tween and idle_tween.is_valid():
		idle_tween.kill()
		
	var tw = create_tween()
	# Crouch and pull right arm back
	tw.parallel().tween_property(hips_node, "position:y", 0.58, 0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(rig_root, "rotation_degrees:y", -20.0, 0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(r_arm_pivot, "rotation_degrees:x", -75.0, 0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(r_arm_pivot, "rotation_degrees:z", 35.0, 0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)

func play_melee_slash(target_pos: Vector3, on_impact_callback: Callable) -> void:
	var tw = create_tween()
	
	# Dash forward into strike
	tw.tween_property(self, "global_position", target_pos + Vector3(-1.2 if is_player else 1.2, 0, 0), 0.22).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_IN)
	tw.parallel().tween_property(r_arm_pivot, "rotation_degrees:x", 65.0, 0.22).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_IN)
	tw.parallel().tween_property(rig_root, "rotation_degrees:y", 30.0, 0.22).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_IN)
	
	tw.tween_callback(func():
		if on_impact_callback.is_valid():
			on_impact_callback.call()
	)
	
	# Hold follow-through pose then recover
	tw.tween_interval(0.3)
	tw.tween_property(r_arm_pivot, "rotation_degrees", Vector3.ZERO, 0.3).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(rig_root, "rotation_degrees:y", 0.0, 0.3).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)

func play_shooting_stance() -> void:
	if idle_tween and idle_tween.is_valid():
		idle_tween.kill()
		
	var tw = create_tween()
	tw.parallel().tween_property(r_arm_pivot, "rotation_degrees:x", 85.0, 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(r_arm_pivot, "rotation_degrees:y", -10.0 if is_player else 10.0, 0.25)
	tw.parallel().tween_property(hips_node, "position:y", 0.62, 0.25)
	tw.parallel().tween_property(head_node, "rotation_degrees:y", -8.0 if is_player else 8.0, 0.25)

func play_shoot_recoil(on_impact_callback: Callable) -> void:
	var tw = create_tween()
	# Recoil kick
	tw.tween_property(r_arm_pivot, "position:z", -0.2, 0.06).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(hips_node, "position:z", -0.15, 0.06)
	
	tw.tween_callback(func():
		if on_impact_callback.is_valid():
			on_impact_callback.call()
	)
	
	# Recovery
	tw.tween_property(r_arm_pivot, "position:z", 0.0, 0.25).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(hips_node, "position:z", 0.0, 0.25)

func play_hit_reaction(is_critical: bool = false) -> void:
	var tw = create_tween()
	var knock_dist = 0.8 if is_critical else 0.4
	var rot_kick = -35.0 if is_critical else -18.0
	
	# Flash white on hit
	if torso_mesh and torso_mesh.material_override:
		tw.tween_callback(func():
			mat_primary.albedo_color = Color(2.0, 2.0, 2.0)
		)
		
	# Stagger backwards
	tw.parallel().tween_property(hips_node, "position:x", knock_dist if not is_player else -knock_dist, 0.12).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(head_node, "rotation_degrees:z", rot_kick if not is_player else -rot_kick, 0.12).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(hips_node, "rotation_degrees:z", rot_kick * 0.5 if not is_player else -rot_kick * 0.5, 0.12)
	
	# Restore color
	tw.tween_interval(0.08)
	tw.tween_callback(func():
		_apply_materials()
	)
	
	# Spring back to stance
	tw.tween_property(hips_node, "position:x", 0.0, 0.35).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(head_node, "rotation_degrees:z", 0.0, 0.35).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(hips_node, "rotation_degrees:z", 0.0, 0.35)

func play_defeat() -> void:
	if idle_tween and idle_tween.is_valid():
		idle_tween.kill()
		
	var tw = create_tween()
	# Fall backwards and extinguish visor
	tw.tween_property(visor_mesh.material_override, "emission_energy_multiplier", 0.0, 0.2)
	tw.parallel().tween_property(core_mesh.material_override, "emission_energy_multiplier", 0.0, 0.2)
	tw.parallel().tween_property(rig_root, "rotation_degrees:x", -85.0, 0.5).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
	tw.parallel().tween_property(hips_node, "position:y", 0.2, 0.5).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
