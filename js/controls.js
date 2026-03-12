export class MobileControls {
    constructor() {
        this.joystickPos = { x: 0, y: 0 };
        this.moveDir = { x: 0, z: 0 };
        this.setupJoystick();
    }

    setupJoystick() {
        const zone = document.getElementById('joystick-zone');
        zone.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const rect = zone.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Hitung jarak dari pusat joystick
            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const maxDist = rect.width / 2;

            if (dist > maxDist) {
                dx *= maxDist / dist;
                dy *= maxDist / dist;
            }

            this.moveDir.x = dx / maxDist;
            this.moveDir.z = dy / maxDist;
        });

        zone.addEventListener('touchend', () => {
            this.moveDir = { x: 0, z: 0 };
        });
    }
}
