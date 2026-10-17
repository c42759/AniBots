# TestRunner.gd
# Programmatic test suite for SaveManager, DatabaseService, Types formulas, and JSON catalog hydration
extends RefCounted
class_name TestRunner

static func run_all_tests() -> Dictionary:
	Types.ensure_catalogs_loaded()
	var results := {
		"total": 0,
		"passed": 0,
		"failed": 0,
		"details": []
	}
	
	_test_slot_paths(results)
	_test_parts_catalog(results)
	_test_chips_catalog(results)
	_test_default_settings(results)
	_test_hardware_math_formulas(results)
	
	return results

static func _test_slot_paths(res: Dictionary) -> void:
	res["total"] += 1
	var path_1 := DatabaseService.get_slot_path(1)
	if path_1 == "user://saves/slot_1.json":
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("Slot 1 path mismatch: " + path_1)

static func _test_parts_catalog(res: Dictionary) -> void:
	res["total"] += 1
	if Types.PARTS_CATALOG.size() >= 190 and Types.PARTS_CATALOG.has("part_head_zerda_radar_ears"):
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("PARTS_CATALOG missing entries: size=%d" % Types.PARTS_CATALOG.size())

static func _test_chips_catalog(res: Dictionary) -> void:
	res["total"] += 1
	if Types.CHIPS_CATALOG.size() >= 36 and Types.CHIPS_CATALOG.has("chip_vulpes_zerda"):
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("CHIPS_CATALOG missing entries: size=%d" % Types.CHIPS_CATALOG.size())

static func _test_default_settings(res: Dictionary) -> void:
	res["total"] += 1
	var settings := DatabaseService.load_settings()
	if settings.has("audio"):
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("Default settings missing audio section")

static func _test_hardware_math_formulas(res: Dictionary) -> void:
	res["total"] += 1
	var bricked_hp := Types.calculate_battle_integrity(100, 0.0)
	var scaled_hp := Types.calculate_battle_integrity(100, 85.0)
	var lat_normal := Types.calculate_effective_latency(5.0, 2.0, false)
	var lat_overweight := Types.calculate_effective_latency(5.0, 2.0, true)
	var syn := Types.apply_affinity_synergy(Types.AttackType.MELEE, "MELEE", 100, 80)
	
	if bricked_hp == 0 and scaled_hp == 85 and is_equal_approx(lat_normal, 3.0) and is_equal_approx(lat_overweight, 4.5) and int(syn["payload"]) == 110:
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("Hardware math formula verification failed")
