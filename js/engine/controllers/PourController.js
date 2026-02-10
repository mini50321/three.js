import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class PourController {
    constructor(engine) {
        this.engine = engine;
        this.activeObject = null;
        this.targetObject = null;
        this.startMouse = new THREE.Vector2();
        this.startRotation = new THREE.Euler();
        this.pourRate = 0;
        this.isPouring = false;
    }

    start(obj, event) {
        if ((!obj.interactions.canPour && !obj.properties.canPour) || !obj.properties.isContainer) return;
        
        this.activeObject = obj;
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        this.startMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.startMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.startRotation.copy(obj.mesh.rotation);
        
        if (obj.properties.contents.length === 0 && obj.properties.volume > 0) {
            obj.properties.contents.push({ type: 'water', volume: obj.properties.volume });
        } else if (obj.properties.contents.length === 0) {
            obj.properties.contents.push({ type: 'water', volume: 500 });
            obj.properties.volume = 500;
        }
        
        this.findPourTarget();
    }

    findPourTarget() {
        const activePos = this.activeObject.mesh.position;
        let closest = null;
        let minDistance = Infinity;
        
        for (const [name, obj] of this.engine.objects) {
            if (obj === this.activeObject || !obj.properties.isContainer) continue;
            
            const distance = activePos.distanceTo(obj.mesh.position);
            if (distance < 2 && distance < minDistance) {
                minDistance = distance;
                closest = obj;
            }
        }
        
        this.targetObject = closest;
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
            this.startRotation.x + deltaY * Math.PI / 2,
            0,
            Math.PI / 2
        );
        const tiltZ = THREE.MathUtils.clamp(
            this.startRotation.z - deltaX * Math.PI / 4,
            -Math.PI / 4,
            Math.PI / 4
        );
        
        this.activeObject.mesh.rotation.x = tiltX;
        this.activeObject.mesh.rotation.z = tiltZ;
        
        if (this.engine.physicsEnabled && this.activeObject.physicsBody && this.engine.physicsManager) {
            const quaternion = new THREE.Quaternion().setFromEuler(this.activeObject.mesh.rotation);
            this.engine.physicsManager.setBodyRotation(this.activeObject.physicsBody, quaternion);
        }
        
        const tiltAngle = Math.abs(tiltX) + Math.abs(tiltZ);
        if (tiltAngle > 0.3 && this.activeObject.properties.contents.length > 0) {
            this.isPouring = true;
            this.pourRate = tiltAngle * 0.5;
            this.transferContents();
        } else {
            this.isPouring = false;
            this.pourRate = 0;
        }
    }

    transferContents() {
        if (!this.targetObject || this.activeObject.properties.contents.length === 0) return;
        
        const transferAmount = this.pourRate * 0.1;
        const sourceContents = this.activeObject.properties.contents;
        
        if (sourceContents.length > 0) {
            const content = sourceContents[0];
            const transferVolume = Math.min(transferAmount, content.volume);
            
            if (transferVolume > 0) {
                content.volume -= transferVolume;
                
                if (content.volume <= 0) {
                    sourceContents.shift();
                }
                
                const targetVolume = this.engine.measurements.volume[this.targetObject.name] || 0;
                const newVolume = targetVolume + transferVolume;
                
                if (newVolume <= (this.targetObject.properties.capacity || 1000)) {
                    if (!this.targetObject.properties.contents.find(c => c.type === content.type)) {
                        this.targetObject.properties.contents.push({
                            type: content.type,
                            volume: transferVolume
                        });
                    } else {
                        const existing = this.targetObject.properties.contents.find(c => c.type === content.type);
                        existing.volume += transferVolume;
                    }
                    
                    if (this.engine.checkChemicalReaction && this.engine.canReactionProceed) {
                        if (this.engine.canReactionProceed(this.targetObject)) {
                            const reaction = this.engine.checkChemicalReaction(this.targetObject);
                            if (reaction) {
                                this.engine.processChemicalReaction(this.targetObject, reaction);
                            }
                        }
                    }
                }
            }
        }
        
        this.engine.measurements.volume[this.activeObject.name] = this.engine.calculateVolume(this.activeObject);
        this.engine.measurements.volume[this.targetObject.name] = this.engine.calculateVolume(this.targetObject);
        
        if (this.engine.updateLiquidMesh) {
            this.engine.updateLiquidMesh(this.activeObject);
            this.engine.updateLiquidMesh(this.targetObject);
        }
    }

    end() {
        if (this.activeObject && this.engine.physicsEnabled && this.activeObject.physicsBody && this.engine.physicsManager) {
            const quaternion = new THREE.Quaternion().setFromEuler(this.activeObject.mesh.rotation);
            this.engine.physicsManager.setBodyRotation(this.activeObject.physicsBody, quaternion);
        }
        this.activeObject = null;
        this.targetObject = null;
        this.isPouring = false;
        this.pourRate = 0;
    }
}

