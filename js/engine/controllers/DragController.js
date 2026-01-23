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
                const beakerBottomOffset = this.activeObject.mesh.position.y - minY;
                newPosition.y = this.engine.tableBounds.y + beakerBottomOffset;
            }
            this.activeObject.mesh.position.copy(newPosition);
        }
    }

    end() {
        this.activeObject = null;
    }
}

