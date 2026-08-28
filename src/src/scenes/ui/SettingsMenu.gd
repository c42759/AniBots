# SettingsMenu.gd
extends Control

signal back_pressed

@onready var master_slider: HSlider = %MasterSlider
@onready var music_slider: HSlider = %MusicSlider
@onready var sfx_slider: HSlider = %SFXSlider
@onready var master_label: Label = %MasterLabel
@onready var music_label: Label = %MusicLabel
@onready var sfx_label: Label = %SFXLabel
@onready var test_sfx_btn: Button = %TestSFXButton
@onready var back_btn: Button = %BackButton

func _ready() -> void:
	_init_sliders()
	master_slider.value_changed.connect(_on_master_changed)
	music_slider.value_changed.connect(_on_music_changed)
	sfx_slider.value_changed.connect(_on_sfx_changed)
	test_sfx_btn.pressed.connect(_on_test_sfx_pressed)
	back_btn.pressed.connect(_on_back_pressed)

func _init_sliders() -> void:
	master_slider.value = AudioManager.master_volume * 100.0
	music_slider.value = AudioManager.music_volume * 100.0
	sfx_slider.value = AudioManager.sfx_volume * 100.0
	_update_labels()

func _update_labels() -> void:
	master_label.text = "%d%%" % int(master_slider.value)
	music_label.text = "%d%%" % int(music_slider.value)
	sfx_label.text = "%d%%" % int(sfx_slider.value)

func _on_master_changed(value: float) -> void:
	AudioManager.set_bus_volume("Master", value / 100.0)
	_update_labels()

func _on_music_changed(value: float) -> void:
	AudioManager.set_bus_volume("Music", value / 100.0)
	_update_labels()

func _on_sfx_changed(value: float) -> void:
	AudioManager.set_bus_volume("SFX", value / 100.0)
	_update_labels()

func _on_test_sfx_pressed() -> void:
	SignalBus.play_sfx_requested.emit("confirm")

func _on_back_pressed() -> void:
	AudioManager.save_audio_settings()
	SignalBus.play_sfx_requested.emit("cancel")
	back_pressed.emit()
	hide()
