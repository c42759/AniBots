# AudioManager.gd
# Manages AudioServer buses, volume levels, and plays UI / combat SFX
extends Node

var master_volume: float = 1.0
var music_volume: float = 0.8
var sfx_volume: float = 0.9

var bgm_player: AudioStreamPlayer
var sfx_players: Array[AudioStreamPlayer] = []
const SFX_POOL_SIZE: int = 8

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_setup_audio_players()
	load_audio_settings()
	SignalBus.play_sfx_requested.connect(play_sfx)

func _setup_audio_players() -> void:
	bgm_player = AudioStreamPlayer.new()
	bgm_player.bus = "Music"
	bgm_player.name = "BGMPlayer"
	add_child(bgm_player)
	
	for i in range(SFX_POOL_SIZE):
		var player := AudioStreamPlayer.new()
		player.bus = "SFX"
		player.name = "SFXPlayer_%d" % i
		add_child(player)
		sfx_players.append(player)

func load_audio_settings() -> void:
	var settings = DatabaseService.load_settings()
	var audio_cfg: Dictionary = settings.get("audio", {})
	set_bus_volume("Master", audio_cfg.get("master_volume", 1.0))
	set_bus_volume("Music", audio_cfg.get("music_volume", 0.8))
	set_bus_volume("SFX", audio_cfg.get("sfx_volume", 0.9))

func set_bus_volume(bus_name: String, linear_value: float) -> void:
	linear_value = clampf(linear_value, 0.0, 1.0)
	match bus_name:
		"Master": master_volume = linear_value
		"Music": music_volume = linear_value
		"SFX": sfx_volume = linear_value
	
	var bus_idx = AudioServer.get_bus_index(bus_name)
	if bus_idx >= 0:
		if linear_value <= 0.01:
			AudioServer.set_bus_mute(bus_idx, true)
		else:
			AudioServer.set_bus_mute(bus_idx, false)
			var db_value = linear_to_db(linear_value)
			AudioServer.set_bus_volume_db(bus_idx, db_value)
	
	SignalBus.volume_changed.emit(bus_name, linear_value)

func save_audio_settings() -> void:
	var settings = {
		"audio": {
			"master_volume": master_volume,
			"music_volume": music_volume,
			"sfx_volume": sfx_volume
		}
	}
	DatabaseService.save_settings(settings)

func play_sfx(sound_name: String) -> void:
	var player = _get_available_sfx_player()
	if not player:
		return
	
	# Generate procedural crisp sound feedback if stream not loaded
	var stream = _generate_procedural_sfx(sound_name)
	if stream:
		player.stream = stream
		player.play()

func _get_available_sfx_player() -> AudioStreamPlayer:
	for p in sfx_players:
		if not p.playing:
			return p
	return sfx_players[0]

# Procedural synth for immediate audio feedback
func _generate_procedural_sfx(sfx_type: String) -> AudioStreamWAV:
	var sample_rate = 44100
	var duration = 0.12
	var freq = 440.0
	
	match sfx_type:
		"click":
			duration = 0.04
			freq = 800.0
		"confirm":
			duration = 0.12
			freq = 660.0
		"cancel", "back":
			duration = 0.08
			freq = 300.0
		"attack_hit":
			duration = 0.18
			freq = 220.0
		"slash":
			duration = 0.14
			freq = 480.0
		"charge":
			duration = 0.28
			freq = 360.0
		"impact_crit":
			duration = 0.26
			freq = 160.0
		"laser":
			duration = 0.22
			freq = 900.0
		"explosion":
			duration = 0.35
			freq = 120.0
		_:
			duration = 0.06
			freq = 520.0

	var num_samples = int(sample_rate * duration)
	var byte_data = PackedByteArray()
	byte_data.resize(num_samples * 2) # 16-bit PCM mono
	
	for i in range(num_samples):
		var t = float(i) / sample_rate
		var envelope = 1.0 - (float(i) / num_samples) # Linear decay
		var sample_val = 0.0
		
		if sfx_type == "explosion":
			sample_val = (randf() * 2.0 - 1.0) * envelope * 0.7
		elif sfx_type == "laser":
			var cur_freq = freq * (1.0 - (t / duration) * 0.6)
			sample_val = sin(TAU * cur_freq * t) * envelope * 0.5
		else:
			sample_val = sin(TAU * freq * t) * envelope * 0.4
			
		var pcm_16 = int(clampf(sample_val, -1.0, 1.0) * 32767.0)
		byte_data.encode_s16(i * 2, pcm_16)

	var stream = AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	stream.data = byte_data
	return stream
