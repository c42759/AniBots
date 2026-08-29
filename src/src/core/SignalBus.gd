# SignalBus.gd
# Global decoupled event bus for AniBots
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
signal dialogue_finished()

# AniBot & Part Assembly Signals
signal anibot_assembly_opened()
signal anibot_part_swapped(bot_id: String, slot: int, new_part_id: String)
signal anibot_assembly_closed()

# Shop & Economy Signals
signal shop_opened()
signal shop_closed()
signal part_purchased(part_id: String, cost: int)
signal economy_updated()
signal parts_repaired(repaired_count: int, cost_scrap: int)

# Combat Signals
signal combat_started(battle_context: Dictionary)
signal combat_phase_changed(unit_id: String, phase: int)
signal combat_action_executed(attacker_id: String, target_id: String, part_used: Dictionary, damage_dealt: int)
signal combat_ended(player_won: bool, rewards: Dictionary)
