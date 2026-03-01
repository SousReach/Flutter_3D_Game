// ============================================
// controls.js — Touch + D-Pad Controls
// ============================================
// D-Pad buttons for movement (works with emulator mouse)
// Touch camera look on right side of screen

const Controls = {
    // Movement state
    moveX: 0,
    moveZ: 0,
    isMoving: false,

    // Camera look state
    lookDeltaX: 0,
    lookDeltaY: 0,

    // Action states
    jumpPressed: false,
    attackPressed: false,

    // Internal tracking
    _lookTouch: null,

    // D-pad state
    _dpad: { up: false, down: false, left: false, right: false },

    init() {
        const btnJump = document.getElementById('btn-jump');
        const btnAction = document.getElementById('btn-action');
        const dpadUp = document.getElementById('dpad-up');
        const dpadDown = document.getElementById('dpad-down');
        const dpadLeft = document.getElementById('dpad-left');
        const dpadRight = document.getElementById('dpad-right');

        // ============ D-PAD BUTTONS ============
        this._setupDpadButton(dpadUp, 'up');
        this._setupDpadButton(dpadDown, 'down');
        this._setupDpadButton(dpadLeft, 'left');
        this._setupDpadButton(dpadRight, 'right');

        // ============ CAMERA LOOK (touch drag on right side) ============
        let lookActive = false;
        let lastX = 0, lastY = 0;

        // Use both mouse and touch for camera look
        const onLookStart = (x, y, target) => {
            // Don't start look on buttons
            if (target && (target.closest('#dpad') || target.closest('#action-buttons') ||
                target.classList.contains('action-btn') || target.classList.contains('dpad-btn'))) {
                return;
            }
            lookActive = true;
            lastX = x;
            lastY = y;
        };

        const onLookMove = (x, y) => {
            if (!lookActive) return;
            this.lookDeltaX = (x - lastX) * 0.005;
            this.lookDeltaY = (y - lastY) * 0.005;
            lastX = x;
            lastY = y;
        };

        const onLookEnd = () => {
            lookActive = false;
            this.lookDeltaX = 0;
            this.lookDeltaY = 0;
        };

        // Mouse events (for emulator)
        document.addEventListener('mousedown', (e) => {
            onLookStart(e.clientX, e.clientY, e.target);
        });
        document.addEventListener('mousemove', (e) => {
            onLookMove(e.clientX, e.clientY);
        });
        document.addEventListener('mouseup', () => onLookEnd());

        // Touch events (for real device)
        document.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.clientX > window.innerWidth * 0.4 && !this._lookTouch) {
                    const target = document.elementFromPoint(t.clientX, t.clientY);
                    if (target && (target.closest('#action-buttons') || target.classList.contains('action-btn'))) continue;
                    this._lookTouch = { id: t.identifier, lastX: t.clientX, lastY: t.clientY };
                }
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this._lookTouch) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === this._lookTouch.id) {
                    this.lookDeltaX = (t.clientX - this._lookTouch.lastX) * 0.005;
                    this.lookDeltaY = (t.clientY - this._lookTouch.lastY) * 0.005;
                    this._lookTouch.lastX = t.clientX;
                    this._lookTouch.lastY = t.clientY;
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!this._lookTouch) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this._lookTouch.id) {
                    this._lookTouch = null;
                    this.lookDeltaX = 0;
                    this.lookDeltaY = 0;
                }
            }
        });

        // ============ ACTION BUTTONS (touch + mouse) ============
        this._setupActionButton(btnJump, 'jump');
        this._setupActionButton(btnAction, 'attack');
    },

    _setupDpadButton(el, dir) {
        if (!el) return;
        const setDir = (active) => {
            this._dpad[dir] = active;
            this._updateMoveFromDpad();
            el.style.background = active ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.15)';
        };

        // Touch
        el.addEventListener('touchstart', (e) => { e.preventDefault(); setDir(true); }, { passive: false });
        el.addEventListener('touchend', (e) => { e.preventDefault(); setDir(false); }, { passive: false });
        el.addEventListener('touchcancel', () => setDir(false));

        // Mouse (for emulator)
        el.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); setDir(true); });
        el.addEventListener('mouseup', (e) => { e.stopPropagation(); setDir(false); });
        el.addEventListener('mouseleave', () => setDir(false));
    },

    _setupActionButton(el, action) {
        if (!el) return;
        const prop = action === 'jump' ? 'jumpPressed' : 'attackPressed';
        const setAction = (active) => {
            this[prop] = active;
            el.style.background = active ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.15)';
        };

        el.addEventListener('touchstart', (e) => { e.preventDefault(); setAction(true); }, { passive: false });
        el.addEventListener('touchend', () => setAction(false));
        el.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); setAction(true); });
        el.addEventListener('mouseup', (e) => { e.stopPropagation(); setAction(false); });
        el.addEventListener('mouseleave', () => setAction(false));
    },

    _updateMoveFromDpad() {
        this.moveX = 0;
        this.moveZ = 0;
        if (this._dpad.up)    this.moveZ = -1;
        if (this._dpad.down)  this.moveZ = 1;
        if (this._dpad.left)  this.moveX = -1;
        if (this._dpad.right) this.moveX = 1;
        this.isMoving = (this.moveX !== 0 || this.moveZ !== 0);
    },

    // Reset look deltas each frame
    resetLookDelta() {
        this.lookDeltaX = 0;
        this.lookDeltaY = 0;
    }
};
