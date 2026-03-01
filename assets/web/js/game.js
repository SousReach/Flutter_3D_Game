// ============================================
// game.js — Main Game Loop + Level Management
// ============================================

const Game = {
    renderer: null,
    scene: null,
    clock: null,
    isRunning: false,
    currentLevel: 1,
    levelData: null,

    // Level definitions (inline for Android WebView compatibility)
    levels: {},

    async init(levelNumber) {
        this.currentLevel = levelNumber || 1;

        // Show loading
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('loading-fill').style.width = '20%';

        // Create renderer (optimized for Android)
        this.renderer = new THREE.WebGLRenderer({
            antialias: false, // Better performance on Android
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for Android
        this.renderer.setClearColor(0x87CEEB);
        document.body.appendChild(this.renderer.domElement);

        document.getElementById('loading-fill').style.width = '40%';

        // Create scene
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        // Initialize controls
        Controls.init();
        document.getElementById('loading-fill').style.width = '60%';

        // Initialize player
        Player.init(this.scene);
        document.getElementById('loading-fill').style.width = '80%';

        // Load level
        this.loadLevel(this.currentLevel);
        document.getElementById('loading-fill').style.width = '100%';

        // Handle window resize
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Hide loading after a short delay
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            this.showObjective(this.levelData.objective || 'Reach the portal!');
        }, 500);

        // Start loop
        this.isRunning = true;
        this.gameLoop();
    },

    loadLevel(levelNum) {
        const data = this.levels[levelNum];
        if (!data) {
            console.warn('Level ' + levelNum + ' not found, using default');
            this.levelData = this.getDefaultLevel();
        } else {
            this.levelData = data;
        }

        // Clear scene (keep camera)
        while (this.scene.children.length > 0) {
            const child = this.scene.children[0];
            if (child !== Player.camera) {
                this.scene.remove(child);
            } else {
                break;
            }
        }
        // Remove everything except camera
        const toRemove = [];
        this.scene.traverse(child => {
            if (child !== this.scene && child !== Player.camera && !Player.camera.children.includes(child)) {
                toRemove.push(child);
            }
        });
        toRemove.forEach(c => {
            if (c.parent === this.scene) this.scene.remove(c);
        });

        // Build world
        World.buildLevel(this.scene, this.levelData);

        // Set gem count
        Player.totalGems = this.levelData.items ? this.levelData.items.filter(i => i.type === 'gem' || i.type === 'crystal_shard').length : 0;
        Player.gemsCollected = 0;
        Player.updateItemsUI();

        // Spawn player
        Player.spawn(World.spawnPoint);

        // Update HUD
        document.getElementById('level-name').textContent = this.levelData.name || ('Level ' + levelNum);
        document.getElementById('world-name').textContent = this.levelData.worldName || '';
    },

    gameLoop() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.gameLoop());

        const dt = Math.min(this.clock.getDelta(), 0.05); // Cap delta for Android
        const time = this.clock.getElapsedTime();

        // Update world animations
        World.update(time);

        // Update player
        const result = Player.update(dt);

        if (result === 'level_complete') {
            this.onLevelComplete();
            return;
        }

        if (!Player.isAlive) {
            this.onGameOver();
            return;
        }

        // Render
        this.renderer.render(this.scene, Player.camera);

        // Debug display
        const dbg = document.getElementById('debug');
        if (dbg) {
            dbg.textContent = 'pos: ' + Player.x.toFixed(1) + ',' + Player.y.toFixed(1) + ',' + Player.z.toFixed(1) +
                ' | move: ' + Controls.moveX.toFixed(1) + ',' + Controls.moveZ.toFixed(1) +
                ' | ground: ' + Player.onGround;
        }
    },

    onLevelComplete() {
        this.isRunning = false;

        // Notify Flutter
        if (window.FlutterChannel) {
            window.FlutterChannel.postMessage(JSON.stringify({
                type: 'level_complete',
                level: this.currentLevel,
                gems: Player.gemsCollected,
                totalGems: Player.totalGems
            }));
        }
    },

    onGameOver() {
        this.isRunning = false;

        // Auto-restart after delay
        setTimeout(() => {
            this.loadLevel(this.currentLevel);
            this.isRunning = true;
            this.gameLoop();
        }, 2000);
    },

    showObjective(text) {
        const el = document.getElementById('objective');
        el.textContent = '📜 ' + text;
        el.style.opacity = '1';
        setTimeout(() => { el.style.opacity = '0'; }, 4000);
    },

    getDefaultLevel() {
        return {
            name: 'Test Level',
            world: 'forest',
            worldName: 'Enchanted Forest',
            objective: 'Reach the portal!',
            spawn: { x: 2, y: 2, z: 2 },
            goal: { x: 14, y: 1, z: 14 },
            blocks: this.generateFloor(16, 16, 'grass'),
            items: [
                { x: 5, y: 1, z: 5, type: 'gem' },
                { x: 8, y: 1, z: 3, type: 'gem' },
                { x: 12, y: 1, z: 10, type: 'gem' },
            ]
        };
    },

    // Helper: generate a flat floor
    generateFloor(sizeX, sizeZ, type) {
        const blocks = [];
        for (let x = 0; x < sizeX; x++) {
            for (let z = 0; z < sizeZ; z++) {
                blocks.push({ x, y: 0, z, type: type });
            }
        }
        return blocks;
    },

    // Helper: generate walls
    generateWalls(sizeX, sizeZ, height, type) {
        const blocks = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < sizeX; x++) {
                blocks.push({ x, y: y + 1, z: 0, type });
                blocks.push({ x, y: y + 1, z: sizeZ - 1, type });
            }
            for (let z = 0; z < sizeZ; z++) {
                blocks.push({ x: 0, y: y + 1, z, type });
                blocks.push({ x: sizeX - 1, y: y + 1, z, type });
            }
        }
        return blocks;
    },

    // Helper: generate a platform
    generatePlatform(startX, startZ, width, depth, y, type) {
        const blocks = [];
        for (let x = startX; x < startX + width; x++) {
            for (let z = startZ; z < startZ + depth; z++) {
                blocks.push({ x, y, z, type });
            }
        }
        return blocks;
    },

    // Helper: generate a tree
    generateTree(x, z, baseY) {
        const blocks = [];
        // Trunk
        for (let y = baseY + 1; y <= baseY + 4; y++) {
            blocks.push({ x, y, z, type: 'wood' });
        }
        // Leaves
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                blocks.push({ x: x + dx, y: baseY + 4, z: z + dz, type: 'leaves' });
                if (Math.abs(dx) + Math.abs(dz) < 2) {
                    blocks.push({ x: x + dx, y: baseY + 5, z: z + dz, type: 'leaves' });
                }
            }
        }
        return blocks;
    },

    // Helper: generate a house
    generateHouse(startX, startZ, baseY) {
        const blocks = [];
        const w = 5, d = 5, h = 3;
        // Walls
        for (let y = baseY + 1; y <= baseY + h; y++) {
            for (let x = startX; x < startX + w; x++) {
                for (let z = startZ; z < startZ + d; z++) {
                    if (x === startX || x === startX + w - 1 || z === startZ || z === startZ + d - 1) {
                        // Door opening
                        if (x === startX + 2 && z === startZ && y <= baseY + 2) continue;
                        blocks.push({ x, y, z, type: 'planks' });
                    }
                }
            }
        }
        // Roof
        for (let x = startX - 1; x < startX + w + 1; x++) {
            for (let z = startZ - 1; z < startZ + d + 1; z++) {
                blocks.push({ x, y: baseY + h + 1, z, type: 'wood' });
            }
        }
        return blocks;
    }
};


// ============================================
// LEVEL DEFINITIONS (all 20 levels inline)
// ============================================

// ---------- WORLD 1: ENCHANTED FOREST (Levels 1-5) ----------

Game.levels[1] = {
    name: 'The Awakening',
    world: 'forest',
    worldName: '🌲 Enchanted Forest',
    objective: 'Walk to the glowing portal ahead.',
    spawn: { x: 2, y: 2, z: 2 },
    goal: { x: 14, y: 1, z: 8 },
    blocks: [
        ...Game.generateFloor(18, 12, 'grass'),
        // Path markers (stone path)
        ...Game.generatePlatform(3, 5, 10, 2, 0, 'stone'),
        // Some trees
        ...Game.generateTree(1, 1, 0),
        ...Game.generateTree(6, 0, 0),
        ...Game.generateTree(0, 10, 0),
        ...Game.generateTree(16, 2, 0),
        ...Game.generateTree(16, 10, 0),
    ],
    items: [
        { x: 5, y: 1, z: 5, type: 'gem' },
        { x: 8, y: 1, z: 5, type: 'gem' },
        { x: 11, y: 1, z: 6, type: 'gem' },
    ]
};

Game.levels[2] = {
    name: 'Forest Path',
    world: 'forest',
    worldName: '🌲 Enchanted Forest',
    objective: 'Cross the old bridge to the other side.',
    spawn: { x: 2, y: 2, z: 2 },
    goal: { x: 22, y: 1, z: 8 },
    blocks: [
        ...Game.generateFloor(10, 12, 'grass'),
        // Gap (no floor from x=10 to x=14)
        // Bridge
        ...Game.generatePlatform(10, 5, 5, 2, 0, 'planks'),
        // Other side
        ...Game.generatePlatform(15, 0, 10, 12, 0, 'grass'),
        // Trees
        ...Game.generateTree(1, 0, 0),
        ...Game.generateTree(4, 10, 0),
        ...Game.generateTree(17, 1, 0),
        ...Game.generateTree(20, 10, 0),
        ...Game.generateTree(23, 5, 0),
        // Fallen tree obstacle
        { x: 7, y: 1, z: 4, type: 'wood' },
        { x: 7, y: 1, z: 5, type: 'wood' },
        { x: 7, y: 1, z: 6, type: 'wood' },
    ],
    items: [
        { x: 5, y: 1, z: 6, type: 'gem' },
        { x: 12, y: 1, z: 5, type: 'gem' },
        { x: 18, y: 1, z: 8, type: 'gem' },
        { x: 20, y: 1, z: 3, type: 'gem' },
    ]
};

Game.levels[3] = {
    name: 'The Hollow Tree',
    world: 'forest',
    worldName: '🌲 Enchanted Forest',
    objective: 'Find the hidden key inside the hollow tree.',
    spawn: { x: 2, y: 2, z: 2 },
    goal: { x: 18, y: 1, z: 18 },
    blocks: [
        ...Game.generateFloor(22, 22, 'grass'),
        // Dense tree area
        ...Game.generateTree(5, 3, 0),
        ...Game.generateTree(8, 7, 0),
        ...Game.generateTree(3, 12, 0),
        ...Game.generateTree(12, 4, 0),
        ...Game.generateTree(15, 14, 0),
        ...Game.generateTree(7, 18, 0),
        ...Game.generateTree(19, 6, 0),
        // Hollow tree (larger, with space inside)
        { x: 10, y: 1, z: 12, type: 'wood' },
        { x: 12, y: 1, z: 12, type: 'wood' },
        { x: 10, y: 1, z: 14, type: 'wood' },
        { x: 12, y: 1, z: 14, type: 'wood' },
        { x: 10, y: 2, z: 12, type: 'wood' },
        { x: 12, y: 2, z: 12, type: 'wood' },
        { x: 10, y: 2, z: 14, type: 'wood' },
        { x: 12, y: 2, z: 14, type: 'wood' },
        { x: 10, y: 3, z: 12, type: 'leaves' },
        { x: 11, y: 3, z: 12, type: 'leaves' },
        { x: 12, y: 3, z: 12, type: 'leaves' },
        { x: 10, y: 3, z: 13, type: 'leaves' },
        { x: 12, y: 3, z: 13, type: 'leaves' },
        { x: 10, y: 3, z: 14, type: 'leaves' },
        { x: 11, y: 3, z: 14, type: 'leaves' },
        { x: 12, y: 3, z: 14, type: 'leaves' },
        // Rock obstacles
        { x: 14, y: 1, z: 10, type: 'stone' },
        { x: 15, y: 1, z: 10, type: 'stone' },
        { x: 14, y: 2, z: 10, type: 'stone' },
    ],
    items: [
        { x: 11, y: 1, z: 13, type: 'key' },
        { x: 5, y: 1, z: 8, type: 'gem' },
        { x: 16, y: 1, z: 5, type: 'gem' },
        { x: 8, y: 1, z: 18, type: 'gem' },
        { x: 15, y: 1, z: 16, type: 'gem' },
        { x: 3, y: 1, z: 3, type: 'gem' },
    ]
};

Game.levels[4] = {
    name: 'River Crossing',
    world: 'forest',
    worldName: '🌲 Enchanted Forest',
    objective: 'Jump across the river stones to the other side.',
    spawn: { x: 2, y: 2, z: 5 },
    goal: { x: 24, y: 1, z: 5 },
    blocks: [
        // Left bank
        ...Game.generatePlatform(0, 0, 8, 12, 0, 'grass'),
        // River stepping stones
        ...Game.generatePlatform(9, 4, 2, 2, 0, 'stone'),
        ...Game.generatePlatform(12, 6, 2, 2, 0, 'stone'),
        ...Game.generatePlatform(15, 3, 2, 2, 0, 'stone'),
        ...Game.generatePlatform(18, 5, 2, 2, 0, 'stone'),
        // Right bank
        ...Game.generatePlatform(21, 0, 8, 12, 0, 'grass'),
        // Trees on banks
        ...Game.generateTree(2, 1, 0),
        ...Game.generateTree(5, 10, 0),
        ...Game.generateTree(24, 2, 0),
        ...Game.generateTree(26, 9, 0),
        // Water (decorative, below path)
        ...Game.generatePlatform(8, 0, 13, 12, -1, 'water'),
    ],
    items: [
        { x: 9, y: 1, z: 4, type: 'gem' },
        { x: 12, y: 1, z: 7, type: 'gem' },
        { x: 15, y: 1, z: 3, type: 'gem' },
        { x: 18, y: 1, z: 5, type: 'gem' },
        { x: 23, y: 1, z: 8, type: 'potion' },
    ]
};

Game.levels[5] = {
    name: 'Forest Guardian',
    world: 'forest',
    worldName: '🌲 Enchanted Forest',
    objective: 'Defeat the Tree Golem and collect the Crystal Shard!',
    spawn: { x: 3, y: 2, z: 3 },
    goal: { x: 12, y: 1, z: 12 },
    blocks: [
        // Arena floor
        ...Game.generateFloor(18, 18, 'grass'),
        // Arena walls (partial)
        ...Game.generateWalls(18, 18, 2, 'stone'),
        // Central area with pillars
        { x: 5, y: 1, z: 5, type: 'stone' }, { x: 5, y: 2, z: 5, type: 'stone' }, { x: 5, y: 3, z: 5, type: 'stone' },
        { x: 12, y: 1, z: 5, type: 'stone' }, { x: 12, y: 2, z: 5, type: 'stone' }, { x: 12, y: 3, z: 5, type: 'stone' },
        { x: 5, y: 1, z: 12, type: 'stone' }, { x: 5, y: 2, z: 12, type: 'stone' }, { x: 5, y: 3, z: 12, type: 'stone' },
        { x: 12, y: 1, z: 12, type: 'stone' }, { x: 12, y: 2, z: 12, type: 'stone' }, { x: 12, y: 3, z: 12, type: 'stone' },
        // Trees around arena
        ...Game.generateTree(2, 15, 0),
        ...Game.generateTree(15, 2, 0),
    ],
    items: [
        { x: 9, y: 1, z: 9, type: 'crystal_shard' },
        { x: 3, y: 1, z: 8, type: 'gem' },
        { x: 14, y: 1, z: 8, type: 'gem' },
        { x: 8, y: 1, z: 14, type: 'potion' },
    ]
};

// ---------- WORLD 2: FROZEN MOUNTAINS (Levels 6-10) ----------

Game.levels[6] = {
    name: 'The Ascent',
    world: 'ice',
    worldName: '❄️ Frozen Mountains',
    objective: 'Climb the snowy path to the mountain peak.',
    spawn: { x: 2, y: 2, z: 2 },
    goal: { x: 18, y: 7, z: 16 },
    blocks: [
        // Base
        ...Game.generatePlatform(0, 0, 8, 6, 0, 'snow'),
        // Ascending path
        ...Game.generatePlatform(5, 4, 5, 3, 1, 'snow'),
        ...Game.generatePlatform(8, 6, 5, 3, 2, 'stone'),
        ...Game.generatePlatform(11, 8, 5, 3, 3, 'snow'),
        ...Game.generatePlatform(13, 10, 5, 3, 4, 'stone'),
        ...Game.generatePlatform(15, 12, 5, 3, 5, 'snow'),
        ...Game.generatePlatform(16, 14, 5, 4, 6, 'snow'),
        // Ice decorations
        { x: 3, y: 1, z: 1, type: 'ice' },
        { x: 4, y: 1, z: 1, type: 'ice' },
        { x: 3, y: 2, z: 1, type: 'ice' },
    ],
    items: [
        { x: 6, y: 3, z: 5, type: 'gem' },
        { x: 12, y: 5, z: 9, type: 'gem' },
        { x: 16, y: 7, z: 13, type: 'gem' },
        { x: 14, y: 6, z: 11, type: 'potion' },
    ]
};

Game.levels[7] = {
    name: 'Ice Caverns',
    world: 'ice',
    worldName: '❄️ Frozen Mountains',
    objective: 'Navigate through the frozen caves.',
    spawn: { x: 2, y: 2, z: 2 },
    goal: { x: 22, y: 1, z: 10 },
    blocks: [
        // Cave floor
        ...Game.generatePlatform(0, 0, 25, 14, 0, 'stone'),
        // Cave walls
        ...Game.generateWalls(25, 14, 4, 'stone'),
        // Cave ceiling
        ...Game.generatePlatform(0, 0, 25, 14, 5, 'stone'),
        // Interior walls creating maze
        ...Game.generatePlatform(5, 0, 1, 8, 1, 'ice'),
        ...Game.generatePlatform(5, 0, 1, 8, 2, 'ice'),
        ...Game.generatePlatform(10, 5, 1, 9, 1, 'stone'),
        ...Game.generatePlatform(10, 5, 1, 9, 2, 'stone'),
        ...Game.generatePlatform(15, 0, 1, 10, 1, 'ice'),
        ...Game.generatePlatform(15, 0, 1, 10, 2, 'ice'),
        // Ice stalactites (hanging from ceiling)
        { x: 8, y: 4, z: 3, type: 'ice' },
        { x: 13, y: 4, z: 7, type: 'ice' },
        { x: 18, y: 4, z: 4, type: 'ice' },
    ],
    items: [
        { x: 3, y: 1, z: 6, type: 'gem' },
        { x: 8, y: 1, z: 10, type: 'gem' },
        { x: 13, y: 1, z: 3, type: 'gem' },
        { x: 18, y: 1, z: 12, type: 'gem' },
        { x: 20, y: 1, z: 5, type: 'gem' },
    ]
};

Game.levels[8] = {
    name: 'The Blizzard',
    world: 'ice',
    worldName: '❄️ Frozen Mountains',
    objective: 'Survive the storm and find shelter!',
    spawn: { x: 2, y: 2, z: 5 },
    goal: { x: 28, y: 1, z: 5 },
    blocks: [
        // Long snowy path
        ...Game.generatePlatform(0, 3, 30, 5, 0, 'snow'),
        // Shelter checkpoints (small roofed areas)
        ...Game.generateHouse(7, 2, 0),
        ...Game.generateHouse(18, 2, 0),
        // Obstacles
        { x: 4, y: 1, z: 4, type: 'snow' }, { x: 4, y: 2, z: 4, type: 'snow' },
        { x: 14, y: 1, z: 5, type: 'ice' }, { x: 14, y: 1, z: 6, type: 'ice' },
        { x: 24, y: 1, z: 4, type: 'snow' }, { x: 24, y: 2, z: 4, type: 'snow' },
    ],
    items: [
        { x: 5, y: 1, z: 5, type: 'gem' },
        { x: 12, y: 1, z: 5, type: 'gem' },
        { x: 9, y: 1, z: 4, type: 'potion' },
        { x: 22, y: 1, z: 5, type: 'gem' },
        { x: 26, y: 1, z: 5, type: 'gem' },
    ]
};

Game.levels[9] = {
    name: 'Frozen Lake',
    world: 'ice',
    worldName: '❄️ Frozen Mountains',
    objective: 'Carefully cross the frozen lake.',
    spawn: { x: 2, y: 2, z: 8 },
    goal: { x: 22, y: 1, z: 8 },
    blocks: [
        // Left shore
        ...Game.generatePlatform(0, 6, 4, 5, 0, 'snow'),
        // Frozen lake (ice platforms - some are paths)
        ...Game.generatePlatform(4, 5, 3, 3, 0, 'ice'),
        ...Game.generatePlatform(8, 7, 2, 3, 0, 'ice'),
        ...Game.generatePlatform(11, 5, 3, 2, 0, 'ice'),
        ...Game.generatePlatform(14, 8, 2, 3, 0, 'ice'),
        ...Game.generatePlatform(17, 6, 3, 2, 0, 'ice'),
        ...Game.generatePlatform(20, 7, 2, 3, 0, 'ice'),
        // Right shore
        ...Game.generatePlatform(22, 6, 4, 5, 0, 'snow'),
        // Snow mounds
        { x: 1, y: 1, z: 7, type: 'snow' },
        { x: 23, y: 1, z: 9, type: 'snow' },
    ],
    items: [
        { x: 5, y: 1, z: 6, type: 'gem' },
        { x: 9, y: 1, z: 8, type: 'gem' },
        { x: 12, y: 1, z: 5, type: 'gem' },
        { x: 17, y: 1, z: 6, type: 'gem' },
        { x: 20, y: 1, z: 8, type: 'potion' },
    ]
};

Game.levels[10] = {
    name: 'Frost Dragon',
    world: 'ice',
    worldName: '❄️ Frozen Mountains',
    objective: 'Defeat the Ice Wyrm and claim the Crystal Shard!',
    spawn: { x: 3, y: 2, z: 3 },
    goal: { x: 10, y: 1, z: 10 },
    blocks: [
        // Circular arena
        ...Game.generateFloor(20, 20, 'snow'),
        // Arena walls (icy)
        ...Game.generateWalls(20, 20, 3, 'ice'),
        // Ice pillars
        { x: 5, y: 1, z: 5, type: 'ice' }, { x: 5, y: 2, z: 5, type: 'ice' }, { x: 5, y: 3, z: 5, type: 'ice' },
        { x: 14, y: 1, z: 5, type: 'ice' }, { x: 14, y: 2, z: 5, type: 'ice' }, { x: 14, y: 3, z: 5, type: 'ice' },
        { x: 5, y: 1, z: 14, type: 'ice' }, { x: 5, y: 2, z: 14, type: 'ice' }, { x: 5, y: 3, z: 14, type: 'ice' },
        { x: 14, y: 1, z: 14, type: 'ice' }, { x: 14, y: 2, z: 14, type: 'ice' }, { x: 14, y: 3, z: 14, type: 'ice' },
        // Center raised platform
        ...Game.generatePlatform(8, 8, 4, 4, 1, 'ice'),
    ],
    items: [
        { x: 10, y: 3, z: 10, type: 'crystal_shard' },
        { x: 3, y: 1, z: 10, type: 'gem' },
        { x: 16, y: 1, z: 10, type: 'gem' },
        { x: 10, y: 1, z: 3, type: 'potion' },
        { x: 10, y: 1, z: 16, type: 'gem' },
    ]
};

// ---------- WORLD 3: VOLCANIC DEPTHS (Levels 11-15) ----------

Game.levels[11] = {
    name: 'Into the Earth',
    world: 'volcanic',
    worldName: '🌋 Volcanic Depths',
    objective: 'Descend into the underground tunnels.',
    spawn: { x: 3, y: 8, z: 3 },
    goal: { x: 18, y: 1, z: 15 },
    blocks: [
        // Top platform (entrance)
        ...Game.generatePlatform(0, 0, 8, 8, 7, 'stone'),
        // Descending stairway
        ...Game.generatePlatform(6, 5, 3, 3, 6, 'stone'),
        ...Game.generatePlatform(8, 7, 3, 3, 5, 'stone'),
        ...Game.generatePlatform(10, 9, 3, 3, 4, 'obsidian'),
        ...Game.generatePlatform(12, 11, 3, 3, 3, 'stone'),
        ...Game.generatePlatform(14, 13, 3, 3, 2, 'obsidian'),
        ...Game.generatePlatform(16, 14, 5, 4, 1, 'stone'),
        // Underground walls
        ...Game.generatePlatform(16, 14, 5, 1, 2, 'obsidian'),
        ...Game.generatePlatform(16, 17, 5, 1, 2, 'obsidian'),
        // Lava pools (decorative)
        { x: 9, y: 0, z: 12, type: 'lava' },
        { x: 10, y: 0, z: 12, type: 'lava' },
        { x: 9, y: 0, z: 13, type: 'lava' },
    ],
    items: [
        { x: 7, y: 8, z: 6, type: 'gem' },
        { x: 11, y: 5, z: 10, type: 'gem' },
        { x: 15, y: 3, z: 14, type: 'gem' },
        { x: 18, y: 2, z: 16, type: 'potion' },
    ]
};

Game.levels[12] = {
    name: 'Lava Tunnels',
    world: 'volcanic',
    worldName: '🌋 Volcanic Depths',
    objective: 'Navigate around the lava streams!',
    spawn: { x: 2, y: 2, z: 2 },
    goal: { x: 24, y: 1, z: 10 },
    blocks: [
        // Tunnel floor with gaps for lava
        ...Game.generatePlatform(0, 0, 5, 14, 0, 'stone'),
        ...Game.generatePlatform(7, 0, 4, 14, 0, 'obsidian'),
        ...Game.generatePlatform(13, 0, 4, 14, 0, 'stone'),
        ...Game.generatePlatform(19, 0, 8, 14, 0, 'obsidian'),
        // Lava rivers between paths
        ...Game.generatePlatform(5, 0, 2, 14, -1, 'lava'),
        ...Game.generatePlatform(11, 0, 2, 14, -1, 'lava'),
        ...Game.generatePlatform(17, 0, 2, 14, -1, 'lava'),
        // Bridges over lava
        ...Game.generatePlatform(5, 5, 2, 2, 0, 'stone'),
        ...Game.generatePlatform(11, 8, 2, 2, 0, 'stone'),
        ...Game.generatePlatform(17, 4, 2, 2, 0, 'stone'),
        // Ceiling
        ...Game.generatePlatform(0, 0, 27, 14, 5, 'obsidian'),
        // Walls
        ...Game.generatePlatform(0, 0, 27, 1, 1, 'stone'),
        ...Game.generatePlatform(0, 0, 27, 1, 2, 'stone'),
        ...Game.generatePlatform(0, 13, 27, 1, 1, 'stone'),
        ...Game.generatePlatform(0, 13, 27, 1, 2, 'stone'),
    ],
    items: [
        { x: 3, y: 1, z: 7, type: 'gem' },
        { x: 9, y: 1, z: 3, type: 'gem' },
        { x: 15, y: 1, z: 10, type: 'gem' },
        { x: 22, y: 1, z: 5, type: 'gem' },
        { x: 14, y: 1, z: 6, type: 'potion' },
    ]
};

Game.levels[13] = {
    name: 'Crystal Mine',
    world: 'volcanic',
    worldName: '🌋 Volcanic Depths',
    objective: 'Collect 5 crystals from the ancient mine.',
    spawn: { x: 2, y: 2, z: 2 },
    goal: { x: 18, y: 1, z: 18 },
    blocks: [
        ...Game.generateFloor(22, 22, 'stone'),
        // Mine shaft supports
        { x: 5, y: 1, z: 5, type: 'wood' }, { x: 5, y: 2, z: 5, type: 'wood' }, { x: 5, y: 3, z: 5, type: 'wood' },
        { x: 15, y: 1, z: 5, type: 'wood' }, { x: 15, y: 2, z: 5, type: 'wood' }, { x: 15, y: 3, z: 5, type: 'wood' },
        { x: 5, y: 1, z: 15, type: 'wood' }, { x: 5, y: 2, z: 15, type: 'wood' }, { x: 5, y: 3, z: 15, type: 'wood' },
        { x: 15, y: 1, z: 15, type: 'wood' }, { x: 15, y: 2, z: 15, type: 'wood' }, { x: 15, y: 3, z: 15, type: 'wood' },
        // Crystal veins in walls
        ...Game.generateWalls(22, 22, 3, 'obsidian'),
        { x: 0, y: 2, z: 8, type: 'crystal' },
        { x: 0, y: 2, z: 14, type: 'crystal' },
        { x: 21, y: 2, z: 6, type: 'crystal' },
        { x: 21, y: 2, z: 16, type: 'crystal' },
        { x: 10, y: 2, z: 0, type: 'crystal' },
        // Raised platforms
        ...Game.generatePlatform(9, 9, 4, 4, 1, 'stone'),
    ],
    items: [
        { x: 3, y: 1, z: 3, type: 'gem' },
        { x: 18, y: 1, z: 3, type: 'gem' },
        { x: 3, y: 1, z: 18, type: 'gem' },
        { x: 18, y: 1, z: 18, type: 'gem' },
        { x: 10, y: 3, z: 10, type: 'gem' },
        { x: 10, y: 1, z: 10, type: 'potion' },
    ]
};

Game.levels[14] = {
    name: 'The Forge',
    world: 'volcanic',
    worldName: '🌋 Volcanic Depths',
    objective: 'Activate the ancient forge to upgrade your sword.',
    spawn: { x: 2, y: 2, z: 8 },
    goal: { x: 20, y: 1, z: 8 },
    blocks: [
        ...Game.generatePlatform(0, 4, 24, 10, 0, 'obsidian'),
        // Forge room in center
        ...Game.generatePlatform(9, 6, 6, 6, 0, 'stone'),
        // Forge (anvil area)
        { x: 11, y: 1, z: 8, type: 'obsidian' },
        { x: 12, y: 1, z: 8, type: 'obsidian' },
        { x: 11, y: 2, z: 8, type: 'gold' },
        // Lava channel around forge
        { x: 8, y: 0, z: 7, type: 'lava' },
        { x: 8, y: 0, z: 8, type: 'lava' },
        { x: 8, y: 0, z: 9, type: 'lava' },
        { x: 15, y: 0, z: 7, type: 'lava' },
        { x: 15, y: 0, z: 8, type: 'lava' },
        { x: 15, y: 0, z: 9, type: 'lava' },
        // Pillars
        { x: 4, y: 1, z: 5, type: 'stone' }, { x: 4, y: 2, z: 5, type: 'stone' }, { x: 4, y: 3, z: 5, type: 'stone' },
        { x: 4, y: 1, z: 12, type: 'stone' }, { x: 4, y: 2, z: 12, type: 'stone' }, { x: 4, y: 3, z: 12, type: 'stone' },
        { x: 19, y: 1, z: 5, type: 'stone' }, { x: 19, y: 2, z: 5, type: 'stone' }, { x: 19, y: 3, z: 5, type: 'stone' },
        { x: 19, y: 1, z: 12, type: 'stone' }, { x: 19, y: 2, z: 12, type: 'stone' }, { x: 19, y: 3, z: 12, type: 'stone' },
    ],
    items: [
        { x: 6, y: 1, z: 8, type: 'gem' },
        { x: 12, y: 1, z: 6, type: 'gem' },
        { x: 17, y: 1, z: 10, type: 'gem' },
        { x: 12, y: 3, z: 8, type: 'gem' },
        { x: 3, y: 1, z: 8, type: 'potion' },
    ]
};

Game.levels[15] = {
    name: 'Magma Beast',
    world: 'volcanic',
    worldName: '🌋 Volcanic Depths',
    objective: 'Defeat the Lava Golem and claim the Crystal Shard!',
    spawn: { x: 3, y: 2, z: 3 },
    goal: { x: 12, y: 1, z: 12 },
    blocks: [
        // Obsidian arena
        ...Game.generateFloor(20, 20, 'obsidian'),
        ...Game.generateWalls(20, 20, 3, 'obsidian'),
        // Lava pools in corners
        ...Game.generatePlatform(1, 1, 3, 3, 0, 'lava'),
        ...Game.generatePlatform(16, 1, 3, 3, 0, 'lava'),
        ...Game.generatePlatform(1, 16, 3, 3, 0, 'lava'),
        ...Game.generatePlatform(16, 16, 3, 3, 0, 'lava'),
        // Raised center
        ...Game.generatePlatform(8, 8, 4, 4, 1, 'stone'),
        ...Game.generatePlatform(9, 9, 2, 2, 2, 'gold'),
    ],
    items: [
        { x: 10, y: 4, z: 10, type: 'crystal_shard' },
        { x: 5, y: 1, z: 10, type: 'gem' },
        { x: 14, y: 1, z: 10, type: 'gem' },
        { x: 10, y: 1, z: 5, type: 'potion' },
        { x: 10, y: 1, z: 15, type: 'gem' },
    ]
};

// ---------- WORLD 4: SHADOW FORTRESS (Levels 16-20) ----------

Game.levels[16] = {
    name: 'The Dark Gate',
    world: 'fortress',
    worldName: '🏰 Shadow Fortress',
    objective: 'Breach the fortress walls and enter!',
    spawn: { x: 3, y: 2, z: 2 },
    goal: { x: 20, y: 1, z: 12 },
    blocks: [
        // Approach path
        ...Game.generatePlatform(0, 0, 10, 6, 0, 'dirt'),
        // Fortress wall
        ...Game.generatePlatform(10, 0, 2, 16, 0, 'castle_brick'),
        ...Game.generatePlatform(10, 0, 2, 16, 1, 'castle_brick'),
        ...Game.generatePlatform(10, 0, 2, 16, 2, 'castle_brick'),
        ...Game.generatePlatform(10, 0, 2, 16, 3, 'castle_brick'),
        ...Game.generatePlatform(10, 0, 2, 16, 4, 'castle_brick'),
        // Gate opening
        ...Game.generatePlatform(12, 5, 12, 12, 0, 'dark_brick'),
        // Inside courtyard
        ...Game.generatePlatform(12, 0, 12, 5, 0, 'dark_brick'),
        // Towers
        { x: 10, y: 5, z: 0, type: 'castle_brick' }, { x: 11, y: 5, z: 0, type: 'castle_brick' },
        { x: 10, y: 5, z: 15, type: 'castle_brick' }, { x: 11, y: 5, z: 15, type: 'castle_brick' },
    ],
    items: [
        { x: 5, y: 1, z: 3, type: 'gem' },
        { x: 14, y: 1, z: 8, type: 'gem' },
        { x: 18, y: 1, z: 14, type: 'gem' },
        { x: 16, y: 1, z: 3, type: 'potion' },
    ]
};

Game.levels[17] = {
    name: 'Dungeon Maze',
    world: 'fortress',
    worldName: '🏰 Shadow Fortress',
    objective: 'Find the exit through the dungeon maze!',
    spawn: { x: 1, y: 2, z: 1 },
    goal: { x: 18, y: 1, z: 18 },
    blocks: [
        ...Game.generateFloor(20, 20, 'dark_brick'),
        ...Game.generateWalls(20, 20, 3, 'castle_brick'),
        ...Game.generatePlatform(0, 0, 20, 20, 4, 'dark_brick'), // Ceiling
        // Maze walls
        ...Game.generatePlatform(3, 0, 1, 14, 1, 'castle_brick'),
        ...Game.generatePlatform(3, 0, 1, 14, 2, 'castle_brick'),
        ...Game.generatePlatform(6, 6, 1, 14, 1, 'castle_brick'),
        ...Game.generatePlatform(6, 6, 1, 14, 2, 'castle_brick'),
        ...Game.generatePlatform(9, 0, 1, 14, 1, 'castle_brick'),
        ...Game.generatePlatform(9, 0, 1, 14, 2, 'castle_brick'),
        ...Game.generatePlatform(12, 6, 1, 14, 1, 'castle_brick'),
        ...Game.generatePlatform(12, 6, 1, 14, 2, 'castle_brick'),
        ...Game.generatePlatform(15, 0, 1, 14, 1, 'castle_brick'),
        ...Game.generatePlatform(15, 0, 1, 14, 2, 'castle_brick'),
    ],
    items: [
        { x: 2, y: 1, z: 10, type: 'gem' },
        { x: 5, y: 1, z: 16, type: 'gem' },
        { x: 8, y: 1, z: 5, type: 'gem' },
        { x: 11, y: 1, z: 15, type: 'key' },
        { x: 14, y: 1, z: 3, type: 'gem' },
        { x: 17, y: 1, z: 12, type: 'potion' },
    ]
};

Game.levels[18] = {
    name: 'Throne Room',
    world: 'fortress',
    worldName: '🏰 Shadow Fortress',
    objective: 'Cross the throne room to reach the Dark Lord.',
    spawn: { x: 3, y: 2, z: 2 },
    goal: { x: 12, y: 1, z: 22 },
    blocks: [
        // Grand hall
        ...Game.generatePlatform(0, 0, 18, 25, 0, 'dark_brick'),
        // Walls
        ...Game.generateWalls(18, 25, 5, 'castle_brick'),
        // Red carpet (center path)
        ...Game.generatePlatform(7, 0, 4, 25, 0, 'castle_brick'),
        // Pillars along sides
        ...[3, 8, 13, 18].flatMap(z => [
            { x: 3, y: 1, z, type: 'castle_brick' }, { x: 3, y: 2, z, type: 'castle_brick' },
            { x: 3, y: 3, z, type: 'castle_brick' }, { x: 3, y: 4, z, type: 'castle_brick' },
            { x: 14, y: 1, z, type: 'castle_brick' }, { x: 14, y: 2, z, type: 'castle_brick' },
            { x: 14, y: 3, z, type: 'castle_brick' }, { x: 14, y: 4, z, type: 'castle_brick' },
        ]),
        // Throne platform
        ...Game.generatePlatform(6, 21, 6, 3, 1, 'gold'),
        // Throne
        { x: 8, y: 2, z: 22, type: 'dark_brick' },
        { x: 9, y: 2, z: 22, type: 'dark_brick' },
        { x: 8, y: 3, z: 22, type: 'gold' },
        { x: 9, y: 3, z: 22, type: 'gold' },
    ],
    items: [
        { x: 5, y: 1, z: 5, type: 'gem' },
        { x: 12, y: 1, z: 10, type: 'gem' },
        { x: 8, y: 1, z: 15, type: 'gem' },
        { x: 9, y: 1, z: 2, type: 'potion' },
        { x: 14, y: 1, z: 20, type: 'potion' },
    ]
};

Game.levels[19] = {
    name: 'The Dark Lord',
    world: 'fortress',
    worldName: '🏰 Shadow Fortress',
    objective: 'Defeat the Dark Lord and take the Crystal Shard!',
    spawn: { x: 3, y: 2, z: 3 },
    goal: { x: 10, y: 1, z: 10 },
    blocks: [
        // Battle arena
        ...Game.generateFloor(20, 20, 'dark_brick'),
        ...Game.generateWalls(20, 20, 4, 'obsidian'),
        // Dark pillars
        { x: 5, y: 1, z: 5, type: 'obsidian' }, { x: 5, y: 2, z: 5, type: 'obsidian' }, { x: 5, y: 3, z: 5, type: 'obsidian' },
        { x: 14, y: 1, z: 5, type: 'obsidian' }, { x: 14, y: 2, z: 5, type: 'obsidian' }, { x: 14, y: 3, z: 5, type: 'obsidian' },
        { x: 5, y: 1, z: 14, type: 'obsidian' }, { x: 5, y: 2, z: 14, type: 'obsidian' }, { x: 5, y: 3, z: 14, type: 'obsidian' },
        { x: 14, y: 1, z: 14, type: 'obsidian' }, { x: 14, y: 2, z: 14, type: 'obsidian' }, { x: 14, y: 3, z: 14, type: 'obsidian' },
        // Center altar
        ...Game.generatePlatform(8, 8, 4, 4, 1, 'obsidian'),
        { x: 9, y: 2, z: 9, type: 'gold' },
        { x: 10, y: 2, z: 9, type: 'gold' },
        { x: 9, y: 2, z: 10, type: 'gold' },
        { x: 10, y: 2, z: 10, type: 'gold' },
    ],
    items: [
        { x: 10, y: 4, z: 10, type: 'crystal_shard' },
        { x: 3, y: 1, z: 10, type: 'gem' },
        { x: 16, y: 1, z: 10, type: 'gem' },
        { x: 10, y: 1, z: 16, type: 'potion' },
        { x: 10, y: 1, z: 3, type: 'potion' },
    ]
};

Game.levels[20] = {
    name: 'Light Restored',
    world: 'fortress',
    worldName: '🏰 Shadow Fortress',
    objective: 'Unite the shards and defeat the Shadow! FINAL LEVEL!',
    spawn: { x: 3, y: 2, z: 3 },
    goal: { x: 12, y: 3, z: 12 },
    blocks: [
        // Grand circular arena
        ...Game.generateFloor(26, 26, 'dark_brick'),
        ...Game.generateWalls(26, 26, 5, 'obsidian'),
        // Inner ring
        ...Game.generatePlatform(5, 5, 16, 16, 0, 'stone'),
        // 5 shard pedestals in pentagram pattern
        ...Game.generatePlatform(12, 3, 2, 2, 1, 'gold'),   // North
        ...Game.generatePlatform(20, 9, 2, 2, 1, 'gold'),   // East
        ...Game.generatePlatform(17, 19, 2, 2, 1, 'gold'),  // SE
        ...Game.generatePlatform(6, 19, 2, 2, 1, 'gold'),   // SW
        ...Game.generatePlatform(3, 9, 2, 2, 1, 'gold'),    // West
        // Center altar (goal)
        ...Game.generatePlatform(10, 10, 5, 5, 1, 'gold'),
        ...Game.generatePlatform(11, 11, 3, 3, 2, 'crystal'),
        // Dramatic pillars
        ...[4, 21].flatMap(x => [4, 21].flatMap(z => [
            { x, y: 1, z, type: 'obsidian' }, { x, y: 2, z, type: 'obsidian' },
            { x, y: 3, z, type: 'obsidian' }, { x, y: 4, z, type: 'obsidian' },
            { x, y: 5, z, type: 'gold' },
        ])),
    ],
    items: [
        { x: 12, y: 3, z: 3, type: 'crystal_shard' },
        { x: 20, y: 3, z: 9, type: 'gem' },
        { x: 17, y: 3, z: 19, type: 'gem' },
        { x: 6, y: 3, z: 19, type: 'gem' },
        { x: 3, y: 3, z: 9, type: 'gem' },
        { x: 12, y: 1, z: 8, type: 'potion' },
        { x: 12, y: 1, z: 18, type: 'potion' },
    ]
};


// ============================================
// INITIALIZATION — Called from Flutter or URL
// ============================================

(function() {
    // Get level from URL params or default to 1
    const params = new URLSearchParams(window.location.search);
    const level = parseInt(params.get('level')) || 1;

    // Also listen for messages from Flutter
    window.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'load_level') {
                Game.isRunning = false;
                setTimeout(() => Game.init(data.level), 100);
            }
        } catch(e) {}
    });

    // Start the game
    Game.init(level);
})();
