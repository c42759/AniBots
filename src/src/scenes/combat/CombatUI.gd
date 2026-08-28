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

func setup_hud(player_unit: CombatUnit, enemy_unit: CombatUnit) -> void:
	p_name_label.text = player_unit.unit_name
	e_name_label.text = enemy_unit.unit_name
	
	_update_unit_hp(player_unit, true)
	_update_unit_hp(enemy_unit, false)
	set_combat_log("Sparring encounter initiated! Ready your Anibot!")

func update_bars(player_unit: CombatUnit, enemy_unit: CombatUnit) -> void:
	p_atb_bar.value = player_unit.action_bar
	e_atb_bar.value = enemy_unit.action_bar
	p_overclock_bar.value = player_unit.overclock_gauge

func open_command_menu(player_unit: CombatUnit) -> void:
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

func update_unit_damage(unit: CombatUnit) -> void:
	_update_unit_hp(unit, unit.is_player)

func _update_unit_hp(unit: CombatUnit, is_player_side: bool) -> void:
	if is_player_side:
		p_head_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.HEAD, 60)
		p_head_bar.value = unit.part_integrities.get(Types.PartSlot.HEAD, 60)
		
		p_torso_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.TORSO, 150)
		p_torso_bar.value = unit.part_integrities.get(Types.PartSlot.TORSO, 150)
		
		p_l_arm_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.LEFT_ARM, 50)
		p_l_arm_bar.value = unit.part_integrities.get(Types.PartSlot.LEFT_ARM, 50)
		
		p_r_arm_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.RIGHT_ARM, 50)
		p_r_arm_bar.value = unit.part_integrities.get(Types.PartSlot.RIGHT_ARM, 50)
		
		p_legs_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.LEGS, 90)
		p_legs_bar.value = unit.part_integrities.get(Types.PartSlot.LEGS, 90)
	else:
		e_head_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.HEAD, 60)
		e_head_bar.value = unit.part_integrities.get(Types.PartSlot.HEAD, 60)
		
		e_torso_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.TORSO, 150)
		e_torso_bar.value = unit.part_integrities.get(Types.PartSlot.TORSO, 150)
		
		e_l_arm_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.LEFT_ARM, 50)
		e_l_arm_bar.value = unit.part_integrities.get(Types.PartSlot.LEFT_ARM, 50)
		
		e_r_arm_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.RIGHT_ARM, 50)
		e_r_arm_bar.value = unit.part_integrities.get(Types.PartSlot.RIGHT_ARM, 50)
		
		e_legs_bar.max_value = unit.part_max_integrities.get(Types.PartSlot.LEGS, 90)
		e_legs_bar.value = unit.part_integrities.get(Types.PartSlot.LEGS, 90)

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
