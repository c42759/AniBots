# CharacterCustomizer.gd
# 3D Handler Character Customization Stage Controller
extends Control

@onready var preview_character: CompositeCharacter3D = %PreviewCharacter3D
@onready var name_input: LineEdit = %NameInput

# Category Style Buttons & Labels
@onready var hair_style_label: Label = %HairStyleLabel
@onready var shirt_style_label: Label = %ShirtStyleLabel
@onready var bottom_style_label: Label = %BottomStyleLabel
@onready var shoe_style_label: Label = %ShoeStyleLabel

@onready var hair_color_container: HBoxContainer = %HairColorContainer
@onready var skin_color_container: HBoxContainer = %SkinColorContainer
@onready var shirt_color_container: HBoxContainer = %ShirtColorContainer
@onready var bottom_color_container: HBoxContainer = %BottomColorContainer
@onready var shoe_color_container: HBoxContainer = %ShoeColorContainer

@onready var starter_chip_label: Label = %StarterChipLabel
@onready var starter_desc_label: Label = %StarterDescLabel

@onready var randomize_btn: Button = %RandomizeButton
@onready var back_btn: Button = %BackButton
@onready var start_game_btn: Button = %StartGameButton

var hair_style_idx: int = 0
var shirt_style_idx: int = 0
var bottom_style_idx: int = 0
var shoe_style_idx: int = 0

var selected_hair_color: Color = Color("#1A1A1A")
var selected_skin_color: Color = Color("#F0D5BE")
var selected_shirt_color: Color = Color("#1976D2")
var selected_bottom_color: Color = Color("#37474F")
var selected_shoe_color: Color = Color("#FAFAFA")

var starter_chips = ["chip_artificer", "chip_spark", "chip_orion"]
var starter_chip_idx: int = 0
var turntable_rot_speed: float = 0.0

func _ready() -> void:
	_setup_color_palettes()
	_connect_style_buttons()
	_update_all_displays()
	
	randomize_btn.pressed.connect(_on_randomize_pressed)
	back_btn.pressed.connect(_on_back_pressed)
	start_game_btn.pressed.connect(_on_start_game_pressed)
	
	if has_node("%RotateLeftBtn"):
		%RotateLeftBtn.pressed.connect(func(): preview_character.rotation.y -= 0.5)
	if has_node("%RotateRightBtn"):
		%RotateRightBtn.pressed.connect(func(): preview_character.rotation.y += 0.5)

func _process(delta: float) -> void:
	if preview_character and turntable_rot_speed != 0.0:
		preview_character.rotation.y += turntable_rot_speed * delta

func _setup_color_palettes() -> void:
	# Hair Colors
	for entry in Types.CUSTOMIZATION_DATA["hair_colors"]:
		var btn = _create_color_button(entry.color, func():
			selected_hair_color = entry.color
			_update_preview()
		)
		hair_color_container.add_child(btn)

	# Skin Colors
	for entry in Types.CUSTOMIZATION_DATA["skin_colors"]:
		var btn = _create_color_button(entry.color, func():
			selected_skin_color = entry.color
			_update_preview()
		)
		skin_color_container.add_child(btn)

	# Shirt Colors
	for entry in Types.CUSTOMIZATION_DATA["shirt_colors"]:
		var btn = _create_color_button(entry.color, func():
			selected_shirt_color = entry.color
			_update_preview()
		)
		shirt_color_container.add_child(btn)

	# Bottom Colors
	for entry in Types.CUSTOMIZATION_DATA["bottom_colors"]:
		var btn = _create_color_button(entry.color, func():
			selected_bottom_color = entry.color
			_update_preview()
		)
		bottom_color_container.add_child(btn)

	# Shoe Colors
	for entry in Types.CUSTOMIZATION_DATA["shoe_colors"]:
		var btn = _create_color_button(entry.color, func():
			selected_shoe_color = entry.color
			_update_preview()
		)
		shoe_color_container.add_child(btn)

func _create_color_button(color: Color, on_click: Callable) -> Button:
	var btn := Button.new()
	btn.custom_minimum_size = Vector2(32, 32)
	
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_bottom_left = 6
	style.corner_radius_bottom_right = 6
	style.corner_radius_top_left = 6
	style.corner_radius_top_right = 6
	style.border_width_bottom = 2
	style.border_width_top = 2
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_color = Color(0.2, 0.2, 0.3)
	
	btn.add_theme_stylebox_override("normal", style)
	btn.add_theme_stylebox_override("hover", style)
	btn.add_theme_stylebox_override("pressed", style)
	
	btn.pressed.connect(func():
		SignalBus.play_sfx_requested.emit("click")
		on_click.call()
	)
	return btn

func _connect_style_buttons() -> void:
	%HairPrevBtn.pressed.connect(func(): _cycle_style("hair", -1))
	%HairNextBtn.pressed.connect(func(): _cycle_style("hair", 1))
	
	%ShirtPrevBtn.pressed.connect(func(): _cycle_style("shirt", -1))
	%ShirtNextBtn.pressed.connect(func(): _cycle_style("shirt", 1))
	
	%BottomPrevBtn.pressed.connect(func(): _cycle_style("bottom", -1))
	%BottomNextBtn.pressed.connect(func(): _cycle_style("bottom", 1))
	
	%ShoePrevBtn.pressed.connect(func(): _cycle_style("shoe", -1))
	%ShoeNextBtn.pressed.connect(func(): _cycle_style("shoe", 1))
	
	%ChipPrevBtn.pressed.connect(func(): _cycle_starter_chip(-1))
	%ChipNextBtn.pressed.connect(func(): _cycle_starter_chip(1))

func _cycle_style(category: String, direction: int) -> void:
	SignalBus.play_sfx_requested.emit("click")
	match category:
		"hair":
			var count = Types.CUSTOMIZATION_DATA["hair_styles"].size()
			hair_style_idx = (hair_style_idx + direction + count) % count
		"shirt":
			var count = Types.CUSTOMIZATION_DATA["shirt_styles"].size()
			shirt_style_idx = (shirt_style_idx + direction + count) % count
		"bottom":
			var count = Types.CUSTOMIZATION_DATA["bottom_styles"].size()
			bottom_style_idx = (bottom_style_idx + direction + count) % count
		"shoe":
			var count = Types.CUSTOMIZATION_DATA["shoe_styles"].size()
			shoe_style_idx = (shoe_style_idx + direction + count) % count
	_update_all_displays()

func _cycle_starter_chip(direction: int) -> void:
	SignalBus.play_sfx_requested.emit("click")
	var count = starter_chips.size()
	starter_chip_idx = (starter_chip_idx + direction + count) % count
	_update_starter_chip_display()

func _update_all_displays() -> void:
	var hair_entry = Types.CUSTOMIZATION_DATA["hair_styles"][hair_style_idx]
	hair_style_label.text = hair_entry["name"]
	
	var shirt_entry = Types.CUSTOMIZATION_DATA["shirt_styles"][shirt_style_idx]
	shirt_style_label.text = shirt_entry["name"]
	
	var bottom_entry = Types.CUSTOMIZATION_DATA["bottom_styles"][bottom_style_idx]
	bottom_style_label.text = bottom_entry["name"]
	
	var shoe_entry = Types.CUSTOMIZATION_DATA["shoe_styles"][shoe_style_idx]
	shoe_style_label.text = shoe_entry["name"]
	
	_update_starter_chip_display()
	_update_preview()

func _update_starter_chip_display() -> void:
	var chip_id = starter_chips[starter_chip_idx]
	var chip = Types.CHIPS_CATALOG[chip_id]
	starter_chip_label.text = "%s (%s)" % [chip["name"], chip["starter_frame"]]
	starter_desc_label.text = "%s\n%s" % [chip["personality"], chip["bonus_text"]]

func _update_preview() -> void:
	var hair_entry = Types.CUSTOMIZATION_DATA["hair_styles"][hair_style_idx]
	var shirt_entry = Types.CUSTOMIZATION_DATA["shirt_styles"][shirt_style_idx]
	var bottom_entry = Types.CUSTOMIZATION_DATA["bottom_styles"][bottom_style_idx]
	var shoe_entry = Types.CUSTOMIZATION_DATA["shoe_styles"][shoe_style_idx]

	var data = {
		"hair_style": hair_entry["id"],
		"hair_color": selected_hair_color,
		"skin_color": selected_skin_color,
		"shirt_style": shirt_entry["id"],
		"shirt_color": selected_shirt_color,
		"bottom_style": bottom_entry["id"],
		"bottom_color": selected_bottom_color,
		"shoe_style": shoe_entry["id"],
		"shoe_color": selected_shoe_color
	}
	if preview_character:
		preview_character.apply_appearance(data)

func _on_randomize_pressed() -> void:
	SignalBus.play_sfx_requested.emit("click")
	hair_style_idx = randi() % Types.CUSTOMIZATION_DATA["hair_styles"].size()
	shirt_style_idx = randi() % Types.CUSTOMIZATION_DATA["shirt_styles"].size()
	bottom_style_idx = randi() % Types.CUSTOMIZATION_DATA["bottom_styles"].size()
	shoe_style_idx = randi() % Types.CUSTOMIZATION_DATA["shoe_styles"].size()
	
	var hair_cols = Types.CUSTOMIZATION_DATA["hair_colors"]
	selected_hair_color = hair_cols[randi() % hair_cols.size()].color
	
	var skin_cols = Types.CUSTOMIZATION_DATA["skin_colors"]
	selected_skin_color = skin_cols[randi() % skin_cols.size()].color
	
	var shirt_cols = Types.CUSTOMIZATION_DATA["shirt_colors"]
	selected_shirt_color = shirt_cols[randi() % shirt_cols.size()].color
	
	var bottom_cols = Types.CUSTOMIZATION_DATA["bottom_colors"]
	selected_bottom_color = bottom_cols[randi() % bottom_cols.size()].color
	
	var shoe_cols = Types.CUSTOMIZATION_DATA["shoe_colors"]
	selected_shoe_color = shoe_cols[randi() % shoe_cols.size()].color
	
	starter_chip_idx = randi() % starter_chips.size()
	_update_all_displays()

func _on_back_pressed() -> void:
	SignalBus.play_sfx_requested.emit("cancel")
	GameManager.return_to_main_menu()

func _on_start_game_pressed() -> void:
	SignalBus.play_sfx_requested.emit("confirm")
	var p_name = name_input.text.strip_edges()
	if p_name.is_empty():
		p_name = "Handler"
		
	var hair_entry = Types.CUSTOMIZATION_DATA["hair_styles"][hair_style_idx]
	var shirt_entry = Types.CUSTOMIZATION_DATA["shirt_styles"][shirt_style_idx]
	var bottom_entry = Types.CUSTOMIZATION_DATA["bottom_styles"][bottom_style_idx]
	var shoe_entry = Types.CUSTOMIZATION_DATA["shoe_styles"][shoe_style_idx]

	var appearance_dict = {
		"hair_style": hair_entry["id"],
		"hair_color": "#" + selected_hair_color.to_html(false),
		"skin_color": "#" + selected_skin_color.to_html(false),
		"shirt_style": shirt_entry["id"],
		"shirt_color": "#" + selected_shirt_color.to_html(false),
		"bottom_style": bottom_entry["id"],
		"bottom_color": "#" + selected_bottom_color.to_html(false),
		"shoe_style": shoe_entry["id"],
		"shoe_color": "#" + selected_shoe_color.to_html(false)
	}
	
	var chosen_chip = starter_chips[starter_chip_idx]
	GameManager.finalize_character_creation(p_name, appearance_dict, chosen_chip)
