# TestRunner.gd
# Programmatic test suite for SaveManager, DatabaseService, and Types definitions
extends RefCounted
class_name TestRunner

static func run_all_tests() -> Dictionary:
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
	
	return results

static func _test_slot_paths(res: Dictionary) -> void:
	res["total"] += 1
	var path_1 = DatabaseService.get_slot_path(1)
	if path_1 == "user://saves/slot_1.json":
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("Slot 1 path mismatch: " + path_1)

static func _test_parts_catalog(res: Dictionary) -> void:
	res["total"] += 1
	if Types.PARTS_CATALOG.size() > 0:
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("PARTS_CATALOG is empty")

static func _test_chips_catalog(res: Dictionary) -> void:
	res["total"] += 1
	if Types.CHIPS_CATALOG.size() > 0:
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("CHIPS_CATALOG is empty")

static func _test_default_settings(res: Dictionary) -> void:
	res["total"] += 1
	var settings = DatabaseService.load_settings()
	if settings.has("audio"):
		res["passed"] += 1
	else:
		res["failed"] += 1
		res["details"].append("Default settings missing audio section")
