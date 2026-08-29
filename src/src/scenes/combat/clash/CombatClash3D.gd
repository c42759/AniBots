# CombatClash3D.gd
# Dedicated 3D Cinematic Combat Clash Battle View Scene Controller
class_name CombatClash3D
extends Node3D

@onready var camera_3d: Camera3D = $Camera3D
@onready var attacker_model: AniBotModel3D = %AttackerBot
@onready var defender_model: AniBotModel3D = %DefenderBot
@onready var floor_mesh: MeshInstance3D = $ArenaFloor
@onready var omni_light: OmniLight3D = $SpotOmniLight

# 2D UI Overlay nodes
@onready var banner_panel: PanelContainer = %BannerPanel
@onready var attacker_label: Label = %AttackerNameLabel
@onready var action_name_label: Label = %ActionNameLabel
@onready var action_type_label: Label = %ActionTypeLabel
@onready var damage_popup: Label = %DamagePopupLabel
@onready var skip_hint_label: Label = %SkipHintLabel

# VFX nodes
@onready var slash_fx: MeshInstance3D = $SlashFX
@onready var laser_fx: MeshInstance3D = $LaserFX
@onready var spark_particles: CPUParticles3D = $SparkParticles

var is_active: bool = false
var camera_shake_trauma: float = 0.0
var base_cam_pos: Vector3 = Vector3(0, 2.0, 5.0)
var current_clash_tween: Tween
var impact_resolved: bool = false

var is_attacker_player: bool = true
var attacker_config: Dictionary = {}
var defender_config: Dictionary = {}
var action_part: Dictionary = {}
var is_ult: bool = false

func _ready() -> void:
	slash_fx.hide()
	laser_fx.hide()
	damage_popup.hide()
	banner_panel.modulate.a = 0.0
	_setup_arena_environment()
	
	_load_clash_from_session()

func _setup_arena_environment() -> void:
	var f_mat = StandardMaterial3D.new()
	f_mat.albedo_color = Color("#141A29")
	f_mat.metallic = 0.8
	f_mat.roughness = 0.3
	floor_mesh.material_override = f_mat
	
	var s_mat = StandardMaterial3D.new()
	s_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	s_mat.albedo_color = Color(1.0, 0.9, 0.2, 0.85)
	s_mat.emission_enabled = true
	s_mat.emission = Color("#FFD600")
	s_mat.emission_energy_multiplier = 4.0
	slash_fx.material_override = s_mat
	
	var l_mat = StandardMaterial3D.new()
	l_mat.albedo_color = Color(0.2, 0.9, 1.0, 0.9)
	l_mat.emission_enabled = true
	l_mat.emission = Color("#00E5FF")
	l_mat.emission_energy_multiplier = 5.0
	laser_fx.material_override = l_mat

func _process(delta: float) -> void:
	if not is_active:
		return
		
	# Camera shake decay
	if camera_shake_trauma > 0.0:
		camera_shake_trauma = max(0.0, camera_shake_trauma - delta * 2.5)
		var shake_offset = Vector3(
			randf_range(-1.0, 1.0) * camera_shake_trauma * 0.18,
			randf_range(-1.0, 1.0) * camera_shake_trauma * 0.18,
			randf_range(-1.0, 1.0) * camera_shake_trauma * 0.1
		)
		camera_3d.h_offset = shake_offset.x
		camera_3d.v_offset = shake_offset.y
	else:
		camera_3d.h_offset = 0.0
		camera_3d.v_offset = 0.0

func _unhandled_input(event: InputEvent) -> void:
	if is_active and (event.is_action_pressed("interact") or event.is_action_pressed("ui_accept")):
		_skip_clash()

func _load_clash_from_session() -> void:
	var session = GameManager.active_battle_session
	var clash_info = session.get("last_clash", {})
	
	is_attacker_player = clash_info.get("attacker_is_player", true)
	action_part = clash_info.get("action_part", {})
	is_ult = clash_info.get("is_ult", false)
	
	var player_data = session.get("player", {}).get("config", {})
	var enemy_data = session.get("enemy", {}).get("config", {})
	
	if is_attacker_player:
		attacker_config = player_data
		defender_config = enemy_data
	else:
		attacker_config = enemy_data
		defender_config = player_data
		
	start_clash_sequence()

func start_clash_sequence() -> void:
	is_active = true
	impact_resolved = false
	
	damage_popup.hide()
	slash_fx.hide()
	laser_fx.hide()
	
	# Position AniBots
	var p_att_x = -3.2 if is_attacker_player else 3.2
	var p_def_x = 3.2 if is_attacker_player else -3.2
	
	attacker_model.global_position = Vector3(p_att_x, 0, 0)
	attacker_model.rotation_degrees.y = 90.0 if is_attacker_player else -90.0
	attacker_model.setup_model(attacker_config, is_attacker_player)
	
	defender_model.global_position = Vector3(p_def_x, 0, 0)
	defender_model.rotation_degrees.y = -90.0 if is_attacker_player else 90.0
	defender_model.setup_model(defender_config, not is_attacker_player)
	
	# Setup UI Banner
	var att_name = attacker_config.get("bot_name", "AniBot")
	var act_name = action_part.get("name", "Strike")
	var act_type_num = action_part.get("type", Types.AttackType.MELEE)
	
	attacker_label.text = att_name.to_upper()
	attacker_label.modulate = Color("#00E5FF") if is_attacker_player else Color("#FF1744")
	
	action_name_label.text = act_name.to_upper()
	if is_ult:
		action_type_label.text = "[OVERCLOCK ULTIMATE]"
		action_type_label.modulate = Color("#FFD600")
	else:
		action_type_label.text = "[%s]" % _attack_type_string(act_type_num)
		action_type_label.modulate = Color("#B0BEC5")
		
	# Animate Banner in
	banner_panel.modulate.a = 0.0
	var b_tw = create_tween()
	b_tw.tween_property(banner_panel, "modulate:a", 1.0, 0.25)
	
	# Play Attack Action Choreography
	if is_ult:
		_choreograph_overclock_ultimate()
	else:
		match act_type_num:
			Types.AttackType.SHOOTING:
				_choreograph_shooting_attack()
			Types.AttackType.TRAP:
				_choreograph_trap_attack()
			_: # Melee or default
				_choreograph_melee_attack()

func _apply_damage_and_resolve() -> Dictionary:
	impact_resolved = true
	var pwr = action_part.get("payload", 30 if is_attacker_player else 20)
	var act_type = action_part.get("type", Types.AttackType.MELEE)
	var sfx = "laser" if is_ult else ("slash" if act_type == Types.AttackType.MELEE else "attack_hit")
	SignalBus.play_sfx_requested.emit(sfx)
	
	var session = GameManager.active_battle_session
	var def_key = "enemy" if is_attacker_player else "player"
	var att_key = "player" if is_attacker_player else "enemy"
	var def_state = session.get(def_key, {})
	var att_state = session.get(att_key, {})
	var def_integrities: Dictionary = def_state.get("part_integrities", {})
	if def_integrities.is_empty():
		def_integrities = def_state.get("integrities", {})
	
	# Calculate damage
	var damage = max(int(pwr - 4), 5)
	
	# Pick random surviving slot
	var valid_slots = []
	for s in [Types.PartSlot.HEAD, Types.PartSlot.LEFT_ARM, Types.PartSlot.RIGHT_ARM, Types.PartSlot.LEGS, Types.PartSlot.TORSO]:
		var cur_val = def_integrities.get(s, def_integrities.get(str(s), 50))
		if cur_val > 0:
			valid_slots.append(s)
	var target_slot = valid_slots[randi() % valid_slots.size()] if valid_slots.size() > 0 else Types.PartSlot.HEAD
	
	var cur_hp = def_integrities.get(target_slot, def_integrities.get(str(target_slot), 50))
	var new_hp = max(0, cur_hp - damage)
	def_integrities[target_slot] = new_hp
	def_state["part_integrities"] = def_integrities
	def_state["integrities"] = def_integrities

	# Attacker Overclock Gauge charge (or reset if ultimate used)
	if is_ult:
		att_state["overclock_gauge"] = 0.0
	else:
		var att_chip = att_state.get("config", {}).get("chip_id", att_state.get("chip_id", ""))
		var att_mult = 2.0 if att_chip == "chip_draco" else 1.0
		var cur_att_gauge = att_state.get("overclock_gauge", 0.0)
		att_state["overclock_gauge"] = clampf(cur_att_gauge + (20.0 * att_mult), 0.0, 100.0)

	# Defender Overclock Gauge charge on damage taken
	var def_chip = def_state.get("config", {}).get("chip_id", def_state.get("chip_id", ""))
	var def_mult = 2.0 if def_chip == "chip_draco" else 1.0
	var cur_def_gauge = def_state.get("overclock_gauge", 0.0)
	def_state["overclock_gauge"] = clampf(cur_def_gauge + (25.0 * def_mult), 0.0, 100.0)

	session[att_key] = att_state
	session[def_key] = def_state
	
	var head_hp = def_integrities.get(Types.PartSlot.HEAD, def_integrities.get(str(Types.PartSlot.HEAD), 60))
	var is_destroyed = (new_hp <= 0)
	var is_head_destroyed = (head_hp <= 0)
	
	var slot_name = _slot_name_str(target_slot)
	var att_name = attacker_config.get("bot_name", "AniBot")
	var def_name = defender_config.get("bot_name", "Opponent")
	var log_msg = "%s strikes with %s! Dealt %d damage to %s's %s!" % [
		att_name,
		action_part.get("name", "Attack"),
		damage,
		def_name,
		slot_name
	]
	if is_destroyed:
		log_msg += " [%s DISABLED!]" % slot_name
	if is_head_destroyed:
		log_msg += " [CRITICAL FAILURE!]"
	session["combat_log"] = log_msg
	
	return {
		"damage": damage,
		"slot_name": slot_name,
		"destroyed": is_destroyed,
		"head_destroyed": is_head_destroyed
	}

# --- Attack Type Choreographies ---

func _choreograph_melee_attack() -> void:
	var dir = 1.0 if is_attacker_player else -1.0
	var start_cam = Vector3(-1.0 * dir, 1.8, 4.2)
	var target_cam = Vector3(0.0, 1.5, 3.4)
	
	camera_3d.position = start_cam
	camera_3d.look_at(Vector3(0, 0.8, 0))
	
	var tw = create_tween()
	current_clash_tween = tw
	
	# Attacker windup
	tw.tween_callback(func(): attacker_model.play_attack("melee"))
	tw.parallel().tween_property(camera_3d, "position", target_cam, 0.35).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	
	# Dash towards defender
	var strike_pos = defender_model.global_position - Vector3(1.2 * dir, 0, 0)
	tw.tween_property(attacker_model, "global_position", strike_pos, 0.22).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
	
	# Impact Frame
	tw.tween_callback(func():
		_trigger_impact(strike_pos + Vector3(0.6 * dir, 0.8, 0))
		_show_slash_vfx(strike_pos + Vector3(0.6 * dir, 0.8, 0))
	)
	
	# Follow-through and return
	tw.tween_interval(0.6)
	tw.tween_callback(_complete_clash)

func _choreograph_shooting_attack() -> void:
	var dir = 1.0 if is_attacker_player else -1.0
	camera_3d.position = Vector3(-2.2 * dir, 1.6, 3.8)
	camera_3d.look_at(defender_model.global_position + Vector3(0, 0.8, 0))
	
	var tw = create_tween()
	current_clash_tween = tw
	
	# Attacker aim
	tw.tween_callback(func(): attacker_model.play_attack("shoot"))
	tw.tween_interval(0.25)
	
	# Fire Laser
	tw.tween_callback(func():
		_show_laser_vfx(attacker_model.global_position + Vector3(0.8 * dir, 0.8, 0), defender_model.global_position + Vector3(0, 0.8, 0))
	)
	
	tw.tween_interval(0.12)
	# Impact
	tw.tween_callback(func():
		_trigger_impact(defender_model.global_position + Vector3(0, 0.8, 0))
	)
	
	tw.tween_interval(0.65)
	tw.tween_callback(_complete_clash)

func _choreograph_trap_attack() -> void:
	var dir = 1.0 if is_attacker_player else -1.0
	camera_3d.position = Vector3(0, 3.2, 4.5)
	camera_3d.look_at(Vector3(0, 0.5, 0))
	
	var tw = create_tween()
	current_clash_tween = tw
	
	tw.tween_callback(func(): attacker_model.play_attack("charge"))
	tw.tween_interval(0.3)
	
	tw.tween_callback(func():
		_trigger_impact(defender_model.global_position + Vector3(0, 0.4, 0))
	)
	
	tw.tween_interval(0.7)
	tw.tween_callback(_complete_clash)

func _choreograph_overclock_ultimate() -> void:
	var dir = 1.0 if is_attacker_player else -1.0
	camera_3d.position = Vector3(-1.8 * dir, 1.4, 2.6)
	camera_3d.look_at(attacker_model.global_position + Vector3(0, 0.8, 0))
	
	var tw = create_tween()
	current_clash_tween = tw
	
	tw.tween_callback(func(): attacker_model.play_attack("charge"))
	tw.tween_property(camera_3d, "fov", 35.0, 0.4).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	
	var strike_pos = defender_model.global_position - Vector3(1.0 * dir, 0, 0)
	tw.tween_callback(func():
		camera_3d.position = Vector3(0, 1.8, 4.0)
		camera_3d.fov = 52.0
		camera_3d.look_at(Vector3(0, 0.8, 0))
	)
	tw.tween_property(attacker_model, "global_position", strike_pos, 0.15).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_IN)
	
	tw.tween_callback(func():
		camera_shake_trauma = 1.0
		_trigger_impact(defender_model.global_position + Vector3(0, 0.8, 0))
		_show_slash_vfx(defender_model.global_position + Vector3(0, 0.8, 0))
		_show_laser_vfx(strike_pos + Vector3(0, 0.8, 0), defender_model.global_position + Vector3(0, 0.8, 0))
	)
	
	tw.tween_interval(0.8)
	tw.tween_callback(_complete_clash)

# --- Impact & VFX Helpers ---

func _trigger_impact(impact_world_pos: Vector3) -> void:
	camera_shake_trauma = 0.6
	spark_particles.global_position = impact_world_pos
	spark_particles.restart()
	spark_particles.emitting = true
	
	var hit_info = _apply_damage_and_resolve()
	defender_model.play_hit_reaction(hit_info.get("head_destroyed", false))
	_show_damage_popup(hit_info)

func _show_slash_vfx(world_pos: Vector3) -> void:
	slash_fx.global_position = world_pos
	slash_fx.scale = Vector3(0.2, 0.2, 0.2)
	slash_fx.show()
	
	var tw = create_tween()
	tw.tween_property(slash_fx, "scale", Vector3(1.5, 1.5, 1.5), 0.12)
	tw.tween_property(slash_fx, "scale", Vector3(0.0, 0.0, 0.0), 0.1)
	tw.tween_callback(slash_fx.hide)

func _show_laser_vfx(from_pos: Vector3, to_pos: Vector3) -> void:
	var mid = (from_pos + to_pos) * 0.5
	var dist = from_pos.distance_to(to_pos)
	
	laser_fx.global_position = mid
	laser_fx.look_at(to_pos)
	laser_fx.scale = Vector3(1.0, 1.0, dist * 0.5)
	laser_fx.show()
	
	var tw = create_tween()
	tw.tween_interval(0.12)
	tw.tween_callback(laser_fx.hide)

func _show_damage_popup(hit_info: Dictionary) -> void:
	var dmg = hit_info.get("damage", 0)
	var slot_name = hit_info.get("slot_name", "CHASSIS")
	var is_destroyed = hit_info.get("destroyed", false)
	var is_head_destroyed = hit_info.get("head_destroyed", false)
	
	damage_popup.text = "-%d HP [%s]" % [dmg, slot_name.to_upper()]
	if is_head_destroyed:
		damage_popup.text += "\n[CRITICAL FAILURE!]"
		damage_popup.modulate = Color("#FF1744")
		defender_model.play_defeat()
	elif is_destroyed:
		damage_popup.text += "\n[PART DISABLED!]"
		damage_popup.modulate = Color("#FF9100")
	else:
		damage_popup.modulate = Color("#FFD600")
		
	damage_popup.scale = Vector2(0.3, 0.3)
	damage_popup.show()
	
	var tw = create_tween()
	tw.tween_property(damage_popup, "scale", Vector2(1.2, 1.2), 0.15).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(damage_popup, "scale", Vector2(1.0, 1.0), 0.1)

func _skip_clash() -> void:
	if not impact_resolved:
		_trigger_impact(defender_model.global_position + Vector3(0, 0.8, 0))
	_complete_clash()

func _complete_clash() -> void:
	if not is_active:
		return
	is_active = false
	
	var tw = create_tween()
	tw.tween_property(banner_panel, "modulate:a", 0.0, 0.2)
	tw.parallel().tween_property(damage_popup, "modulate:a", 0.0, 0.2)
	tw.tween_callback(func():
		GameManager.return_from_clash_to_arena()
	)

func _attack_type_string(type: int) -> String:
	match type:
		Types.AttackType.SHOOTING: return "SHOOTING"
		Types.AttackType.MELEE: return "MELEE"
		Types.AttackType.SUPPORT: return "SUPPORT"
		Types.AttackType.TRAP: return "TACTICAL TRAP"
		Types.AttackType.DEFENSE: return "DEFENSE"
	return "STRIKE"

func _slot_name_str(slot: int) -> String:
	match slot:
		Types.PartSlot.HEAD: return "Head"
		Types.PartSlot.TORSO: return "Torso"
		Types.PartSlot.LEFT_ARM: return "Left Arm"
		Types.PartSlot.RIGHT_ARM: return "Right Arm"
		Types.PartSlot.LEGS: return "Legs"
	return "Chassis"
