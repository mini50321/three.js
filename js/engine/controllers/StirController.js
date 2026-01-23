import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class StirController {
    constructor(engine) {
        this.engine = engine;
        this.activeObject = null;
        this.startMouse = new THREE.Vector2();
        this.lastPosition = new THREE.Vector2();
        this.stirCount = 0;
        this.minStirDistance = 0.1;
        this.totalDistance = 0;
    }

    start(obj, event) {
        this.activeObject = obj;
        this.startMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.startMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.lastPosition.copy(this.startMouse);
        this.stirCount = obj.properties.stirCount || 0;
        this.totalDistance = 0;
    }

    update(event) {
        if (!this.activeObject) return;
        
        const currentMouse = new THREE.Vector2();
        currentMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        currentMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const distance = currentMouse.distanceTo(this.lastPosition);
        this.totalDistance += distance;
        
        if (this.totalDistance >= this.minStirDistance) {
            this.stirCount++;
            this.activeObject.properties.stirCount = this.stirCount;
            this.totalDistance = 0;
            
            this.animateStir();
        }
        
        this.lastPosition.copy(currentMouse);
    }

    animateStir() {
        if (!this.activeObject) return;
        
        const originalRotation = this.activeObject.mesh.rotation.y;
        let angle = 0;
        const maxAngle = Math.PI / 8;
        
        const animate = () => {
            angle += 0.2;
            if (angle < Math.PI * 2) {
                this.activeObject.mesh.rotation.y = originalRotation + Math.sin(angle) * maxAngle;
                requestAnimationFrame(animate);
            } else {
                this.activeObject.mesh.rotation.y = originalRotation;
            }
        };
        animate();
    }

    end() {
        if (this.activeObject) {
            this.activeObject.properties.stirCount = this.stirCount;
        }
        this.activeObject = null;
        this.stirCount = 0;
        this.totalDistance = 0;
    }
}

