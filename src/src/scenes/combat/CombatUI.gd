# CombatUI.gd
# Handles combat HUD, command selection, ATB progress, integrity status, and results modal
extends Control

signal command_chosen(slot: int, is_overclock: bool)
signal return_to_overworld_requested

# Player HUD Elements
@onready var p_name_label: Label = %PNameLabel
@onready var p_atb_bar: ProgressBar = %PATBBar
@onready var p_head_bar: ProgressBar = %PHeadBar
@onready var p_torso_bar: ProgressBar = %PTorsoBar
@onready var p_l_arm_bar: ProgressBar = %PLArmBar
@onready var p_r_arm_bar: ProgressBar = %PRArmBar
@onready var p_legs_bar: ProgressBar = %PLegsBar
@onready var p_overclock_bar: ProgressBar = %POverclockBar

# Enemy HUD Elements
@onready var e_name_label: Label = %ENameLabel
@onready var e_atb_bar: ProgressBar = %EATBBar
@onready var e_head_bar: ProgressBar = %EHeadBar
@onready var e_torso_bar: ProgressBar = %ETorsoBar
@onready var e_l_arm_bar: ProgressBar = %ELArmBar
@onready var e_r_arm_bar: ProgressBar = %ERArmBar
@onready var e_legs_bar: ProgressBar = %ELegsBar

# Command Menu
@onready var command_panel: PanelContainer = %CommandPanel
@onready var head_btn: Button = %HeadButton
@onready var l_arm_btn: Button = %LArmButton
@onready var r_arm_btn: Button = %RArmButton
@onready var overclock_btn: Button = %OverclockButton

# Combat Log
@onready var combat_log_label: Label = %CombatLogLabel

# Result Modal
@onready var result_modal: PanelContainer = %ResultModal
@onready var result_title_label: Label = %ResultTitleLabel
@onready var result_desc_label: Label = %ResultDescLabel
@onready var result_return_btn: Button = %ResultReturnButton

func _ready() -> void:
	command_panel.hide()
	result_modal.hide()
	
	head_btn.pressed.connect(func(): _on_command_selected(Types.PartSlot.HEAD, false))
	l_arm_btn.pressed.connect(func(): _on_command_selected(Types.PartSlot.LEFT_ARM, false))
	r_arm_btn.pressed.connect(func(): _on_command_selected(Types.PartSlot.RIGHT_ARM, false))
	overclock_btn.pressed.connect(func(): _on_command_selected(Types.PartSlot.HEAD, true))
	result_return_btn.pressed.connect(_on_return_pressed)

func setup_hud(player_unit: CombatUnit3D, enemy_unit: CombatUnit3D) -> void:
	p_name_label.text = player_unit.unit_name
	e_name_label.text = enemy_unit.unit_name
	
	_update_unit_hp(player_unit, true)
	_update_unit_hp(enemy_unit, false)
	set_combat_log("Sparring encounter initiated! Ready your Anibot!")

func update_bars(player_unit: CombatUnit3D, enemy_unit: CombatUnit3D) -> void:
	p_atb_bar.value = player_unit.action_bar
	e_atb_bar.value = enemy_unit.action_bar
	p_overclock_bar.value = player_unit.overclock_gauge

func open_command_menu(player_unit: CombatUnit3D) -> void:
	var head_entry = player_unit._get_part_catalog(Types.PartSlot.HEAD)
	var l_arm_entry = player_unit._get_part_catalog(Types.PartSlot.LEFT_ARM)
	var r_arm_entry = player_unit._get_part_catalog(Types.PartSlot.RIGHT_ARM)
	
	head_btn.text = "[Head] %s (Cache: %d)" % [head_entry.get("name", "Head Weapon"), player_unit.head_cache_remaining]
	head_btn.disabled = (player_unit.part_integrities[Types.PartSlot.HEAD] <= 0 or player_unit.head_cache_remaining <= 0)
	
	l_arm_btn.text = "[L-Arm] %s (Pwr: %d)" % [l_arm_entry.get("name", "Left Arm"), l_arm_entry.get("payload", 20)]
	l_arm_btn.disabled = (player_unit.part_integrities[Types.PartSlot.LEFT_ARM] <= 0)
	
	r_arm_btn.text = "[R-Arm] %s (Pwr: %d)" % [r_arm_entry.get("name", "Right Arm"), r_arm_entry.get("payload", 20)]
	r_arm_btn.disabled = (player_unit.part_integrities[Types.PartSlot.RIGHT_ARM] <= 0)
	
	overclock_btn.text = "[ULTIMATE] Overclock Blitz"
	overclock_btn.disabled = (player_unit.overclock_gauge < 100.0)
	
	command_panel.show()

func close_command_menu() -> void:
	command_panel.hide()

func _on_command_selected(slot: int, is_overclock: bool) -> void:
	SignalBus.play_sfx_requested.emit("confirm")
	close_command_menu()
	command_chosen.emit(slot, is_overclock)

func update_unit_damage(unit: CombatUnit3D) -> void:
	_update_unit_hp(unit, unit.is_player)

func _update_unit_hp(unit: CombatUnit3D, is_player_side: bool) -> void:
	var head_max = unit.part_max_integrities.get(Types.PartSlot.HEAD, 60)
	var head_cur = unit.part_integrities.get(Types.PartSlot.HEAD, 60)
	var torso_max = unit.part_max_integrities.get(Types.PartSlot.TORSO, 150)
	var torso_cur = unit.part_integrities.get(Types.PartSlot.TORSO, 150)
	var l_arm_max = unit.part_max_integrities.get(Types.PartSlot.LEFT_ARM, 50)
	var l_arm_cur = unit.part_integrities.get(Types.PartSlot.LEFT_ARM, 50)
	var r_arm_max = unit.part_max_integrities.get(Types.PartSlot.RIGHT_ARM, 50)
	var r_arm_cur = unit.part_integrities.get(Types.PartSlot.RIGHT_ARM, 50)
	var legs_max = unit.part_max_integrities.get(Types.PartSlot.LEGS, 90)
	var legs_cur = unit.part_integrities.get(Types.PartSlot.LEGS, 90)

	if is_player_side:
		_set_bar_value_and_color(p_head_bar, head_cur, head_max, true)
		_set_bar_value_and_color(p_torso_bar, torso_cur, torso_max, true)
		_set_bar_value_and_color(p_l_arm_bar, l_arm_cur, l_arm_max, true)
		_set_bar_value_and_color(p_r_arm_bar, r_arm_cur, r_arm_max, true)
		_set_bar_value_and_color(p_legs_bar, legs_cur, legs_max, true)
	else:
		_set_bar_value_and_color(e_head_bar, head_cur, head_max, false)
		_set_bar_value_and_color(e_torso_bar, torso_cur, torso_max, false)
		_set_bar_value_and_color(e_l_arm_bar, l_arm_cur, l_arm_max, false)
		_set_bar_value_and_color(e_r_arm_bar, r_arm_cur, r_arm_max, false)
		_set_bar_value_and_color(e_legs_bar, legs_cur, legs_max, false)

func _set_bar_value_and_color(bar: ProgressBar, current_hp: int, max_hp: int, is_player_side: bool) -> void:
	bar.max_value = max(max_hp, 1)
	bar.value = clamp(current_hp, 0, max_hp)
	var ratio = float(current_hp) / float(max(max_hp, 1))
	if current_hp <= 0:
		bar.modulate = Color(0.35, 0.35, 0.35, 0.6) # disabled dark gray
	elif ratio < 0.3:
		bar.modulate = Color(1.0, 0.2, 0.2) # critical red
	elif ratio < 0.6:
		bar.modulate = Color(1.0, 0.75, 0.2) # warning amber
	else:
		bar.modulate = Color(0.2, 0.85, 1.0) if is_player_side else Color(1.0, 0.45, 0.45)

func set_combat_log(msg: String) -> void:
	combat_log_label.text = msg

func show_battle_results(victory: bool, rewards: Dictionary) -> void:
	command_panel.hide()
	if victory:
		result_title_label.text = "SYSTEM VICTORY!"
		result_title_label.modulate = Color(0.3, 1.0, 0.4)
		var scrap_earned = rewards.get("scrap", 15)
		result_desc_label.text = "Opponent Head Destroyed!\nSystem Failure Confirmed.\n\nRewards Claimed:\n+ %d Scrap Units\n+ 1 Salvage Part Diagnostic Data" % scrap_earned
	else:
		result_title_label.text = "SYSTEM FAILURE"
		result_title_label.modulate = Color(1.0, 0.3, 0.3)
		result_desc_label.text = "Your Anibot's Head integrity reached 0.\nReturning to workshop for field maintenance."
		
	result_modal.show()

func _on_return_pressed() -> void:
	SignalBus.play_sfx_requested.emit("confirm")
	return_to_overworld_requested.emit()
