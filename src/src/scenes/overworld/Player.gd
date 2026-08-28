# Player.gd
# Top-down player character controller with interaction detection and dynamic cosmetics
class_name Player
extends CharacterBody2D

@export var move_speed: float = 160.0

@onready var sprite_renderer: CompositeCharacter = %CompositeCharacter
@onready var raycast: RayCast2D = %InteractionRayCast
@onready var camera: Camera2D = %Camera2D

var facing_direction: Vector2 = Vector2.DOWN
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
			sprite_renderer.apply_appearance(app)

func _on_appearance_changed(app: Dictionary) -> void:
	sprite_renderer.apply_appearance(app)

func _physics_process(_delta: float) -> void:
	if is_control_locked:
		velocity = Vector2.ZERO
		sprite_renderer.set_movement_state(false, facing_direction)
		move_and_slide()
		return

	var input_vector := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	
	if input_vector != Vector2.ZERO:
		facing_direction = input_vector.normalized()
		raycast.target_position = facing_direction * 28.0
		velocity = input_vector * move_speed
		sprite_renderer.set_movement_state(true, facing_direction)
	else:
		velocity = Vector2.ZERO
		sprite_renderer.set_movement_state(false, facing_direction)
		
	move_and_slide()
	SignalBus.player_moved.emit(global_position)

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
