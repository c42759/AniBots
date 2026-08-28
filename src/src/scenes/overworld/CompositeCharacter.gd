# CompositeCharacter.gd
# Renders a Pokémon Brilliant Diamond (BDSP) inspired Chibi / SD character
class_name CompositeCharacter
extends Node2D

@export var is_preview_mode: bool = false
@export var preview_scale: float = 3.5

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

var facing_direction: Vector2 = Vector2.DOWN
var is_walking: bool = false
var walk_time: float = 0.0

func _ready() -> void:
	if is_preview_mode:
		scale = Vector2(preview_scale, preview_scale)

func _process(delta: float) -> void:
	if is_walking or is_preview_mode:
		walk_time += delta * 7.5
		queue_redraw()

func apply_appearance(data: Dictionary) -> void:
	for key in data:
		if data[key] is String and data[key].begins_with("#"):
			appearance_data[key] = Color(data[key])
		else:
			appearance_data[key] = data[key]
	queue_redraw()

func set_movement_state(walking: bool, direction: Vector2) -> void:
	is_walking = walking
	if direction != Vector2.ZERO:
		facing_direction = direction
	queue_redraw()

func _draw() -> void:
	# Bouncy Chibi Walk Cycle Animation
	var bounce = abs(sin(walk_time)) * -3.0 if (is_walking or is_preview_mode) else 0.0
	var leg_swing = sin(walk_time) * 4.0 if (is_walking or is_preview_mode) else 0.0
	var arm_swing = sin(walk_time) * 4.5 if (is_walking or is_preview_mode) else 0.0
	
	var skin_col: Color = _ensure_color(appearance_data.get("skin_color", Color("#F0D5BE")))
	var hair_col: Color = _ensure_color(appearance_data.get("hair_color", Color("#1A1A1A")))
	var shirt_col: Color = _ensure_color(appearance_data.get("shirt_color", Color("#1976D2")))
	var bottom_col: Color = _ensure_color(appearance_data.get("bottom_color", Color("#37474F")))
	var shoe_col: Color = _ensure_color(appearance_data.get("shoe_color", Color("#FAFAFA")))
	
	var hair_style: String = str(appearance_data.get("hair_style", "hair_01"))
	var shirt_style: String = str(appearance_data.get("shirt_style", "shirt_tshirt"))
	var bottom_style: String = str(appearance_data.get("bottom_style", "bottom_shorts"))
	var shoe_style: String = str(appearance_data.get("shoe_style", "shoes_sneakers"))

	# 1. Soft Dynamic Drop Shadow (Slightly scales with bounce)
	var shadow_scale = 1.0 - (abs(bounce) * 0.06)
	draw_circle(Vector2(0, 18), 12.0 * shadow_scale, Color(0, 0, 0, 0.28))

	# 2. Chibi Stubby Feet & Shoes
	var shoe_w = 6.5
	var shoe_h = 5.0
	if shoe_style == "shoes_boots":
		shoe_w = 7.5
		shoe_h = 7.0
	elif shoe_style == "shoes_sandals":
		shoe_w = 6.0
		shoe_h = 4.0

	# Left foot (Chibi rounded shoe)
	draw_circle(Vector2(-6, 14 + leg_swing), shoe_w * 0.5, shoe_col)
	draw_rect(Rect2(-6 - shoe_w * 0.5, 14 + leg_swing - 2, shoe_w, shoe_h), shoe_col)
	
	# Right foot
	draw_circle(Vector2(6, 14 - leg_swing), shoe_w * 0.5, shoe_col)
	draw_rect(Rect2(6 - shoe_w * 0.5, 14 - leg_swing - 2, shoe_w, shoe_h), shoe_col)

	# 3. Chibi Shorts / Bottoms (Chubby rounded hips)
	var bottom_len = 6.5
	if bottom_style == "bottom_shorts":
		bottom_len = 4.5
		# Exposed chibi legs
		draw_rect(Rect2(-7, 8 + leg_swing, 4.5, 5), skin_col)
		draw_rect(Rect2(2.5, 8 - leg_swing, 4.5, 5), skin_col)
	elif bottom_style == "bottom_cargo":
		bottom_len = 8.0

	# Pelvis & Legs
	draw_rect(Rect2(-8, 5 + bounce, 16, bottom_len), bottom_col)
	draw_rect(Rect2(-8.5, 4 + bounce, 17, 3), bottom_col.darkened(0.15)) # Belt line

	# 4. Compact Chibi Torso / Shirt
	var torso_rect = Rect2(-9, -6 + bounce, 18, 12)
	draw_rect(torso_rect, shirt_col)
	draw_circle(Vector2(-9, 0 + bounce), 2.0, shirt_col) # Rounded side
	draw_circle(Vector2(9, 0 + bounce), 2.0, shirt_col)
	
	# Shirt Details
	if shirt_style == "shirt_jacket":
		# Inner shirt
		draw_rect(Rect2(-3, -6 + bounce, 6, 12), Color(0.95, 0.95, 0.95))
		# Lapels
		draw_line(Vector2(-7, -6 + bounce), Vector2(-3, 0 + bounce), Color(0.15, 0.15, 0.15), 2.0)
		draw_line(Vector2(7, -6 + bounce), Vector2(3, 0 + bounce), Color(0.15, 0.15, 0.15), 2.0)
	elif shirt_style == "shirt_hoodie":
		# Cute kangaroo pocket & hoodie drawstring
		draw_rect(Rect2(-6, 0 + bounce, 12, 5), shirt_col.darkened(0.2))
		draw_line(Vector2(-3, -6 + bounce), Vector2(-3, -1 + bounce), Color.WHITE, 1.2)
		draw_line(Vector2(3, -6 + bounce), Vector2(3, -1 + bounce), Color.WHITE, 1.2)

	# 5. Chibi Rounded Arms & Hands
	var arm_color = shirt_col if shirt_style != "shirt_tshirt" else skin_col
	# Left arm
	draw_circle(Vector2(-11, -3 + bounce - arm_swing), 3.0, arm_color)
	draw_rect(Rect2(-13, -3 + bounce - arm_swing, 4, 8), arm_color)
	draw_circle(Vector2(-11, 6 + bounce - arm_swing), 3.0, skin_col) # Chubby round hand
	
	# Right arm
	draw_circle(Vector2(11, -3 + bounce + arm_swing), 3.0, arm_color)
	draw_rect(Rect2(9, -3 + bounce + arm_swing, 4, 8), arm_color)
	draw_circle(Vector2(11, 6 + bounce + arm_swing), 3.0, skin_col) # Chubby round hand

	# 6. Big Oversized Chibi Head (BDSP Proportions)
	var head_center = Vector2(0, -17 + bounce)
	draw_circle(head_center, 14.5, skin_col) # Large rounded head
	draw_circle(head_center + Vector2(0, 2), 14.0, skin_col) # Chubby lower cheeks

	# Cute Rosy Blush on Cheeks
	var blush_col = Color(1.0, 0.5, 0.6, 0.45)
	draw_circle(head_center + Vector2(-9.5, 2.5), 3.0, blush_col)
	draw_circle(head_center + Vector2(9.5, 2.5), 3.0, blush_col)

	# Big Expressive Anime Eyes (BDSP Style)
	var eye_y = head_center.y - 0.5
	# Eye sockets
	draw_circle(Vector2(-5.5, eye_y), 3.6, Color("#1A1A24"))
	draw_circle(Vector2(5.5, eye_y), 3.6, Color("#1A1A24"))
	
	# Eye Iris Color Tint
	var iris_col = Color("#29B6F6")
	draw_circle(Vector2(-5.5, eye_y + 1.0), 2.6, iris_col)
	draw_circle(Vector2(5.5, eye_y + 1.0), 2.6, iris_col)
	
	# Dual Anime Eye Sparkles
	draw_circle(Vector2(-4.8, eye_y - 1.2), 1.3, Color.WHITE) # Main sparkle
	draw_circle(Vector2(6.2, eye_y - 1.2), 1.3, Color.WHITE)
	draw_circle(Vector2(-6.2, eye_y + 1.8), 0.7, Color.WHITE) # Micro sparkle
	draw_circle(Vector2(4.8, eye_y + 1.8), 0.7, Color.WHITE)

	# Cute Chibi Mouth
	draw_arc(head_center + Vector2(0, 5.5), 2.5, 0.2 * PI, 0.8 * PI, 8, Color("#8D4343"), 1.8)

	# 7. Stylized Chibi Hair with Volumetric Highlights
	_draw_chibi_hair(hair_style, hair_col, head_center)

func _draw_chibi_hair(style: String, color: Color, head_pos: Vector2) -> void:
	var highlight_col = color.lightened(0.35)
	
	match style:
		"hair_01": # Spiky Punk (Big chunky spikes)
			var points = PackedVector2Array([
				head_pos + Vector2(-15, 2),
				head_pos + Vector2(-16, -8),
				head_pos + Vector2(-12, -18),
				head_pos + Vector2(-5, -25),
				head_pos + Vector2(0, -22),
				head_pos + Vector2(7, -26),
				head_pos + Vector2(13, -18),
				head_pos + Vector2(16, -7),
				head_pos + Vector2(15, 2),
				head_pos + Vector2(11, -4),
				head_pos + Vector2(0, -8),
				head_pos + Vector2(-11, -4)
			])
			draw_colored_polygon(points, color)
			# Shiny hair streak
			draw_line(head_pos + Vector2(-8, -14), head_pos + Vector2(6, -14), highlight_col, 2.5)
			
		"hair_02": # Side Part (Soft rounded bob)
			draw_circle(head_pos + Vector2(0, -4), 15.2, color)
			draw_rect(Rect2(head_pos.x - 15, head_pos.y - 18, 30, 12), color)
			# Bang sweep
			var bang_points = PackedVector2Array([
				head_pos + Vector2(-14, -8),
				head_pos + Vector2(12, -3),
				head_pos + Vector2(14, -14),
				head_pos + Vector2(-14, -16)
			])
			draw_colored_polygon(bang_points, color.darkened(0.1))
			draw_circle(head_pos + Vector2(-4, -12), 4.0, highlight_col)
			
		"hair_03": # Ponytail (Fluffy high ponytail)
			draw_circle(head_pos + Vector2(0, -4), 15.0, color)
			# Chunky ponytail puffs
			draw_circle(head_pos + Vector2(17, -12), 8.0, color)
			draw_circle(head_pos + Vector2(22, -6), 6.5, color)
			draw_circle(head_pos + Vector2(17, -12), 3.0, highlight_col)
			# Hair band
			draw_circle(head_pos + Vector2(13, -11), 3.5, Color("#FF4081"))
			
		"hair_04": # Buzz Cut (Clean rounded crop)
			draw_circle(head_pos + Vector2(0, -2), 14.8, color)
			draw_arc(head_pos + Vector2(0, -2), 15.0, -PI, 0, 16, highlight_col, 2.0)
			
		"hair_05": # Messy Anime (Big flowing tufts)
			var points = PackedVector2Array([
				head_pos + Vector2(-16, 4),
				head_pos + Vector2(-18, -6),
				head_pos + Vector2(-14, -20),
				head_pos + Vector2(-3, -26),
				head_pos + Vector2(8, -24),
				head_pos + Vector2(17, -16),
				head_pos + Vector2(17, 4),
				head_pos + Vector2(12, -2),
				head_pos + Vector2(5, -7),
				head_pos + Vector2(-4, -6),
				head_pos + Vector2(-12, -2)
			])
			draw_colored_polygon(points, color)
			# Anime shine curves
			draw_circle(head_pos + Vector2(-6, -16), 3.5, highlight_col)
			draw_circle(head_pos + Vector2(4, -15), 4.0, highlight_col)
			
		_:
			draw_circle(head_pos + Vector2(0, -4), 14.5, color)

func _ensure_color(val) -> Color:
	if val is Color:
		return val
	if val is String:
		return Color(val)
	return Color.WHITE
