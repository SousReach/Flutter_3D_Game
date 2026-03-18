// ============================================
// model_loader.js — GLB Model Preloader & Cache
// ============================================

const ModelLoader = {
    loader: null,
    cache: {},       // path -> THREE.Group (original loaded scene)
    loading: false,
    onProgress: null,

    init() {
        if (!THREE.GLTFLoader) {
            console.warn('ModelLoader: GLTFLoader not found, models will use fallback geometry');
            return;
        }
        this.loader = new THREE.GLTFLoader();
    },

    // Model path mappings for items
    itemModels: {
        'gem':           'models/items/Gem Pink.glb',
        'crystal_shard': 'models/items/Gem Pink.glb',
        'key':           'models/items/key.glb',
        'potion':        'models/items/health_potion.glb',
        'sword':         'models/items/sword.glb',
        'shield':        'models/items/Shield.glb',
        'torch':         'models/items/Torch.glb',
    },

    // Item scale overrides (default is 1.0)
    itemScales: {
        'gem':           0.5,
        'crystal_shard': 0.8,
        'key':           0.5,
        'potion':        0.5,
        'sword':         0.4,
        'shield':        0.5,
        'torch':         0.5,
    },

    // Environment models per world theme
    environmentModels: {
        'forest': [
            { path: 'models/environment/forest/Pine Tree.glb', scale: 0.6, count: 5, groundOnly: true },
            { path: 'models/environment/forest/Bush.glb', scale: 0.5, count: 4, groundOnly: true },
            { path: 'models/environment/forest/Rocks.glb', scale: 0.5, count: 3, groundOnly: true },
            { path: 'models/environment/forest/Post Lantern.glb', scale: 0.4, count: 2, groundOnly: true },
        ],
        'ice': [
            { path: 'models/environment/ice/Pine Tree with Snow.glb', scale: 0.6, count: 4, groundOnly: true },
            { path: 'models/environment/ice/Mountain.glb', scale: 0.8, count: 2, groundOnly: true },
            { path: 'models/environment/ice/ice.glb', scale: 0.5, count: 3, groundOnly: true },
            { path: 'models/environment/ice/Post Lantern.glb', scale: 0.4, count: 2, groundOnly: true },
        ],
        'volcanic': [
            { path: 'models/environment/volcanic/Rock Large.glb', scale: 0.5, count: 3, groundOnly: true },
            { path: 'models/environment/volcanic/Rock.glb', scale: 0.4, count: 4, groundOnly: true },
            { path: 'models/environment/volcanic/Anvil.glb', scale: 0.4, count: 1, groundOnly: true },
            { path: 'models/environment/volcanic/Post Lantern.glb', scale: 0.4, count: 2, groundOnly: true },
        ],
        'fortress': [
            { path: 'models/environment/fortress/Banner Wall.glb', scale: 0.5, count: 3, groundOnly: true },
            { path: 'models/environment/fortress/Chandelier.glb', scale: 0.4, count: 2, groundOnly: false },
            { path: 'models/environment/fortress/Throne.glb', scale: 0.5, count: 1, groundOnly: true },
            { path: 'models/environment/fortress/Post Lantern.glb', scale: 0.4, count: 2, groundOnly: true },
        ],
    },

    // Character models
    characterModels: {
        'main_character': 'models/characters/main_character.glb',
        'wizard':         'models/characters/wizard.glb',
        'farmer':         'models/characters/Farmer.glb',
        'dog':            'models/characters/dog.glb',
    },

    // Enemy models
    enemyModels: {
        'spider':   'models/enemies/Spider.glb',
        'ghost':    'models/enemies/ghost.glb',
        'skeleton': 'models/enemies/skeleton.glb',
    },

    // Boss models
    bossModels: {
        'tree_boss':       'models/bosses/tree_boss.glb',
        'ice_dragon':      'models/bosses/ice_dragon.glb',
        'lava_demon':      'models/bosses/lava_demon.glb',
        'evil_wizard_boss': 'models/bosses/evil_wizard_boss.glb',
    },

    /**
     * Load a single model and cache it.
     * Returns a promise that resolves with the loaded scene.
     */
    load(path) {
        return new Promise((resolve, reject) => {
            if (this.cache[path]) {
                resolve(this.cache[path]);
                return;
            }
            if (!this.loader) {
                reject(new Error('GLTFLoader not initialized'));
                return;
            }
            this.loader.load(
                path,
                (gltf) => {
                    this.cache[path] = gltf.scene;
                    resolve(gltf.scene);
                },
                undefined,
                (error) => {
                    console.warn('ModelLoader: Failed to load ' + path, error);
                    reject(error);
                }
            );
        });
    },

    /**
     * Get a clone of a cached model. Returns null if not cached.
     */
    get(path) {
        const original = this.cache[path];
        if (!original) return null;
        return original.clone();
    },

    /**
     * Get a clone of an item model by item type. Returns null if not available.
     */
    getItem(itemType) {
        const path = this.itemModels[itemType];
        if (!path) return null;
        const model = this.get(path);
        if (!model) return null;

        // Apply scale
        const scale = this.itemScales[itemType] || 1.0;
        model.scale.set(scale, scale, scale);

        // Special: crystal shards are larger and purple-tinted
        if (itemType === 'crystal_shard') {
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    const mat = child.material.clone();
                    mat.emissive = new THREE.Color(0x9C27B0);
                    mat.emissiveIntensity = 0.5;
                    child.material = mat;
                }
            });
        }

        return model;
    },

    /**
     * Preload all models needed for a given world type.
     * Also preloads all item models and the sword for the player.
     */
    async preloadForLevel(worldType) {
        if (!this.loader) {
            console.warn('ModelLoader: No loader available, skipping preload');
            return;
        }

        const paths = new Set();

        // Item models
        Object.values(this.itemModels).forEach(p => paths.add(p));

        // Environment models for this world
        const envModels = this.environmentModels[worldType] || [];
        envModels.forEach(e => paths.add(e.path));

        const pathArray = Array.from(paths);
        let loaded = 0;
        const total = pathArray.length;

        const promises = pathArray.map(path =>
            this.load(path)
                .then(() => {
                    loaded++;
                    if (this.onProgress) {
                        this.onProgress(loaded / total);
                    }
                })
                .catch(() => {
                    loaded++;
                    if (this.onProgress) {
                        this.onProgress(loaded / total);
                    }
                })
        );

        await Promise.all(promises);
        console.log('ModelLoader: Preloaded ' + loaded + '/' + total + ' models for world: ' + worldType);
    },

    /**
     * Place environment decoration models around the level.
     * Scatters props on the ground surface, avoiding spawn/goal areas.
     */
    addEnvironmentProps(scene, levelData) {
        const worldType = levelData.world || 'forest';
        const envModels = this.environmentModels[worldType];
        if (!envModels) return;

        // Determine level bounds from blocks
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        if (levelData.blocks) {
            levelData.blocks.forEach(b => {
                if (b.x < minX) minX = b.x;
                if (b.x > maxX) maxX = b.x;
                if (b.z < minZ) minZ = b.z;
                if (b.z > maxZ) maxZ = b.z;
            });
        }
        if (minX === Infinity) return; // No blocks

        const spawnX = levelData.spawn ? levelData.spawn.x : 2;
        const spawnZ = levelData.spawn ? levelData.spawn.z : 2;
        const goalX = levelData.goal ? levelData.goal.x : maxX;
        const goalZ = levelData.goal ? levelData.goal.z : maxZ;

        envModels.forEach(envDef => {
            const model = this.get(envDef.path);
            if (!model) return;

            for (let i = 0; i < envDef.count; i++) {
                // Random position within level bounds
                const x = minX + Math.random() * (maxX - minX);
                const z = minZ + Math.random() * (maxZ - minZ);

                // Skip if too close to spawn or goal
                const distSpawn = Math.sqrt((x - spawnX) ** 2 + (z - spawnZ) ** 2);
                const distGoal = Math.sqrt((x - goalX) ** 2 + (z - goalZ) ** 2);
                if (distSpawn < 3 || distGoal < 3) continue;

                // Find ground height at this position
                const groundY = World.getGroundHeight(x + 0.5, z + 0.5, 0.1);
                if (groundY <= -Infinity) continue; // No ground

                const clone = model.clone();
                const scale = envDef.scale || 1.0;
                clone.scale.set(scale, scale, scale);
                clone.position.set(x + 0.5, envDef.groundOnly ? groundY : groundY + 3, z + 0.5);
                clone.rotation.y = Math.random() * Math.PI * 2; // Random rotation
                clone.userData = { isDecoration: true };
                scene.add(clone);
            }
        });
    }
};
