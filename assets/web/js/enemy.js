// ============================================
// enemy.js — Enemy System with AI & Combat
// ============================================

const EnemySystem = {
    enemies: [],
    _tempVec: new THREE.Vector3(),

    // Enemy type definitions
    types: {
        // ---- Regular Enemies ----
        'spider': {
            health: 2,
            speed: 2.5,
            damage: 1,
            chaseRange: 8,
            attackRange: 1.2,
            attackCooldown: 1.5,
            scale: 0.5,
            color: 0x4E342E,
            emissive: 0x3E2723,
            height: 0.5,
            radius: 0.4,
            patrolRadius: 4,
            bodyType: 'spider',
        },
        'ghost': {
            health: 2,
            speed: 2.0,
            damage: 1,
            chaseRange: 10,
            attackRange: 1.3,
            attackCooldown: 2.0,
            scale: 0.5,
            color: 0xB0BEC5,
            emissive: 0x78909C,
            height: 1.2,
            radius: 0.4,
            patrolRadius: 5,
            bodyType: 'ghost',
            floats: true,
        },
        'skeleton': {
            health: 3,
            speed: 2.2,
            damage: 1,
            chaseRange: 9,
            attackRange: 1.5,
            attackCooldown: 1.2,
            scale: 0.5,
            color: 0xEFEBE9,
            emissive: 0xBDBDBD,
            height: 1.5,
            radius: 0.35,
            patrolRadius: 4,
            bodyType: 'humanoid',
        },

        // ---- Bosses ----
        'tree_boss': {
            health: 12,
            speed: 1.5,
            damage: 2,
            chaseRange: 14,
            attackRange: 2.5,
            attackCooldown: 2.0,
            scale: 1.2,
            color: 0x5D4037,
            emissive: 0x4CAF50,
            height: 2.5,
            radius: 1.0,
            patrolRadius: 5,
            bodyType: 'boss',
            isBoss: true,
        },
        'ice_dragon': {
            health: 15,
            speed: 1.8,
            damage: 2,
            chaseRange: 16,
            attackRange: 3.0,
            attackCooldown: 1.8,
            scale: 1.4,
            color: 0x81D4FA,
            emissive: 0x29B6F6,
            height: 2.5,
            radius: 1.2,
            patrolRadius: 6,
            bodyType: 'boss',
            isBoss: true,
        },
        'lava_demon': {
            health: 15,
            speed: 1.6,
            damage: 2,
            chaseRange: 14,
            attackRange: 2.5,
            attackCooldown: 1.5,
            scale: 1.3,
            color: 0xFF5722,
            emissive: 0xFF3D00,
            height: 2.5,
            radius: 1.0,
            patrolRadius: 5,
            bodyType: 'boss',
            isBoss: true,
        },
        'dark_lord': {
            health: 20,
            speed: 2.0,
            damage: 2,
            chaseRange: 18,
            attackRange: 2.5,
            attackCooldown: 1.2,
            scale: 1.3,
            color: 0x311B92,
            emissive: 0x7C4DFF,
            height: 2.2,
            radius: 0.8,
            patrolRadius: 6,
            bodyType: 'boss',
            isBoss: true,
        },
    },

    /**
     * Create a single enemy and add it to the scene.
     */
    createEnemy(scene, data) {
        const typeDef = this.types[data.type];
        if (!typeDef) {
            console.warn('EnemySystem: Unknown enemy type:', data.type);
            return null;
        }

        const group = new THREE.Group();

        // Try GLB model first
        let usedModel = false;
        if (typeof ModelLoader !== 'undefined') {
            // Check boss models
            const bossPath = ModelLoader.bossModels && ModelLoader.bossModels[data.type];
            const enemyPath = ModelLoader.enemyModels && ModelLoader.enemyModels[data.type];
            const modelPath = bossPath || enemyPath;

            if (modelPath) {
                const model = ModelLoader.get(modelPath);
                if (model) {
                    model.scale.set(typeDef.scale, typeDef.scale, typeDef.scale);
                    group.add(model);
                    usedModel = true;
                }
            }
        }

        // Fallback: procedural geometry
        if (!usedModel) {
            this._createProceduralEnemy(group, data.type, typeDef);
        }

        // Position
        group.position.set(data.x + 0.5, data.y + typeDef.height / 2, data.z + 0.5);

        // Health bar (billboard above enemy)
        const healthBar = this._createHealthBar(typeDef.isBoss);
        healthBar.position.y = typeDef.height + 0.3;
        group.add(healthBar);

        // Enemy data
        const enemy = {
            mesh: group,
            type: data.type,
            typeDef: typeDef,

            // Position & physics
            x: data.x + 0.5,
            y: data.y,
            z: data.z + 0.5,
            vx: 0,
            vz: 0,

            // State
            health: typeDef.health,
            maxHealth: typeDef.health,
            isAlive: true,
            state: 'patrol', // 'patrol', 'chase', 'attack', 'hurt', 'dead'
            stateTimer: 0,

            // Patrol
            spawnX: data.x + 0.5,
            spawnZ: data.z + 0.5,
            patrolTargetX: data.x + 0.5,
            patrolTargetZ: data.z + 0.5,
            patrolWait: 0,

            // Attack
            attackCooldownTimer: 0,
            lastDamageTime: 0,

            // Animation
            animTime: Math.random() * Math.PI * 2,

            // References
            healthBarFill: healthBar.children[1],
            healthBarGroup: healthBar,
        };

        scene.add(group);
        this.enemies.push(enemy);
        return enemy;
    },

    /**
     * Create procedural geometry for an enemy (fallback when no GLB model).
     */
    _createProceduralEnemy(group, type, typeDef) {
        const bodyColor = typeDef.color;
        const emissive = typeDef.emissive || 0x000000;

        switch (typeDef.bodyType) {
            case 'spider': {
                // Body
                const body = new THREE.Mesh(
                    new THREE.SphereGeometry(0.35, 8, 6),
                    new THREE.MeshLambertMaterial({ color: bodyColor, emissive: emissive, emissiveIntensity: 0.1 })
                );
                group.add(body);
                // Eyes (red)
                for (let side = -1; side <= 1; side += 2) {
                    const eye = new THREE.Mesh(
                        new THREE.SphereGeometry(0.06, 6, 6),
                        new THREE.MeshBasicMaterial({ color: 0xFF0000 })
                    );
                    eye.position.set(side * 0.12, 0.1, -0.3);
                    group.add(eye);
                }
                // Legs
                const legMat = new THREE.MeshLambertMaterial({ color: bodyColor });
                for (let i = 0; i < 4; i++) {
                    for (let side = -1; side <= 1; side += 2) {
                        const leg = new THREE.Mesh(
                            new THREE.BoxGeometry(0.04, 0.3, 0.04),
                            legMat
                        );
                        leg.position.set(side * (0.25 + i * 0.05), -0.15, -0.15 + i * 0.1);
                        leg.rotation.z = side * 0.5;
                        group.add(leg);
                    }
                }
                break;
            }
            case 'ghost': {
                // Ghostly body (translucent)
                const ghostBody = new THREE.Mesh(
                    new THREE.ConeGeometry(0.4, 1.2, 8),
                    new THREE.MeshLambertMaterial({
                        color: bodyColor, emissive: emissive, emissiveIntensity: 0.3,
                        transparent: true, opacity: 0.6
                    })
                );
                ghostBody.rotation.x = Math.PI; // Inverted cone
                ghostBody.position.y = 0.6;
                group.add(ghostBody);
                // Eyes (glowing)
                for (let side = -1; side <= 1; side += 2) {
                    const eye = new THREE.Mesh(
                        new THREE.SphereGeometry(0.07, 6, 6),
                        new THREE.MeshBasicMaterial({ color: 0x00E5FF })
                    );
                    eye.position.set(side * 0.13, 0.8, -0.25);
                    group.add(eye);
                }
                break;
            }
            case 'humanoid': {
                // Head
                const head = new THREE.Mesh(
                    new THREE.BoxGeometry(0.35, 0.35, 0.35),
                    new THREE.MeshLambertMaterial({ color: bodyColor, emissive: emissive, emissiveIntensity: 0.1 })
                );
                head.position.y = 1.3;
                group.add(head);
                // Eyes
                for (let side = -1; side <= 1; side += 2) {
                    const eye = new THREE.Mesh(
                        new THREE.BoxGeometry(0.06, 0.06, 0.02),
                        new THREE.MeshBasicMaterial({ color: 0xFF0000 })
                    );
                    eye.position.set(side * 0.08, 1.35, -0.18);
                    group.add(eye);
                }
                // Body
                const body2 = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.6, 0.25),
                    new THREE.MeshLambertMaterial({ color: bodyColor })
                );
                body2.position.y = 0.85;
                group.add(body2);
                // Legs
                for (let side = -1; side <= 1; side += 2) {
                    const leg = new THREE.Mesh(
                        new THREE.BoxGeometry(0.15, 0.55, 0.15),
                        new THREE.MeshLambertMaterial({ color: bodyColor })
                    );
                    leg.position.set(side * 0.12, 0.27, 0);
                    group.add(leg);
                }
                break;
            }
            case 'boss': {
                // Large imposing body
                const torso = new THREE.Mesh(
                    new THREE.BoxGeometry(1.0, 1.2, 0.7),
                    new THREE.MeshLambertMaterial({ color: bodyColor, emissive: emissive, emissiveIntensity: 0.3 })
                );
                torso.position.y = 1.2;
                group.add(torso);
                // Head
                const bossHead = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 0.6, 0.5),
                    new THREE.MeshLambertMaterial({ color: bodyColor, emissive: emissive, emissiveIntensity: 0.2 })
                );
                bossHead.position.y = 2.1;
                group.add(bossHead);
                // Glowing eyes
                for (let side = -1; side <= 1; side += 2) {
                    const eye = new THREE.Mesh(
                        new THREE.SphereGeometry(0.08, 6, 6),
                        new THREE.MeshBasicMaterial({ color: 0xFF0000 })
                    );
                    eye.position.set(side * 0.15, 2.15, -0.26);
                    group.add(eye);
                }
                // Arms
                for (let side = -1; side <= 1; side += 2) {
                    const arm = new THREE.Mesh(
                        new THREE.BoxGeometry(0.25, 0.9, 0.25),
                        new THREE.MeshLambertMaterial({ color: bodyColor })
                    );
                    arm.position.set(side * 0.65, 1.1, 0);
                    group.add(arm);
                }
                // Legs
                for (let side = -1; side <= 1; side += 2) {
                    const leg = new THREE.Mesh(
                        new THREE.BoxGeometry(0.3, 0.7, 0.3),
                        new THREE.MeshLambertMaterial({ color: bodyColor })
                    );
                    leg.position.set(side * 0.25, 0.35, 0);
                    group.add(leg);
                }
                break;
            }
        }
    },

    /**
     * Create a health bar billboard.
     */
    _createHealthBar(isBoss) {
        const group = new THREE.Group();
        const width = isBoss ? 1.5 : 0.8;
        const height = 0.08;

        // Background
        const bgGeo = new THREE.PlaneGeometry(width, height);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
        const bg = new THREE.Mesh(bgGeo, bgMat);
        group.add(bg);

        // Fill
        const fillGeo = new THREE.PlaneGeometry(width - 0.02, height - 0.02);
        const fillMat = new THREE.MeshBasicMaterial({ color: 0xFF1744, side: THREE.DoubleSide });
        const fill = new THREE.Mesh(fillGeo, fillMat);
        fill.position.z = 0.001; // In front of bg
        group.add(fill);

        return group;
    },

    /**
     * Update all enemies each frame.
     */
    update(dt, time, playerX, playerY, playerZ) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive) {
                // Fade out dead enemies
                enemy.stateTimer -= dt;
                if (enemy.stateTimer <= 0) {
                    enemy.mesh.parent.remove(enemy.mesh);
                    this.enemies.splice(i, 1);
                }
                continue;
            }

            enemy.animTime += dt;
            enemy.attackCooldownTimer = Math.max(0, enemy.attackCooldownTimer - dt);

            // Distance to player
            const dx = playerX - enemy.x;
            const dz = playerZ - enemy.z;
            const distToPlayer = Math.sqrt(dx * dx + dz * dz);

            // State machine
            switch (enemy.state) {
                case 'patrol':
                    this._updatePatrol(enemy, dt);
                    // Transition to chase if player is close
                    if (distToPlayer < enemy.typeDef.chaseRange) {
                        enemy.state = 'chase';
                    }
                    break;

                case 'chase':
                    this._updateChase(enemy, dt, playerX, playerZ);
                    // Transition to attack if close enough
                    if (distToPlayer < enemy.typeDef.attackRange) {
                        enemy.state = 'attack';
                    }
                    // Return to patrol if player is far
                    else if (distToPlayer > enemy.typeDef.chaseRange * 1.5) {
                        enemy.state = 'patrol';
                    }
                    break;

                case 'attack':
                    this._updateAttack(enemy, dt, playerX, playerZ, distToPlayer);
                    // Return to chase if player moved away
                    if (distToPlayer > enemy.typeDef.attackRange * 1.5) {
                        enemy.state = 'chase';
                    }
                    break;

                case 'hurt':
                    enemy.stateTimer -= dt;
                    if (enemy.stateTimer <= 0) {
                        enemy.state = 'chase'; // Aggro after being hit
                    }
                    break;
            }

            // Apply movement with basic collision
            this._applyMovement(enemy, dt);

            // Animate
            this._animate(enemy, time);

            // Update mesh position
            enemy.mesh.position.set(enemy.x, enemy.y + enemy.typeDef.height / 2, enemy.z);

            // Face toward movement direction or player when chasing
            if (enemy.state === 'chase' || enemy.state === 'attack') {
                enemy.mesh.rotation.y = Math.atan2(dx, dz);
            } else if (Math.abs(enemy.vx) > 0.1 || Math.abs(enemy.vz) > 0.1) {
                enemy.mesh.rotation.y = Math.atan2(enemy.vx, enemy.vz);
            }

            // Billboard health bar toward camera
            if (enemy.healthBarGroup) {
                enemy.healthBarGroup.lookAt(
                    Player.camera.position.x,
                    enemy.healthBarGroup.getWorldPosition(this._tempVec).y,
                    Player.camera.position.z
                );
            }
        }
    },

    /**
     * Patrol: wander around spawn point.
     */
    _updatePatrol(enemy, dt) {
        // Pick a new patrol target when close to current target
        const dxTarget = enemy.patrolTargetX - enemy.x;
        const dzTarget = enemy.patrolTargetZ - enemy.z;
        const distToTarget = Math.sqrt(dxTarget * dxTarget + dzTarget * dzTarget);

        if (distToTarget < 0.5) {
            enemy.patrolWait -= dt;
            enemy.vx *= 0.8;
            enemy.vz *= 0.8;
            if (enemy.patrolWait <= 0) {
                // Pick new random target within patrol radius
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * enemy.typeDef.patrolRadius;
                enemy.patrolTargetX = enemy.spawnX + Math.cos(angle) * dist;
                enemy.patrolTargetZ = enemy.spawnZ + Math.sin(angle) * dist;
                enemy.patrolWait = 1.0 + Math.random() * 2.0;
            }
        } else {
            // Move toward target
            const speed = enemy.typeDef.speed * 0.5; // Slower when patrolling
            enemy.vx = (dxTarget / distToTarget) * speed;
            enemy.vz = (dzTarget / distToTarget) * speed;
        }
    },

    /**
     * Chase: move directly toward the player.
     */
    _updateChase(enemy, dt, playerX, playerZ) {
        const dx = playerX - enemy.x;
        const dz = playerZ - enemy.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.5) {
            enemy.vx = (dx / dist) * enemy.typeDef.speed;
            enemy.vz = (dz / dist) * enemy.typeDef.speed;
        }
    },

    /**
     * Attack: face player and deal damage on cooldown.
     */
    _updateAttack(enemy, dt, playerX, playerZ, distToPlayer) {
        enemy.vx *= 0.8;
        enemy.vz *= 0.8;

        if (enemy.attackCooldownTimer <= 0 && distToPlayer < enemy.typeDef.attackRange) {
            // Deal damage to player
            Player.takeDamage(enemy.typeDef.damage);
            enemy.attackCooldownTimer = enemy.typeDef.attackCooldown;

            // Visual feedback: lunge briefly
            const dx = playerX - enemy.x;
            const dz = playerZ - enemy.z;
            const dist = Math.sqrt(dx * dx + dz * dz) || 1;
            enemy.vx = (dx / dist) * 3;
            enemy.vz = (dz / dist) * 3;
        }
    },

    /**
     * Apply movement with world block collision.
     */
    _applyMovement(enemy, dt) {
        const newX = enemy.x + enemy.vx * dt;
        const newZ = enemy.z + enemy.vz * dt;
        const r = enemy.typeDef.radius;
        const h = enemy.typeDef.height;

        // X collision
        if (!World.checkBlockCollision(newX, enemy.y, enemy.z, r, h)) {
            enemy.x = newX;
        } else {
            enemy.vx = -enemy.vx * 0.5; // Bounce off walls
        }

        // Z collision
        if (!World.checkBlockCollision(enemy.x, enemy.y, newZ, r, h)) {
            enemy.z = newZ;
        } else {
            enemy.vz = -enemy.vz * 0.5;
        }

        // Gravity / ground snap
        const groundY = World.getGroundHeight(enemy.x, enemy.z, r, enemy.y + 1);
        if (groundY > -Infinity) {
            if (enemy.typeDef.floats) {
                enemy.y = groundY + 0.5; // Float above ground
            } else {
                enemy.y = groundY;
            }
        }
    },

    /**
     * Animate enemies (bob, walk cycle etc).
     */
    _animate(enemy, time) {
        const t = enemy.animTime;

        // Hover/bob
        if (enemy.typeDef.floats) {
            enemy.mesh.position.y += Math.sin(t * 2) * 0.15;
        } else {
            // Walk bob when moving
            if (enemy.state === 'chase' || enemy.state === 'patrol') {
                const speed = Math.sqrt(enemy.vx * enemy.vx + enemy.vz * enemy.vz);
                if (speed > 0.3) {
                    enemy.mesh.position.y += Math.abs(Math.sin(t * 8)) * 0.05;
                }
            }
        }

        // Attack lunge visual
        if (enemy.state === 'attack' && enemy.attackCooldownTimer > enemy.typeDef.attackCooldown * 0.7) {
            enemy.mesh.rotation.x = Math.sin(t * 15) * 0.2;
        } else {
            enemy.mesh.rotation.x = 0;
        }

        // Hurt flash (red tint)
        if (enemy.state === 'hurt') {
            const flash = Math.sin(t * 20) > 0;
            enemy.mesh.traverse(child => {
                if (child.isMesh && child.material && !child.material._isHealthBar) {
                    if (child.material._origColor === undefined) {
                        child.material._origColor = child.material.color.getHex();
                    }
                    child.material.color.setHex(flash ? 0xFF0000 : child.material._origColor);
                }
            });
        }
    },

    /**
     * Take damage on an enemy (called from Player attack).
     * Returns true if enemy died.
     */
    damageEnemy(enemy, amount) {
        if (!enemy.isAlive) return false;

        enemy.health -= amount;

        // Update health bar
        const ratio = Math.max(0, enemy.health / enemy.maxHealth);
        if (enemy.healthBarFill) {
            enemy.healthBarFill.scale.x = ratio;
            enemy.healthBarFill.position.x = -(1 - ratio) * 0.2;
            // Color: green > yellow > red
            if (ratio > 0.5) {
                enemy.healthBarFill.material.color.setHex(0x4CAF50);
            } else if (ratio > 0.25) {
                enemy.healthBarFill.material.color.setHex(0xFFEB3B);
            } else {
                enemy.healthBarFill.material.color.setHex(0xFF1744);
            }
        }

        if (enemy.health <= 0) {
            // Die
            enemy.isAlive = false;
            enemy.state = 'dead';
            enemy.stateTimer = 1.0; // Fade time

            // Death effect: scale down and fade
            this._deathAnimation(enemy);
            return true;
        } else {
            // Hurt state: brief stun
            enemy.state = 'hurt';
            enemy.stateTimer = 0.3;
            // Knockback away from player
            const dx = enemy.x - Player.x;
            const dz = enemy.z - Player.z;
            const dist = Math.sqrt(dx * dx + dz * dz) || 1;
            enemy.vx = (dx / dist) * 5;
            enemy.vz = (dz / dist) * 5;

            return false;
        }
    },

    /**
     * Death animation: shrink and fade.
     */
    _deathAnimation(enemy) {
        const startScale = enemy.mesh.scale.x;
        const startTime = performance.now();
        const duration = 800;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const scale = startScale * (1 - progress);
            enemy.mesh.scale.set(scale, scale, scale);
            enemy.mesh.position.y += 0.01;
            enemy.mesh.rotation.y += 0.1;

            // Fade opacity
            enemy.mesh.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 1 - progress;
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    },

    /**
     * Check if player's attack hits any enemies.
     * Called when player swings sword.
     */
    checkPlayerAttack(playerX, playerY, playerZ, playerRotX, attackRange) {
        const attackDir = new THREE.Vector3(
            -Math.sin(playerRotX),
            0,
            -Math.cos(playerRotX)
        );

        let hitAny = false;
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;

            // Distance check
            const dx = enemy.x - playerX;
            const dz = enemy.z - playerZ;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist > attackRange + enemy.typeDef.radius) continue;

            // Angle check: is enemy roughly in front of player? (120 degree cone)
            const toEnemy = new THREE.Vector3(dx, 0, dz).normalize();
            const dot = attackDir.dot(toEnemy);
            if (dot < 0.3) continue; // Not in front

            // Hit!
            this.damageEnemy(enemy, 1);
            hitAny = true;
        }
        return hitAny;
    },

    /**
     * Check if player is touching any enemy (contact damage).
     */
    checkContactDamage(playerX, playerY, playerZ, playerRadius) {
        const now = performance.now() / 1000;
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            if (now - enemy.lastDamageTime < 1.0) continue; // 1s damage immunity

            const dx = playerX - enemy.x;
            const dz = playerZ - enemy.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const minDist = playerRadius + enemy.typeDef.radius;

            if (dist < minDist) {
                const dy = Math.abs(playerY - enemy.y);
                if (dy < enemy.typeDef.height + 0.5) {
                    enemy.lastDamageTime = now;
                    return enemy.typeDef.damage;
                }
            }
        }
        return 0;
    },

    /**
     * Clear all enemies (called on level load).
     */
    clear(scene) {
        for (const enemy of this.enemies) {
            if (enemy.mesh.parent) {
                enemy.mesh.parent.remove(enemy.mesh);
            }
        }
        this.enemies = [];
    }
};
