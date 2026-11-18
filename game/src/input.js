export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false, pressed: false };
        this.justPressed = {};
        this.muted = false;
        this.paused = false;

        window.addEventListener('keydown', e => {
            if (!this.keys[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            if (e.code === 'KeyM') {
                this.muted = !this.muted;
            }
            if (e.code === 'KeyP') {
                this.paused = !this.paused;
            }
        });

        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouse.x = (e.clientX - rect.left) * scaleX;
            this.mouse.y = (e.clientY - rect.top) * scaleY;
        });

        canvas.addEventListener('mousedown', e => {
            if (e.button === 0) {
                this.mouse.down = true;
                this.mouse.pressed = true;
            }
        });

        window.addEventListener('mouseup', e => {
            if (e.button === 0) {
                this.mouse.down = false;
            }
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    wasPressed(code) {
        const val = !!this.justPressed[code];
        this.justPressed[code] = false;
        return val;
    }

    clearPressed() {
        this.justPressed = {};
        this.mouse.pressed = false;
    }
}
