# PartsShop.gd
# Interactive Workshop Shop UI to buy new AniParts with Credits and Repair damaged gear with Scrap
extends Control

signal closed

@onready var credits_label: Label = find_child("ShopCreditsLabel", true, false)
@onready var scrap_label: Label = find_child("ShopScrapLabel", true, false)
@onready var catalog_container: VBoxContainer = find_child("ShopCatalogContainer", true, false)
@onready var part_preview_panel: PanelContainer = find_child("ShopPreviewPanel", true, false)
@onready var preview_name_label: Label = find_child("PreviewNameLabel", true, false)
@onready var preview_slot_label: Label = find_child("PreviewSlotLabel", true, false)
@onready var preview_desc_label: Label = find_child("PreviewDescLabel", true, false)
@onready var preview_hp_label: Label = find_child("PreviewHPLabel", true, false)
@onready var preview_power_label: Label = find_child("PreviewPowerLabel", true, false)
@onready var preview_latency_label: Label = find_child("PreviewLatencyLabel", true, false)
@onready var preview_weight_label: Label = find_child("PreviewWeightLabel", true, false)
@onready var buy_btn: Button = find_child("BuyButton", true, false)
@onready var repair_all_btn: Button = find_child("RepairAllButton", true, false)
@onready var close_btn: Button = find_child("ShopCloseButton", true, false)
@onready var status_toast_label: Label = find_child("ShopStatusToast", true, false)

# Filter Buttons
@onready var filter_all_btn: Button = find_child("FilterAllBtn", true, false)
@onready var filter_head_btn: Button = find_child("FilterHeadBtn", true, false)
@onready var filter_torso_btn: Button = find_child("FilterTorsoBtn", true, false)
@onready var filter_arms_btn: Button = find_child("FilterArmsBtn", true, false)
@onready var filter_legs_btn: Button = find_child("FilterLegsBtn", true, false)

var active_slot_filter: int = -1 # -1 = All
var selected_shop_item_id: String = ""
var selected_item_price: int = 0

# Parts price book matching Types.PARTS_CATALOG keys
const PARTS_PRICES: Dictionary = {
	# Heads
	"part_head_logic_bomb": 250,
	"part_head_surge_node": 300,
	"part_head_astro_scope": 350,
	
	# Torsos
	"part_torso_genesis": 400,
	"part_torso_circuit": 450,
	"part_torso_nova": 500,
	
	# Left Arms
	"part_arm_l_wrench": 200,
	"part_arm_l_static_whip": 280,
	"part_arm_l_pulsar_rifle": 380,
	
	# Right Arms
	"part_arm_r_ratchet": 220,
	"part_arm_r_volt_caster": 300,
	"part_arm_r_comet_snipe": 420,
	
	# Legs
	"part_legs_steady_tread": 280,
	"part_legs_current_wheels": 320,
	"part_legs_hover_drive": 380
}

func _ready() -> void:
	_ensure_nodes()
	if close_btn and not close_btn.pressed.is_connected(_on_close_pressed):
		close_btn.pressed.connect(_on_close_pressed)
	if buy_btn and not buy_btn.pressed.is_connected(_on_buy_pressed):
		buy_btn.pressed.connect(_on_buy_pressed)
	if repair_all_btn and not repair_all_btn.pressed.is_connected(_on_repair_all_pressed):
		repair_all_btn.pressed.connect(_on_repair_all_pressed)
		
	if filter_all_btn and not filter_all_btn.pressed.is_connected(_on_filter_all):
		filter_all_btn.pressed.connect(_on_filter_all)
	if filter_head_btn and not filter_head_btn.pressed.is_connected(_on_filter_head):
		filter_head_btn.pressed.connect(_on_filter_head)
	if filter_torso_btn and not filter_torso_btn.pressed.is_connected(_on_filter_torso):
		filter_torso_btn.pressed.connect(_on_filter_torso)
	if filter_arms_btn and not filter_arms_btn.pressed.is_connected(_on_filter_arms):
		filter_arms_btn.pressed.connect(_on_filter_arms)
	if filter_legs_btn and not filter_legs_btn.pressed.is_connected(_on_filter_legs):
		filter_legs_btn.pressed.connect(_on_filter_legs)
	
	SignalBus.economy_updated.connect(_update_economy_labels)
	if part_preview_panel:
		part_preview_panel.hide()

func _on_filter_all() -> void: _set_filter(-1)
func _on_filter_head() -> void: _set_filter(Types.PartSlot.HEAD)
func _on_filter_torso() -> void: _set_filter(Types.PartSlot.TORSO)
func _on_filter_arms() -> void: _set_filter(Types.PartSlot.RIGHT_ARM)
func _on_filter_legs() -> void: _set_filter(Types.PartSlot.LEGS)

func open_shop() -> void:
	show()
	_ensure_nodes()
	_update_economy_labels()
	_set_filter(-1)
	if status_toast_label:
		status_toast_label.text = "Welcome to the Workshop Lab! Select a component to inspect."
		status_toast_label.modulate = Color(0.7, 0.9, 1.0)
	SignalBus.shop_opened.emit()

func _ensure_nodes() -> void:
	if not credits_label: credits_label = find_child("ShopCreditsLabel", true, false)
	if not scrap_label: scrap_label = find_child("ShopScrapLabel", true, false)
	if not catalog_container: catalog_container = find_child("ShopCatalogContainer", true, false)
	if not part_preview_panel: part_preview_panel = find_child("ShopPreviewPanel", true, false)
	if not preview_name_label: preview_name_label = find_child("PreviewNameLabel", true, false)
	if not preview_slot_label: preview_slot_label = find_child("PreviewSlotLabel", true, false)
	if not preview_desc_label: preview_desc_label = find_child("PreviewDescLabel", true, false)
	if not preview_hp_label: preview_hp_label = find_child("PreviewHPLabel", true, false)
	if not preview_power_label: preview_power_label = find_child("PreviewPowerLabel", true, false)
	if not preview_latency_label: preview_latency_label = find_child("PreviewLatencyLabel", true, false)
	if not preview_weight_label: preview_weight_label = find_child("PreviewWeightLabel", true, false)
	if not buy_btn: buy_btn = find_child("BuyButton", true, false)
	if not repair_all_btn: repair_all_btn = find_child("RepairAllButton", true, false)
	if not close_btn: close_btn = find_child("ShopCloseButton", true, false)
	if not status_toast_label: status_toast_label = find_child("ShopStatusToast", true, false)
	
	if not filter_all_btn: filter_all_btn = find_child("FilterAllBtn", true, false)
	if not filter_head_btn: filter_head_btn = find_child("FilterHeadBtn", true, false)
	if not filter_torso_btn: filter_torso_btn = find_child("FilterTorsoBtn", true, false)
	if not filter_arms_btn: filter_arms_btn = find_child("FilterArmsBtn", true, false)
	if not filter_legs_btn: filter_legs_btn = find_child("FilterLegsBtn", true, false)

func _update_economy_labels() -> void:
	var eco = SaveManager.get_economy()
	if credits_label:
		credits_label.text = "Credits: %d C" % eco.get("credits", 0)
	if scrap_label:
		scrap_label.text = "Scrap: %d" % eco.get("scrap", 0)

func _set_filter(slot_filter: int) -> void:
	SignalBus.play_sfx_requested.emit("click")
	active_slot_filter = slot_filter
	_update_filter_button_visuals()
	_refresh_catalog()

func _update_filter_button_visuals() -> void:
	var def_col = Color(1, 1, 1, 1)
	var act_col = Color("#00E5FF")
	
	if filter_all_btn: filter_all_btn.modulate = act_col if active_slot_filter == -1 else def_col
	if filter_head_btn: filter_head_btn.modulate = act_col if active_slot_filter == Types.PartSlot.HEAD else def_col
	if filter_torso_btn: filter_torso_btn.modulate = act_col if active_slot_filter == Types.PartSlot.TORSO else def_col
	if filter_arms_btn: filter_arms_btn.modulate = act_col if (active_slot_filter == Types.PartSlot.LEFT_ARM or active_slot_filter == Types.PartSlot.RIGHT_ARM) else def_col
	if filter_legs_btn: filter_legs_btn.modulate = act_col if active_slot_filter == Types.PartSlot.LEGS else def_col

func _refresh_catalog() -> void:
	if not catalog_container:
		return
		
	for child in catalog_container.get_children():
		child.queue_free()
		
	var items_shown = 0
	for part_id in PARTS_PRICES:
		var part_info = Types.PARTS_CATALOG.get(part_id, {})
		var slot = part_info.get("slot", -1)
		
		# Filter check (arms filter matches both left and right arm slots)
		if active_slot_filter != -1:
			if active_slot_filter == Types.PartSlot.RIGHT_ARM or active_slot_filter == Types.PartSlot.LEFT_ARM:
				if slot != Types.PartSlot.LEFT_ARM and slot != Types.PartSlot.RIGHT_ARM:
					continue
			elif slot != active_slot_filter:
				continue
				
		var card = _create_shop_item_row(part_id, part_info, PARTS_PRICES[part_id])
		catalog_container.add_child(card)
		items_shown += 1
		
	if items_shown == 0:
		var empty_lbl := Label.new()
		empty_lbl.text = "No parts found for this filter."
		empty_lbl.modulate = Color(0.6, 0.7, 0.8)
		catalog_container.add_child(empty_lbl)

func _create_shop_item_row(part_id: String, item: Dictionary, price: int) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(0, 52)
	
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 8)
	panel.add_child(margin)
	
	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 12)
	margin.add_child(hbox)
	
	var slot_badge := Label.new()
	slot_badge.text = "[%s]" % _slot_to_name(item.get("slot", 0))
	slot_badge.modulate = Color("#29B6F6")
	slot_badge.add_theme_font_size_override("font_size", 12)
	hbox.add_child(slot_badge)
	
	var name_lbl := Label.new()
	name_lbl.text = item.get("name", "Part")
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_lbl.add_theme_font_size_override("font_size", 14)
	hbox.add_child(name_lbl)
	
	var price_lbl := Label.new()
	price_lbl.text = "%d Credits" % price
	price_lbl.modulate = Color("#66BB6A")
	price_lbl.add_theme_font_size_override("font_size", 13)
	hbox.add_child(price_lbl)
	
	var inspect_btn := Button.new()
	inspect_btn.text = "Inspect"
	inspect_btn.custom_minimum_size = Vector2(76, 32)
	inspect_btn.pressed.connect(func(): _inspect_shop_item(part_id, item, price))
	hbox.add_child(inspect_btn)
	
	return panel

func _inspect_shop_item(part_id: String, item: Dictionary, price: int) -> void:
	SignalBus.play_sfx_requested.emit("click")
	selected_shop_item_id = part_id
	selected_item_price = price
	
	if preview_name_label: preview_name_label.text = item.get("name", "Part")
	if preview_slot_label: preview_slot_label.text = "Hardware Slot: %s | Brand New (100%% Grade)" % _slot_to_name(item.get("slot", 0))
	if preview_desc_label: preview_desc_label.text = "Affinity: %s | High durability modular component." % item.get("series", "Standard").to_upper()
	if preview_hp_label: preview_hp_label.text = "Base Integrity: %d HP" % item.get("base_integrity", 50)
	if preview_power_label: preview_power_label.text = "Payload Power: %d" % item.get("payload", 0)
	if preview_latency_label: preview_latency_label.text = "Latency: %.1fs" % item.get("latency", 2.0)
	if preview_weight_label: preview_weight_label.text = "Weight: %d" % item.get("weight", 0)
	
	var eco = SaveManager.get_economy()
	var player_credits = eco.get("credits", 0)
	
	if buy_btn:
		buy_btn.text = "Purchase for %d Credits" % price
		buy_btn.disabled = player_credits < price
		
	if part_preview_panel:
		part_preview_panel.show()

func _on_buy_pressed() -> void:
	if selected_shop_item_id.is_empty() or selected_item_price <= 0:
		return
		
	var success = SaveManager.purchase_part(selected_shop_item_id, selected_item_price)
	if success:
		SignalBus.play_sfx_requested.emit("confirm")
		_update_economy_labels()
		if status_toast_label:
			status_toast_label.text = "Purchased %s! Added to inventory garage." % Types.PARTS_CATALOG.get(selected_shop_item_id, {}).get("name", "Part")
			status_toast_label.modulate = Color(0.4, 1.0, 0.4)
		_inspect_shop_item(selected_shop_item_id, Types.PARTS_CATALOG.get(selected_shop_item_id, {}), selected_item_price)
	else:
		SignalBus.play_sfx_requested.emit("cancel")
		if status_toast_label:
			status_toast_label.text = "Insufficient Credits to purchase this part!"
			status_toast_label.modulate = Color(1.0, 0.4, 0.4)

func _on_repair_all_pressed() -> void:
	var result = SaveManager.repair_all_parts(5)
	if result.get("success", false):
		SignalBus.play_sfx_requested.emit("confirm")
		_update_economy_labels()
		if status_toast_label:
			status_toast_label.text = "Repaired %d damaged parts for %d Scrap!" % [result.get("repaired_count", 0), result.get("cost_scrap", 0)]
			status_toast_label.modulate = Color(0.4, 1.0, 0.4)
	else:
		SignalBus.play_sfx_requested.emit("click")
		if status_toast_label:
			status_toast_label.text = "All parts are already at 100% pristine condition!"
			status_toast_label.modulate = Color(0.7, 0.9, 1.0)

func _on_close_pressed() -> void:
	SignalBus.play_sfx_requested.emit("cancel")
	hide()
	closed.emit()
	SignalBus.shop_closed.emit()

func _slot_to_name(slot: int) -> String:
	match slot:
		Types.PartSlot.HEAD: return "Head"
		Types.PartSlot.TORSO: return "Torso"
		Types.PartSlot.LEFT_ARM: return "Left Arm"
		Types.PartSlot.RIGHT_ARM: return "Right Arm"
		Types.PartSlot.LEGS: return "Legs"
	return "Part"
