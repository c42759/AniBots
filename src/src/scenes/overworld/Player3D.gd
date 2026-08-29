# Player3D.gd
# 3D Top-Down / Isometric Player Character Controller
class_name Player3D
extends CharacterBody3D

@export var move_speed: float = 6.5

@onready var character_model: CompositeCharacter3D = %CompositeCharacter3D
@onready var raycast: RayCast3D = %InteractionRayCast3D
@onready var camera: Camera3D = %Camera3D

var facing_direction: Vector3 = Vector3.FORWARD
var is_control_locked: bool = false

func _ready() -> void:
	_load_player_appearance()
	SignalBus.character_appearance_changed.connect(_on_appearance_changed)
	SignalBus.dialogue_requested.connect(func(_d): is_control_locked = true)
	SignalBus.dialogue_finished.connect(func(): is_control_locked = false)

func _load_player_appearance() -> void:
	if SaveManager.is_game_loaded:
		var app = SaveManager.get_player_appearance()
		if not app.is_empty():
			character_model.apply_appearance(app)

func _on_appearance_changed(app: Dictionary) -> void:
	character_model.apply_appearance(app)

func _physics_process(_delta: float) -> void:
	if is_control_locked:
		velocity = Vector3.ZERO
		character_model.set_movement_state(false)
		move_and_slide()
		return

	var input_2d := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	var move_dir := Vector3(input_2d.x, 0.0, input_2d.y).normalized()
	
	if move_dir != Vector3.ZERO:
		facing_direction = move_dir
		raycast.target_position = facing_direction * 1.5
		velocity.x = move_dir.x * move_speed
		velocity.z = move_dir.z * move_speed
		character_model.set_movement_state(true)
		
		# Smoothly rotate model to face movement direction
		var target_angle = atan2(move_dir.x, move_dir.z)
		character_model.rotation.y = lerp_angle(character_model.rotation.y, target_angle, 0.25)
	else:
		velocity.x = move_toward(velocity.x, 0, move_speed)
		velocity.z = move_toward(velocity.z, 0, move_speed)
		character_model.set_movement_state(false)
		
	velocity.y = 0.0
	move_and_slide()
	SignalBus.player_moved.emit(Vector2(global_position.x, global_position.z))

func _unhandled_input(event: InputEvent) -> void:
	if is_control_locked:
		return
		
	if event.is_action_pressed("interact"):
		if raycast.is_colliding():
			var collider = raycast.get_collider()
			var target = collider
			if target and not target.has_method("interact") and target.get_parent() and target.get_parent().has_method("interact"):
				target = target.get_parent()
			if target and target.has_method("interact"):
				get_viewport().set_input_as_handled()
				target.interact(self)
