# AnibotAssembly.gd
# Medabots-style AniBot Loadout Assembly, 3-Bot Squad Switcher, Field-Patch Kit (85% Cap), and Part Swapping 3D Garage UI
extends Control

signal closed

@onready var bot_name_label: Label = find_child("BotNameLabel", true, false)
@onready var chip_info_label: Label = find_child("ChipInfoLabel", true, false)
@onready var total_hp_label: Label = find_child("TotalHPLabel", true, false)
@onready var weight_loadout_label: Label = find_child("WeightLoadoutLabel", true, false)
@onready var cooling_label: Label = find_child("CoolingLabel", true, false)
@onready var overweight_warning: Label = find_child("OverweightWarning", true, false)
@onready var affinity_badge: Label = find_child("AffinityBadge", true, false)

# Equipped Slot Labels
@onready var head_name_label: Label = find_child("HeadNameLabel", true, false)
@onready var head_stats_label: Label = find_child("HeadStatsLabel", true, false)
@onready var torso_name_label: Label = find_child("TorsoNameLabel", true, false)
@onready var torso_stats_label: Label = find_child("TorsoStatsLabel", true, false)
@onready var l_arm_name_label: Label = find_child("LArmNameLabel", true, false)
@onready var l_arm_stats_label: Label = find_child("LArmStatsLabel", true, false)
@onready var r_arm_name_label: Label = find_child("RArmNameLabel", true, false)
@onready var r_arm_stats_label: Label = find_child("RArmStatsLabel", true, false)
@onready var legs_name_label: Label = find_child("LegsNameLabel", true, false)
@onready var legs_stats_label: Label = find_child("LegsStatsLabel", true, false)

# Inventory & Comparison
@onready var inv_title_label: Label = find_child("InvTitleLabel", true, false)
@onready var inv_parts_container: VBoxContainer = find_child("InvPartsContainer", true, false)
@onready var comparison_panel: PanelContainer = find_child("ComparisonPanel", true, false)
@onready var comp_title_label: Label = find_child("CompTitleLabel", true, false)
@onready var comp_hp_label: Label = find_child("CompHPLabel", true, false)
@onready var comp_power_label: Label = find_child("CompPowerLabel", true, false)
@onready var comp_latency_label: Label = find_child("CompLatencyLabel", true, false)
@onready var comp_weight_label: Label = find_child("CompWeightLabel", true, false)
@onready var equip_button: Button = find_child("EquipButton", true, false)
@onready var close_button: Button = find_child("CloseButton", true, false)
@onready var select_head_btn: Button = find_child("SelectHeadBtn", true, false)
@onready var select_torso_btn: Button = find_child("SelectTorsoBtn", true, false)
@onready var select_l_arm_btn: Button = find_child("SelectLArmBtn", true, false)
@onready var select_r_arm_btn: Button = find_child("SelectRArmBtn", true, false)
@onready var select_legs_btn: Button = find_child("SelectLegsBtn", true, false)

@onready var hangar_bot: AniBotModel3D = %HangarBot3D

var active_slot_selected: int = Types.PartSlot.HEAD
var selected_inventory_part: Dictionary = {}

# Dynamic extra controls for Squad Switcher, Chip Cycer & Field-Patch Kit
var squad_switch_btn: Button = null
var cycle_chip_btn: Button = null
var patch_slot_btn: Button = null

func _ready() -> void:
	Types.ensure_catalogs_loaded()
	_ensure_nodes_resolved()
	_setup_extra_controls()
	if comparison_panel:
		comparison_panel.hide()
	if close_button and not close_button.pressed.is_connected(_on_close_pressed):
		close_button.pressed.connect(_on_close_pressed)
	if equip_button and not equip_button.pressed.is_connected(_on_equip_pressed):
		equip_button.pressed.connect(_on_equip_pressed)
	
	if select_head_btn and not select_head_btn.pressed.is_connected(_select_slot_head):
		select_head_btn.pressed.connect(_select_slot_head)
	if select_torso_btn and not select_torso_btn.pressed.is_connected(_select_slot_torso):
		select_torso_btn.pressed.connect(_select_slot_torso)
	if select_l_arm_btn and not select_l_arm_btn.pressed.is_connected(_select_slot_l_arm):
		select_l_arm_btn.pressed.connect(_select_slot_l_arm)
	if select_r_arm_btn and not select_r_arm_btn.pressed.is_connected(_select_slot_r_arm):
		select_r_arm_btn.pressed.connect(_select_slot_r_arm)
	if select_legs_btn and not select_legs_btn.pressed.is_connected(_select_slot_legs):
		select_legs_btn.pressed.connect(_select_slot_legs)

func _setup_extra_controls() -> void:
	if bot_name_label and bot_name_label.get_parent() and not squad_switch_btn:
		var parent_box := bot_name_label.get_parent()
		var hbox := HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 6)
		parent_box.add_child(hbox)
		parent_box.move_child(hbox, bot_name_label.get_index() + 1)
		
		squad_switch_btn = Button.new()
		squad_switch_btn.text = "Switch Squad Bot [1/3]"
		squad_switch_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		squad_switch_btn.pressed.connect(_on_switch_squad_bot)
		hbox.add_child(squad_switch_btn)
		
		cycle_chip_btn = Button.new()
		cycle_chip_btn.text = "Swap Chip"
		cycle_chip_btn.pressed.connect(_on_cycle_chip)
		hbox.add_child(cycle_chip_btn)
		
		patch_slot_btn = Button.new()
		patch_slot_btn.text = "Apply Field-Patch Kit (85% Cap)"
		patch_slot_btn.pressed.connect(_on_apply_patch_kit)
		parent_box.add_child(patch_slot_btn)

func _on_switch_squad_bot() -> void:
	SignalBus.play_sfx_requested.emit("click")
	var roster := SaveManager.get_squad_roster()
	if roster.size() > 0:
		var next_idx := (SaveManager.get_selected_bot_index() + 1) % roster.size()
		SaveManager.select_squad_bot(next_idx)
		refresh_all_views()

func _on_cycle_chip() -> void:
	SignalBus.play_sfx_requested.emit("click")
	var owned := SaveManager.get_owned_chips()
	if owned.is_empty():
		return
	var bot := SaveManager.get_active_anibot()
	var cur_chip: String = str(bot.get("chip_id", "chip_artificer"))
	var idx := owned.find(cur_chip)
	var next_chip: String = str(owned[(idx + 1) % owned.size()])
	SaveManager.swap_active_anibot_chip(next_chip)
	refresh_all_views()

func _on_apply_patch_kit() -> void:
	var res := SaveManager.apply_field_patch_to_equipped_slot(active_slot_selected)
	if res.get("success", false):
		SignalBus.play_sfx_requested.emit("confirm")
	else:
		SignalBus.play_sfx_requested.emit("cancel")
	refresh_all_views()

func _process(delta: float) -> void:
	if visible and hangar_bot:
		hangar_bot.rotation.y += delta * 0.5

func _select_slot_head() -> void: _select_slot(Types.PartSlot.HEAD)
func _select_slot_torso() -> void: _select_slot(Types.PartSlot.TORSO)
func _select_slot_l_arm() -> void: _select_slot(Types.PartSlot.LEFT_ARM)
func _select_slot_r_arm() -> void: _select_slot(Types.PartSlot.RIGHT_ARM)
func _select_slot_legs() -> void: _select_slot(Types.PartSlot.LEGS)

func _ensure_nodes_resolved() -> void:
	if not bot_name_label: bot_name_label = find_child("BotNameLabel", true, false)
	if not chip_info_label: chip_info_label = find_child("ChipInfoLabel", true, false)
	if not total_hp_label: total_hp_label = find_child("TotalHPLabel", true, false)
	if not weight_loadout_label: weight_loadout_label = find_child("WeightLoadoutLabel", true, false)
	if not cooling_label: cooling_label = find_child("CoolingLabel", true, false)
	if not overweight_warning: overweight_warning = find_child("OverweightWarning", true, false)
	if not affinity_badge: affinity_badge = find_child("AffinityBadge", true, false)
	
	if not head_name_label: head_name_label = find_child("HeadNameLabel", true, false)
	if not head_stats_label: head_stats_label = find_child("HeadStatsLabel", true, false)
	if not torso_name_label: torso_name_label = find_child("TorsoNameLabel", true, false)
	if not torso_stats_label: torso_stats_label = find_child("TorsoStatsLabel", true, false)
	if not l_arm_name_label: l_arm_name_label = find_child("LArmNameLabel", true, false)
	if not l_arm_stats_label: l_arm_stats_label = find_child("LArmStatsLabel", true, false)
	if not r_arm_name_label: r_arm_name_label = find_child("RArmNameLabel", true, false)
	if not r_arm_stats_label: r_arm_stats_label = find_child("RArmStatsLabel", true, false)
	if not legs_name_label: legs_name_label = find_child("LegsNameLabel", true, false)
	if not legs_stats_label: legs_stats_label = find_child("LegsStatsLabel", true, false)
	
	if not inv_title_label: inv_title_label = find_child("InvTitleLabel", true, false)
	if not inv_parts_container: inv_parts_container = find_child("InvPartsContainer", true, false)
	if not comparison_panel: comparison_panel = find_child("ComparisonPanel", true, false)
	if not comp_title_label: comp_title_label = find_child("CompTitleLabel", true, false)
	if not comp_hp_label: comp_hp_label = find_child("CompHPLabel", true, false)
	if not comp_power_label: comp_power_label = find_child("CompPowerLabel", true, false)
	if not comp_latency_label: comp_latency_label = find_child("CompLatencyLabel", true, false)
	if not comp_weight_label: comp_weight_label = find_child("CompWeightLabel", true, false)
	if not equip_button: equip_button = find_child("EquipButton", true, false)
	if not close_button: close_button = find_child("CloseButton", true, false)
	
	if not select_head_btn: select_head_btn = find_child("SelectHeadBtn", true, false)
	if not select_torso_btn: select_torso_btn = find_child("SelectTorsoBtn", true, false)
	if not select_l_arm_btn: select_l_arm_btn = find_child("SelectLArmBtn", true, false)
	if not select_r_arm_btn: select_r_arm_btn = find_child("SelectRArmBtn", true, false)
	if not select_legs_btn: select_legs_btn = find_child("SelectLegsBtn", true, false)

func open_garage() -> void:
	show()
	_ensure_nodes_resolved()
	_setup_extra_controls()
	_select_slot(Types.PartSlot.HEAD)
	refresh_all_views()
	SignalBus.anibot_assembly_opened.emit()

func refresh_all_views() -> void:
	Types.ensure_catalogs_loaded()
	var bot_data := SaveManager.get_active_anibot()
	if bot_data.is_empty():
		return
		
	var idx := SaveManager.get_selected_bot_index()
	var roster := SaveManager.get_squad_roster()
	var role_tag := "LEADER" if idx == 0 else ("WINGMAN #%d" % (idx + 1))
	var bot_name: String = bot_data.get("bot_name", "Genesis-1")
	var chip_id: String = bot_data.get("chip_id", "chip_artificer")
	var chip: Dictionary = Types.CHIPS_CATALOG.get(chip_id, Types.CHIPS_CATALOG["chip_artificer"])
	var chip_aff: String = str(chip.get("affinity", "TRAP"))
	
	bot_name_label.text = "[%s] %s" % [role_tag, bot_name]
	if squad_switch_btn:
		squad_switch_btn.text = "Squad Bot [%d/%d]" % [idx + 1, maxi(1, roster.size())]
	if patch_slot_btn:
		var kits := int(SaveManager.get_economy().get("patch_kits", 0))
		patch_slot_btn.text = "Patch %s -> 85%% (Kits: %d)" % [_slot_name(active_slot_selected), kits]
		patch_slot_btn.disabled = (kits <= 0)
		
	chip_info_label.text = "Chip: %s (%s)\nAffinity: %s" % [chip.get("name", "Chip"), chip.get("personality_engram", chip.get("personality", "")), chip_aff]
	
	var parts: Dictionary = bot_data.get("parts", {})
	var total_hp := 0
	var total_weight := 0
	var affinity_match_count := 0
	
	# Head
	var head_item: Dictionary = parts.get("head", {})
	var head_cat: Dictionary = Types.PARTS_CATALOG.get(head_item.get("part_id", ""), {})
	var head_hp := Types.calculate_battle_integrity(int(head_cat.get("base_integrity", 0)), float(head_item.get("condition", 100.0)))
	var head_syn := Types.apply_affinity_synergy(int(head_cat.get("type", 0)), chip_aff, int(head_cat.get("payload", 0)), int(head_cat.get("precision", 85)))
	if head_syn["matches"]: affinity_match_count += 1
	head_name_label.text = head_cat.get("name", "Empty") + (" [★+10%]" if head_syn["matches"] else "")
	head_stats_label.text = "Cond: %d%% | HP: %d | Pwr: %d | Cache: %d" % [
		int(head_item.get("condition", 100.0)),
		head_hp,
		head_syn["payload"],
		head_item.get("current_cache", head_cat.get("cache", 3))
	]
	total_hp += head_hp
	total_weight += int(head_cat.get("weight", 0))
	
	# Torso
	var torso_item: Dictionary = parts.get("torso", {})
	var torso_cat: Dictionary = Types.PARTS_CATALOG.get(torso_item.get("part_id", ""), {})
	var torso_hp := Types.calculate_battle_integrity(int(torso_cat.get("base_integrity", 0)), float(torso_item.get("condition", 100.0)))
	torso_name_label.text = torso_cat.get("name", "Empty")
	torso_stats_label.text = "Cond: %d%% | HP: %d | Firewall: %d | Cool: %.1f | MaxLoad: %d" % [
		int(torso_item.get("condition", 100.0)),
		torso_hp,
		int(torso_cat.get("firewall", 0)),
		float(torso_cat.get("cooling", 1.0)),
		int(torso_cat.get("max_loadout", 30))
	]
	total_hp += torso_hp
	var max_loadout: int = int(torso_cat.get("max_loadout", 30))
	var cooling_val: float = float(torso_cat.get("cooling", 1.0))
	
	# Left Arm
	var l_arm_item: Dictionary = parts.get("left_arm", {})
	var l_arm_cat: Dictionary = Types.PARTS_CATALOG.get(l_arm_item.get("part_id", ""), {})
	var l_arm_hp := Types.calculate_battle_integrity(int(l_arm_cat.get("base_integrity", 0)), float(l_arm_item.get("condition", 100.0)))
	var l_syn := Types.apply_affinity_synergy(int(l_arm_cat.get("type", 0)), chip_aff, int(l_arm_cat.get("payload", 0)), int(l_arm_cat.get("precision", 85)))
	if l_syn["matches"]: affinity_match_count += 1
	l_arm_name_label.text = l_arm_cat.get("name", "Empty") + (" [★+10%]" if l_syn["matches"] else "")
	l_arm_stats_label.text = "Cond: %d%% | HP: %d | Pwr: %d | Latency: %.1fs" % [
		int(l_arm_item.get("condition", 100.0)),
		l_arm_hp,
		l_syn["payload"],
		float(l_arm_cat.get("latency", 2.0))
	]
	total_hp += l_arm_hp
	total_weight += int(l_arm_cat.get("weight", 0))
	
	# Right Arm
	var r_arm_item: Dictionary = parts.get("right_arm", {})
	var r_arm_cat: Dictionary = Types.PARTS_CATALOG.get(r_arm_item.get("part_id", ""), {})
	var r_arm_hp := Types.calculate_battle_integrity(int(r_arm_cat.get("base_integrity", 0)), float(r_arm_item.get("condition", 100.0)))
	var r_syn := Types.apply_affinity_synergy(int(r_arm_cat.get("type", 0)), chip_aff, int(r_arm_cat.get("payload", 0)), int(r_arm_cat.get("precision", 85)))
	if r_syn["matches"]: affinity_match_count += 1
	r_arm_name_label.text = r_arm_cat.get("name", "Empty") + (" [★+10%]" if r_syn["matches"] else "")
	r_arm_stats_label.text = "Cond: %d%% | HP: %d | Pwr: %d | Latency: %.1fs" % [
		int(r_arm_item.get("condition", 100.0)),
		r_arm_hp,
		r_syn["payload"],
		float(r_arm_cat.get("latency", 2.0))
	]
	total_hp += r_arm_hp
	total_weight += int(r_arm_cat.get("weight", 0))
	
	# Legs
	var legs_item: Dictionary = parts.get("legs", {})
	var legs_cat: Dictionary = Types.PARTS_CATALOG.get(legs_item.get("part_id", ""), {})
	var legs_hp := Types.calculate_battle_integrity(int(legs_cat.get("base_integrity", 0)), float(legs_item.get("condition", 100.0)))
	legs_name_label.text = legs_cat.get("name", "Empty")
	legs_stats_label.text = "Cond: %d%% | HP: %d | Speed: %.1f | Eva: %d%% | %s" % [
		int(legs_item.get("condition", 100.0)),
		legs_hp,
		float(legs_cat.get("clock_speed", 1.0)),
		int(legs_cat.get("packet_loss", 0)),
		str(legs_cat.get("protocol", "BIPEDAL"))
	]
	total_hp += legs_hp

	total_hp_label.text = "Total Integrity: %d HP" % total_hp
	weight_loadout_label.text = "Weight Loadout: %d / %d" % [total_weight, max_loadout]
	cooling_label.text = "Cooling System: %.1fx recovery" % cooling_val
	
	if affinity_badge:
		if affinity_match_count > 0:
			affinity_badge.text = "★ AFFINITY SYNERGY ACTIVE (%d Parts +10%% Stats)" % affinity_match_count
			affinity_badge.modulate = Color("#00E5FF")
			affinity_badge.show()
		else:
			affinity_badge.hide()
	
	if Types.is_build_overweight(head_cat, l_arm_cat, r_arm_cat, torso_cat):
		overweight_warning.show()
		weight_loadout_label.modulate = Color(1, 0.3, 0.3)
	else:
		overweight_warning.hide()
		weight_loadout_label.modulate = Color(0.4, 0.9, 0.4)

	if hangar_bot:
		hangar_bot.setup_model(bot_data, true)

	_refresh_inventory_list()

func _select_slot(slot: int) -> void:
	SignalBus.play_sfx_requested.emit("click")
	active_slot_selected = slot
	inv_title_label.text = "AVAILABLE %s PARTS" % _slot_name(slot).to_upper()
	comparison_panel.hide()
	selected_inventory_part = {}
	if patch_slot_btn:
		var kits := int(SaveManager.get_economy().get("patch_kits", 0))
		patch_slot_btn.text = "Patch %s -> 85%% (Kits: %d)" % [_slot_name(active_slot_selected), kits]
		patch_slot_btn.disabled = (kits <= 0)
	_refresh_inventory_list()

func _refresh_inventory_list() -> void:
	for child in inv_parts_container.get_children():
		child.queue_free()
		
	var items := SaveManager.get_inventory_parts(active_slot_selected)
	if items.size() == 0:
		var empty_lbl := Label.new()
		empty_lbl.text = "No spare %s parts in inventory." % _slot_name(active_slot_selected)
		empty_lbl.modulate = Color(0.6, 0.6, 0.7)
		inv_parts_container.add_child(empty_lbl)
		return
		
	for item in items:
		var card := _create_inventory_item_card(item)
		inv_parts_container.add_child(card)

func _create_inventory_item_card(item: Dictionary) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(0, 56)
	
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 8)
	panel.add_child(margin)
	
	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 10)
	margin.add_child(hbox)
	
	var info_vbox := VBoxContainer.new()
	info_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hbox.add_child(info_vbox)
	
	var cond := int(item.get("condition", 100.0))
	var name_lbl := Label.new()
	name_lbl.text = item.get("name", "Part") + (" [BRICKED]" if cond <= 0 else (" [TEST DRIVE 40%]" if cond == 40 else ""))
	name_lbl.add_theme_font_size_override("font_size", 15)
	if cond <= 0:
		name_lbl.modulate = Color(1.0, 0.3, 0.3)
	elif cond <= 45:
		name_lbl.modulate = Color(1.0, 0.8, 0.2)
	info_vbox.add_child(name_lbl)
	
	var stat_lbl := Label.new()
	var pwr := int(item.get("payload", 0))
	var hp := Types.calculate_battle_integrity(int(item.get("base_integrity", 0)), float(cond))
	stat_lbl.text = "Grade: %d%% | HP: %d | Power: %d | Wt: %d" % [cond, hp, pwr, int(item.get("weight", 0))]
	stat_lbl.modulate = Color(0.7, 0.8, 0.9)
	stat_lbl.add_theme_font_size_override("font_size", 12)
	info_vbox.add_child(stat_lbl)
	
	var select_btn := Button.new()
	select_btn.text = "Inspect"
	select_btn.custom_minimum_size = Vector2(76, 36)
	select_btn.pressed.connect(func(): _on_inspect_part(item))
	hbox.add_child(select_btn)
	
	return panel

func _on_inspect_part(item: Dictionary) -> void:
	SignalBus.play_sfx_requested.emit("click")
	selected_inventory_part = item
	
	var bot := SaveManager.get_active_anibot()
	var parts: Dictionary = bot.get("parts", {})
	var slot_key := _slot_to_key(active_slot_selected)
	var cur_equipped_item: Dictionary = parts.get(slot_key, {})
	var cur_cat: Dictionary = Types.PARTS_CATALOG.get(cur_equipped_item.get("part_id", ""), {})
	
	comp_title_label.text = "COMPARISON: %s -> %s" % [cur_cat.get("name", "Empty"), item.get("name", "Part")]
	
	var cur_hp := Types.calculate_battle_integrity(int(cur_cat.get("base_integrity", 0)), float(cur_equipped_item.get("condition", 100.0)))
	var new_hp := Types.calculate_battle_integrity(int(item.get("base_integrity", 0)), float(item.get("condition", 100.0)))
	var diff_hp := new_hp - cur_hp
	comp_hp_label.text = "Integrity: %d -> %d (%s%d)" % [cur_hp, new_hp, "+" if diff_hp >= 0 else "", diff_hp]
	comp_hp_label.modulate = Color(0.4, 1.0, 0.4) if diff_hp >= 0 else Color(1.0, 0.4, 0.4)
	
	var cur_pwr := int(cur_cat.get("payload", 0))
	var new_pwr := int(item.get("payload", 0))
	var diff_pwr := new_pwr - cur_pwr
	comp_power_label.text = "Payload Power: %d -> %d (%s%d)" % [cur_pwr, new_pwr, "+" if diff_pwr >= 0 else "", diff_pwr]
	comp_power_label.modulate = Color(0.4, 1.0, 0.4) if diff_pwr >= 0 else Color(1.0, 0.4, 0.4)
	
	var cur_lat := float(cur_cat.get("latency", 2.0))
	var new_lat := float(item.get("latency", 2.0))
	var diff_lat := new_lat - cur_lat
	comp_latency_label.text = "Cooldown Latency: %.1fs -> %.1fs (%s%.1fs)" % [cur_lat, new_lat, "+" if diff_lat > 0 else "", diff_lat]
	comp_latency_label.modulate = Color(1.0, 0.4, 0.4) if diff_lat > 0 else Color(0.4, 1.0, 0.4)
	
	var cur_wt := int(cur_cat.get("weight", 0))
	var new_wt := int(item.get("weight", 0))
	var diff_wt := new_wt - cur_wt
	comp_weight_label.text = "Weight: %d -> %d (%s%d)" % [cur_wt, new_wt, "+" if diff_wt > 0 else "", diff_wt]
	comp_weight_label.modulate = Color(1.0, 0.4, 0.4) if diff_wt > 0 else Color(0.4, 1.0, 0.4)

	if equip_button:
		var is_bricked := float(item.get("condition", 100.0)) <= 0.0
		equip_button.disabled = is_bricked
		equip_button.text = "Bricked (Repair Required)" if is_bricked else "Equip Selected Part"

	comparison_panel.show()

func _on_equip_pressed() -> void:
	if selected_inventory_part.is_empty():
		return
		
	var uuid: String = selected_inventory_part.get("uuid", "")
	var success := SaveManager.swap_active_anibot_part(active_slot_selected, uuid)
	if success:
		SignalBus.play_sfx_requested.emit("confirm")
		selected_inventory_part = {}
		comparison_panel.hide()
		refresh_all_views()

func _on_close_pressed() -> void:
	SignalBus.play_sfx_requested.emit("cancel")
	hide()
	closed.emit()
	SignalBus.anibot_assembly_closed.emit()

func _slot_name(slot: int) -> String:
	match slot:
		Types.PartSlot.HEAD: return "Head"
		Types.PartSlot.TORSO: return "Torso"
		Types.PartSlot.LEFT_ARM: return "Left Arm"
		Types.PartSlot.RIGHT_ARM: return "Right Arm"
		Types.PartSlot.LEGS: return "Legs"
	return "Part"

func _slot_to_key(slot: int) -> String:
	match slot:
		Types.PartSlot.HEAD: return "head"
		Types.PartSlot.TORSO: return "torso"
		Types.PartSlot.LEFT_ARM: return "left_arm"
		Types.PartSlot.RIGHT_ARM: return "right_arm"
		Types.PartSlot.LEGS: return "legs"
	return "head"
