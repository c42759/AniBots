# DatabaseService.gd
# Data persistence layer supporting 5 save slots and global settings
class_name DatabaseService
extends RefCounted

const SAVES_DIR: String = "user://saves"
const SETTINGS_FILE: String = "user://settings.cfg"
const TOTAL_SAVE_SLOTS: int = 5

static func ensure_save_directory() -> void:
	if not DirAccess.dir_exists_absolute(SAVES_DIR):
		DirAccess.make_dir_recursive_absolute(SAVES_DIR)

static func get_slot_path(slot_id: int) -> String:
	return "%s/slot_%d.json" % [SAVES_DIR, slot_id]

# --- Global Settings ---
static func save_settings(settings_data: Dictionary) -> bool:
	var config := ConfigFile.new()
	for section in settings_data:
		for key in settings_data[section]:
			config.set_value(section, key, settings_data[section][key])
	return config.save(SETTINGS_FILE) == OK

static func load_settings() -> Dictionary:
	var config := ConfigFile.new()
	var default_settings := {
		"audio": {
			"master_volume": 1.0,
			"music_volume": 0.8,
			"sfx_volume": 0.9
		}
	}
	if config.load(SETTINGS_FILE) != OK:
		return default_settings
	
	var loaded := {}
	for section in ["audio"]:
		loaded[section] = {}
		for key in default_settings[section]:
			loaded[section][key] = config.get_value(section, key, default_settings[section][key])
	return loaded

# --- Multi-Slot Save Management ---
static func get_slot_metadata(slot_id: int) -> Dictionary:
	ensure_save_directory()
	var path := get_slot_path(slot_id)
	if not FileAccess.file_exists(path):
		return {"exists": false, "slot_id": slot_id}
	
	var file := FileAccess.open(path, FileAccess.READ)
	if not file:
		return {"exists": false, "slot_id": slot_id}
	
	var json_text := file.get_as_text()
	file.close()
	
	var parse_result = JSON.parse_string(json_text)
	if typeof(parse_result) != TYPE_DICTIONARY:
		return {"exists": false, "slot_id": slot_id}
	
	var meta: Dictionary = parse_result.get("metadata", {})
	meta["exists"] = true
	meta["slot_id"] = slot_id
	return meta

static func get_all_slots_summary() -> Array[Dictionary]:
	var summaries: Array[Dictionary] = []
	for i in range(1, TOTAL_SAVE_SLOTS + 1):
		summaries.append(get_slot_metadata(i))
	return summaries

static func load_slot_data(slot_id: int) -> Dictionary:
	ensure_save_directory()
	var path := get_slot_path(slot_id)
	if not FileAccess.file_exists(path):
		return {}
	
	var file := FileAccess.open(path, FileAccess.READ)
	if not file:
		return {}
	
	var json_text := file.get_as_text()
	file.close()
	
	var data = JSON.parse_string(json_text)
	if typeof(data) == TYPE_DICTIONARY:
		return data
	return {}

static func save_slot_data(slot_id: int, full_data: Dictionary) -> bool:
	ensure_save_directory()
	var path := get_slot_path(slot_id)
	
	# Update metadata timestamps
	if not full_data.has("metadata"):
		full_data["metadata"] = {}
	
	full_data["metadata"]["last_saved_at"] = Time.get_datetime_string_from_system()
	full_data["metadata"]["slot_id"] = slot_id
	
	var file := FileAccess.open(path, FileAccess.WRITE)
	if not file:
		return false
	
	var json_string := JSON.stringify(full_data, "\t")
	file.store_string(json_string)
	file.close()
	return true

static func delete_slot(slot_id: int) -> bool:
	ensure_save_directory()
	var path := get_slot_path(slot_id)
	if FileAccess.file_exists(path):
		return DirAccess.remove_absolute(path) == OK
	return true

# --- Factory for Default Save Data ---
static func create_initial_save_data(player_name: String, appearance: Dictionary, starter_chip_id: String) -> Dictionary:
	var chip_data = Types.CHIPS_CATALOG.get(starter_chip_id, Types.CHIPS_CATALOG["chip_artificer"])
	
	var initial_bot := {
		"bot_id": "bot_starter_01",
		"bot_name": chip_data.get("starter_frame", "Genesis-1"),
		"chip_id": starter_chip_id,
		"parts": {}
	}
	
	# Assign initial starter parts based on chip
	match starter_chip_id:
		"chip_spark":
			initial_bot["parts"] = {
				"head": {"part_id": "part_head_surge_node", "condition": 100.0, "current_cache": 4},
				"left_arm": {"part_id": "part_arm_l_static_whip", "condition": 100.0},
				"right_arm": {"part_id": "part_arm_r_volt_caster", "condition": 100.0},
				"torso": {"part_id": "part_torso_circuit", "condition": 100.0},
				"legs": {"part_id": "part_legs_current_wheels", "condition": 100.0}
			}
		"chip_orion":
			initial_bot["parts"] = {
				"head": {"part_id": "part_head_astro_scope", "condition": 100.0, "current_cache": 3},
				"left_arm": {"part_id": "part_arm_l_pulsar_rifle", "condition": 100.0},
				"right_arm": {"part_id": "part_arm_r_comet_snipe", "condition": 100.0},
				"torso": {"part_id": "part_torso_nova", "condition": 100.0},
				"legs": {"part_id": "part_legs_hover_drive", "condition": 100.0}
			}
		_: # Artificer
			initial_bot["parts"] = {
				"head": {"part_id": "part_head_logic_bomb", "condition": 100.0, "current_cache": 3},
				"left_arm": {"part_id": "part_arm_l_wrench", "condition": 100.0},
				"right_arm": {"part_id": "part_arm_r_ratchet", "condition": 100.0},
				"torso": {"part_id": "part_torso_genesis", "condition": 100.0},
				"legs": {"part_id": "part_legs_steady_tread", "condition": 100.0}
			}

	return {
		"metadata": {
			"player_name": player_name if not player_name.is_empty() else "Handler",
			"playtime_seconds": 0,
			"created_at": Time.get_datetime_string_from_system(),
			"last_saved_at": Time.get_datetime_string_from_system(),
			"starter_chip": chip_data.get("name", "Artificer Chip"),
			"location_name": "Circuit City - Sector 0",
			"badges": 0
		},
		"player": {
			"name": player_name if not player_name.is_empty() else "Handler",
			"appearance": appearance,
			"position": {"x": 320.0, "y": 240.0},
			"current_map": "StarterCity"
		},
		"economy": {
			"credits": 500,
			"scrap": 25,
			"patch_kits": 2
		},
		"active_anibot": initial_bot,
		"inventory_parts": [
			{
				"uuid": "inv_part_01",
				"part_id": "part_arm_l_pulsar_rifle",
				"condition": 95.0,
				"current_cache": -1
			},
			{
				"uuid": "inv_part_02",
				"part_id": "part_arm_r_volt_caster",
				"condition": 90.0,
				"current_cache": -1
			},
			{
				"uuid": "inv_part_03",
				"part_id": "part_legs_current_wheels",
				"condition": 88.0,
				"current_cache": -1
			},
			{
				"uuid": "inv_part_04",
				"part_id": "part_head_surge_node",
				"condition": 92.0,
				"current_cache": 4
			},
			{
				"uuid": "inv_part_05",
				"part_id": "part_torso_circuit",
				"condition": 100.0,
				"current_cache": -1
			}
		],
		"inventory_chips": [starter_chip_id]
	}
