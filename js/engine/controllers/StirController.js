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
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        this.startMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.startMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.lastPosition.copy(this.startMouse);
        this.stirCount = obj.properties.stirCount || 0;
        this.totalDistance = 0;
        
        if (!obj.originalRotation) {
            obj.originalRotation = obj.mesh.rotation.clone();
        }
    }

    update(event) {
        if (!this.activeObject) return;
        
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        const currentMouse = new THREE.Vector2();
        currentMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        currentMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        const deltaX = currentMouse.x - this.lastPosition.x;
        const deltaY = currentMouse.y - this.lastPosition.y;
        const distance = currentMouse.distanceTo(this.lastPosition);
        this.totalDistance += distance;
        
        if (distance > 0.01) {
            const angle = Math.atan2(deltaY, deltaX);
            const rotationSpeed = distance * 2;
            
            this.activeObject.mesh.rotation.y += rotationSpeed;
            
            const tiltAmount = Math.min(distance * 0.5, 0.1);
            this.activeObject.mesh.rotation.x = Math.sin(angle) * tiltAmount;
            this.activeObject.mesh.rotation.z = Math.cos(angle) * tiltAmount;
        }
        
        if (this.totalDistance >= this.minStirDistance) {
            this.stirCount++;
            this.activeObject.properties.stirCount = this.stirCount;
            this.totalDistance = 0;
        }
        
        this.lastPosition.copy(currentMouse);
    }

    end() {
        if (this.activeObject) {
            this.activeObject.properties.stirCount = this.stirCount;
            
            if (this.stirCount > 0 && this.activeObject.properties.isContainer) {
                if (this.engine.markReactionReady) {
                    this.engine.markReactionReady(this.activeObject);
                }
            }
            
            if (this.activeObject.originalRotation) {
                this.activeObject.mesh.rotation.x = this.activeObject.originalRotation.x;
                this.activeObject.mesh.rotation.z = this.activeObject.originalRotation.z;
            }
        }
        this.activeObject = null;
        this.stirCount = 0;
        this.totalDistance = 0;
    }
}

