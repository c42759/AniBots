# SaveManager.gd
# Manages the active save state across 5 slots
extends Node

var current_slot_id: int = 1
var active_save_data: Dictionary = {}
var is_game_loaded: bool = false

var session_playtime_start: int = 0

func _ready() -> void:
	DatabaseService.ensure_save_directory()

func create_new_save(slot_id: int, player_name: String, appearance: Dictionary, starter_chip_id: String) -> bool:
	current_slot_id = slot_id
	active_save_data = DatabaseService.create_initial_save_data(player_name, appearance, starter_chip_id)
	var success = DatabaseService.save_slot_data(slot_id, active_save_data)
	if success:
		is_game_loaded = true
		session_playtime_start = Time.get_ticks_msec() / 1000
		SignalBus.save_created.emit(slot_id)
	return success

func load_save(slot_id: int) -> bool:
	var data = DatabaseService.load_slot_data(slot_id)
	if data.is_empty():
		return false
	
	current_slot_id = slot_id
	active_save_data = data
	is_game_loaded = true
	session_playtime_start = Time.get_ticks_msec() / 1000
	SignalBus.save_loaded.emit(slot_id)
	return true

func save_active_game() -> bool:
	if not is_game_loaded or current_slot_id <= 0:
		return false
	
	# Update elapsed playtime
	var current_time = Time.get_ticks_msec() / 1000
	var elapsed = current_time - session_playtime_start
	session_playtime_start = current_time
	
	var meta: Dictionary = active_save_data.get("metadata", {})
	var current_playtime: int = meta.get("playtime_seconds", 0)
	meta["playtime_seconds"] = current_playtime + elapsed
	active_save_data["metadata"] = meta
	
	var success = DatabaseService.save_slot_data(current_slot_id, active_save_data)
	if success:
		SignalBus.game_saved.emit()
	return success

func delete_save(slot_id: int) -> bool:
	var success = DatabaseService.delete_slot(slot_id)
	if success:
		if current_slot_id == slot_id:
			active_save_data = {}
			is_game_loaded = false
		SignalBus.save_deleted.emit(slot_id)
	return success

func get_all_slot_summaries() -> Array[Dictionary]:
	return DatabaseService.get_all_slots_summary()

func get_player_appearance() -> Dictionary:
	return active_save_data.get("player", {}).get("appearance", {})

func update_player_appearance(new_appearance: Dictionary) -> void:
	if not active_save_data.has("player"):
		active_save_data["player"] = {}
	active_save_data["player"]["appearance"] = new_appearance
	SignalBus.character_appearance_changed.emit(new_appearance)

func get_player_name() -> String:
	return active_save_data.get("player", {}).get("name", "Handler")

func get_active_anibot() -> Dictionary:
	return active_save_data.get("active_anibot", {})

func update_active_anibot(bot_data: Dictionary) -> void:
	active_save_data["active_anibot"] = bot_data

func add_scrap(amount: int) -> void:
	if not active_save_data.has("economy"):
		active_save_data["economy"] = {"credits": 500, "scrap": 25, "patch_kits": 2}
	var current_scrap = active_save_data["economy"].get("scrap", 0)
	active_save_data["economy"]["scrap"] = current_scrap + amount
	SignalBus.economy_updated.emit()
	save_active_game()

func add_credits(amount: int) -> void:
	if not active_save_data.has("economy"):
		active_save_data["economy"] = {"credits": 500, "scrap": 25, "patch_kits": 2}
	var current_credits = active_save_data["economy"].get("credits", 0)
	active_save_data["economy"]["credits"] = current_credits + amount
	SignalBus.economy_updated.emit()
	save_active_game()

func deduct_credits(amount: int) -> bool:
	if not active_save_data.has("economy"):
		active_save_data["economy"] = {"credits": 500, "scrap": 25, "patch_kits": 2}
	var current_credits = active_save_data["economy"].get("credits", 0)
	if current_credits < amount:
		return false
	active_save_data["economy"]["credits"] = current_credits - amount
	SignalBus.economy_updated.emit()
	save_active_game()
	return true

func deduct_scrap(amount: int) -> bool:
	if not active_save_data.has("economy"):
		active_save_data["economy"] = {"credits": 500, "scrap": 25, "patch_kits": 2}
	var current_scrap = active_save_data["economy"].get("scrap", 0)
	if current_scrap < amount:
		return false
	active_save_data["economy"]["scrap"] = current_scrap - amount
	SignalBus.economy_updated.emit()
	save_active_game()
	return true

func get_economy() -> Dictionary:
	return active_save_data.get("economy", {"credits": 500, "scrap": 25, "patch_kits": 2})

func purchase_part(part_id: String, cost_credits: int) -> bool:
	if not deduct_credits(cost_credits):
		return false
	
	var catalog_entry = Types.PARTS_CATALOG.get(part_id, {})
	var default_cache = catalog_entry.get("cache", -1)
	add_inventory_part(part_id, 100.0, default_cache)
	save_active_game()
	SignalBus.part_purchased.emit(part_id, cost_credits)
	return true

func repair_all_parts(scrap_cost_per_repair: int = 5) -> Dictionary:
	var repaired_count = 0
	var total_cost = 0
	
	var eco = get_economy()
	var available_scrap = eco.get("scrap", 0)
	
	# 1. Repair equipped parts
	var active_bot = active_save_data.get("active_anibot", {})
	var parts = active_bot.get("parts", {})
	for slot_key in parts:
		var p = parts[slot_key]
		if p.get("condition", 100.0) < 100.0:
			if available_scrap >= scrap_cost_per_repair:
				p["condition"] = 100.0
				var cat = Types.PARTS_CATALOG.get(p.get("part_id", ""), {})
				if cat.has("cache"):
					p["current_cache"] = cat.get("cache", 3)
				available_scrap -= scrap_cost_per_repair
				total_cost += scrap_cost_per_repair
				repaired_count += 1
				
	# 2. Repair inventory parts
	var inv = active_save_data.get("inventory_parts", [])
	for p in inv:
		if p.get("condition", 100.0) < 100.0:
			if available_scrap >= scrap_cost_per_repair:
				p["condition"] = 100.0
				var cat = Types.PARTS_CATALOG.get(p.get("part_id", ""), {})
				if cat.has("cache"):
					p["current_cache"] = cat.get("cache", 3)
				available_scrap -= scrap_cost_per_repair
				total_cost += scrap_cost_per_repair
				repaired_count += 1
				
	if total_cost > 0:
		deduct_scrap(total_cost)
		save_active_game()
		SignalBus.parts_repaired.emit(repaired_count, total_cost)
		
	return {
		"repaired_count": repaired_count,
		"cost_scrap": total_cost,
		"success": repaired_count > 0
	}

# --- AniBot Assembly & Part Inventory Management ---
func get_inventory_parts(slot_filter: int = -1) -> Array[Dictionary]:
	var raw_list: Array = active_save_data.get("inventory_parts", [])
	var result: Array[Dictionary] = []
	
	for item in raw_list:
		var p_id: String = item.get("part_id", "")
		var catalog_entry: Dictionary = Types.PARTS_CATALOG.get(p_id, {})
		var item_slot: int = catalog_entry.get("slot", -1)
		
		if slot_filter == -1 or item_slot == slot_filter:
			var merged: Dictionary = catalog_entry.duplicate()
			merged["uuid"] = item.get("uuid", "item_" + p_id)
			merged["condition"] = item.get("condition", 100.0)
			merged["current_cache"] = item.get("current_cache", catalog_entry.get("cache", -1))
			result.append(merged)
	return result

func add_inventory_part(part_id: String, condition: float = 100.0, cache: int = -1) -> void:
	if not active_save_data.has("inventory_parts"):
		active_save_data["inventory_parts"] = []
		
	var uuid = "part_" + str(Time.get_ticks_msec()) + "_" + str(randi() % 1000)
	active_save_data["inventory_parts"].append({
		"uuid": uuid,
		"part_id": part_id,
		"condition": condition,
		"current_cache": cache
	})

func swap_active_anibot_part(slot: int, inventory_part_uuid: String) -> bool:
	if not is_game_loaded:
		return false
		
	var slot_key = _slot_to_key(slot)
	var active_bot: Dictionary = active_save_data.get("active_anibot", {})
	var parts: Dictionary = active_bot.get("parts", {})
	var current_equipped_part: Dictionary = parts.get(slot_key, {})
	
	# Find target inventory part
	var inv_list: Array = active_save_data.get("inventory_parts", [])
	var target_inv_idx: int = -1
	var target_inv_item: Dictionary = {}
	
	for i in range(inv_list.size()):
		if inv_list[i].get("uuid", "") == inventory_part_uuid:
			target_inv_idx = i
			target_inv_item = inv_list[i]
			break
			
	if target_inv_idx == -1:
		return false
		
	# 1. Remove target part from inventory
	inv_list.remove_at(target_inv_idx)
	
	# 2. Put old equipped part into inventory (if it exists)
	if not current_equipped_part.is_empty():
		var old_uuid = "part_" + str(Time.get_ticks_msec()) + "_" + str(randi() % 1000)
		inv_list.append({
			"uuid": old_uuid,
			"part_id": current_equipped_part.get("part_id", ""),
			"condition": current_equipped_part.get("condition", 100.0),
			"current_cache": current_equipped_part.get("current_cache", -1)
		})
	
	# 3. Equip new part onto active AniBot
	parts[slot_key] = {
		"part_id": target_inv_item.get("part_id", ""),
		"condition": target_inv_item.get("condition", 100.0),
		"current_cache": target_inv_item.get("current_cache", -1)
	}
	active_bot["parts"] = parts
	active_save_data["active_anibot"] = active_bot
	active_save_data["inventory_parts"] = inv_list
	
	# Save updated loadout
	save_active_game()
	SignalBus.anibot_part_swapped.emit(active_bot.get("bot_id", "bot_01"), slot, target_inv_item.get("part_id", ""))
	return true

func _slot_to_key(slot: int) -> String:
	match slot:
		Types.PartSlot.HEAD: return "head"
		Types.PartSlot.TORSO: return "torso"
		Types.PartSlot.LEFT_ARM: return "left_arm"
		Types.PartSlot.RIGHT_ARM: return "right_arm"
		Types.PartSlot.LEGS: return "legs"
	return "head"
