# SaveManager.gd
# Manages active save state across 5 slots, 3-bot squad loadouts, degradation, repair & Scrap Synthesis
extends Node

const FIELD_PATCH_CAP_PERCENT: float = 85.0
const SYNTHESIS_TEST_DRIVE_CONDITION: float = 40.0
const SYNTHESIS_SCRAP_COST: int = 50
const RECYCLE_SCRAP_YIELD: int = 18

var current_slot_id: int = 1
var active_save_data: Dictionary = {}
var is_game_loaded: bool = false
var session_playtime_start: int = 0

func _ready() -> void:
	DatabaseService.ensure_save_directory()

func create_new_save(slot_id: int, player_name: String, appearance: Dictionary, starter_chip_id: String) -> bool:
	current_slot_id = slot_id
	active_save_data = DatabaseService.create_initial_save_data(player_name, appearance, starter_chip_id)
	var success := DatabaseService.save_slot_data(slot_id, active_save_data)
	if success:
		is_game_loaded = true
		session_playtime_start = int(Time.get_ticks_msec() / 1000.0)
		SignalBus.save_created.emit(slot_id)
	return success

func load_save(slot_id: int) -> bool:
	var data := DatabaseService.load_slot_data(slot_id)
	if data.is_empty():
		return false
	
	current_slot_id = slot_id
	active_save_data = data
	is_game_loaded = true
	session_playtime_start = int(Time.get_ticks_msec() / 1000.0)
	SignalBus.save_loaded.emit(slot_id)
	return true

func save_active_game() -> bool:
	if not is_game_loaded or current_slot_id <= 0:
		return false
	
	var current_time := int(Time.get_ticks_msec() / 1000.0)
	var elapsed := current_time - session_playtime_start
	session_playtime_start = current_time
	
	var meta: Dictionary = active_save_data.get("metadata", {})
	var current_playtime: int = int(meta.get("playtime_seconds", 0))
	meta["playtime_seconds"] = current_playtime + elapsed
	active_save_data["metadata"] = meta
	
	# Sync active_anibot into squad_roster[selected_bot_index]
	var roster: Array = get_squad_roster()
	var idx: int = get_selected_bot_index()
	if idx >= 0 and idx < roster.size():
		roster[idx] = active_save_data.get("active_anibot", roster[idx])
		active_save_data["squad_roster"] = roster
	
	var success := DatabaseService.save_slot_data(current_slot_id, active_save_data)
	if success:
		SignalBus.game_saved.emit()
	return success

func delete_save(slot_id: int) -> bool:
	var success := DatabaseService.delete_slot(slot_id)
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
	return active_save_data.get("player", {}).get("name", "Kura Ato")

# --- 3-Bot Squad Roster & Active Bot Selection ---
func get_squad_roster() -> Array:
	if not active_save_data.has("squad_roster") or active_save_data["squad_roster"].is_empty():
		DatabaseService._migrate_save_schema(active_save_data)
	return active_save_data.get("squad_roster", [])

func get_selected_bot_index() -> int:
	return clampi(int(active_save_data.get("selected_bot_index", 0)), 0, maxi(0, get_squad_roster().size() - 1))

func select_squad_bot(bot_index: int) -> void:
	var roster := get_squad_roster()
	if bot_index >= 0 and bot_index < roster.size():
		active_save_data["selected_bot_index"] = bot_index
		active_save_data["active_anibot"] = roster[bot_index]

func get_active_anibot() -> Dictionary:
	var roster := get_squad_roster()
	var idx := get_selected_bot_index()
	if idx >= 0 and idx < roster.size():
		active_save_data["active_anibot"] = roster[idx]
		return roster[idx]
	return active_save_data.get("active_anibot", {})

func update_active_anibot(bot_data: Dictionary) -> void:
	active_save_data["active_anibot"] = bot_data
	var roster := get_squad_roster()
	var idx := get_selected_bot_index()
	if idx >= 0 and idx < roster.size():
		roster[idx] = bot_data
		active_save_data["squad_roster"] = roster

func swap_active_anibot_chip(new_chip_id: String) -> bool:
	Types.ensure_catalogs_loaded()
	if not Types.CHIPS_CATALOG.has(new_chip_id):
		return false
	var bot := get_active_anibot()
	if bot.is_empty():
		return false
	bot["chip_id"] = new_chip_id
	update_active_anibot(bot)
	save_active_game()
	SignalBus.anibot_chip_swapped.emit(bot.get("bot_id", "bot_01"), new_chip_id)
	return true

func get_owned_chips() -> Array:
	Types.ensure_catalogs_loaded()
	var owned: Array = active_save_data.get("inventory_chips", ["chip_artificer", "chip_spark", "chip_orion", "chip_vulpes_zerda"])
	return owned

# --- Economy ---
func get_economy() -> Dictionary:
	if not active_save_data.has("economy"):
		active_save_data["economy"] = {"credits": 650, "scrap": 100, "patch_kits": 3}
	return active_save_data["economy"]

func add_scrap(amount: int) -> void:
	var eco := get_economy()
	eco["scrap"] = int(eco.get("scrap", 0)) + amount
	SignalBus.economy_updated.emit()
	save_active_game()

func add_credits(amount: int) -> void:
	var eco := get_economy()
	eco["credits"] = int(eco.get("credits", 0)) + amount
	SignalBus.economy_updated.emit()
	save_active_game()

func deduct_credits(amount: int) -> bool:
	var eco := get_economy()
	var cur := int(eco.get("credits", 0))
	if cur < amount:
		return false
	eco["credits"] = cur - amount
	SignalBus.economy_updated.emit()
	save_active_game()
	return true

func deduct_scrap(amount: int) -> bool:
	var eco := get_economy()
	var cur := int(eco.get("scrap", 0))
	if cur < amount:
		return false
	eco["scrap"] = cur - amount
	SignalBus.economy_updated.emit()
	save_active_game()
	return true

func purchase_patch_kit(cost_credits: int = 80) -> bool:
	if not deduct_credits(cost_credits):
		return false
	var eco := get_economy()
	eco["patch_kits"] = int(eco.get("patch_kits", 0)) + 1
	SignalBus.economy_updated.emit()
	save_active_game()
	return true

# --- Dual-Tier Repair Economy (OVERVIEW.md Section: Hardware Degradation & Economy) ---
# Tier 1: Field-Patch Kit (Consumable, capped at 85% Condition)
func apply_field_patch_to_equipped_slot(slot: int) -> Dictionary:
	var eco := get_economy()
	var kits := int(eco.get("patch_kits", 0))
	if kits <= 0:
		return {"success": false, "reason": "No Field-Patch Kits remaining!"}
		
	var bot := get_active_anibot()
	var parts: Dictionary = bot.get("parts", {})
	var slot_key := _slot_to_key(slot)
	var part_ref: Dictionary = parts.get(slot_key, {})
	if part_ref.is_empty():
		return {"success": false, "reason": "No part equipped in slot."}
		
	var cur_cond := float(part_ref.get("condition", 100.0))
	if cur_cond >= FIELD_PATCH_CAP_PERCENT:
		return {"success": false, "reason": "Field-Patch Kits cap at 85%% Condition! Visit Workshop for 100%% overhaul."}
		
	part_ref["condition"] = FIELD_PATCH_CAP_PERCENT
	var cat: Dictionary = Types.PARTS_CATALOG.get(part_ref.get("part_id", ""), {})
	if cat.has("cache") and int(cat.get("cache", -1)) > 0:
		part_ref["current_cache"] = int(cat.get("cache", 3))
	parts[slot_key] = part_ref
	bot["parts"] = parts
	update_active_anibot(bot)
	
	eco["patch_kits"] = kits - 1
	SignalBus.economy_updated.emit()
	SignalBus.part_patched.emit(slot_key, FIELD_PATCH_CAP_PERCENT)
	save_active_game()
	return {"success": true, "new_condition": FIELD_PATCH_CAP_PERCENT, "kits_left": kits - 1}

# Tier 2: Workshop Full Overhaul (100% Condition restoration using Scrap)
func repair_all_parts(scrap_cost_per_repair: int = 5) -> Dictionary:
	var repaired_count := 0
	var total_cost := 0
	
	var eco := get_economy()
	var available_scrap := int(eco.get("scrap", 0))
	
	# 1. Repair all squad roster equipped parts
	var roster := get_squad_roster()
	for bot in roster:
		var parts: Dictionary = bot.get("parts", {})
		for slot_key in parts:
			var p: Dictionary = parts[slot_key]
			if float(p.get("condition", 100.0)) < 100.0:
				if available_scrap >= scrap_cost_per_repair:
					p["condition"] = 100.0
					var cat: Dictionary = Types.PARTS_CATALOG.get(p.get("part_id", ""), {})
					if cat.has("cache"):
						p["current_cache"] = cat.get("cache", 3)
					available_scrap -= scrap_cost_per_repair
					total_cost += scrap_cost_per_repair
					repaired_count += 1
					
	# 2. Repair inventory parts
	var inv: Array = active_save_data.get("inventory_parts", [])
	for p in inv:
		if float(p.get("condition", 100.0)) < 100.0:
			if available_scrap >= scrap_cost_per_repair:
				p["condition"] = 100.0
				var cat: Dictionary = Types.PARTS_CATALOG.get(p.get("part_id", ""), {})
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

# --- Scrap Synthesis & Closed-Loop Economy (OVERVIEW.md Section: Scrap Synthesis) ---
# Fabricate a random AniPart at 40% "Test Drive" Condition for 50 Scrap
func synthesize_random_part(scrap_cost: int = SYNTHESIS_SCRAP_COST) -> Dictionary:
	Types.ensure_catalogs_loaded()
	if not deduct_scrap(scrap_cost):
		return {"success": false, "reason": "Need %d Scrap to fabricate a prototype part!" % scrap_cost}
		
	var candidate_ids: Array = []
	for pid in Types.PARTS_CATALOG:
		if not str(pid).contains("dummy"):
			candidate_ids.append(pid)
			
	if candidate_ids.is_empty():
		return {"success": false, "reason": "Parts catalog unavailable."}
		
	var chosen_id: String = candidate_ids[randi() % candidate_ids.size()]
	var cat: Dictionary = Types.PARTS_CATALOG[chosen_id]
	var default_cache: int = int(cat.get("cache", -1))
	var created_item := add_inventory_part(chosen_id, SYNTHESIS_TEST_DRIVE_CONDITION, default_cache)
	save_active_game()
	SignalBus.part_synthesized.emit(created_item, scrap_cost)
	return {
		"success": true,
		"part_id": chosen_id,
		"part_name": cat.get("name", chosen_id),
		"slot": cat.get("slot", 0),
		"condition": SYNTHESIS_TEST_DRIVE_CONDITION,
		"cost_scrap": scrap_cost
	}

# Recycle an unwanted inventory part back into Scrap
func recycle_inventory_part(inventory_part_uuid: String) -> Dictionary:
	var inv_list: Array = active_save_data.get("inventory_parts", [])
	for i in range(inv_list.size()):
		if inv_list[i].get("uuid", "") == inventory_part_uuid:
			var removed: Dictionary = inv_list[i]
			var pid: String = removed.get("part_id", "")
			var cat: Dictionary = Types.PARTS_CATALOG.get(pid, {})
			inv_list.remove_at(i)
			active_save_data["inventory_parts"] = inv_list
			add_scrap(RECYCLE_SCRAP_YIELD)
			SignalBus.part_recycled.emit(pid, RECYCLE_SCRAP_YIELD)
			return {
				"success": true,
				"part_name": cat.get("name", pid),
				"scrap_gained": RECYCLE_SCRAP_YIELD
			}
	return {"success": false}

# --- Post-Battle Destruction Penalty & Salvage System (OVERVIEW.md) ---
func apply_post_battle_degradation_and_salvage(player_won: bool, broken_player_slots: Array, opponent_config: Dictionary, broken_enemy_slots: Array) -> Dictionary:
	Types.ensure_catalogs_loaded()
	var degraded_parts: Array = []
	var bot := get_active_anibot()
	var p_parts: Dictionary = bot.get("parts", {})
	
	# 1. Destruction Penalty (-10% to -15% permanent Condition on broken player parts)
	for slot_enum in broken_player_slots:
		var skey := _slot_to_key(int(slot_enum))
		if p_parts.has(skey):
			var penalty := float(randi_range(10, 15))
			var old_cond := float(p_parts[skey].get("condition", 100.0))
			var new_cond := maxf(0.0, old_cond - penalty)
			p_parts[skey]["condition"] = new_cond
			var p_cat: Dictionary = Types.PARTS_CATALOG.get(p_parts[skey].get("part_id", ""), {})
			degraded_parts.append({
				"name": p_cat.get("name", skey),
				"old_condition": old_cond,
				"new_condition": new_cond
			})
	bot["parts"] = p_parts
	update_active_anibot(bot)
	
	# 2. Salvage Loot (1 random enemy part on victory; -12% break penalty if destroyed during battle)
	var salvaged_info: Dictionary = {}
	if player_won and opponent_config.has("parts"):
		var e_parts: Dictionary = opponent_config["parts"]
		var e_keys := e_parts.keys()
		if e_keys.size() > 0:
			var pick_key: String = e_keys[randi() % e_keys.size()]
			var pick_ref: Dictionary = e_parts[pick_key]
			var pick_id: String = pick_ref.get("part_id", "")
			if not pick_id.is_empty() and Types.PARTS_CATALOG.has(pick_id):
				var pick_cat: Dictionary = Types.PARTS_CATALOG[pick_id]
				var start_cond: float = float(pick_ref.get("condition", 90.0))
				var pick_slot: int = int(pick_cat.get("slot", 0))
				if pick_slot in broken_enemy_slots:
					start_cond = maxf(15.0, start_cond - 12.0)
				add_inventory_part(pick_id, start_cond, int(pick_cat.get("cache", -1)))
				salvaged_info = {
					"part_id": pick_id,
					"part_name": pick_cat.get("name", pick_id),
					"condition": start_cond
				}
	save_active_game()
	return {
		"degraded_parts": degraded_parts,
		"salvaged_part": salvaged_info
	}

func purchase_part(part_id: String, cost_credits: int) -> bool:
	Types.ensure_catalogs_loaded()
	if not deduct_credits(cost_credits):
		return false
	
	var catalog_entry: Dictionary = Types.PARTS_CATALOG.get(part_id, {})
	var default_cache: int = int(catalog_entry.get("cache", -1))
	add_inventory_part(part_id, 100.0, default_cache)
	save_active_game()
	SignalBus.part_purchased.emit(part_id, cost_credits)
	return true

# --- AniBot Assembly & Part Inventory Management ---
func get_inventory_parts(slot_filter: int = -1) -> Array[Dictionary]:
	Types.ensure_catalogs_loaded()
	var raw_list: Array = active_save_data.get("inventory_parts", [])
	var result: Array[Dictionary] = []
	
	for item in raw_list:
		var p_id: String = item.get("part_id", "")
		var catalog_entry: Dictionary = Types.PARTS_CATALOG.get(p_id, {})
		if catalog_entry.is_empty():
			continue
		var item_slot: int = int(catalog_entry.get("slot", -1))
		
		if slot_filter == -1 or item_slot == slot_filter:
			var merged: Dictionary = catalog_entry.duplicate()
			merged["uuid"] = item.get("uuid", "item_" + p_id)
			merged["part_id"] = p_id
			merged["condition"] = float(item.get("condition", 100.0))
			merged["current_cache"] = int(item.get("current_cache", catalog_entry.get("cache", -1)))
			result.append(merged)
	return result

func add_inventory_part(part_id: String, condition: float = 100.0, cache: int = -1) -> Dictionary:
	if not active_save_data.has("inventory_parts"):
		active_save_data["inventory_parts"] = []
		
	var uuid := "part_" + str(Time.get_ticks_msec()) + "_" + str(randi() % 10000)
	var item := {
		"uuid": uuid,
		"part_id": part_id,
		"condition": condition,
		"current_cache": cache
	}
	active_save_data["inventory_parts"].append(item)
	return item

func swap_active_anibot_part(slot: int, inventory_part_uuid: String) -> bool:
	if not is_game_loaded:
		return false
		
	var slot_key := _slot_to_key(slot)
	var active_bot: Dictionary = get_active_anibot()
	var parts: Dictionary = active_bot.get("parts", {})
	var current_equipped_part: Dictionary = parts.get(slot_key, {})
	
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
		
	# Prevent equipping Bricked (0% Condition) parts (OVERVIEW.md Section: Condition vs Integrity)
	if float(target_inv_item.get("condition", 100.0)) <= 0.0:
		return false
		
	# 1. Remove target part from inventory
	inv_list.remove_at(target_inv_idx)
	
	# 2. Put old equipped part into inventory
	if not current_equipped_part.is_empty():
		var old_uuid := "part_" + str(Time.get_ticks_msec()) + "_" + str(randi() % 10000)
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
	update_active_anibot(active_bot)
	active_save_data["inventory_parts"] = inv_list
	
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
