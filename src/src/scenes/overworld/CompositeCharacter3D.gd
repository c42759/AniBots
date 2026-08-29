# CompositeCharacter3D.gd
# Procedural 3D Pokémon BDSP-inspired Chibi Human Character Generator & Rig
class_name CompositeCharacter3D
extends Node3D

@export var is_preview_mode: bool = false
@export var preview_scale: float = 1.0

var appearance_data: Dictionary = {
	"hair_style": "hair_01",
	"hair_color": Color("#1A1A1A"),
	"skin_color": Color("#F0D5BE"),
	"shirt_style": "shirt_tshirt",
	"shirt_color": Color("#1976D2"),
	"bottom_style": "bottom_shorts",
	"bottom_color": Color("#37474F"),
	"shoe_style": "shoes_sneakers",
	"shoe_color": Color("#FAFAFA")
}

var is_walking: bool = false
var walk_time: float = 0.0

# Hierarchy nodes
var rig_root: Node3D
var shadow_mesh: MeshInstance3D
var hips_node: Node3D
var bottoms_mesh: MeshInstance3D
var l_leg_pivot: Node3D
var r_leg_pivot: Node3D
var l_leg_mesh: MeshInstance3D
var r_leg_mesh: MeshInstance3D
var l_shoe_mesh: MeshInstance3D
var r_shoe_mesh: MeshInstance3D
var torso_node: Node3D
var torso_mesh: MeshInstance3D
var l_arm_pivot: Node3D
var r_arm_pivot: Node3D
var l_arm_mesh: MeshInstance3D
var r_arm_mesh: MeshInstance3D
var head_node: Node3D
var head_mesh: MeshInstance3D
var l_eye_mesh: MeshInstance3D
var r_eye_mesh: MeshInstance3D
var l_blush_mesh: MeshInstance3D
var r_blush_mesh: MeshInstance3D
var hair_root: Node3D

# Materials
var mat_skin: StandardMaterial3D
var mat_hair: StandardMaterial3D
var mat_shirt: StandardMaterial3D
var mat_bottom: StandardMaterial3D
var mat_shoe: StandardMaterial3D
var mat_eye: StandardMaterial3D
var mat_blush: StandardMaterial3D

func _ready() -> void:
	if not rig_root:
		_build_rig()
	if is_preview_mode:
		scale = Vector3.ONE * preview_scale
	_apply_appearance_materials()

func _process(delta: float) -> void:
	if is_walking or is_preview_mode:
		walk_time += delta * 9.0
		var bounce = abs(sin(walk_time)) * 0.06
		var leg_swing = sin(walk_time) * 32.0
		var arm_swing = sin(walk_time) * 36.0
		
		hips_node.position.y = 0.45 + bounce
		l_leg_pivot.rotation_degrees.x = leg_swing
		r_leg_pivot.rotation_degrees.x = -leg_swing
		l_arm_pivot.rotation_degrees.x = -arm_swing
		r_arm_pivot.rotation_degrees.x = arm_swing
		head_node.rotation_degrees.x = sin(walk_time * 0.5) * 3.0
	else:
		walk_time = 0.0
		hips_node.position.y = 0.45
		l_leg_pivot.rotation_degrees.x = 0.0
		r_leg_pivot.rotation_degrees.x = 0.0
		l_arm_pivot.rotation_degrees.x = 0.0
		r_arm_pivot.rotation_degrees.x = 0.0
		head_node.rotation_degrees.x = 0.0

func set_movement_state(walking: bool) -> void:
	is_walking = walking

func apply_appearance(data: Dictionary) -> void:
	for key in data:
		if data[key] is String and data[key].begins_with("#"):
			appearance_data[key] = Color(data[key])
		else:
			appearance_data[key] = data[key]
	
	if not rig_root:
		_build_rig()
	_apply_appearance_materials()
	_rebuild_hair()

func _build_rig() -> void:
	rig_root = Node3D.new()
	rig_root.name = "RigRoot"
	add_child(rig_root)
	
	# Floor shadow
	shadow_mesh = MeshInstance3D.new()
	var qm = QuadMesh.new()
	qm.size = Vector2(0.7, 0.7)
	shadow_mesh.mesh = qm
	shadow_mesh.rotation_degrees.x = -90.0
	shadow_mesh.position.y = 0.015
	var sh_mat = StandardMaterial3D.new()
	sh_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	sh_mat.albedo_color = Color(0, 0, 0, 0.35)
	sh_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	shadow_mesh.material_override = sh_mat
	rig_root.add_child(shadow_mesh)
	
	# Hips
	hips_node = Node3D.new()
	hips_node.name = "Hips"
	hips_node.position = Vector3(0, 0.45, 0)
	rig_root.add_child(hips_node)
	
	# Bottoms / Pelvis
	bottoms_mesh = MeshInstance3D.new()
	var b_box = BoxMesh.new()
	b_box.size = Vector3(0.34, 0.2, 0.24)
	bottoms_mesh.mesh = b_box
	bottoms_mesh.position = Vector3(0, 0.02, 0)
	hips_node.add_child(bottoms_mesh)
	
	# Left Leg
	l_leg_pivot = Node3D.new()
	l_leg_pivot.name = "LLegPivot"
	l_leg_pivot.position = Vector3(-0.1, -0.06, 0)
	hips_node.add_child(l_leg_pivot)
	
	l_leg_mesh = MeshInstance3D.new()
	var leg_cyl = CylinderMesh.new()
	leg_cyl.top_radius = 0.065
	leg_cyl.bottom_radius = 0.06
	leg_cyl.height = 0.22
	l_leg_mesh.mesh = leg_cyl
	l_leg_mesh.position = Vector3(0, -0.1, 0)
	l_leg_pivot.add_child(l_leg_mesh)
	
	l_shoe_mesh = MeshInstance3D.new()
	var shoe_box = BoxMesh.new()
	shoe_box.size = Vector3(0.13, 0.1, 0.19)
	l_shoe_mesh.mesh = shoe_box
	l_shoe_mesh.position = Vector3(0, -0.21, 0.03)
	l_leg_pivot.add_child(l_shoe_mesh)
	
	# Right Leg
	r_leg_pivot = Node3D.new()
	r_leg_pivot.name = "RLegPivot"
	r_leg_pivot.position = Vector3(0.1, -0.06, 0)
	hips_node.add_child(r_leg_pivot)
	
	r_leg_mesh = MeshInstance3D.new()
	r_leg_mesh.mesh = leg_cyl
	r_leg_mesh.position = Vector3(0, -0.1, 0)
	r_leg_pivot.add_child(r_leg_mesh)
	
	r_shoe_mesh = MeshInstance3D.new()
	r_shoe_mesh.mesh = shoe_box
	r_shoe_mesh.position = Vector3(0, -0.21, 0.03)
	r_leg_pivot.add_child(r_shoe_mesh)
	
	# Torso
	torso_node = Node3D.new()
	torso_node.name = "Torso"
	torso_node.position = Vector3(0, 0.12, 0)
	hips_node.add_child(torso_node)
	
	torso_mesh = MeshInstance3D.new()
	var t_box = BoxMesh.new()
	t_box.size = Vector3(0.36, 0.28, 0.24)
	torso_mesh.mesh = t_box
	torso_mesh.position = Vector3(0, 0.14, 0)
	torso_node.add_child(torso_mesh)
	
	# Left Arm
	l_arm_pivot = Node3D.new()
	l_arm_pivot.name = "LArmPivot"
	l_arm_pivot.position = Vector3(-0.24, 0.22, 0)
	torso_node.add_child(l_arm_pivot)
	
	l_arm_mesh = MeshInstance3D.new()
	var arm_cyl = CylinderMesh.new()
	arm_cyl.top_radius = 0.055
	arm_cyl.bottom_radius = 0.055
	arm_cyl.height = 0.22
	l_arm_mesh.mesh = arm_cyl
	l_arm_mesh.position = Vector3(0, -0.1, 0)
	l_arm_pivot.add_child(l_arm_mesh)
	
	var l_hand = MeshInstance3D.new()
	var h_sph = SphereMesh.new()
	h_sph.radius = 0.06
	h_sph.height = 0.12
	l_hand.mesh = h_sph
	l_hand.position = Vector3(0, -0.21, 0)
	l_hand.name = "LHand"
	l_arm_pivot.add_child(l_hand)
	
	# Right Arm
	r_arm_pivot = Node3D.new()
	r_arm_pivot.name = "RArmPivot"
	r_arm_pivot.position = Vector3(0.24, 0.22, 0)
	torso_node.add_child(r_arm_pivot)
	
	r_arm_mesh = MeshInstance3D.new()
	r_arm_mesh.mesh = arm_cyl
	r_arm_mesh.position = Vector3(0, -0.1, 0)
	r_arm_pivot.add_child(r_arm_mesh)
	
	var r_hand = MeshInstance3D.new()
	r_hand.mesh = h_sph
	r_hand.position = Vector3(0, -0.21, 0)
	r_hand.name = "RHand"
	r_arm_pivot.add_child(r_hand)
	
	# Head (Big oversized Chibi head)
	head_node = Node3D.new()
	head_node.name = "Head"
	head_node.position = Vector3(0, 0.3, 0)
	torso_node.add_child(head_node)
	
	head_mesh = MeshInstance3D.new()
	var head_sph = SphereMesh.new()
	head_sph.radius = 0.32
	head_sph.height = 0.62
	head_mesh.mesh = head_sph
	head_mesh.position = Vector3(0, 0.24, 0)
	head_node.add_child(head_mesh)
	
	# Left Eye
	l_eye_mesh = MeshInstance3D.new()
	var eye_box = BoxMesh.new()
	eye_box.size = Vector3(0.08, 0.11, 0.03)
	l_eye_mesh.mesh = eye_box
	l_eye_mesh.position = Vector3(-0.11, 0.24, 0.29)
	head_node.add_child(l_eye_mesh)
	
	# Right Eye
	r_eye_mesh = MeshInstance3D.new()
	r_eye_mesh.mesh = eye_box
	r_eye_mesh.position = Vector3(0.11, 0.24, 0.29)
	head_node.add_child(r_eye_mesh)
	
	# Left Blush
	l_blush_mesh = MeshInstance3D.new()
	var blush_box = BoxMesh.new()
	blush_box.size = Vector3(0.08, 0.04, 0.02)
	l_blush_mesh.mesh = blush_box
	l_blush_mesh.position = Vector3(-0.18, 0.16, 0.26)
	head_node.add_child(l_blush_mesh)
	
	# Right Blush
	r_blush_mesh = MeshInstance3D.new()
	r_blush_mesh.mesh = blush_box
	r_blush_mesh.position = Vector3(0.18, 0.16, 0.26)
	head_node.add_child(r_blush_mesh)
	
	# Hair Container
	hair_root = Node3D.new()
	hair_root.name = "HairRoot"
	head_node.add_child(hair_root)
	_rebuild_hair()

func _apply_appearance_materials() -> void:
	mat_skin = StandardMaterial3D.new()
	mat_skin.albedo_color = _ensure_color(appearance_data.get("skin_color", Color("#F0D5BE")))
	mat_skin.roughness = 0.5
	
	mat_hair = StandardMaterial3D.new()
	mat_hair.albedo_color = _ensure_color(appearance_data.get("hair_color", Color("#1A1A1A")))
	mat_hair.roughness = 0.4
	
	mat_shirt = StandardMaterial3D.new()
	mat_shirt.albedo_color = _ensure_color(appearance_data.get("shirt_color", Color("#1976D2")))
	mat_shirt.roughness = 0.6
	
	mat_bottom = StandardMaterial3D.new()
	mat_bottom.albedo_color = _ensure_color(appearance_data.get("bottom_color", Color("#37474F")))
	mat_bottom.roughness = 0.6
	
	mat_shoe = StandardMaterial3D.new()
	mat_shoe.albedo_color = _ensure_color(appearance_data.get("shoe_color", Color("#FAFAFA")))
	mat_shoe.roughness = 0.5
	
	mat_eye = StandardMaterial3D.new()
	mat_eye.albedo_color = Color("#1A1A24")
	mat_eye.roughness = 0.1
	
	mat_blush = StandardMaterial3D.new()
	mat_blush.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat_blush.albedo_color = Color(1.0, 0.45, 0.55, 0.6)
	mat_blush.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	
	head_mesh.material_override = mat_skin
	torso_mesh.material_override = mat_shirt
	bottoms_mesh.material_override = mat_bottom
	
	var shirt_style = str(appearance_data.get("shirt_style", "shirt_tshirt"))
	var arm_mat = mat_shirt if shirt_style != "shirt_tshirt" else mat_skin
	l_arm_mesh.material_override = arm_mat
	r_arm_mesh.material_override = arm_mat
	
	var l_hand = l_arm_pivot.find_child("LHand", false, false) as MeshInstance3D
	var r_hand = r_arm_pivot.find_child("RHand", false, false) as MeshInstance3D
	if l_hand: l_hand.material_override = mat_skin
	if r_hand: r_hand.material_override = mat_skin
	
	l_leg_mesh.material_override = mat_skin if str(appearance_data.get("bottom_style")) == "bottom_shorts" else mat_bottom
	r_leg_mesh.material_override = mat_skin if str(appearance_data.get("bottom_style")) == "bottom_shorts" else mat_bottom
	
	l_shoe_mesh.material_override = mat_shoe
	r_shoe_mesh.material_override = mat_shoe
	
	l_eye_mesh.material_override = mat_eye
	r_eye_mesh.material_override = mat_eye
	l_blush_mesh.material_override = mat_blush
	r_blush_mesh.material_override = mat_blush
	
	for child in hair_root.get_children():
		if child is MeshInstance3D:
			child.material_override = mat_hair

func _rebuild_hair() -> void:
	if not hair_root:
		return
		
	for child in hair_root.get_children():
		child.queue_free()
		
	var style = str(appearance_data.get("hair_style", "hair_01"))
	
	# Base Cap
	var cap = MeshInstance3D.new()
	var cap_sph = SphereMesh.new()
	cap_sph.radius = 0.33
	cap_sph.height = 0.42
	cap.mesh = cap_sph
	cap.position = Vector3(0, 0.32, -0.04)
	cap.material_override = mat_hair
	hair_root.add_child(cap)
	
	match style:
		"hair_01": # Spiky Punk (Chunky forward and top spikes)
			for i in range(5):
				var spike = MeshInstance3D.new()
				var c_mesh = CylinderMesh.new()
				c_mesh.top_radius = 0.02
				c_mesh.bottom_radius = 0.09
				c_mesh.height = 0.28
				spike.mesh = c_mesh
				spike.position = Vector3(-0.16 + (i * 0.08), 0.48, 0.06 - abs(i - 2) * 0.04)
				spike.rotation_degrees = Vector3(30, 0, (i - 2) * -18)
				spike.material_override = mat_hair
				hair_root.add_child(spike)
				
		"hair_02": # Side Part (Smooth sweeping side fringe)
			var fringe = MeshInstance3D.new()
			var b_mesh = BoxMesh.new()
			b_mesh.size = Vector3(0.42, 0.16, 0.12)
			fringe.mesh = b_mesh
			fringe.position = Vector3(0.04, 0.44, 0.22)
			fringe.rotation_degrees = Vector3(15, 0, -12)
			fringe.material_override = mat_hair
			hair_root.add_child(fringe)
			
		"hair_03": # Ponytail (Fluffy ponytail bun on back)
			var bun = MeshInstance3D.new()
			var bun_sph = SphereMesh.new()
			bun_sph.radius = 0.16
			bun_sph.height = 0.32
			bun.mesh = bun_sph
			bun.position = Vector3(0, 0.46, -0.32)
			bun.material_override = mat_hair
			hair_root.add_child(bun)
			
		"hair_04": # Buzz Cut
			pass
			
		"hair_05": # Messy Anime (Tufts spreading left, right, and top)
			for i in range(6):
				var tuft = MeshInstance3D.new()
				var t_box = BoxMesh.new()
				t_box.size = Vector3(0.12, 0.18, 0.12)
				tuft.mesh = t_box
				tuft.position = Vector3(-0.2 + (i * 0.08), 0.46, 0.12)
				tuft.rotation_degrees = Vector3(25, 0, (i - 2.5) * -15)
				tuft.material_override = mat_hair
				hair_root.add_child(tuft)

func _ensure_color(val) -> Color:
	if val is Color:
		return val
	if val is String:
		return Color(val)
	return Color.WHITE
