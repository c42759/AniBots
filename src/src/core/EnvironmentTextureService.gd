# EnvironmentTextureService.gd
# Loads and caches seamless environment textures from res://assets/textures/environment/*.png
# and constructs UV-tiled / triplanar StandardMaterial3D instances with normal/roughness detail
class_name EnvironmentTextureService
extends RefCounted

const TEX_DIR: String = "res://assets/textures/environment/"

static var _texture_cache: Dictionary = {}
static var _normal_map_cache: Dictionary = {}

static func get_texture(file_name: String) -> Texture2D:
	if _texture_cache.has(file_name):
		return _texture_cache[file_name]
		
	var res_path := TEX_DIR + file_name
	var abs_path := ProjectSettings.globalize_path(res_path)
	var img := Image.new()
	if FileAccess.file_exists(abs_path) and img.load(abs_path) == OK:
		img.generate_mipmaps()
		var tex := ImageTexture.create_from_image(img)
		_texture_cache[file_name] = tex
		return tex
		
	if FileAccess.file_exists(res_path) and img.load(res_path) == OK:
		img.generate_mipmaps()
		var tex := ImageTexture.create_from_image(img)
		_texture_cache[file_name] = tex
		return tex
		
	if ResourceLoader.exists(res_path):
		var loaded = load(res_path)
		if loaded is Texture2D:
			_texture_cache[file_name] = loaded
			return loaded
			
	return null

static func get_procedural_normal_map(seed_id: int, frequency: float = 0.04, bump_strength: float = 4.0) -> NoiseTexture2D:
	var key := "%d_%.3f" % [seed_id, frequency]
	if _normal_map_cache.has(key):
		return _normal_map_cache[key]
		
	var noise := FastNoiseLite.new()
	noise.seed = seed_id
	noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	noise.frequency = frequency
	noise.fractal_octaves = 3
	
	var n_tex := NoiseTexture2D.new()
	n_tex.width = 128
	n_tex.height = 128
	n_tex.seamless = true
	n_tex.as_normal_map = true
	n_tex.bump_strength = bump_strength
	n_tex.noise = noise
	_normal_map_cache[key] = n_tex
	return n_tex

static func create_tiled_material(
	file_name: String,
	uv_scale: Vector3 = Vector3(8.0, 8.0, 8.0),
	roughness_val: float = 0.75,
	metallic_val: float = 0.05,
	use_triplanar: bool = false,
	normal_seed: int = 101,
	normal_scale: float = 0.35
) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	var tex := get_texture(file_name)
	if tex:
		mat.albedo_texture = tex
	mat.roughness = roughness_val
	mat.metallic = metallic_val
	mat.uv1_scale = uv_scale
	mat.uv1_triplanar = use_triplanar
	mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	
	if normal_scale > 0.0:
		mat.normal_enabled = true
		mat.normal_scale = normal_scale
		mat.normal_texture = get_procedural_normal_map(normal_seed, 0.05, 3.5)
	return mat

static func create_arena_terrain_material(terrain: int) -> StandardMaterial3D:
	match terrain:
		Types.TerrainType.RUBBLE:
			return create_tiled_material("arena_rubble_junkyard.png", Vector3(10, 6, 1), 0.85, 0.25, false, 202, 0.55)
		Types.TerrainType.MUD:
			return create_tiled_material("arena_mud_trench.png", Vector3(9, 6, 1), 0.45, 0.10, false, 203, 0.50)
		Types.TerrainType.FLOODED:
			var mat := create_tiled_material("arena_flooded_water.png", Vector3(10, 6, 1), 0.15, 0.65, false, 204, 0.40)
			mat.emission_enabled = true
			mat.emission = Color("#006080")
			mat.emission_energy_multiplier = 0.35
			return mat
		Types.TerrainType.ROCKY:
			return create_tiled_material("arena_rocky_cliffs.png", Vector3(9, 6, 1), 0.90, 0.05, false, 205, 0.65)
		_: # CITY
			return create_tiled_material("arena_city_asphalt.png", Vector3(12, 8, 1), 0.40, 0.55, false, 201, 0.30)

static func create_relay_track_material() -> StandardMaterial3D:
	var mat := create_tiled_material("relay_track_tech.png", Vector3(8, 1, 1), 0.35, 0.65, false, 210, 0.20)
	mat.emission_enabled = true
	mat.emission_texture = get_texture("relay_track_tech.png")
	mat.emission_energy_multiplier = 0.45
	return mat
