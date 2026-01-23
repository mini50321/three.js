import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { DragController } from './controllers/DragController.js';
import { TiltController } from './controllers/TiltController.js';
import { PourController } from './controllers/PourController.js';
import { HeatController } from './controllers/HeatController.js';
import { StirController } from './controllers/StirController.js';

export class ExperimentEngine {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config || {};
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.objects = new Map();
        this.interactions = new Map();
        this.activeController = null;
        this.tableSurface = null;
        this.tableBounds = null;
        this.particleSystems = new Map();
        this.effects = new Map();
        this.measurements = {
            volume: {},
            mass: {},
            time: Date.now(),
            temperature: {}
        };
        this.currentStep = 0;
        this.stepValidations = [];
        this.score = 0;
        this.maxScore = 0;
        this.feedback = [];
        this.stepHistory = [];
        this.isRunning = false;
        
        this.init();
    }

    async init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        await this.loadTable();
        await this.loadModels();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);
    }

    async loadTable() {
        const tablePath = this.config.tableModel || 'assets/models/Table1.glb';
        const loader = new GLTFLoader();
        
        try {
            const gltf = await loader.loadAsync(tablePath);
            const table = gltf.scene;
            
            table.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            const box = new THREE.Box3().setFromObject(table);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const minY = box.min.y;
            const maxY = box.max.y;
            
            this.tableSurface = table;
            this.scene.add(table);
            
            const tableTopY = maxY;
            
            this.tableBounds = {
                minX: box.min.x,
                maxX: box.max.x,
                minZ: box.min.z,
                maxZ: box.max.z,
                y: tableTopY
            };
            
            return true;
        } catch (error) {
            console.warn('Failed to load table model, using default:', error);
            this.createDefaultTable();
            return false;
        }
    }

    createDefaultTable() {
        const tableConfig = this.config.table || { width: 10, height: 0.1, depth: 10, y: 0 };
        
        const tableGeometry = new THREE.BoxGeometry(tableConfig.width, tableConfig.height, tableConfig.depth);
        const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        this.tableSurface = new THREE.Mesh(tableGeometry, tableMaterial);
        this.tableSurface.position.set(0, tableConfig.y, 0);
        this.tableSurface.receiveShadow = true;
        this.scene.add(this.tableSurface);

        this.tableBounds = {
            minX: -tableConfig.width / 2,
            maxX: tableConfig.width / 2,
            minZ: -tableConfig.depth / 2,
            maxZ: tableConfig.depth / 2,
            y: tableConfig.y + tableConfig.height / 2
        };
    }

    setupCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 20;
        this.controls.enablePan = true;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.4);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
    }

    async loadModels() {
        if (!this.config.models || this.config.models.length === 0) return;

        const loader = new GLTFLoader();
        
        for (const modelConfig of this.config.models) {
            const modelPath = typeof modelConfig === 'string' ? modelConfig : modelConfig.path;
            const modelName = typeof modelConfig === 'string' ? this.extractModelName(modelPath) : (modelConfig.name || this.extractModelName(modelPath));
            
            if (modelName.toLowerCase().includes('table')) {
                continue;
            }
            
            let modelProps = typeof modelConfig === 'object' ? modelConfig.properties || {} : {};
                
                const lowerName = modelName.toLowerCase();
                if (lowerName.includes('beaker') || lowerName.includes('flask') || lowerName.includes('conical') || lowerName.includes('bottle')) {
                    if (modelProps.isContainer === undefined) modelProps.isContainer = true;
                    if (modelProps.capacity === undefined) modelProps.capacity = 1000;
                    if (modelProps.canPour === undefined) modelProps.canPour = true;
                    if (modelProps.canHeat === undefined) modelProps.canHeat = true;
                }
            
            try {
                const gltf = await loader.loadAsync(modelPath);
                const model = gltf.scene;
                
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const minY = box.min.y;
                
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                const tableTopY = this.tableBounds.y;
                const beakerBottomOffset = model.position.y - minY;
                const beakerY = tableTopY + beakerBottomOffset;
                
                const initialPosition = modelConfig.position ? 
                    new THREE.Vector3(modelConfig.position.x || 0, modelConfig.position.y || beakerY, modelConfig.position.z || 0) :
                    new THREE.Vector3(0, beakerY, 0);
                
                model.position.copy(initialPosition);
                
                this.objects.set(modelName, {
                    mesh: model,
                    name: modelName,
                    originalPosition: initialPosition.clone(),
                    originalRotation: model.rotation.clone(),
                    originalScale: model.scale.clone(),
                    boundingBox: box,
                    size: size,
                    center: center,
                    properties: {
                        volume: modelProps.volume || 0,
                        mass: modelProps.mass || 0,
                        temperature: modelProps.temperature || 20,
                        contents: modelProps.contents || [],
                        isContainer: modelProps.isContainer || false,
                        capacity: modelProps.capacity || 0,
                        canHeat: modelProps.canHeat !== false,
                        canPour: modelProps.canPour !== false
                    },
                    interactions: {
                        draggable: modelProps.draggable !== false,
                        tiltable: modelProps.tiltable !== false,
                        heatable: modelProps.canHeat !== false,
                        canPour: modelProps.canPour !== false
                    }
                });
                
                this.scene.add(model);
            } catch (error) {
                console.error(`Failed to load model ${modelPath}:`, error);
            }
        }
        
        this.setupInteractions();
    }

    setupInteractions() {
        this.interactions.set('drag', new DragController(this));
        this.interactions.set('tilt', new TiltController(this));
        this.interactions.set('pour', new PourController(this));
        this.interactions.set('heat', new HeatController(this));
        this.interactions.set('stir', new StirController(this));
        
        this.renderer.domElement.style.cursor = 'pointer';
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e), { passive: false });
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: false });
        this.renderer.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e), { passive: false });
        this.renderer.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.renderer.domElement.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.renderer.domElement.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    }

    extractModelName(path) {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace('.glb', '').replace('.gltf', '');
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.updatePhysics();
        this.renderer.render(this.scene, this.camera);
    }

    updatePhysics() {
        for (const [name, obj] of this.objects) {
            this.constrainToTable(obj);
            
            if (obj.properties.temperature > 20) {
                obj.properties.temperature -= 0.05;
            }
            
            this.updateEffects(obj);
            this.updateMeasurements(obj);
        }
        
        this.updateParticles();
    }

    constrainToTable(obj) {
        if (!this.tableBounds || !obj.interactions.draggable) return;
        
        const box = new THREE.Box3().setFromObject(obj.mesh);
        const size = box.getSize(new THREE.Vector3());
        const minY = box.min.y;
        const position = obj.mesh.position;
        
        const tableTopY = this.tableBounds.y;
        const beakerBottomOffset = position.y - minY;
        const minAllowedY = tableTopY + beakerBottomOffset;
        
        if (position.y < minAllowedY) {
            position.y = minAllowedY;
        }
        
        const halfWidth = size.x / 2;
        const halfDepth = size.z / 2;
        
        if (position.x - halfWidth < this.tableBounds.minX) {
            position.x = this.tableBounds.minX + halfWidth;
        }
        if (position.x + halfWidth > this.tableBounds.maxX) {
            position.x = this.tableBounds.maxX - halfWidth;
        }
        
        if (position.z - halfDepth < this.tableBounds.minZ) {
            position.z = this.tableBounds.minZ + halfDepth;
        }
        if (position.z + halfDepth > this.tableBounds.maxZ) {
            position.z = this.tableBounds.maxZ - halfDepth;
        }
    }

    checkCollision(obj1, obj2) {
        const box1 = new THREE.Box3().setFromObject(obj1.mesh);
        const box2 = new THREE.Box3().setFromObject(obj2.mesh);
        return box1.intersectsBox(box2);
    }

    updateEffects(obj) {
        if (obj.properties.temperature > 100 && !this.effects.has(obj.name + '_boiling')) {
            this.createBoilingEffect(obj);
        }
        if (obj.properties.temperature > 80 && !this.effects.has(obj.name + '_smoke')) {
            this.createSmokeEffect(obj);
        }
    }

    createBoilingEffect(obj) {
        const effect = {
            type: 'boiling',
            particles: [],
            active: true
        };
        
        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
            );
            particle.position.copy(obj.mesh.position);
            particle.position.y += 0.5;
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.2 + 0.1,
                (Math.random() - 0.5) * 0.1
            );
            this.scene.add(particle);
            effect.particles.push(particle);
        }
        
        this.effects.set(obj.name + '_boiling', effect);
    }

    createSmokeEffect(obj) {
        const effect = {
            type: 'smoke',
            particles: [],
            active: true
        };
        
        for (let i = 0; i < 15; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.4 })
            );
            particle.position.copy(obj.mesh.position);
            particle.position.y += 0.3;
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.05,
                Math.random() * 0.1 + 0.05,
                (Math.random() - 0.5) * 0.05
            );
            this.scene.add(particle);
            effect.particles.push(particle);
        }
        
        this.effects.set(obj.name + '_smoke', effect);
    }

    updateParticles() {
        for (const [key, effect] of this.effects) {
            if (!effect.active) continue;
            
            effect.particles.forEach(particle => {
                particle.position.add(particle.velocity);
                particle.material.opacity *= 0.98;
                
                if (particle.material.opacity < 0.01) {
                    particle.position.y = -1000;
                    particle.velocity.multiplyScalar(0);
                }
            });
        }
    }

    updateMeasurements(obj) {
        if (obj.properties.isContainer) {
            const volume = this.calculateVolume(obj);
            this.measurements.volume[obj.name] = volume;
        }
        
        this.measurements.temperature[obj.name] = obj.properties.temperature;
        this.measurements.time = (Date.now() - this.measurements.time) / 1000;
    }

    calculateVolume(obj) {
        if (!obj.properties.isContainer) return 0;
        
        let totalVolume = 0;
        obj.properties.contents.forEach(content => {
            totalVolume += content.volume || 0;
        });
        
        return Math.min(totalVolume, obj.properties.capacity || 1000);
    }

    onMouseDown(event) {
        if (event.button !== 0) return;
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const allMeshes = [];
        for (const [name, obj] of this.objects) {
            obj.mesh.traverse((child) => {
                if (child.isMesh) {
                    allMeshes.push(child);
                }
            });
        }
        const intersects = this.raycaster.intersectObjects(allMeshes, true);
        
        if (intersects.length > 0) {
            const clickedObject = this.findObjectByMesh(intersects[0].object);
            if (clickedObject) {
                console.log('Clicked object:', clickedObject.name, 'draggable:', clickedObject.interactions.draggable, 'tiltable:', clickedObject.interactions.tiltable);
                event.preventDefault();
                event.stopPropagation();
                this.handleInteractionStart(clickedObject, event);
            } else {
                console.log('Object found but not in registry');
            }
        } else {
            console.log('No intersection found, mouse:', this.mouse);
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        if (this.activeController) {
            event.preventDefault();
            this.activeController.update(event);
        }
    }

    onMouseUp(event) {
        if (this.activeController) {
            this.activeController.end();
            this.activeController = null;
            this.controls.enabled = true;
        }
    }

    onTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.onMouseDown(mouseEvent);
    }

    onTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.onMouseMove(mouseEvent);
    }

    onTouchEnd(event) {
        event.preventDefault();
        this.onMouseUp(event);
    }

    findObjectByMesh(mesh) {
        for (const [name, obj] of this.objects) {
            let found = false;
            obj.mesh.traverse((child) => {
                if (child === mesh) found = true;
            });
            if (found) return obj;
        }
        return null;
    }

    handleInteractionStart(obj, event) {
        console.log('handleInteractionStart', obj.name, this.isRunning, obj.interactions);
        
        if (this.isRunning) {
            const currentStep = this.config.steps?.[this.currentStep];
            if (currentStep) {
                if (obj.name !== currentStep.equipment) {
                    this.addFeedback(`Please use ${currentStep.equipment} for this step.`);
                    return;
                }
                
                const action = currentStep.action;
                let controller = null;
                
                if (action === 'tilt' && obj.interactions.tiltable) {
                    controller = this.interactions.get('tilt');
                } else if (action === 'drag' && obj.interactions.draggable) {
                    controller = this.interactions.get('drag');
                } else if (action === 'pour' && (obj.properties.isContainer || obj.properties.canPour)) {
                    controller = this.interactions.get('pour');
                } else if (action === 'heat' && obj.interactions.heatable) {
                    controller = this.interactions.get('heat');
                } else if (action === 'stir') {
                    controller = this.interactions.get('stir');
                }
                
                if (controller) {
                    this.controls.enabled = false;
                    this.activeController = controller;
                    controller.start(obj, event);
                    return;
                }
            }
        }
        
        if (obj.interactions.draggable) {
            this.controls.enabled = false;
            this.activeController = this.interactions.get('drag');
            if (this.activeController) {
                this.activeController.start(obj, event);
            }
        } else if (obj.interactions.tiltable) {
            this.controls.enabled = false;
            this.activeController = this.interactions.get('tilt');
            if (this.activeController) {
                this.activeController.start(obj, event);
            }
        }
    }

    getObject(name) {
        return this.objects.get(name);
    }

    getAllObjects() {
        return Array.from(this.objects.values());
    }

    addInteraction(interaction) {
        this.interactions.set(interaction.type, interaction);
    }

    validateStep(stepIndex) {
        if (!this.config.steps || stepIndex >= this.config.steps.length) {
            return { valid: false, message: 'Invalid step' };
        }

        const step = this.config.steps[stepIndex];
        const validation = this.checkStepConditions(step);
        
        if (validation.valid) {
            this.currentStep++;
            this.score += validation.points || 0;
            this.stepHistory.push({
                stepIndex,
                step,
                score: validation.points || 0,
                timestamp: Date.now()
            });
        } else {
            this.addFeedback(validation.message);
        }

        return validation;
    }

    checkStepConditions(step) {
        const equipment = this.getObject(step.equipment);
        if (!equipment) {
            return { valid: false, message: `Equipment ${step.equipment} not found` };
        }

        if (step.rules) {
            return this.validateRules(equipment, step);
        }

        switch (step.action) {
            case 'tilt':
                return this.validateTilt(equipment, step);
            case 'pour':
                return this.validatePour(equipment, step);
            case 'heat':
                return this.validateHeat(equipment, step);
            case 'stir':
                return this.validateStir(equipment, step);
            case 'measure':
                return this.validateMeasure(equipment, step);
            default:
                return { valid: false, message: `Unknown action: ${step.action}` };
        }
    }

    validateRules(equipment, step) {
        const rules = step.rules;
        let allValid = true;
        const errors = [];
        let totalPoints = 0;

        if (rules.conditions) {
            for (const condition of rules.conditions) {
                const result = this.checkCondition(equipment, condition);
                if (!result.valid) {
                    allValid = false;
                    errors.push(result.message);
                } else {
                    totalPoints += result.points || 0;
                }
            }
        }

        if (rules.temperature) {
            const temp = equipment.properties.temperature;
            const target = rules.temperature.target;
            const tolerance = rules.temperature.tolerance || 5;
            
            if (Math.abs(temp - target) > tolerance) {
                allValid = false;
                errors.push(`Temperature should be ${target}°C (±${tolerance}), current: ${temp.toFixed(1)}°C`);
            } else {
                totalPoints += rules.temperature.points || 10;
            }
        }

        if (rules.volume) {
            const volume = this.measurements.volume[equipment.name] || 0;
            const target = rules.volume.target;
            const tolerance = rules.volume.tolerance || 10;
            
            if (Math.abs(volume - target) > tolerance) {
                allValid = false;
                errors.push(`Volume should be ${target}ml (±${tolerance}), current: ${volume.toFixed(1)}ml`);
            } else {
                totalPoints += rules.volume.points || 10;
            }
        }

        if (rules.rotation) {
            const rotation = equipment.mesh.rotation;
            const targetX = rules.rotation.x || 0;
            const targetZ = rules.rotation.z || 0;
            const tolerance = rules.rotation.tolerance || 0.1;
            
            if (Math.abs(rotation.x - targetX) > tolerance || Math.abs(rotation.z - targetZ) > tolerance) {
                allValid = false;
                errors.push(`Rotation angle is incorrect`);
            } else {
                totalPoints += rules.rotation.points || 10;
            }
        }

        return {
            valid: allValid,
            points: totalPoints,
            message: allValid ? step.successMessage || 'Step completed correctly' : errors.join('; ')
        };
    }

    checkCondition(equipment, condition) {
        switch (condition.type) {
            case 'temperature':
                const temp = equipment.properties.temperature;
                if (condition.operator === '>') {
                    return { valid: temp > condition.value, message: condition.message || `Temperature should be above ${condition.value}°C` };
                } else if (condition.operator === '<') {
                    return { valid: temp < condition.value, message: condition.message || `Temperature should be below ${condition.value}°C` };
                } else if (condition.operator === '==') {
                    const tolerance = condition.tolerance || 5;
                    return { valid: Math.abs(temp - condition.value) <= tolerance, message: condition.message || `Temperature should be ${condition.value}°C` };
                }
                break;
            case 'volume':
                const volume = this.measurements.volume[equipment.name] || 0;
                if (condition.operator === '>') {
                    return { valid: volume > condition.value, message: condition.message || `Volume should be above ${condition.value}ml` };
                } else if (condition.operator === '<') {
                    return { valid: volume < condition.value, message: condition.message || `Volume should be below ${condition.value}ml` };
                } else if (condition.operator === '==') {
                    const tolerance = condition.tolerance || 10;
                    return { valid: Math.abs(volume - condition.value) <= tolerance, message: condition.message || `Volume should be ${condition.value}ml` };
                }
                break;
            case 'hasContent':
                return { valid: equipment.properties.contents.length > 0, message: condition.message || 'Container should have contents' };
            case 'empty':
                return { valid: equipment.properties.contents.length === 0, message: condition.message || 'Container should be empty' };
        }
        return { valid: false, message: 'Unknown condition type' };
    }

    validateTilt(equipment, step) {
        const rotation = equipment.mesh.rotation;
        const tiltAngle = Math.abs(rotation.x) + Math.abs(rotation.z);
        const minAngle = step.minAngle || 0.1;
        const maxAngle = step.maxAngle || Math.PI / 2;
        
        if (tiltAngle >= minAngle && tiltAngle <= maxAngle) {
            return { valid: true, points: step.points || 10, message: 'Object tilted correctly' };
        }
        return { valid: false, message: step.errorMessage || 'Object needs to be tilted to the correct angle' };
    }

    validatePour(equipment, step) {
        const rotation = equipment.mesh.rotation;
        const tiltAngle = Math.abs(rotation.x) + Math.abs(rotation.z);
        const minAngle = step.minAngle || 0.5;
        
        if (tiltAngle >= minAngle) {
            return { valid: true, points: step.points || 15, message: 'Pouring action completed' };
        }
        return { valid: false, message: step.errorMessage || 'Tilt more to pour' };
    }

    validateHeat(equipment, step) {
        const targetTemp = step.targetTemperature || 80;
        const tolerance = step.tolerance || 5;
        const currentTemp = equipment.properties.temperature;
        
        if (Math.abs(currentTemp - targetTemp) <= tolerance) {
            return { valid: true, points: step.points || 20, message: 'Heating completed' };
        }
        return { valid: false, message: step.errorMessage || `Continue heating. Target: ${targetTemp}°C, Current: ${currentTemp.toFixed(1)}°C` };
    }

    validateStir(equipment, step) {
        const stirCount = equipment.properties.stirCount || 0;
        const minStirs = step.minStirs || 5;
        
        if (stirCount >= minStirs) {
            return { valid: true, points: step.points || 10, message: 'Stirring action completed' };
        }
        return { valid: false, message: step.errorMessage || `Stir more. Required: ${minStirs}, Current: ${stirCount}` };
    }

    validateMeasure(equipment, step) {
        const measurementType = step.measurementType || 'volume';
        const target = step.targetValue;
        const tolerance = step.tolerance || 10;
        
        let currentValue = 0;
        if (measurementType === 'volume') {
            currentValue = this.measurements.volume[equipment.name] || 0;
        } else if (measurementType === 'temperature') {
            currentValue = this.measurements.temperature[equipment.name] || 20;
        } else if (measurementType === 'mass') {
            currentValue = equipment.properties.mass || 0;
        }
        
        if (Math.abs(currentValue - target) <= tolerance) {
            return { valid: true, points: step.points || 15, message: 'Measurement correct' };
        }
        return { valid: false, message: step.errorMessage || `Measurement incorrect. Target: ${target}, Current: ${currentValue.toFixed(1)}` };
    }

    addFeedback(message) {
        this.feedback.push({
            message,
            timestamp: Date.now(),
            step: this.currentStep
        });
    }

    start() {
        this.isRunning = true;
        this.currentStep = 0;
        this.score = 0;
        this.feedback = [];
        this.stepHistory = [];
        this.measurements.time = Date.now();
        
        if (this.config.steps) {
            this.maxScore = this.config.steps.reduce((sum, step) => sum + (step.points || 10), 0);
        }
    }

    stop() {
        this.isRunning = false;
    }

    getProgress() {
        if (!this.config.steps || this.config.steps.length === 0) return 0;
        return (this.currentStep / this.config.steps.length) * 100;
    }

    getScorePercentage() {
        if (this.maxScore === 0) return 0;
        return (this.score / this.maxScore) * 100;
    }

    getScore() {
        return this.score;
    }

    getFeedback() {
        return this.feedback;
    }

    reset() {
        this.currentStep = 0;
        this.score = 0;
        this.feedback = [];
        this.stepHistory = [];
        this.isRunning = false;
        this.measurements.time = Date.now();
        
        for (const [name, obj] of this.objects) {
            obj.mesh.position.copy(obj.originalPosition);
            obj.mesh.rotation.copy(obj.originalRotation);
            obj.mesh.scale.copy(obj.originalScale);
            obj.properties.temperature = obj.properties.temperature || 20;
            obj.properties.contents = [];
            obj.properties.stirCount = 0;
        }
        
        for (const [key, effect] of this.effects) {
            effect.particles.forEach(particle => {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            });
        }
        this.effects.clear();
    }

    getCurrentStepInfo() {
        if (!this.config.steps || this.currentStep >= this.config.steps.length) {
            return null;
        }
        return this.config.steps[this.currentStep];
    }

    isExperimentComplete() {
        if (!this.config.steps) return false;
        return this.currentStep >= this.config.steps.length;
    }

    destroy() {
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }
}

