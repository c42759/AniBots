# DialogueBox.gd
extends PanelContainer

signal choice_made(choice_index: int)
signal dialogue_closed

@onready var speaker_label: Label = %SpeakerLabel
@onready var message_label: Label = %MessageLabel
@onready var choices_container: VBoxContainer = %ChoicesContainer
@onready var next_prompt_label: Label = %NextPromptLabel

var is_active: bool = false
var has_choices: bool = false

func _ready() -> void:
	hide()

func show_dialogue(speaker: String, text: String, choices: Array = []) -> void:
	speaker_label.text = speaker
	message_label.text = text
	
	for child in choices_container.get_children():
		child.queue_free()
	
	if choices.size() > 0:
		has_choices = true
		next_prompt_label.hide()
		choices_container.show()
		
		for i in range(choices.size()):
			var choice_text: String = choices[i]
			var btn := Button.new()
			btn.text = choice_text
			btn.custom_minimum_size = Vector2(0, 36)
			btn.pressed.connect(func():
				SignalBus.play_sfx_requested.emit("click")
				choice_made.emit(i)
				close_dialogue()
			)
			choices_container.add_child(btn)
	else:
		has_choices = false
		choices_container.hide()
		next_prompt_label.show()

	is_active = true
	show()
	SignalBus.dialogue_requested.emit({"speaker": speaker, "text": text})

func _unhandled_input(event: InputEvent) -> void:
	if not is_active or has_choices:
		return
	
	if event.is_action_pressed("interact") or event.is_action_pressed("ui_accept"):
		get_viewport().set_input_as_handled()
		SignalBus.play_sfx_requested.emit("click")
		close_dialogue()

func close_dialogue() -> void:
	is_active = false
	hide()
	dialogue_closed.emit()
	SignalBus.dialogue_finished.emit()
