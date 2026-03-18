// ============================================
// player.js — First-Person Player Controller
// ============================================

const Player = {
    camera: null,
    height: 1.6,
    radius: 0.3,

    // Position
    x: 2, y: 3, z: 2,

    // Velocity
    vx: 0, vy: 0, vz: 0,

    // Camera rotation
    rotX: 0, // Yaw (left-right)
    rotY: 0, // Pitch (up-down)

    // Movement config
    speed: 4.0,
    jumpForce: 7.0,
    gravity: -15.0,
    onGround: false,

    // Game state
    health: 3,
    maxHealth: 3,
    inventory: [],
    gemsCollected: 0,
    totalGems: 0,
    isAlive: true,

    // Hand weapon (shown on screen)
    handGroup: null,
    handSwing: 0,
    isAttacking: false,

    init(scene) {
        // Create camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);

        // Create hand/weapon visible on right side of screen
        this.handGroup = new THREE.Group();

        // Try to load sword GLB model
        let usedModel = false;
        if (typeof ModelLoader !== 'undefined') {
            const swordModel = ModelLoader.getItem('sword');
            if (swordModel) {
                swordModel.rotation.set(0, 0, -0.5);
                this.handGroup.add(swordModel);
                usedModel = true;
            }
        }

        // Fallback to procedural geometry if model not available
        if (!usedModel) {
            // Arm
            const armGeo = new THREE.BoxGeometry(0.15, 0.5, 0.15);
            const armMat = new THREE.MeshLambertMaterial({ color: 0xD2A679 });
            const arm = new THREE.Mesh(armGeo, armMat);
            arm.position.set(0, -0.1, 0);
            this.handGroup.add(arm);

            // Sword blade
            const bladeGeo = new THREE.BoxGeometry(0.08, 0.7, 0.04);
            const bladeMat = new THREE.MeshLambertMaterial({ color: 0xB0BEC5, emissive: 0x78909C, emissiveIntensity: 0.1 });
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.position.set(0, 0.5, 0);
            this.handGroup.add(blade);

            // Sword handle
            const handleGeo = new THREE.BoxGeometry(0.12, 0.15, 0.06);
            const handleMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
            const handle = new THREE.Mesh(handleGeo, handleMat);
            handle.position.set(0, 0.12, 0);
            this.handGroup.add(handle);

            // Guard
            const guardGeo = new THREE.BoxGeometry(0.25, 0.05, 0.08);
            const guardMat = new THREE.MeshLambertMaterial({ color: 0xFFD600 });
            const guard = new THREE.Mesh(guardGeo, guardMat);
            guard.position.set(0, 0.2, 0);
            this.handGroup.add(guard);
        }

        // Position hand on right side of screen
        this.handGroup.position.set(0.45, -0.35, -0.6);
        this.handGroup.rotation.set(0, 0, -0.3);
        this.camera.add(this.handGroup);

        scene.add(this.camera);

        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    },

    spawn(spawnPoint) {
        const safe = World.findSafeSpawn(spawnPoint);
        this.x = safe.x;
        this.y = safe.y;
        this.z = safe.z;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.rotX = 0;
        this.rotY = 0;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.gemsCollected = 0;
        this.inventory = [];
        this.updateHealthUI();
    },

    update(dt) {
        if (!this.isAlive) return;

        // ---- Camera Look (from touch controls) ----
        this.rotX -= Controls.lookDeltaX;
        this.rotY -= Controls.lookDeltaY;
        this.rotY = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.rotY));


        // ---- Movement (from D-pad or joystick) ----
        const forward = new THREE.Vector3(
            -Math.sin(this.rotX),
            0,
            -Math.cos(this.rotX)
        );
        const right = new THREE.Vector3(
            Math.cos(this.rotX),
            0,
            -Math.sin(this.rotX)
        );

        const moveDir = new THREE.Vector3(0, 0, 0);
        moveDir.add(right.clone().multiplyScalar(Controls.moveX));
        moveDir.add(forward.clone().multiplyScalar(-Controls.moveZ));

        if (moveDir.length() > 0) {
            moveDir.normalize();
            this.vx = moveDir.x * this.speed;
            this.vz = moveDir.z * this.speed;
        } else {
            this.vx *= 0.8; // Friction
            this.vz *= 0.8;
        }

        // ---- Jump ----
        if (Controls.jumpPressed && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
        }

        // ---- Gravity ----
        this.vy += this.gravity * dt;

        // ---- Move with collision ----
        const newX = this.x + this.vx * dt;
        const newY = this.y + this.vy * dt;
        const newZ = this.z + this.vz * dt;

        // Horizontal collision (X)
        if (!World.checkBlockCollision(newX, this.y, this.z, this.radius, this.height)) {
            this.x = newX;
        } else {
            this.vx = 0;
        }

        // Horizontal collision (Z)
        if (!World.checkBlockCollision(this.x, this.y, newZ, this.radius, this.height)) {
            this.z = newZ;
        } else {
            this.vz = 0;
        }

        // Vertical collision (Y) — only check blocks below player's feet + small margin
        const groundY = World.getGroundHeight(this.x, this.z, this.radius, this.y + 0.1);
        if (newY <= groundY) {
            this.y = groundY;
            this.vy = 0;
            this.onGround = true;
        } else if (newY < -10) {
            // Fell off the map
            this.takeDamage(1);
            if (this.isAlive) {
                this.x = World.spawnPoint.x;
                this.y = World.spawnPoint.y + 2;
                this.z = World.spawnPoint.z;
                this.vy = 0;
            }
        } else {
            this.y = newY;
            this.onGround = false;
        }

        // ---- Update Camera Position ----
        this.camera.position.set(this.x, this.y + this.height, this.z);
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.rotX;
        this.camera.rotation.x = this.rotY;

        // ---- Attack Animation ----
        if (Controls.attackPressed && !this.isAttacking) {
            this.isAttacking = true;
            this.handSwing = 0;
        }
        if (this.isAttacking) {
            this.handSwing += dt * 8;
            if (this.handSwing < Math.PI) {
                this.handGroup.rotation.x = -Math.sin(this.handSwing) * 0.8;
            } else {
                this.handGroup.rotation.x = 0;
                this.isAttacking = false;
                this.handSwing = 0;
            }
        } else {
            // Idle hand bob
            const time = performance.now() / 1000;
            const bobAmount = Controls.isMoving ? 0.03 : 0.01;
            const bobSpeed = Controls.isMoving ? 6 : 2;
            this.handGroup.position.y = -0.35 + Math.sin(time * bobSpeed) * bobAmount;
        }

        // ---- Check Collectibles ----
        const collected = World.checkItemPickup(this.x, this.y + 1, this.z, 1.2);
        collected.forEach(type => {
            if (type === 'gem') {
                this.gemsCollected++;
                this.updateItemsUI();
            } else if (type === 'potion') {
                this.health = Math.min(this.health + 1, this.maxHealth);
                this.updateHealthUI();
            } else if (type === 'key') {
                this.inventory.push('key');
            } else if (type === 'crystal_shard') {
                this.inventory.push('crystal_shard');
                this.gemsCollected++;
                this.updateItemsUI();
            }
        });

        // ---- Check Goal ----
        if (World.checkGoalReached(this.x, this.y, this.z, 1.5)) {
            return 'level_complete';
        }

        // Reset look delta
        Controls.resetLookDelta();

        return null;
    },

    takeDamage(amount) {
        this.health -= amount;
        this.updateHealthUI();

        if (this.health <= 0) {
            this.isAlive = false;
            return 'game_over';
        }
        return null;
    },

    updateHealthUI() {
        const bar = document.getElementById('health-bar');
        if (!bar) return;
        bar.innerHTML = '';
        for (let i = 0; i < this.maxHealth; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.textContent = i < this.health ? '❤️' : '🖤';
            bar.appendChild(heart);
        }
    },

    updateItemsUI() {
        const el = document.getElementById('items-collected');
        if (el) {
            el.textContent = `💎 ${this.gemsCollected} / ${this.totalGems}`;
        }
    }
};
