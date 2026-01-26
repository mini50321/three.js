import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class PhysicsManager {
    constructor() {
        this.world = null;
        this.bodies = new Map();
        this.materials = new Map();
        this.contacts = new Map();
        this.gravity = -9.82;
        this.timeStep = 1/60;
        this.maxSubSteps = 3;
        this.quaternionNormalizeSkip = 0;
        this.quaternionNormalizeFast = false;
        this.solverIterations = 10;
        this.broadphase = null;
        this.CANNON = null;
    }

    async init() {
        this.CANNON = await this.loadCannon();
        this.createWorld();
    }

    async loadCannon() {
        // Check if already loaded
        if (window.CANNON) {
            return window.CANNON;
        }

        // Try loading from jsDelivr (using version 0.6.2 which is known to work)
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.min.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                // Wait for CANNON to be available (some CDNs need a moment)
                let attempts = 0;
                const maxAttempts = 50;
                const checkCANNON = setInterval(() => {
                    if (window.CANNON) {
                        clearInterval(checkCANNON);
                        resolve(window.CANNON);
                    } else if (attempts++ >= maxAttempts) {
                        clearInterval(checkCANNON);
                        // Try alternative CDN
                        this.loadCannonFromAlternativeCDN(resolve, reject);
                    }
                }, 100);
            };
            
            script.onerror = () => {
                // Try alternative CDN on error
                this.loadCannonFromAlternativeCDN(resolve, reject);
            };
            
            document.head.appendChild(script);
        });
    }

    loadCannonFromAlternativeCDN(resolve, reject) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/cannon@0.6.2/build/cannon.min.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
            let attempts = 0;
            const maxAttempts = 50;
            const checkCANNON = setInterval(() => {
                if (window.CANNON) {
                    clearInterval(checkCANNON);
                    resolve(window.CANNON);
                } else if (attempts++ >= maxAttempts) {
                    clearInterval(checkCANNON);
                    reject(new Error('CANNON library loaded but window.CANNON is not available. The library may not be compatible with this version.'));
                }
            }, 100);
        };
        
        script.onerror = () => {
            reject(new Error('Failed to load Cannon.js from all CDNs. Please check your internet connection.'));
        };
        
        document.head.appendChild(script);
    }

    createWorld() {
        if (!this.CANNON) return;

        this.world = new this.CANNON.World();
        this.world.gravity.set(0, this.gravity, 0);
        this.world.broadphase = new this.CANNON.NaiveBroadphase();
        this.world.solver.iterations = this.solverIterations;
        this.world.defaultContactMaterial.friction = 0.4;
        this.world.defaultContactMaterial.restitution = 0.3;
        this.world.allowSleep = false;
        this.world.defaultContactMaterial.contactEquationStiffness = 1e8;
        this.world.defaultContactMaterial.contactEquationRelaxation = 3;

        this.createMaterials();
    }

    createMaterials() {
        if (!this.CANNON) return;

        const tableMaterial = new this.CANNON.Material('table');
        tableMaterial.friction = 0.8;
        tableMaterial.restitution = 0.1;

        const objectMaterial = new this.CANNON.Material('object');
        objectMaterial.friction = 0.6;
        objectMaterial.restitution = 0.2;

        const tableObjectContact = new this.CANNON.ContactMaterial(
            tableMaterial,
            objectMaterial,
            {
                friction: 0.7,
                restitution: 0.2
            }
        );
        this.world.addContactMaterial(tableObjectContact);

        const objectObjectContact = new this.CANNON.ContactMaterial(
            objectMaterial,
            objectMaterial,
            {
                friction: 0.6,
                restitution: 0.3,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }
        );
        this.world.addContactMaterial(objectObjectContact);

        this.materials.set('table', tableMaterial);
        this.materials.set('object', objectMaterial);
    }

    createBoxBody(mesh, mass = 1, material = 'object') {
        if (!this.CANNON || !this.world) return null;

        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const halfExtents = new this.CANNON.Vec3(
            size.x / 2,
            size.y / 2,
            size.z / 2
        );

        const shape = new this.CANNON.Box(halfExtents);
        const body = new this.CANNON.Body({ mass: mass });
        body.addShape(shape);
        body.position.copy(mesh.position);
        body.quaternion.copy(mesh.quaternion);

        const mat = this.materials.get(material) || this.materials.get('object');
        body.material = mat;

        this.world.addBody(body);
        return body;
    }

    createCylinderBody(mesh, mass = 1, material = 'object') {
        if (!this.CANNON || !this.world) return null;

        mesh.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, size.z) / 2;
        const height = size.y;
        const center = box.getCenter(new THREE.Vector3());

        const shape = new this.CANNON.Cylinder(
            radius,
            radius,
            height,
            16
        );
        const body = new this.CANNON.Body({ mass: mass });
        
        const quaternion = new this.CANNON.Quaternion();
        quaternion.setFromAxisAngle(new this.CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        body.addShape(shape, new this.CANNON.Vec3(0, 0, 0), quaternion);
        
        body.position.set(
            center.x,
            center.y,
            center.z
        );
        
        const meshQuaternion = new THREE.Quaternion().setFromEuler(mesh.rotation);
        body.quaternion.set(
            meshQuaternion.x,
            meshQuaternion.y,
            meshQuaternion.z,
            meshQuaternion.w
        );

        const mat = this.materials.get(material) || this.materials.get('object');
        body.material = mat;
        body.collisionFilterGroup = 1;
        body.collisionFilterMask = -1;

        this.world.addBody(body);
        return body;
    }

    createSphereBody(mesh, mass = 1, material = 'object') {
        if (!this.CANNON || !this.world) return null;

        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, size.y, size.z) / 2;

        const shape = new this.CANNON.Sphere(radius);
        const body = new this.CANNON.Body({ mass: mass });
        body.addShape(shape);
        body.position.copy(mesh.position);
        body.quaternion.copy(mesh.quaternion);

        const mat = this.materials.get(material) || this.materials.get('object');
        body.material = mat;

        this.world.addBody(body);
        return body;
    }

    createTableBody(tableMesh, tableBounds) {
        if (!this.CANNON || !this.world) return null;

        const shape = new this.CANNON.Box(new this.CANNON.Vec3(
            (tableBounds.maxX - tableBounds.minX) / 2,
            0.1,
            (tableBounds.maxZ - tableBounds.minZ) / 2
        ));

        const body = new this.CANNON.Body({ 
            mass: 0, 
            type: this.CANNON.Body.STATIC,
            material: this.materials.get('table')
        });
        body.addShape(shape);
        body.position.set(
            (tableBounds.minX + tableBounds.maxX) / 2,
            tableBounds.y - 0.05,
            (tableBounds.minZ + tableBounds.maxZ) / 2
        );
        body.collisionFilterGroup = 2;
        body.collisionFilterMask = -1;

        this.world.addBody(body);
        return body;
    }

    addBody(name, body) {
        this.bodies.set(name, body);
    }

    getBody(name) {
        return this.bodies.get(name);
    }

    removeBody(name) {
        const body = this.bodies.get(name);
        if (body && this.world) {
            this.world.removeBody(body);
            this.bodies.delete(name);
        }
    }

    update(deltaTime) {
        if (!this.world) return;

        this.world.step(this.timeStep, deltaTime, this.maxSubSteps);
    }

    syncMeshToBody(mesh, body, centerOffset) {
        if (!mesh || !body) return;

        if (centerOffset) {
            mesh.position.copy(new THREE.Vector3().subVectors(body.position, centerOffset));
        } else {
            mesh.position.copy(body.position);
        }
        mesh.quaternion.copy(body.quaternion);
    }

    syncBodyToMesh(body, mesh) {
        if (!body || !mesh) return;

        body.position.copy(mesh.position);
        body.quaternion.copy(mesh.quaternion);
    }

    setBodyPosition(body, position) {
        if (!body) return;
        body.position.set(position.x, position.y, position.z);
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
    }

    setBodyRotation(body, quaternion) {
        if (!body) return;
        body.quaternion.copy(quaternion);
        body.angularVelocity.set(0, 0, 0);
    }

    applyForce(body, force, point) {
        if (!body) return;
        const cannonPoint = point ? new this.CANNON.Vec3(point.x, point.y, point.z) : body.position;
        const cannonForce = new this.CANNON.Vec3(force.x, force.y, force.z);
        body.applyForce(cannonForce, cannonPoint);
    }

    applyImpulse(body, impulse, point) {
        if (!body) return;
        const cannonPoint = point ? new this.CANNON.Vec3(point.x, point.y, point.z) : body.position;
        const cannonImpulse = new this.CANNON.Vec3(impulse.x, impulse.y, impulse.z);
        body.applyImpulse(cannonImpulse, cannonPoint);
    }

    setGravity(gravity) {
        this.gravity = gravity;
        if (this.world) {
            this.world.gravity.set(0, gravity, 0);
        }
    }

    enableBody(body, enabled) {
        if (!body || !this.CANNON) return;
        if (enabled) {
            body.type = this.CANNON.Body.DYNAMIC;
        } else {
            body.type = this.CANNON.Body.KINEMATIC;
            body.velocity.set(0, 0, 0);
            body.angularVelocity.set(0, 0, 0);
        }
    }

    setBodyMass(body, mass) {
        if (!body) return;
        body.mass = mass;
        body.updateMassProperties();
    }

    getCollisions() {
        const collisions = [];
        for (let i = 0; i < this.world.contacts.length; i++) {
            const contact = this.world.contacts[i];
            if (contact.bi && contact.bj) {
                collisions.push({
                    bodyA: contact.bi,
                    bodyB: contact.bj,
                    contactPoint: contact.ri,
                    normal: contact.ni
                });
            }
        }
        return collisions;
    }

    reset() {
        if (this.world) {
            for (const body of this.world.bodies) {
                this.world.removeBody(body);
            }
        }
        this.bodies.clear();
        this.contacts.clear();
    }
}

