// ============================================
// world.js — Blocky World Builder (Minecraft-style)
// ============================================

const World = {
    blocks: [],
    items: [],
    enemies: [],
    goalPosition: null,
    spawnPoint: { x: 2, y: 2, z: 2 },
    loadedModels: {},

    // Block type definitions with colors (used when no textures)
    blockTypes: {
        'grass':        { color: 0x4CAF50, topColor: 0x66BB6A },
        'dirt':         { color: 0x795548 },
        'stone':        { color: 0x9E9E9E },
        'wood':         { color: 0x8D6E63 },
        'planks':       { color: 0xBCAAA4 },
        'ice':          { color: 0x81D4FA, opacity: 0.8 },
        'snow':         { color: 0xFAFAFA },
        'lava':         { color: 0xFF5722, emissive: 0xFF3D00 },
        'obsidian':     { color: 0x37474F },
        'castle_brick': { color: 0x6D4C41 },
        'dark_brick':   { color: 0x3E2723 },
        'sand':         { color: 0xFFE082 },
        'water':        { color: 0x29B6F6, opacity: 0.6 },
        'leaves':       { color: 0x388E3C },
        'crystal':      { color: 0xE040FB, emissive: 0x9C27B0, opacity: 0.7 },
        'gold':         { color: 0xFFD600, emissive: 0xFFA000 },
        'portal':       { color: 0x7C4DFF, emissive: 0x651FFF, opacity: 0.5 },
    },

    // World sky colors per theme
    skyColors: {
        'forest':   { top: 0x87CEEB, bottom: 0xB8E6B8, fog: 0xC8E6C8, fogDensity: 0.02 },
        'ice':      { top: 0xB3E5FC, bottom: 0xE1F5FE, fog: 0xE3F2FD, fogDensity: 0.025 },
        'volcanic': { top: 0x4E342E, bottom: 0xBF360C, fog: 0x3E2723, fogDensity: 0.03 },
        'fortress': { top: 0x1a1a2e, bottom: 0x16213e, fog: 0x1a1a2e, fogDensity: 0.035 },
    },

    createBlock(x, y, z, type) {
        const blockDef = this.blockTypes[type] || this.blockTypes['stone'];
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const materialOptions = {
            color: blockDef.color,
            flatShading: true,
        };

        if (blockDef.emissive) {
            materialOptions.emissive = blockDef.emissive;
            materialOptions.emissiveIntensity = 0.3;
        }

        if (blockDef.opacity && blockDef.opacity < 1) {
            materialOptions.transparent = true;
            materialOptions.opacity = blockDef.opacity;
        }

        const material = new THREE.MeshLambertMaterial(materialOptions);

        // For grass blocks, make top face green
        if (type === 'grass' && blockDef.topColor) {
            const materials = [
                material, material, // +x, -x
                new THREE.MeshLambertMaterial({ color: blockDef.topColor, flatShading: true }), // +y (top)
                new THREE.MeshLambertMaterial({ color: 0x5D4037, flatShading: true }), // -y (bottom)
                material, material, // +z, -z
            ];
            const mesh = new THREE.Mesh(geometry, materials);
            mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
            mesh.userData = { type: type, isBlock: true };
            return mesh;
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
        mesh.userData = { type: type, isBlock: true };
        return mesh;
    },

    createCollectible(x, y, z, itemType) {
        let geometry, material;

        switch (itemType) {
            case 'crystal_shard':
                geometry = new THREE.OctahedronGeometry(0.3);
                material = new THREE.MeshLambertMaterial({
                    color: 0xE040FB, emissive: 0x9C27B0,
                    emissiveIntensity: 0.5, transparent: true, opacity: 0.8
                });
                break;
            case 'gem':
                geometry = new THREE.OctahedronGeometry(0.2);
                material = new THREE.MeshLambertMaterial({
                    color: 0x00E5FF, emissive: 0x00BCD4,
                    emissiveIntensity: 0.3
                });
                break;
            case 'key':
                geometry = new THREE.BoxGeometry(0.15, 0.4, 0.05);
                material = new THREE.MeshLambertMaterial({
                    color: 0xFFD600, emissive: 0xFFA000,
                    emissiveIntensity: 0.2
                });
                break;
            case 'potion':
                geometry = new THREE.CylinderGeometry(0.12, 0.15, 0.3, 8);
                material = new THREE.MeshLambertMaterial({
                    color: 0xF44336, emissive: 0xD32F2F,
                    emissiveIntensity: 0.2, transparent: true, opacity: 0.8
                });
                break;
            default:
                geometry = new THREE.SphereGeometry(0.2, 8, 8);
                material = new THREE.MeshLambertMaterial({ color: 0xFFEB3B });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x + 0.5, y + 0.8, z + 0.5);
        mesh.userData = { type: itemType, isCollectible: true, collected: false };
        return mesh;
    },

    createGoalPortal(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x + 0.5, y, z + 0.5);

        // Portal frame
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x7C4DFF, emissive: 0x651FFF, emissiveIntensity: 0.4 });
        const frameGeo = new THREE.BoxGeometry(0.2, 3, 0.2);

        const left = new THREE.Mesh(frameGeo, frameMaterial);
        left.position.set(-0.8, 1.5, 0);
        group.add(left);

        const right = new THREE.Mesh(frameGeo, frameMaterial);
        right.position.set(0.8, 1.5, 0);
        group.add(right);

        const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.2), frameMaterial);
        top.position.set(0, 3, 0);
        group.add(top);

        // Portal inner glow
        const portalGeo = new THREE.PlaneGeometry(1.4, 2.8);
        const portalMat = new THREE.MeshBasicMaterial({
            color: 0xB388FF, transparent: true, opacity: 0.4,
            side: THREE.DoubleSide
        });
        const portal = new THREE.Mesh(portalGeo, portalMat);
        portal.position.set(0, 1.5, 0);
        portal.userData = { isPortal: true };
        group.add(portal);

        group.userData = { isGoal: true };
        return group;
    },

    buildLevel(scene, levelData) {
        // Clear existing
        this.blocks = [];
        this.items = [];
        this.enemies = [];

        // Set world atmosphere
        const sky = this.skyColors[levelData.world] || this.skyColors['forest'];
        scene.background = new THREE.Color(sky.top);
        scene.fog = new THREE.FogExp2(sky.fog, sky.fogDensity);

        // Build blocks from grid
        if (levelData.blocks) {
            levelData.blocks.forEach(b => {
                const block = this.createBlock(b.x, b.y, b.z, b.type);
                scene.add(block);
                this.blocks.push(block);
            });
        }

        // Place collectibles
        if (levelData.items) {
            levelData.items.forEach(item => {
                const collectible = this.createCollectible(item.x, item.y, item.z, item.type);
                scene.add(collectible);
                this.items.push(collectible);
            });
        }

        // Place goal portal
        if (levelData.goal) {
            const goal = this.createGoalPortal(levelData.goal.x, levelData.goal.y, levelData.goal.z);
            scene.add(goal);
            this.goalPosition = { x: levelData.goal.x + 0.5, y: levelData.goal.y, z: levelData.goal.z + 0.5 };
        }

        // Set spawn
        if (levelData.spawn) {
            this.spawnPoint = { ...levelData.spawn };
        }

        // Add ambient lighting
        this.addLighting(scene, levelData.world);
    },

    addLighting(scene, worldType) {
        // Ambient light
        const ambientIntensity = worldType === 'volcanic' ? 0.3 : worldType === 'fortress' ? 0.25 : 0.5;
        const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity);
        scene.add(ambient);

        // Directional (sun) light
        const sunColor = worldType === 'volcanic' ? 0xFF8A65 : worldType === 'ice' ? 0xE3F2FD : 0xFFF9C4;
        const sun = new THREE.DirectionalLight(sunColor, 0.8);
        sun.position.set(10, 20, 10);
        sun.castShadow = false; // Keep performance light for Android
        scene.add(sun);

        // World-specific lights
        if (worldType === 'volcanic') {
            const lavaGlow = new THREE.PointLight(0xFF5722, 0.5, 20);
            lavaGlow.position.set(5, 1, 5);
            scene.add(lavaGlow);
        }
        if (worldType === 'fortress') {
            const torchLight = new THREE.PointLight(0xFF9800, 0.4, 15);
            torchLight.position.set(5, 3, 5);
            scene.add(torchLight);
        }
    },

    // Animate collectible items (float + spin)
    update(time) {
        this.items.forEach((item, i) => {
            if (!item.userData.collected) {
                item.rotation.y = time * 2 + i;
                item.position.y = item.userData.originalY || item.position.y;
                if (!item.userData.originalY) item.userData.originalY = item.position.y;
                item.position.y = item.userData.originalY + Math.sin(time * 3 + i) * 0.1;
            }
        });
    },

    // Check collision with blocks (simple AABB)
    // playerHeight: if provided, use full body height for Y-axis and skip ground blocks
    checkBlockCollision(x, y, z, radius, playerHeight) {
        for (const block of this.blocks) {
            const bx = block.position.x;
            const by = block.position.y;
            const bz = block.position.z;
            const half = 0.5;

            const blockTop = by + half;
            // Skip blocks at or below the player's feet (the ground they stand on)
            if (playerHeight !== undefined && blockTop <= y + 0.05) continue;

            // Y overlap: player body extends from y to y + playerHeight (or y +/- radius)
            const bodyTop = playerHeight !== undefined ? y + playerHeight : y + radius;
            const bodyBottom = y;

            if (x + radius > bx - half && x - radius < bx + half &&
                bodyTop > by - half && bodyBottom < by + half &&
                z + radius > bz - half && z - radius < bz + half) {
                return block;
            }
        }
        return null;
    },

    // Check if player is on top of a block
    // belowY: if provided, only consider blocks whose top is at or below this Y
    getGroundHeight(x, z, radius, belowY) {
        let maxY = -Infinity;
        for (const block of this.blocks) {
            const bx = block.position.x;
            const bz = block.position.z;
            const half = 0.5;

            if (x + radius > bx - half && x - radius < bx + half &&
                z + radius > bz - half && z - radius < bz + half) {
                const topY = block.position.y + half;
                // Skip blocks above the player (ceilings, upper platforms)
                if (belowY !== undefined && topY > belowY + 0.05) continue;
                if (topY > maxY) maxY = topY;
            }
        }
        return maxY;
    },

    // Check item pickup
    checkItemPickup(px, py, pz, pickupRadius) {
        const collected = [];
        this.items.forEach(item => {
            if (item.userData.collected) return;
            const dx = px - item.position.x;
            const dy = py - item.position.y;
            const dz = pz - item.position.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist < pickupRadius) {
                item.userData.collected = true;
                item.visible = false;
                collected.push(item.userData.type);
            }
        });
        return collected;
    },

    // Check if player reached goal
    checkGoalReached(px, py, pz, goalRadius) {
        if (!this.goalPosition) return false;
        const dx = px - this.goalPosition.x;
        const dz = pz - this.goalPosition.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        return dist < goalRadius;
    },

    // Find a safe spawn position (on top of the highest block at spawn x/z, below spawn Y)
    findSafeSpawn(spawnPoint) {
        // Use spawn Y + some headroom as the ceiling filter
        const groundY = this.getGroundHeight(spawnPoint.x, spawnPoint.z, 0.3, spawnPoint.y);
        return {
            x: spawnPoint.x,
            y: groundY > -Infinity ? groundY : spawnPoint.y,
            z: spawnPoint.z
        };
    }
};
