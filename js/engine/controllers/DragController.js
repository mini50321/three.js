import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class DragController {
    constructor(engine) {
        this.engine = engine;
        this.activeObject = null;
        this.offset = new THREE.Vector3();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.ray = new THREE.Ray();
    }

    updatePlane() {
        if (this.engine.tableBounds) {
            this.plane.constant = -this.engine.tableBounds.y;
        }
    }

    start(obj, event) {
        if (!obj.interactions.draggable) return;
        
        this.activeObject = obj;
        this.updatePlane();
        
        if (this.engine.physicsEnabled && obj.physicsBody && this.engine.physicsManager) {
            if (!obj.physicsEnabled) {
                obj.physicsEnabled = true;
                obj.physicsBody.type = this.engine.physicsManager.CANNON.Body.DYNAMIC;
                const box = new THREE.Box3().setFromObject(obj.mesh);
                const center = box.getCenter(new THREE.Vector3());
                this.engine.physicsManager.setBodyPosition(obj.physicsBody, center);
                if (obj.centerOffset) {
                    obj.centerOffset = new THREE.Vector3().subVectors(center, obj.mesh.position);
                }
            }
            this.engine.physicsManager.enableBody(obj.physicsBody, false);
        }
        
        const mouse = new THREE.Vector2();
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.engine.raycaster.setFromCamera(mouse, this.engine.camera);
        const intersects = this.engine.raycaster.intersectObject(obj.mesh, true);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.offset.copy(point).sub(obj.mesh.position);
        } else {
            this.offset.set(0, 0, 0);
        }
    }

    update(event) {
        if (!this.activeObject) return;
        
        this.updatePlane();
        
        const mouse = new THREE.Vector2();
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.engine.raycaster.setFromCamera(mouse, this.engine.camera);
        
        const ray = new THREE.Ray();
        ray.origin.copy(this.engine.raycaster.ray.origin);
        ray.direction.copy(this.engine.raycaster.ray.direction);
        
        const intersectionPoint = new THREE.Vector3();
        ray.intersectPlane(this.plane, intersectionPoint);
        
        if (intersectionPoint) {
            const newPosition = intersectionPoint.clone().sub(this.offset);
            if (this.engine.tableBounds) {
                const box = new THREE.Box3().setFromObject(this.activeObject.mesh);
                const minY = box.min.y;
                const bottomOffset = this.activeObject.mesh.position.y - minY;
                const targetY = this.engine.tableBounds.y + bottomOffset;
                
                if (newPosition.y < targetY) {
                    newPosition.y = targetY;
                } else {
                    newPosition.y = Math.max(targetY, newPosition.y);
                }
            }
            
            if (this.engine.physicsEnabled && this.activeObject.physicsBody && this.engine.physicsManager) {
                if (this.activeObject.centerOffset) {
                    const bodyCenter = new THREE.Vector3().addVectors(newPosition, this.activeObject.centerOffset);
                    this.engine.physicsManager.setBodyPosition(this.activeObject.physicsBody, bodyCenter);
                } else {
                    this.engine.physicsManager.setBodyPosition(this.activeObject.physicsBody, newPosition);
                }
                this.activeObject.mesh.position.copy(newPosition);
            } else {
                this.activeObject.mesh.position.copy(newPosition);
            }
        }
    }

    end() {
        if (this.activeObject && this.engine.physicsEnabled && this.activeObject.physicsBody && this.engine.physicsManager) {
            this.activeObject.mesh.updateMatrixWorld(true);
            
            if (this.engine.tableBounds) {
                const box = new THREE.Box3().setFromObject(this.activeObject.mesh);
                const minY = box.min.y;
                const targetMinY = this.engine.tableBounds.y;
                
                if (Math.abs(minY - targetMinY) > 0.01) {
                    const correction = targetMinY - minY;
                    this.activeObject.mesh.position.y += correction;
                    this.activeObject.mesh.updateMatrixWorld(true);
                }
            }
            
            const boxFinal = new THREE.Box3().setFromObject(this.activeObject.mesh);
            const centerWorld = boxFinal.getCenter(new THREE.Vector3());
            const centerOffsetNew = new THREE.Vector3().subVectors(centerWorld, this.activeObject.mesh.position);
            this.activeObject.centerOffset = centerOffsetNew;
            
            this.engine.physicsManager.setBodyPosition(this.activeObject.physicsBody, centerWorld);
            
            const meshQuaternion = new THREE.Quaternion().setFromEuler(this.activeObject.mesh.rotation);
            this.activeObject.physicsBody.quaternion.set(
                meshQuaternion.x,
                meshQuaternion.y,
                meshQuaternion.z,
                meshQuaternion.w
            );
            
            this.activeObject.physicsBody.velocity.set(0, 0, 0);
            this.activeObject.physicsBody.angularVelocity.set(0, 0, 0);
            this.activeObject.justReleased = true;
            
            this.engine.physicsManager.enableBody(this.activeObject.physicsBody, true);
            this.activeObject.physicsBody.wakeUp();
            
            requestAnimationFrame(() => {
                if (this.activeObject) {
                    this.activeObject.justReleased = false;
                }
            });
        }
        this.activeObject = null;
    }
}

