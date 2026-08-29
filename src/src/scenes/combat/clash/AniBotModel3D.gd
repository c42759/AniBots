# AniBotModel3D.gd
# Multi-Model 3D Mecha Rig Controller supporting RV-A-001 & Metabee (KBT)
class_name AniBotModel3D
extends Node3D

const MODEL_HUMANOID: String = "res://assets/models/humanoid_robot/source/model.gltf"
const MODEL_METABEE: String = "res://assets/models/metabee/scene.gltf"

var is_player: bool = true
var bot_data: Dictionary = {}
var current_model_path: String = ""

# Node hierarchy references
var model_instance: Node3D
var rig_root: Node3D
var head_node: Node3D
var l_arm_pivot: Node3D
var r_arm_pivot: Node3D
var l_leg_pivot: Node3D
var r_leg_pivot: Node3D

# Rest Transforms
var head_rest_rot: Vector3 = Vector3.ZERO
var l_arm_rest_rot: Vector3 = Vector3.ZERO
var r_arm_rest_rot: Vector3 = Vector3.ZERO
var l_leg_rest_rot: Vector3 = Vector3.ZERO
var r_leg_rest_rot: Vector3 = Vector3.ZERO

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
		
	var req_model = config.get("bot_model", "")
	var target_path = MODEL_HUMANOID
	var target_scale = Vector3(0.65, 0.65, 0.65)
	var rot_y = 180.0
	
	if req_model == "metabee" or (not is_player_side and req_model != "rv_a_001" and req_model != "humanoid"):
		target_path = MODEL_METABEE
		target_scale = Vector3(0.9, 0.9, 0.9)
		rot_y = 0.0
	else:
		target_path = MODEL_HUMANOID
		target_scale = Vector3(0.65, 0.65, 0.65)
		rot_y = 180.0
		
	if target_path != current_model_path or not model_instance:
		_load_model_instance(target_path, target_scale, rot_y)
		
	play_idle()

func _build_rig() -> void:
	rig_root = Node3D.new()
	rig_root.name = "RigRoot"
	add_child(rig_root)
	
	# Ground Shadow Quad
	var shadow = MeshInstance3D.new()
	var quad_mesh = QuadMesh.new()
	quad_mesh.size = Vector2(1.8, 1.8)
	shadow.mesh = quad_mesh
	shadow.rotation_degrees.x = -90.0
	shadow.position.y = 0.02
	var shadow_mat = StandardMaterial3D.new()
	shadow_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	shadow_mat.albedo_color = Color(0.0, 0.0, 0.0, 0.45)
	shadow_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	shadow.material_override = shadow_mat
	rig_root.add_child(shadow)
	
	var default_path = MODEL_HUMANOID if is_player else MODEL_METABEE
	var default_scale = Vector3(0.65, 0.65, 0.65) if is_player else Vector3(0.9, 0.9, 0.9)
	var default_rot = 180.0 if is_player else 0.0
	_load_model_instance(default_path, default_scale, default_rot)

func _load_model_instance(path: String, model_scale: Vector3, rot_y: float) -> void:
	if model_instance:
		model_instance.queue_free()
		model_instance = null
		head_node = null
		l_arm_pivot = null
		r_arm_pivot = null
		l_leg_pivot = null
		r_leg_pivot = null
		
	current_model_path = path
	var gltf_res = load(path)
	if gltf_res and gltf_res is PackedScene:
		model_instance = gltf_res.instantiate()
		model_instance.scale = model_scale
		model_instance.rotation_degrees.y = rot_y
		model_instance.position = Vector3.ZERO
		rig_root.add_child(model_instance)
		_find_mesh_and_bone_nodes(model_instance)
	else:
		_build_fallback_primitives()

func _find_mesh_and_bone_nodes(root: Node) -> void:
	for child in root.get_children():
		var c_name = child.name.to_lower()
		if ("head" in c_name or "rotate" in c_name) and not head_node:
			head_node = child as Node3D
			head_rest_rot = head_node.rotation
		elif ("left_arm" in c_name or "shouldera.l" in c_name or "upperarm.l" in c_name or "forearma.l" in c_name or "hand.l" in c_name) and not l_arm_pivot:
			l_arm_pivot = child as Node3D
			l_arm_rest_rot = l_arm_pivot.rotation
		elif ("right_arm" in c_name or "shouldera.r" in c_name or "upperarm.r" in c_name or "forearma.r" in c_name or "hand.r" in c_name) and not r_arm_pivot:
			r_arm_pivot = child as Node3D
			r_arm_rest_rot = r_arm_pivot.rotation
		elif ("left_leg" in c_name or "leguppera.l" in c_name or "leglower.l" in c_name) and not l_leg_pivot:
			l_leg_pivot = child as Node3D
			l_leg_rest_rot = l_leg_pivot.rotation
		elif ("right_leg" in c_name or "leguppera.r" in c_name or "leglower.r" in c_name) and not r_leg_pivot:
			r_leg_pivot = child as Node3D
			r_leg_rest_rot = r_leg_pivot.rotation
			
		_find_mesh_and_bone_nodes(child)

func _build_fallback_primitives() -> void:
	var hips = Node3D.new()
	hips.position.y = 0.7
	rig_root.add_child(hips)
	
	var torso_mesh = MeshInstance3D.new()
	var b_mesh = BoxMesh.new()
	b_mesh.size = Vector3(0.8, 0.8, 0.5)
	torso_mesh.mesh = b_mesh
	hips.add_child(torso_mesh)
	
	head_node = Node3D.new()
	head_node.position.y = 0.6
	hips.add_child(head_node)
	var h_mesh = MeshInstance3D.new()
	var s_mesh = BoxMesh.new()
	s_mesh.size = Vector3(0.7, 0.6, 0.6)
	h_mesh.mesh = s_mesh
	head_node.add_child(h_mesh)
	head_rest_rot = head_node.rotation
	
	l_arm_pivot = Node3D.new()
	l_arm_pivot.position = Vector3(-0.55, 0.2, 0)
	hips.add_child(l_arm_pivot)
	l_arm_rest_rot = l_arm_pivot.rotation
	
	r_arm_pivot = Node3D.new()
	r_arm_pivot.position = Vector3(0.55, 0.2, 0)
	hips.add_child(r_arm_pivot)
	r_arm_rest_rot = r_arm_pivot.rotation
	
	l_leg_pivot = Node3D.new()
	l_leg_pivot.position = Vector3(-0.25, -0.4, 0)
	hips.add_child(l_leg_pivot)
	l_leg_rest_rot = l_leg_pivot.rotation
	
	r_leg_pivot = Node3D.new()
	r_leg_pivot.position = Vector3(0.25, -0.4, 0)
	hips.add_child(r_leg_pivot)
	r_leg_rest_rot = r_leg_pivot.rotation

# --- Animation Choreographies & Rigs ---

func play_idle() -> void:
	if idle_tween and idle_tween.is_valid():
		idle_tween.kill()
	
	idle_tween = create_tween().set_loops()
	
	idle_tween.tween_property(rig_root, "position:y", 0.04, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	if head_node:
		idle_tween.parallel().tween_property(head_node, "rotation", head_rest_rot + Vector3(deg_to_rad(3.0), 0, 0), 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	if l_arm_pivot:
		idle_tween.parallel().tween_property(l_arm_pivot, "rotation", l_arm_rest_rot + Vector3(deg_to_rad(4.0), 0, 0), 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	if r_arm_pivot:
		idle_tween.parallel().tween_property(r_arm_pivot, "rotation", r_arm_rest_rot + Vector3(deg_to_rad(-4.0), 0, 0), 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
		
	idle_tween.tween_property(rig_root, "position:y", 0.0, 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	if head_node:
		idle_tween.parallel().tween_property(head_node, "rotation", head_rest_rot - Vector3(deg_to_rad(3.0), 0, 0), 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	if l_arm_pivot:
		idle_tween.parallel().tween_property(l_arm_pivot, "rotation", l_arm_rest_rot - Vector3(deg_to_rad(4.0), 0, 0), 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	if r_arm_pivot:
		idle_tween.parallel().tween_property(r_arm_pivot, "rotation", r_arm_rest_rot + Vector3(deg_to_rad(4.0), 0, 0), 0.7).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

func play_attack(type_str: String = "melee") -> void:
	match type_str.to_lower():
		"shoot", "shooting":
			play_shooting_stance()
		"charge", "trap", "overclock":
			if idle_tween and idle_tween.is_valid():
				idle_tween.kill()
			var tw = create_tween()
			if r_arm_pivot:
				tw.parallel().tween_property(r_arm_pivot, "rotation", r_arm_rest_rot + Vector3(deg_to_rad(-45.0), 0, 0), 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
			if l_arm_pivot:
				tw.parallel().tween_property(l_arm_pivot, "rotation", l_arm_rest_rot + Vector3(deg_to_rad(-45.0), 0, 0), 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		_: # melee
			play_windup_melee()

func play_windup_melee() -> void:
	if idle_tween and idle_tween.is_valid():
		idle_tween.kill()
		
	var tw = create_tween()
	if rig_root:
		tw.parallel().tween_property(rig_root, "rotation_degrees:y", -20.0, 0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	if r_arm_pivot:
		tw.parallel().tween_property(r_arm_pivot, "rotation", r_arm_rest_rot + Vector3(deg_to_rad(-55.0), 0, 0), 0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)

func play_shooting_stance() -> void:
	if idle_tween and idle_tween.is_valid():
		idle_tween.kill()
		
	var tw = create_tween()
	if r_arm_pivot:
		tw.parallel().tween_property(r_arm_pivot, "rotation", r_arm_rest_rot + Vector3(deg_to_rad(70.0), 0, 0), 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	if head_node:
		tw.parallel().tween_property(head_node, "rotation", head_rest_rot + Vector3(0, deg_to_rad(-8.0 if is_player else 8.0), 0), 0.25)

func play_hit_reaction(is_critical: bool = false) -> void:
	var tw = create_tween()
	var knock_dist = 0.5 if is_critical else 0.25
	var rot_kick = -20.0 if is_critical else -10.0
	
	if rig_root:
		tw.parallel().tween_property(rig_root, "position:x", knock_dist if not is_player else -knock_dist, 0.12).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_OUT)
		tw.parallel().tween_property(rig_root, "rotation_degrees:z", rot_kick if not is_player else -rot_kick, 0.12).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_OUT)
		
	if rig_root:
		tw.tween_property(rig_root, "position:x", 0.0, 0.3).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)
		tw.parallel().tween_property(rig_root, "rotation_degrees:z", 0.0, 0.3).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)

func play_defeat() -> void:
	if idle_tween and idle_tween.is_valid():
		idle_tween.kill()
		
	var tw = create_tween()
	if rig_root:
		tw.parallel().tween_property(rig_root, "rotation_degrees:x", -85.0, 0.45).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
		tw.parallel().tween_property(rig_root, "position:y", 0.1, 0.45).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
