import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class TiltController {
    constructor(engine) {
        this.engine = engine;
        this.activeObject = null;
        this.startMouse = new THREE.Vector2();
        this.startRotation = new THREE.Euler();
        this.maxTilt = Math.PI / 2;
    }

    start(obj, event) {
        if (!obj.interactions.tiltable) return;
        
        this.activeObject = obj;
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        this.startMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.startMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.startRotation.copy(obj.mesh.rotation);
    }

    update(event) {
        if (!this.activeObject) return;
        
        const currentMouse = new THREE.Vector2();
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        currentMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        currentMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        const deltaX = currentMouse.x - this.startMouse.x;
        const deltaY = currentMouse.y - this.startMouse.y;
        
        const tiltX = THREE.MathUtils.clamp(
            this.startRotation.x + deltaY * this.maxTilt,
            -this.maxTilt,
            this.maxTilt
        );
        const tiltZ = THREE.MathUtils.clamp(
            this.startRotation.z - deltaX * this.maxTilt,
            -this.maxTilt,
            this.maxTilt
        );
        
        this.activeObject.mesh.rotation.x = tiltX;
        this.activeObject.mesh.rotation.z = tiltZ;
    }

    end() {
        this.activeObject = null;
    }
}

