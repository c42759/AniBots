# SceneRouter.gd
# Smooth transitions between UI menus, Overworld City, and Battle Arena
extends Node

var overlay_layer: CanvasLayer
var color_rect: ColorRect
var is_transitioning: bool = false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_setup_fade_overlay()

func _setup_fade_overlay() -> void:
	overlay_layer = CanvasLayer.new()
	overlay_layer.layer = 100
	add_child(overlay_layer)
	
	color_rect = ColorRect.new()
	color_rect.color = Color(0, 0, 0, 0)
	color_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	color_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	overlay_layer.add_child(color_rect)

func change_scene(target_path: String, duration: float = 0.3) -> void:
	if is_transitioning:
		return
	is_transitioning = true
	
	color_rect.mouse_filter = Control.MOUSE_FILTER_STOP
	
	var tween = create_tween()
	tween.tween_property(color_rect, "color:a", 1.0, duration)
	await tween.finished
	
	get_tree().change_scene_to_file(target_path)
	
	await get_tree().process_frame
	
	var tween_in = create_tween()
	tween_in.tween_property(color_rect, "color:a", 0.0, duration)
	await tween_in.finished
	
	color_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	is_transitioning = false

func fade_to_scene(target_path: String, duration: float = 0.3) -> void:
	await change_scene(target_path, duration)
