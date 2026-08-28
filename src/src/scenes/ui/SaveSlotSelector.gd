# SaveSlotSelector.gd
extends Control

signal slot_selected(slot_id: int)
signal back_pressed

enum Mode {
	NEW_GAME,
	CONTINUE_GAME
}

var current_mode: Mode = Mode.NEW_GAME
var pending_slot_for_action: int = -1

@onready var title_label: Label = %TitleLabel
@onready var slots_container: VBoxContainer = %SlotsContainer
@onready var back_btn: Button = %BackButton
@onready var confirm_modal: PanelContainer = %ConfirmModal
@onready var confirm_label: Label = %ConfirmLabel
@onready var confirm_yes_btn: Button = %ConfirmYesBtn
@onready var confirm_no_btn: Button = %ConfirmNoBtn

func _ready() -> void:
	back_btn.pressed.connect(_on_back_pressed)
	confirm_yes_btn.pressed.connect(_on_confirm_yes)
	confirm_no_btn.pressed.connect(_on_confirm_no)
	confirm_modal.hide()

func open_for_mode(mode: Mode) -> void:
	current_mode = mode
	title_label.text = "SELECT SAVE SLOT - " + ("NEW GAME" if mode == Mode.NEW_GAME else "CONTINUE")
	confirm_modal.hide()
	show()
	refresh_slots_list()

func refresh_slots_list() -> void:
	for child in slots_container.get_children():
		child.queue_free()
	
	var summaries = DatabaseService.get_all_slots_summary()
	for slot_meta in summaries:
		var slot_card = _create_slot_card(slot_meta)
		slots_container.add_child(slot_card)

func _create_slot_card(meta: Dictionary) -> PanelContainer:
	var slot_id: int = meta.get("slot_id", 1)
	var exists: bool = meta.get("exists", false)
	
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(680, 72)
	
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 16)
	margin.add_theme_constant_override("margin_right", 16)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_bottom", 10)
	panel.add_child(margin)
	
	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 16)
	margin.add_child(hbox)
	
	var slot_num_label := Label.new()
	slot_num_label.text = "SLOT %d" % slot_id
	slot_num_label.add_theme_font_size_override("font_size", 20)
	slot_num_label.custom_minimum_size = Vector2(90, 0)
	hbox.add_child(slot_num_label)
	
	var info_vbox := VBoxContainer.new()
	info_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hbox.add_child(info_vbox)
	
	if exists:
		var player_name: String = meta.get("player_name", "Handler")
		var chip_name: String = meta.get("starter_chip", "Unknown")
		var loc: String = meta.get("location_name", "Circuit City")
		var playtime_sec: int = meta.get("playtime_seconds", 0)
		var hours = playtime_sec / 3600
		var minutes = (playtime_sec % 3600) / 60
		var time_str = "%02d:%02d" % [hours, minutes]
		var last_saved: String = meta.get("last_saved_at", "").substr(0, 16).replace("T", " ")
		
		var main_info := Label.new()
		main_info.text = "%s  |  %s  |  %s" % [player_name, chip_name, loc]
		main_info.add_theme_font_size_override("font_size", 16)
		info_vbox.add_child(main_info)
		
		var sub_info := Label.new()
		sub_info.text = "Playtime: %s  |  Saved: %s" % [time_str, last_saved]
		sub_info.modulate = Color(0.7, 0.7, 0.8)
		sub_info.add_theme_font_size_override("font_size", 13)
		info_vbox.add_child(sub_info)
	else:
		var empty_label := Label.new()
		empty_label.text = "--- EMPTY SAVE SLOT ---"
		empty_label.modulate = Color(0.5, 0.5, 0.6)
		empty_label.add_theme_font_size_override("font_size", 16)
		info_vbox.add_child(empty_label)

	var action_btn := Button.new()
	action_btn.custom_minimum_size = Vector2(120, 40)
	
	if current_mode == Mode.NEW_GAME:
		action_btn.text = "Select Slot" if not exists else "Overwrite"
		action_btn.pressed.connect(func(): _on_slot_chosen_for_new_game(slot_id, exists))
		hbox.add_child(action_btn)
	else: # CONTINUE
		if exists:
			action_btn.text = "Load Game"
			action_btn.pressed.connect(func(): _on_slot_chosen_for_load(slot_id))
			hbox.add_child(action_btn)
			
			var del_btn := Button.new()
			del_btn.text = "Delete"
			del_btn.custom_minimum_size = Vector2(80, 40)
			del_btn.modulate = Color(1.0, 0.5, 0.5)
			del_btn.pressed.connect(func(): _on_slot_chosen_for_delete(slot_id))
			hbox.add_child(del_btn)
		else:
			action_btn.text = "Empty"
			action_btn.disabled = true
			hbox.add_child(action_btn)

	return panel

func _on_slot_chosen_for_new_game(slot_id: int, exists: bool) -> void:
	SignalBus.play_sfx_requested.emit("click")
	pending_slot_for_action = slot_id
	if exists:
		confirm_label.text = "Overwrite Slot %d?\nExisting game progress will be lost." % slot_id
		confirm_modal.show()
	else:
		GameManager.start_new_game_flow(slot_id)

func _on_slot_chosen_for_load(slot_id: int) -> void:
	SignalBus.play_sfx_requested.emit("confirm")
	GameManager.enter_overworld_from_save(slot_id)

func _on_slot_chosen_for_delete(slot_id: int) -> void:
	SignalBus.play_sfx_requested.emit("cancel")
	pending_slot_for_action = slot_id
	confirm_label.text = "Permanently delete Save Slot %d?" % slot_id
	confirm_modal.show()

func _on_confirm_yes() -> void:
	confirm_modal.hide()
	if current_mode == Mode.NEW_GAME:
		SignalBus.play_sfx_requested.emit("confirm")
		GameManager.start_new_game_flow(pending_slot_for_action)
	else: # Delete action
		SignalBus.play_sfx_requested.emit("cancel")
		SaveManager.delete_save(pending_slot_for_action)
		refresh_slots_list()

func _on_confirm_no() -> void:
	SignalBus.play_sfx_requested.emit("click")
	confirm_modal.hide()
	pending_slot_for_action = -1

func _on_back_pressed() -> void:
	SignalBus.play_sfx_requested.emit("cancel")
	back_pressed.emit()
	hide()
