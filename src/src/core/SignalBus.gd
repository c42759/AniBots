# SignalBus.gd
# Global decoupled event bus for AniBots (GAME.md Section 2.2)
extends Node

# Audio Signals
signal volume_changed(bus_name: String, volume_linear: float)
signal play_sfx_requested(sfx_name: String)

# Save / Load Signals
signal save_created(slot_index: int)
signal save_loaded(slot_index: int)
signal save_deleted(slot_index: int)
signal game_saved()

# Character Customization Signals
signal character_appearance_changed(appearance_data: Dictionary)

# Overworld & Interaction Signals
signal player_moved(position: Vector2)
signal interaction_triggered(npc_node: Node)
signal dialogue_requested(dialogue_data: Dictionary)
signal dialogue_choice_selected(choice_index: int)
signal dialogue_finished()

# AniBot & Part Assembly Signals
signal anibot_assembly_opened()
signal anibot_part_swapped(bot_id: String, slot: int, new_part_id: String)
signal anibot_chip_swapped(bot_id: String, new_chip_id: String)
signal anibot_assembly_closed()

# Shop, Repair & Scrap Synthesis Signals
signal shop_opened()
signal shop_closed()
signal part_purchased(part_id: String, cost: int)
signal part_synthesized(part_item: Dictionary, cost_scrap: int)
signal part_recycled(part_id: String, scrap_gained: int)
signal part_patched(part_uuid: String, new_condition: float)
signal economy_updated()
signal parts_repaired(repaired_count: int, cost_scrap: int)

# Battle Signals
signal combat_started(battle_context: Dictionary)
signal combat_phase_changed(unit_id: String, phase: int)
signal combat_action_executed(attacker_id: String, target_id: String, part_used: Dictionary, damage_dealt: int)
signal combat_trap_placed(owner_is_player: bool, trap_data: Dictionary)
signal combat_override_activated(defender_id: String)
signal combat_ended(player_won: bool, rewards: Dictionary)
