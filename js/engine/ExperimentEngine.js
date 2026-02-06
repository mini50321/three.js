import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { DragController } from './controllers/DragController.js';
import { TiltController } from './controllers/TiltController.js';
import { PourController } from './controllers/PourController.js';
import { HeatController } from './controllers/HeatController.js';
import { StirController } from './controllers/StirController.js';
import { ScaleController } from './controllers/ScaleController.js';
import { PerformanceManager } from './PerformanceManager.js';
import { PhysicsManager } from './PhysicsManager.js';

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
        this.selectedObject = null;
        this.keyboardTiltSpeed = 0.005;
        this.keysPressed = new Set();
        this.isSwirling = false;
        this.swirlSpeed = 0.15;
        this.swirlTiltAmount = 0.1;
        this.laboratory = null;
        this.tableSurface = null;
        this.tableBounds = null;
        this.particleSystems = new Map();
        this.effects = new Map();
        this.liquidMeshes = new Map();
        this.powderMeshes = new Map();
        this.gasMeshes = new Map();
        this.chemicalStates = {
            solid: ['powder', 'salt', 'sugar', 'copper', 'iron', 'sodium', 'calcium', 'carbonate'],
            gas: ['gas', 'vapor', 'smoke', 'steam', 'co2', 'oxygen', 'hydrogen', 'chlorine']
        };
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
        this.initialState = null;
        this.performanceManager = new PerformanceManager();
        this.physicsManager = new PhysicsManager();
        this.lastUpdateTime = 0;
        this.updateThrottleCounter = 0;
        this.physicsEnabled = true;
        this.tableBody = null;
        this.spiritLamp = null;
        this.burnerStand = null;
        this.electricBalance = null;
        this.spiritLampFireOn = false;
        this.spiritLampFire = null;
        this.isDraggingLabware = false;
        this.pendingDragObject = null;
        this.pendingTiltObject = null;
        this.pendingPourObject = null;
        this.pendingStirObject = null;
        this.mouseDownPosition = null;
        
        this.init();
    }

    async init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        await this.physicsManager.init();
        await this.loadTable();
        this.updateLampButtonVisibility();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);
    }

    async loadLaboratory() {
        const laboratoryPath = this.config.laboratoryModel || 'assets/models/Laboratory (2).glb';
        const loader = new GLTFLoader();
        
        try {
            const gltf = await loader.loadAsync(laboratoryPath);
            const laboratory = gltf.scene;
            
            const shadowsEnabled = this.performanceManager.getShadowsEnabled();
            laboratory.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = shadowsEnabled;
                    child.receiveShadow = shadowsEnabled;
                }
                
                const name = (child.name || '').toLowerCase();
                const userDataName = (child.userData?.name || '').toLowerCase();
                
                if (name.includes('conical') || userDataName.includes('conical')) {
                    child.visible = false;
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({ visible: false });
                    }
                }
            });
            
            laboratory.position.set(0, 0, 0);
            this.laboratory = laboratory;
            this.scene.add(laboratory);
            
            return true;
        } catch (error) {
            console.warn('Failed to load laboratory model:', error);
            return false;
        }
    }

    async loadTable() {
        const tablePath = this.config.tableModel || 'assets/models/Table1.glb';
        const loader = new GLTFLoader();
        
        try {
            const gltf = await loader.loadAsync(tablePath);
            const table = gltf.scene;
            
            const shadowsEnabled = this.performanceManager.getShadowsEnabled();
            table.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = shadowsEnabled;
                    child.receiveShadow = shadowsEnabled;
                }
            });
            
            const box = new THREE.Box3().setFromObject(table);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const minY = box.min.y;
            const maxY = box.max.y;
            
            table.position.set(0, 0, 0);
            
            this.tableSurface = table;
            this.scene.add(table);
            
            const tableTopY = maxY;
            
            this.tableBounds = {
                minX: box.min.x + table.position.x,
                maxX: box.max.x + table.position.x,
                minZ: box.min.z + table.position.z,
                maxZ: box.max.z + table.position.z,
                y: tableTopY
            };
            
            if (this.physicsManager && this.physicsManager.world) {
                this.tableBody = this.physicsManager.createTableBody(table, this.tableBounds);
            }
            
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
        this.tableSurface.receiveShadow = this.performanceManager.getShadowsEnabled();
        this.scene.add(this.tableSurface);

        this.tableBounds = {
            minX: -tableConfig.width / 2,
            maxX: tableConfig.width / 2,
            minZ: -tableConfig.depth / 2,
            maxZ: tableConfig.depth / 2,
            y: tableConfig.y + tableConfig.height / 2
        };
    }

    async loadHardcodedModels() {
        const loader = new GLTFLoader();
        if (!this.tableBounds || !this.tableBounds.y) {
            console.warn('Table bounds not available, waiting...');
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!this.tableBounds || !this.tableBounds.y) {
                console.error('Table bounds still not available');
                return;
            }
        }
        const tableTopY = this.tableBounds.y;
        const tableCenterX = (this.tableBounds.minX + this.tableBounds.maxX) / 2;
        const tableCenterZ = (this.tableBounds.minZ + this.tableBounds.maxZ) / 2;
        const tableWidth = this.tableBounds.maxX - this.tableBounds.minX;
        const tableDepth = this.tableBounds.maxZ - this.tableBounds.minZ;
        
        try {
            const balanceGltf = await loader.loadAsync('assets/models/electronic_scale.glb');
            const balance = balanceGltf.scene;
            balance.scale.set(1.0, 1.0, 1.0);
            
            const shadowsEnabled = this.performanceManager.getShadowsEnabled();
            balance.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = shadowsEnabled;
                    child.receiveShadow = shadowsEnabled;
                }
            });
            
            balance.position.set(0, 0, 0);
            balance.updateMatrixWorld(true);
            
            const balanceBox = new THREE.Box3().setFromObject(balance);
            const balanceMinY = balanceBox.min.y;
            const balanceSize = balanceBox.getSize(new THREE.Vector3());
            const balanceRadius = Math.max(balanceSize.x, balanceSize.z) / 2;
            
            const balanceX = Math.max(this.tableBounds.minX + balanceRadius + 0.1, 
                                     Math.min(this.tableBounds.maxX - balanceRadius - 0.1, 
                                             tableCenterX - tableWidth * 0.25));
            const balanceZ = tableCenterZ;
            
            balance.position.set(balanceX, 0, balanceZ);
            balance.updateMatrixWorld(true);
            
            const balanceBoxPositioned = new THREE.Box3().setFromObject(balance);
            const balanceMinYPositioned = balanceBoxPositioned.min.y;
            const offsetY = tableTopY - balanceMinYPositioned;
            balance.position.y = offsetY;
            balance.updateMatrixWorld(true);
            
            balance.userData.isHardcoded = true;
            this.electricBalance = balance;
            this.scene.add(balance);
            
            const balanceData = {
                mesh: balance,
                name: 'Electric Balance',
                originalPosition: balance.position.clone(),
                originalRotation: balance.rotation.clone(),
                originalScale: balance.scale.clone(),
                boundingBox: balanceBox,
                size: balanceSize,
                center: balanceBox.getCenter(new THREE.Vector3()),
                centerOffset: new THREE.Vector3(0, 0, 0),
                properties: {
                    isScale: true,
                    volume: 0,
                    mass: 1,
                    temperature: 20,
                    contents: []
                },
                interactions: {
                    draggable: true,
                    tiltable: false,
                    heatable: false,
                    canPour: false
                },
                physicsBody: null
            };
            this.objects.set('Electric Balance', balanceData);
        } catch (error) {
            console.warn('Failed to load electric balance:', error);
        }
        
        try {
            const lampGltf = await loader.loadAsync('assets/models/Spirit Lamp .glb');
            const spiritLamp = lampGltf.scene;
            spiritLamp.scale.set(0.2, 0.2, 0.2);
            
            const shadowsEnabled = this.performanceManager.getShadowsEnabled();
            spiritLamp.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = shadowsEnabled;
                    child.receiveShadow = shadowsEnabled;
                }
            });
            
            spiritLamp.position.set(0, 0, 0);
            spiritLamp.updateMatrixWorld(true);
            
            const lampBox = new THREE.Box3().setFromObject(spiritLamp);
            const lampSize = lampBox.getSize(new THREE.Vector3());
            const lampRadius = Math.max(lampSize.x, lampSize.z) / 2;
            
            const lampX = Math.max(this.tableBounds.minX + lampRadius + 0.1, 
                                   Math.min(this.tableBounds.maxX - lampRadius - 0.1, 
                                           tableCenterX + tableWidth * 0.25));
            const lampZ = tableCenterZ;
            
            spiritLamp.position.set(lampX, 0, lampZ);
            spiritLamp.updateMatrixWorld(true);
            
            const lampBoxPositioned = new THREE.Box3().setFromObject(spiritLamp);
            const lampMinYPositioned = lampBoxPositioned.min.y;
            const lampOffsetY = tableTopY - lampMinYPositioned;
            spiritLamp.position.y = lampOffsetY;
            spiritLamp.updateMatrixWorld(true);
            
            const lampBoxFinal = new THREE.Box3().setFromObject(spiritLamp);
            const lampTopY = lampBoxFinal.max.y;
            
            spiritLamp.userData.isHardcoded = true;
            this.spiritLamp = spiritLamp;
            this.scene.add(spiritLamp);
            
            const lampData = {
                mesh: spiritLamp,
                name: 'Spirit Lamp',
                originalPosition: spiritLamp.position.clone(),
                originalRotation: spiritLamp.rotation.clone(),
                originalScale: spiritLamp.scale.clone(),
                boundingBox: lampBoxFinal,
                size: lampBoxFinal.getSize(new THREE.Vector3()),
                center: lampBoxFinal.getCenter(new THREE.Vector3()),
                centerOffset: new THREE.Vector3(0, 0, 0),
                properties: {
                    canHeat: true,
                    volume: 0,
                    mass: 1,
                    temperature: 20,
                    contents: []
                },
                interactions: {
                    draggable: true,
                    tiltable: false,
                    heatable: false,
                    canPour: false
                },
                physicsBody: null
            };
            this.objects.set('Spirit Lamp', lampData);
            this.updateLampButtonVisibility();
            
            const burnerGltf = await loader.loadAsync('assets/models/Burner Stand.glb');
            const burnerStand = burnerGltf.scene;
            burnerStand.scale.set(1.0, 1.0, 1.0);
            
            burnerStand.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = shadowsEnabled;
                    child.receiveShadow = shadowsEnabled;
                }
            });
            
            burnerStand.position.set(0, 0, 0);
            burnerStand.updateMatrixWorld(true);
            
            const burnerBox = new THREE.Box3().setFromObject(burnerStand);
            const burnerSize = burnerBox.getSize(new THREE.Vector3());
            const burnerRadius = Math.max(burnerSize.x, burnerSize.z) / 2;
            
            const burnerX = Math.max(this.tableBounds.minX + burnerRadius + 0.1, 
                                    Math.min(this.tableBounds.maxX - burnerRadius - 0.1, lampX));
            const burnerZ = lampZ;
            
            burnerStand.position.set(burnerX, 0, burnerZ);
            burnerStand.updateMatrixWorld(true);
            
            const burnerBoxPositioned = new THREE.Box3().setFromObject(burnerStand);
            const burnerMinYPositioned = burnerBoxPositioned.min.y;
            const burnerOffsetY = lampTopY - burnerMinYPositioned;
            burnerStand.position.y = burnerOffsetY;
            burnerStand.updateMatrixWorld(true);
            
            const burnerBoxFinal = new THREE.Box3().setFromObject(burnerStand);
            
            burnerStand.userData.isHardcoded = true;
            this.burnerStand = burnerStand;
            this.scene.add(burnerStand);
            
            const burnerData = {
                mesh: burnerStand,
                name: 'Burner Stand',
                originalPosition: burnerStand.position.clone(),
                originalRotation: burnerStand.rotation.clone(),
                originalScale: burnerStand.scale.clone(),
                boundingBox: burnerBox,
                size: burnerBox.getSize(new THREE.Vector3()),
                center: burnerBox.getCenter(new THREE.Vector3()),
                centerOffset: new THREE.Vector3(0, 0, 0),
                properties: {
                    volume: 0,
                    mass: 1,
                    temperature: 20,
                    contents: []
                },
                interactions: {
                    draggable: true,
                    tiltable: false,
                    heatable: false,
                    canPour: false
                },
                physicsBody: null
            };
            this.objects.set('Burner Stand', burnerData);
        } catch (error) {
            console.warn('Failed to load burner stand or spirit lamp:', error);
        }
    }

    async toggleSpiritLampFire() {
        this.spiritLampFireOn = !this.spiritLampFireOn;
        
        if (!this.spiritLamp) {
            const spiritLampObj = this.objects.get('Spirit Lamp');
            if (spiritLampObj && spiritLampObj.mesh) {
                this.spiritLamp = spiritLampObj.mesh;
            }
        }
        
        if (this.spiritLampFireOn) {
            if (this.spiritLamp && !this.spiritLampFire) {
                try {
                    if (!this.FireShader) {
                        const fireShaderModule = await import('./FireShader.js');
                        if (fireShaderModule.default) {
                            this.FireShader = fireShaderModule.default(THREE);
                        }
                    }
                    
                    if (!this.Fire) {
                        const fireModule = await import('./Fire.js');
                        if (fireModule.default && this.FireShader) {
                            this.Fire = fireModule.default(THREE, this.FireShader);
                        }
                    }
                    
                    if (this.Fire && this.FireShader) {
                        const lampBox = new THREE.Box3().setFromObject(this.spiritLamp);
                        const lampTopY = lampBox.max.y;
                        const lampCenter = lampBox.getCenter(new THREE.Vector3());
                        const lampSize = lampBox.getSize(new THREE.Vector3());
                        
                        const textureLoader = new THREE.TextureLoader();
                        const fireTexture = textureLoader.load(
                            './THREE.Fire/Fire.png',
                            (texture) => {
                                texture.needsUpdate = true;
                                
                                const fire = new this.Fire(texture, new THREE.Color(0xffaa44));
                                fire.scale.set(0.15, 0.4, 0.15);
                                const fireOffset = 0.2;
                                fire.position.set(lampCenter.x, lampTopY + fireOffset, lampCenter.z);
                                
                                this.scene.add(fire);
                                this.spiritLampFire = fire;
                                
                                this.effects.set('spiritLamp_fire', {
                                    type: 'threefire',
                                    fire: fire,
                                    active: true
                                });
                            },
                            undefined,
                            (error) => {
                                console.error('Failed to load Fire.png texture:', error);
                            }
                        );
                    } else {
                        throw new Error('Fire or FireShader not available');
                    }
                } catch (error) {
                    console.error('Failed to load Fire library:', error);
                }
            }
        } else {
            if (this.spiritLampFire) {
                this.scene.remove(this.spiritLampFire);
                if (this.spiritLampFire.dispose && typeof this.spiritLampFire.dispose === 'function') {
                    this.spiritLampFire.dispose();
                } else {
                    if (this.spiritLampFire.geometry) {
                        this.spiritLampFire.geometry.dispose();
                    }
                    if (this.spiritLampFire.material) {
                        if (Array.isArray(this.spiritLampFire.material)) {
                            this.spiritLampFire.material.forEach(mat => {
                                if (mat.map) mat.map.dispose();
                                mat.dispose();
                            });
                        } else {
                            if (this.spiritLampFire.material.map) {
                                this.spiritLampFire.material.map.dispose();
                            }
                            this.spiritLampFire.material.dispose();
                        }
                    }
                }
                this.spiritLampFire = null;
                this.effects.delete('spiritLamp_fire');
            }
        }
        
        return this.spiritLampFireOn;
    }


    setupCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(5, 1.6, 5);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        const quality = this.performanceManager.getQuality();
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: quality.antialias,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(quality.pixelRatio);
        this.renderer.shadowMap.enabled = quality.shadows;
        this.renderer.shadowMap.type = quality.shadowMapType;
        this.renderer.sortObjects = false;
        
        this.renderer.domElement.style.touchAction = 'none';
        this.renderer.domElement.style.userSelect = 'none';
        this.renderer.domElement.style.pointerEvents = 'auto';
        
        this.container.appendChild(this.renderer.domElement);
        
        console.log('About to call setupInteractions from setupRenderer');
        this.setupInteractions();
        console.log('After setupInteractions, interactions map size:', this.interactions.size);
        console.log('Drag controller exists:', !!this.interactions.get('drag'));

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.15;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 20;
        this.controls.enablePan = true;
        this.controls.enableZoom = false;
        this.controls.enableRotate = true;
        this.controls.screenSpacePanning = false;
        this.controls.enabled = true;
        
        this.controls.minPolarAngle = 0.5;
        this.controls.maxPolarAngle = 1.2;
        this.controls.minAzimuthAngle = -Infinity;
        this.controls.maxAzimuthAngle = Infinity;
        
        this.controls.target.set(0, 0, 0);
        
        const eyeLevel = 1.6;
        const constrainCameraHeight = () => {
            const minHeight = eyeLevel - 0.3;
            const maxHeight = eyeLevel + 0.4;
            
            if (this.camera.position.y < minHeight) {
                this.camera.position.y = minHeight;
            } else if (this.camera.position.y > maxHeight) {
                this.camera.position.y = maxHeight;
            }
        };
        
        this.controls.addEventListener('change', constrainCameraHeight);
        
        this.controls.update();
        
        this.targetZoomDistance = null;
        this.currentZoomDistance = this.camera.position.distanceTo(this.controls.target);
        this.zoomSpeed = 0.4;
        this.zoomSmoothing = 0.2;
        
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const delta = e.deltaY;
            const currentDistance = this.camera.position.distanceTo(this.controls.target);
            const zoomFactor = 1 + (delta > 0 ? this.zoomSpeed : -this.zoomSpeed);
            const newDistance = currentDistance * zoomFactor;
            
            const clampedDistance = Math.max(
                this.controls.minDistance,
                Math.min(this.controls.maxDistance, newDistance)
            );
            
            this.targetZoomDistance = clampedDistance;
        }, { passive: false });
    
        this.renderer.domElement.focus();
        
        console.log('OrbitControls initialized:', {
            enabled: this.controls.enabled,
            enableZoom: this.controls.enableZoom,
            enableRotate: this.controls.enableRotate
        });
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const shadowsEnabled = this.performanceManager.getShadowsEnabled();
        const quality = this.performanceManager.getQuality();
        const directionalLight = new THREE.DirectionalLight(0xffffff, shadowsEnabled ? 0.6 : 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = shadowsEnabled;
        
        if (shadowsEnabled) {
            const shadowMapSize = quality === 'high' ? 2048 : (quality === 'medium' ? 1024 : 512);
            directionalLight.shadow.mapSize.width = shadowMapSize;
            directionalLight.shadow.mapSize.height = shadowMapSize;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 50;
            directionalLight.shadow.camera.left = -10;
            directionalLight.shadow.camera.right = 10;
            directionalLight.shadow.camera.top = 10;
            directionalLight.shadow.camera.bottom = -10;
            directionalLight.shadow.bias = -0.0001;
            directionalLight.shadow.normalBias = 0.02;
            directionalLight.shadow.radius = 6;
            this.renderer.shadowMap.autoUpdate = true;
        }
        
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
    }

    removeConicalObjects() {
        const objectsToRemove = [];
        
        this.scene.traverse((child) => {
            const name = (child.name || '').toLowerCase();
            const userDataName = (child.userData?.name || '').toLowerCase();
            
            if (name.includes('conical') || userDataName.includes('conical')) {
                child.visible = false;
                if (child.isMesh) {
                    child.material = new THREE.MeshBasicMaterial({ visible: false });
                }
                objectsToRemove.push(child);
            }
        });
        
        
        for (const [name, obj] of this.objects) {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('conical')) {
                if (obj.mesh) {
                    obj.mesh.visible = false;
                    obj.mesh.traverse((child) => {
                        if (child.isMesh) {
                            child.visible = false;
                            child.material = new THREE.MeshBasicMaterial({ visible: false });
                        }
                    });
                }
                this.scene.remove(obj.mesh);
                this.objects.delete(name);
            }
        }
    }

    async loadModels() {
        const loader = new GLTFLoader();
        
        let modelsToLoad = [];
        
        if (this.config.models && Array.isArray(this.config.models) && this.config.models.length > 0) {
            modelsToLoad = this.config.models.map(modelPath => {
                const modelName = this.extractModelName(modelPath);
                return { path: modelPath, name: modelName };
            });
        } else {
            modelsToLoad = [
                { path: 'assets/models/Beaker.glb', name: 'Beaker' },
                { path: 'assets/models/Conical.glb', name: 'Conical' }
            ];
        }
        
        for (const modelConfig of modelsToLoad) {
            const modelPath = modelConfig.path;
            const modelName = modelConfig.name || this.extractModelName(modelPath);
            
            const lowerName = modelName.toLowerCase();
            if (lowerName.includes('table') || lowerName.includes('laboratory')) {
                continue;
            }
            
            let modelProps = modelConfig.properties || {};
            const modelScale = modelConfig.scale || 1;
            
            let defaultScale = 1;
            if (lowerName.includes('beaker') || lowerName.includes('flask') || lowerName.includes('bottle')) {
                if (modelProps.isContainer === undefined) modelProps.isContainer = true;
                if (modelProps.capacity === undefined) modelProps.capacity = 1000;
                if (modelProps.canPour === undefined) modelProps.canPour = true;
                if (modelProps.canHeat === undefined) modelProps.canHeat = true;
                defaultScale = 2.5;
            } else if (lowerName.includes('conical')) {
                if (modelProps.isContainer === undefined) modelProps.isContainer = true;
                if (modelProps.capacity === undefined) modelProps.capacity = 1000;
                if (modelProps.canPour === undefined) modelProps.canPour = true;
                if (modelProps.canHeat === undefined) modelProps.canHeat = true;
                defaultScale = 1.5;
            } else if (lowerName.includes('scale') || lowerName.includes('electronic_scale')) {
                if (modelProps.isScale === undefined) modelProps.isScale = true;
                defaultScale = 1.0;
            }
            
            const finalScale = modelScale !== 1 ? modelScale : defaultScale;
            
            try {
                const gltf = await loader.loadAsync(modelPath);
                const model = gltf.scene;
                
                if (finalScale !== 1) {
                    model.scale.set(finalScale, finalScale, finalScale);
                }
                
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const minY = box.min.y;
                
                const shadowsEnabled = this.performanceManager.getShadowsEnabled();
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = shadowsEnabled;
                        child.receiveShadow = shadowsEnabled;
                    }
                });
                
                const tableTopY = this.tableBounds ? this.tableBounds.y : 0;
                
                const objectSize = box.getSize(new THREE.Vector3());
                const objectRadius = Math.max(objectSize.x, objectSize.z) / 2;
                
                let initialPosition;
                if (this.tableBounds) {
                    const tableCenterX = (this.tableBounds.minX + this.tableBounds.maxX) / 2;
                    const tableCenterZ = (this.tableBounds.minZ + this.tableBounds.maxZ) / 2;
                    const tableWidth = this.tableBounds.maxX - this.tableBounds.minX;
                    const tableDepth = this.tableBounds.maxZ - this.tableBounds.minZ;
                    
                    let minSpacing = objectRadius * 4;
                    if (this.objects.size > 0) {
                        for (const [existingName, existingObj] of this.objects) {
                            existingObj.mesh.updateMatrixWorld(true);
                            const existingBox = new THREE.Box3().setFromObject(existingObj.mesh);
                            const existingSize = existingBox.getSize(new THREE.Vector3());
                            const existingRadius = Math.max(existingSize.x, existingSize.z) / 2;
                            minSpacing = Math.max(minSpacing, objectRadius + existingRadius + 0.3);
                        }
                    }
                    
                    let posX, posZ;
                    if (lowerName.includes('beaker')) {
                        posX = tableCenterX - minSpacing;
                        posZ = tableCenterZ;
                    } else if (lowerName.includes('conical')) {
                        posX = tableCenterX + minSpacing;
                        posZ = tableCenterZ;
                    } else {
                        posX = tableCenterX;
                        posZ = tableCenterZ;
                    }
                    
                    posX = Math.max(this.tableBounds.minX + objectRadius + 0.3, Math.min(this.tableBounds.maxX - objectRadius - 0.3, posX));
                    posZ = Math.max(this.tableBounds.minZ + objectRadius + 0.3, Math.min(this.tableBounds.maxZ - objectRadius - 0.3, posZ));
                    
                    initialPosition = new THREE.Vector3(posX, 0, posZ);
                } else {
                    initialPosition = new THREE.Vector3(0, 0, 0);
                }
                
                model.position.copy(initialPosition);
                model.updateMatrixWorld(true);
                
                let attempts = 0;
                let boxPositioned = new THREE.Box3().setFromObject(model);
                let minYPositioned = boxPositioned.min.y;
                
                while (Math.abs(minYPositioned - tableTopY) > 0.001 && attempts < 20) {
                    const correction = tableTopY - minYPositioned;
                    model.position.y += correction;
                    model.updateMatrixWorld(true);
                    boxPositioned = new THREE.Box3().setFromObject(model);
                    minYPositioned = boxPositioned.min.y;
                    attempts++;
                }
                
                if (Math.abs(minYPositioned - tableTopY) > 0.01) {
                    console.warn(`Failed to position ${modelName} on table. minY: ${minYPositioned}, tableTopY: ${tableTopY}`);
                }
                
                const centerFinal = boxPositioned.getCenter(new THREE.Vector3());
                const centerOffset = new THREE.Vector3().subVectors(centerFinal, model.position);
                
                const initialStateForObject = this.getInitialStateForObject(modelName);
                
                const initialVolume = initialStateForObject?.volume !== null && initialStateForObject?.volume !== undefined 
                    ? initialStateForObject.volume 
                    : (modelProps.volume || 0);
                const initialTemperature = initialStateForObject?.temperature !== null && initialStateForObject?.temperature !== undefined 
                    ? initialStateForObject.temperature 
                    : (modelProps.temperature || 20);
                let initialContents = initialStateForObject?.contents && initialStateForObject.contents.length > 0
                    ? initialStateForObject.contents
                    : (modelProps.contents || []);
                
                if (initialContents.length > 0 && typeof initialContents[0] === 'string') {
                    const volume = initialVolume || 0;
                    if (volume > 0) {
                        initialContents = initialContents.map(content => ({
                            type: content,
                            volume: volume / initialContents.length
                        }));
                    }
                } else if (initialContents.length === 0 && initialVolume > 0) {
                    initialContents = [{
                        type: 'water',
                        volume: initialVolume
                    }];
                }
                
                const objectData = {
                    mesh: model,
                    name: modelName,
                    originalPosition: initialPosition.clone(),
                    originalRotation: model.rotation.clone(),
                    originalScale: model.scale.clone(),
                    boundingBox: box,
                    size: size,
                    center: center,
                    centerOffset: centerOffset,
                    properties: {
                        volume: initialVolume,
                        mass: modelProps.mass || 1,
                        temperature: initialTemperature,
                        contents: initialContents,
                        isContainer: modelProps.isContainer || false,
                        isScale: lowerName.includes('scale') || lowerName.includes('electronic_scale') || modelProps.isScale || false,
                        capacity: modelProps.capacity || 0,
                        canHeat: modelProps.canHeat !== false,
                        canPour: modelProps.canPour !== false
                    },
                    interactions: {
                        draggable: modelProps.draggable !== false,
                        tiltable: modelProps.tiltable !== false,
                        heatable: modelProps.canHeat !== false,
                        canPour: modelProps.canPour !== false,
                        stirable: modelProps.stirable !== false
                    },
                    initialState: {
                        volume: initialVolume,
                        temperature: initialTemperature,
                        contents: [...initialContents]
                    },
                    physicsBody: null
                };
                
                if (this.physicsManager && this.physicsManager.world) {
                    const mass = objectData.properties.mass || 1;
                    let body = null;
                    
                    if (lowerName.includes('beaker') || lowerName.includes('conical') || lowerName.includes('flask')) {
                        body = this.physicsManager.createCylinderBody(model, mass);
                    } else if (lowerName.includes('sphere') || lowerName.includes('ball')) {
                        body = this.physicsManager.createSphereBody(model, mass);
                    } else {
                        body = this.physicsManager.createBoxBody(model, mass);
                    }
                    
                    if (body) {
                        model.updateMatrixWorld(true);
                        const boxWorld = new THREE.Box3().setFromObject(model);
                        const centerWorld = boxWorld.getCenter(new THREE.Vector3());
                        const minYWorld = boxWorld.min.y;
                        
                        if (Math.abs(minYWorld - tableTopY) > 0.01) {
                            let correctionAttempts = 0;
                            let currentMinY = minYWorld;
                            while (Math.abs(currentMinY - tableTopY) > 0.001 && correctionAttempts < 20) {
                                const correction = tableTopY - currentMinY;
                                model.position.y += correction;
                                model.updateMatrixWorld(true);
                                const boxCorrected = new THREE.Box3().setFromObject(model);
                                currentMinY = boxCorrected.min.y;
                                correctionAttempts++;
                            }
                            const boxFinal = new THREE.Box3().setFromObject(model);
                            const centerFinal = boxFinal.getCenter(new THREE.Vector3());
                            body.position.set(centerFinal.x, centerFinal.y, centerFinal.z);
                            objectData.centerOffset = new THREE.Vector3().subVectors(centerFinal, model.position);
                        } else {
                            body.position.set(centerWorld.x, centerWorld.y, centerWorld.z);
                        }
                        
                        const meshQuaternion = new THREE.Quaternion().setFromEuler(model.rotation);
                        body.quaternion.set(meshQuaternion.x, meshQuaternion.y, meshQuaternion.z, meshQuaternion.w);
                        body.velocity.set(0, 0, 0);
                        body.angularVelocity.set(0, 0, 0);
                        body.type = this.physicsManager.CANNON.Body.DYNAMIC;
                        body.material = this.physicsManager.materials.get('object');
                        body.collisionFilterGroup = 1;
                        body.collisionFilterMask = -1;
                        body.wakeUp();
                        body.sleepSpeedLimit = 0.1;
                        body.sleepTimeLimit = 1;
                        objectData.physicsBody = body;
                        this.physicsManager.addBody(modelName, body);
                        
                        setTimeout(() => {
                            if (body && objectData.physicsBody === body) {
                                model.updateMatrixWorld(true);
                                const boxCheck = new THREE.Box3().setFromObject(model);
                                const centerCheck = boxCheck.getCenter(new THREE.Vector3());
                                body.position.set(centerCheck.x, centerCheck.y, centerCheck.z);
                                body.wakeUp();
                            }
                        }, 100);
                    }
                }
                
                this.objects.set(modelName, objectData);
                
                this.scene.add(model);
                
                if (objectData.properties.isContainer) {
                    setTimeout(() => {
                        this.createLiquidMesh(objectData);
                    }, 100);
                }
            } catch (error) {
                console.error(`Failed to load model ${modelPath}:`, error);
            }
        }
        
        console.log('About to call setupInteractions, renderer exists:', !!this.renderer);
        console.log('About to call setupInteractions, renderer exists:', !!this.renderer, 'renderer.domElement:', !!this.renderer?.domElement);
        this.setupInteractions();
        console.log('After setupInteractions, interactions map size:', this.interactions.size);
        console.log('Drag controller exists:', !!this.interactions.get('drag'));
        console.log('After setupInteractions, interactions map size:', this.interactions.size);
        console.log('Drag controller exists:', !!this.interactions.get('drag'));
        this.storeInitialState();
        
        setTimeout(() => {
            for (const [name, obj] of this.objects) {
                if (obj.properties.isContainer) {
                    const volume = this.calculateVolume(obj);
                    if (volume > 0) {
                        this.createLiquidMesh(obj);
                    }
                }
            }
        }, 300);
    }

    getInitialStateForObject(objectName) {
        if (!this.config.initialState || !Array.isArray(this.config.initialState)) {
            return null;
        }
        const lowerObjectName = objectName.toLowerCase();
        const numberMatch = lowerObjectName.match(/\s+(\d+)$/);
        const instanceNumber = numberMatch ? parseInt(numberMatch[1]) : 0;
        const normalizedObjectName = lowerObjectName.replace(/\s+\d+$/, '');
        
        const matchingStates = this.config.initialState.filter(state => {
            if (!state.objectName) return false;
            const lowerStateName = state.objectName.toLowerCase();
            const normalizedStateName = lowerStateName.replace(/\s+\d+$/, '');
            
            if (lowerStateName === lowerObjectName) {
                return true;
            }
            
            if (normalizedStateName === normalizedObjectName) {
                return true;
            }
            
            return false;
        });
        
        if (matchingStates.length === 0) {
            return null;
        }
        
        if (matchingStates.length === 1) {
            return matchingStates[0];
        }
        
        if (instanceNumber < matchingStates.length) {
            return matchingStates[instanceNumber];
        }
        
        return matchingStates[0];
    }

    storeInitialState() {
        this.initialState = new Map();
        for (const [name, obj] of this.objects) {
            const contents = Array.isArray(obj.properties.contents) ? obj.properties.contents : [];
            this.initialState.set(name, {
                volume: obj.properties.volume || 0,
                temperature: obj.properties.temperature || 20,
                contents: [...contents],
                position: obj.mesh.position.clone(),
                rotation: obj.mesh.rotation.clone(),
                scale: obj.mesh.scale.clone()
            });
        }
    }

    setupInteractions() {
        console.log('setupInteractions called');
        this.interactions.set('drag', new DragController(this));
        this.interactions.set('tilt', new TiltController(this));
        this.interactions.set('pour', new PourController(this));
        this.interactions.set('heat', new HeatController(this));
        this.interactions.set('stir', new StirController(this));
        this.scaleController = new ScaleController(this);
        
        console.log('Controllers set up. Drag controller exists:', !!this.interactions.get('drag'));
        
        this.renderer.domElement.style.cursor = 'pointer';
        this.renderer.domElement.setAttribute('tabindex', '0'); 
        
        // Click on canvas to focus it for wheel events
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.focus();
        });
        
        const mouseDownHandler = (e) => {
            console.log('mousedown event fired on canvas', 'button:', e.button, 'target:', e.target);
            if (this.isDraggingLabware) {
                console.log('isDraggingLabware is true, returning');
                this.isDraggingLabware = false;
                return;
            }
            if (e.button === 0) {
                console.log('Left button clicked, calling onMouseDown');
                this.onMouseDown(e);
            } else {
                console.log('Not left button, ignoring');
            }
        };
        this.renderer.domElement.addEventListener('mousedown', mouseDownHandler, { passive: false, capture: true });
        console.log('mousedown listener attached. Canvas element:', this.renderer.domElement);
        console.log('Canvas has pointer-events:', window.getComputedStyle(this.renderer.domElement).pointerEvents);
        
        console.log('Mouse event listeners attached');
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: false });
        this.renderer.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e), { passive: false });
        this.renderer.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.renderer.domElement.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.renderer.domElement.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        
        // Debug: Test if wheel events are reaching the canvas
        this.renderer.domElement.addEventListener('wheel', (e) => {
            if (this.controls && this.controls.enabled) {
                e.preventDefault();
                const currentDistance = this.camera.position.distanceTo(this.controls.target);
                const zoomDelta = e.deltaY * 0.02;
                const newDistance = Math.max(
                    this.controls.minDistance,
                    Math.min(this.controls.maxDistance, currentDistance + zoomDelta)
                );
                this.targetZoomDistance = newDistance;
            }
        }, { passive: false });
        
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    getWorldPositionFromMouse(event) {
        if (!this.renderer || !this.renderer.domElement) {
            console.error('Renderer or domElement not available');
            return this.tableBounds ? new THREE.Vector3(0, this.tableBounds.y, 0) : new THREE.Vector3(0, 0, 0);
        }
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(mouse, this.camera);
        
        if (this.tableSurface) {
            const intersects = this.raycaster.intersectObject(this.tableSurface, true);
            if (intersects.length > 0) {
                return intersects[0].point;
            }
        }
        
        const tableTopY = this.tableBounds ? this.tableBounds.y : 0;
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), tableTopY);
        const intersectPoint = new THREE.Vector3();
        const didIntersect = this.raycaster.ray.intersectPlane(plane, intersectPoint);
        
        if (didIntersect) {
            return intersectPoint;
        }
        
        const centerX = this.tableBounds ? (this.tableBounds.minX + this.tableBounds.maxX) / 2 : 0;
        const centerZ = this.tableBounds ? (this.tableBounds.minZ + this.tableBounds.maxZ) / 2 : 0;
        return new THREE.Vector3(centerX, tableTopY, centerZ);
    }

    async addLabware(modelPath, modelName = null, position = null) {
        console.log('addLabware called with:', { modelPath, modelName, position });
        const loader = new GLTFLoader();
        let name = modelName || this.extractModelName(modelPath);
        const lowerName = name.toLowerCase();
        
        if (this.objects.has(name)) {
            let counter = 1;
            let uniqueName = `${name} ${counter}`;
            while (this.objects.has(uniqueName)) {
                counter++;
                uniqueName = `${name} ${counter}`;
            }
            name = uniqueName;
            console.log(`Labware ${modelName || this.extractModelName(modelPath)} already exists, using unique name: ${name}`);
        }
        
        if (lowerName.includes('table') || lowerName.includes('laboratory')) {
            console.warn(`Cannot add ${name} as labware`);
            return;
        }
        
        try {
            console.log('Loading model from path:', modelPath);
            const pathParts = modelPath.split('/');
            const filename = pathParts.pop();
            const encodedPath = pathParts.join('/') + '/' + encodeURIComponent(filename);
            const gltf = await loader.loadAsync(encodedPath);
            console.log('Model loaded successfully:', gltf);
            
            if (!gltf || !gltf.scene) {
                throw new Error('Invalid GLTF file: scene is missing');
            }
            const model = gltf.scene.clone();
            model.visible = true;
            
            let defaultScale = 1;
            let modelProps = {};
            
            if (lowerName.includes('beaker') || lowerName.includes('flask') || lowerName.includes('bottle')) {
                modelProps.isContainer = true;
                modelProps.capacity = 1000;
                modelProps.canPour = true;
                modelProps.canHeat = true;
                defaultScale = 2.5;
            } else if (lowerName.includes('conical')) {
                modelProps.isContainer = true;
                modelProps.capacity = 1000;
                modelProps.canPour = true;
                modelProps.canHeat = true;
                defaultScale = 1.5;
            } else if (lowerName.includes('test') || lowerName.includes('tube')) {
                modelProps.isContainer = true;
                modelProps.capacity = 50;
                modelProps.canPour = true;
                modelProps.canHeat = true;
                defaultScale = 2.0;
            } else if (lowerName.includes('cylinder') || lowerName.includes('graduated')) {
                modelProps.isContainer = true;
                modelProps.capacity = 500;
                modelProps.canPour = true;
                modelProps.canHeat = false;
                defaultScale = 1.2;
            } else if (lowerName.includes('rod') || lowerName.includes('glass rod') || lowerName.includes('dropper')) {
                modelProps.isContainer = true;
                modelProps.capacity = 50;
                modelProps.canPour = false;
                modelProps.canHeat = false;
                defaultScale = 1.0;
            } else if (lowerName.includes('scale') || lowerName.includes('electronic')) {
                modelProps.isScale = true;
                defaultScale = 1.0;
            } else if (lowerName.includes('spirit') || lowerName.includes('lamp')) {
                defaultScale = 0.2;
            } else if (lowerName.includes('burner')) {
                defaultScale = 1.0;
            }
            
            model.scale.set(defaultScale, defaultScale, defaultScale);
            
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const minY = box.min.y;
            
            const shadowsEnabled = this.performanceManager.getShadowsEnabled();
            model.traverse((child) => {
                if (child.isMesh) {
                    child.visible = true;
                    child.castShadow = shadowsEnabled;
                    child.receiveShadow = shadowsEnabled;
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                if (mat) {
                                    mat.needsUpdate = true;
                                    mat.transparent = false;
                                }
                            });
                        } else {
                            child.material.needsUpdate = true;
                            child.material.transparent = false;
                        }
                    }
                    child.frustumCulled = false;
                }
            });
            
            const tableTopY = this.tableBounds ? this.tableBounds.y : 0;
            const objectSize = box.getSize(new THREE.Vector3());
            const objectRadius = Math.max(objectSize.x, objectSize.z) / 2;
            
            let initialPosition;
            if (position) {
                initialPosition = position.clone();
            } else if (this.tableBounds) {
                const tableCenterX = (this.tableBounds.minX + this.tableBounds.maxX) / 2;
                const tableCenterZ = (this.tableBounds.minZ + this.tableBounds.maxZ) / 2;
                
                let minSpacing = objectRadius * 4;
                if (this.objects.size > 0) {
                    for (const [existingName, existingObj] of this.objects) {
                        existingObj.mesh.updateMatrixWorld(true);
                        const existingBox = new THREE.Box3().setFromObject(existingObj.mesh);
                        const existingSize = existingBox.getSize(new THREE.Vector3());
                        const existingRadius = Math.max(existingSize.x, existingSize.z) / 2;
                        minSpacing = Math.max(minSpacing, objectRadius + existingRadius + 0.3);
                    }
                }
                
                const posX = tableCenterX;
                const posZ = tableCenterZ;
                
                initialPosition = new THREE.Vector3(
                    Math.max(this.tableBounds.minX + objectRadius + 0.3, Math.min(this.tableBounds.maxX - objectRadius - 0.3, posX)),
                    0,
                    Math.max(this.tableBounds.minZ + objectRadius + 0.3, Math.min(this.tableBounds.maxZ - objectRadius - 0.3, posZ))
                );
            } else {
                initialPosition = new THREE.Vector3(0, 0, 0);
            }
            
            model.updateMatrixWorld(true);
            const initialBox = new THREE.Box3().setFromObject(model);
            const initialMinY = initialBox.min.y;
            const modelCurrentY = model.position.y;
            const offsetFromOrigin = initialMinY - modelCurrentY;
            
            if (position) {
                const objectSize = box.getSize(new THREE.Vector3());
                const objectRadius = Math.max(objectSize.x, objectSize.z) / 2;
                model.position.set(position.x, tableTopY - offsetFromOrigin, position.z);
                if (this.tableBounds) {
                    model.position.x = Math.max(this.tableBounds.minX + objectRadius + 0.1, 
                                               Math.min(this.tableBounds.maxX - objectRadius - 0.1, model.position.x));
                    model.position.z = Math.max(this.tableBounds.minZ + objectRadius + 0.1, 
                                               Math.min(this.tableBounds.maxZ - objectRadius - 0.1, model.position.z));
                }
            } else {
                model.position.set(initialPosition.x, tableTopY - offsetFromOrigin, initialPosition.z);
            }
            
            model.updateMatrixWorld(true);
            
            let attempts = 0;
            let boxPositioned = new THREE.Box3().setFromObject(model);
            let minYPositioned = boxPositioned.min.y;
            
            while (Math.abs(minYPositioned - tableTopY) > 0.01 && attempts < 50) {
                const correction = tableTopY - minYPositioned;
                model.position.y += correction;
                model.updateMatrixWorld(true);
                boxPositioned = new THREE.Box3().setFromObject(model);
                minYPositioned = boxPositioned.min.y;
                attempts++;
            }
            
            if (attempts >= 50 || Math.abs(minYPositioned - tableTopY) > 0.01) {
                console.warn(`Positioning issue for ${name}: minY=${minYPositioned.toFixed(3)}, tableTopY=${tableTopY.toFixed(3)}, attempts=${attempts}`);
            }
            
            const centerFinal = boxPositioned.getCenter(new THREE.Vector3());
            const centerOffset = new THREE.Vector3().subVectors(centerFinal, model.position);
            
            const initialStateForObject = this.getInitialStateForObject(name);
            
            const initialVolume = initialStateForObject?.volume !== null && initialStateForObject?.volume !== undefined 
                ? initialStateForObject.volume 
                : 0;
            const initialTemperature = initialStateForObject?.temperature !== null && initialStateForObject?.temperature !== undefined 
                ? initialStateForObject.temperature 
                : 20;
            let initialContents = initialStateForObject?.contents && initialStateForObject.contents.length > 0
                ? initialStateForObject.contents
                : [];
            
            if (initialContents.length > 0 && typeof initialContents[0] === 'string') {
                const volume = initialVolume || 0;
                if (volume > 0) {
                    initialContents = initialContents.map(content => ({
                        type: content,
                        volume: volume / initialContents.length
                    }));
                }
            } else if (initialContents.length === 0 && initialVolume > 0) {
                initialContents = [{
                    type: 'water',
                    volume: initialVolume
                }];
            }
            
            const objectData = {
                mesh: model,
                name: name,
                originalPosition: initialPosition.clone(),
                originalRotation: model.rotation.clone(),
                originalScale: model.scale.clone(),
                boundingBox: box,
                size: size,
                center: center,
                centerOffset: centerOffset,
                properties: {
                    volume: initialVolume,
                    mass: 1,
                    temperature: initialTemperature,
                    contents: initialContents,
                    isContainer: modelProps.isContainer || false,
                    isScale: modelProps.isScale || (lowerName.includes('scale') || lowerName.includes('electronic')) || false,
                    capacity: modelProps.capacity || 0,
                    canHeat: modelProps.canHeat !== false,
                    canPour: modelProps.canPour !== false
                },
                interactions: {
                    draggable: true,
                    tiltable: true,
                    heatable: modelProps.canHeat !== false,
                    canPour: modelProps.canPour !== false
                },
                initialState: {
                    volume: initialVolume,
                    temperature: initialTemperature,
                    contents: [...initialContents]
                },
                physicsBody: null,
                initializing: true,
                justReleased: false
            };
            
            if (this.physicsManager && this.physicsManager.world) {
                const mass = objectData.properties.mass || 1;
                let body = null;
                
                if (lowerName.includes('beaker') || lowerName.includes('conical') || lowerName.includes('flask') || lowerName.includes('cylinder')) {
                    body = this.physicsManager.createCylinderBody(model, mass);
                } else if (lowerName.includes('sphere') || lowerName.includes('ball')) {
                    body = this.physicsManager.createSphereBody(model, mass);
                } else {
                    body = this.physicsManager.createBoxBody(model, mass);
                }
                
                if (body) {
                    model.updateMatrixWorld(true);
                    const boxWorld = new THREE.Box3().setFromObject(model);
                    const centerWorld = boxWorld.getCenter(new THREE.Vector3());
                    body.position.set(centerWorld.x, centerWorld.y, centerWorld.z);
                    body.type = this.physicsManager.CANNON.Body.KINEMATIC;
                    body.velocity.set(0, 0, 0);
                    body.angularVelocity.set(0, 0, 0);
                    this.physicsManager.addBody(name, body);
                    objectData.physicsBody = body;
                }
            }
            
            this.scene.add(model);
            this.objects.set(name, objectData);
            
            if (objectData.properties.isContainer && initialVolume > 0) {
                this.measurements.volume[name] = initialVolume;
                if (this.createLiquidMesh) {
                    this.createLiquidMesh(objectData);
                }
            }
            
            if (lowerName.includes('spirit') || lowerName.includes('lamp')) {
                this.spiritLamp = model;
                this.updateLampButtonVisibility();
            }
            
            console.log('Beaker added - Name:', name, 'Objects count:', this.objects.size);
            console.log('Beaker position:', model.position);
            console.log('Beaker in scene:', this.scene.children.includes(model));
            console.log('Beaker visible:', model.visible);
            console.log('Beaker interactions:', objectData.interactions);
            
            model.visible = true;
            model.matrixAutoUpdate = true;
            model.renderOrder = 0;
            model.userData.objectName = name;
            
            model.traverse((child) => {
                child.visible = true;
                child.matrixAutoUpdate = true;
                child.userData.objectName = name;
                if (child.isMesh) {
                    child.frustumCulled = false;
                    child.renderOrder = 0;
                    if (!child.material) {
                        child.material = new THREE.MeshStandardMaterial({ color: 0x888888 });
                    }
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            if (mat) {
                                mat.visible = true;
                                mat.transparent = false;
                                mat.opacity = 1.0;
                            }
                        });
                    } else {
                        child.material.visible = true;
                        child.material.transparent = false;
                        child.material.opacity = 1.0;
                    }
                }
            });
            
            model.updateMatrixWorld(true);
            
            if (objectData.physicsBody) {
                const boxFinal = new THREE.Box3().setFromObject(model);
                const centerFinal = boxFinal.getCenter(new THREE.Vector3());
                objectData.centerOffset = new THREE.Vector3().subVectors(centerFinal, model.position);
                objectData.physicsBody.position.set(centerFinal.x, centerFinal.y, centerFinal.z);
                const meshQuaternion = new THREE.Quaternion().setFromEuler(model.rotation);
                objectData.physicsBody.quaternion.set(
                    meshQuaternion.x,
                    meshQuaternion.y,
                    meshQuaternion.z,
                    meshQuaternion.w
                );
                objectData.physicsBody.velocity.set(0, 0, 0);
                objectData.physicsBody.angularVelocity.set(0, 0, 0);
                objectData.physicsBody.type = this.physicsManager.CANNON.Body.KINEMATIC;
            }
            
            setTimeout(() => {
                if (objectData.physicsBody && objectData.initializing) {
                    objectData.initializing = false;
                }
            }, 100);
            
            if (this.initialState) {
                this.initialState.set(name, {
                    volume: 0,
                    temperature: 20,
                    contents: [],
                    position: model.position.clone(),
                    rotation: model.rotation.clone(),
                    scale: model.scale.clone()
                });
            }
        } catch (error) {
            console.error(`Failed to load labware ${name}:`, error);
            console.error('Error details:', error.message, error.stack);
        }
    }

    removeLabware(name) {
        console.log('removeLabware called for:', name);
        const obj = this.objects.get(name);
        if (!obj) {
            console.warn(`Labware ${name} not found`);
            return false;
        }
        
        const lowerName = name.toLowerCase();
        if (lowerName.includes('table') || lowerName.includes('laboratory')) {
            console.warn(`Cannot remove ${name}`);
            return false;
        }
        
        if (obj.mesh) {
            this.scene.remove(obj.mesh);
            
            obj.mesh.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                if (mat.map) mat.map.dispose();
                                mat.dispose();
                            });
                        } else {
                            if (child.material.map) child.material.map.dispose();
                            child.material.dispose();
                        }
                    }
                }
            });
            
            if (obj.mesh.geometry) obj.mesh.geometry.dispose();
            if (obj.mesh.material) {
                if (Array.isArray(obj.mesh.material)) {
                    obj.mesh.material.forEach(mat => {
                        if (mat.map) mat.map.dispose();
                        mat.dispose();
                    });
                } else {
                    if (obj.mesh.material.map) obj.mesh.material.map.dispose();
                    obj.mesh.material.dispose();
                }
            }
        }
        
        if (obj.physicsBody && this.physicsManager) {
            this.physicsManager.removeBody(name);
        }
        
        if (this.liquidMeshes.has(name)) {
            const liquidMesh = this.liquidMeshes.get(name);
            this.scene.remove(liquidMesh);
            if (liquidMesh.geometry) liquidMesh.geometry.dispose();
            if (liquidMesh.material) liquidMesh.material.dispose();
            this.liquidMeshes.delete(name);
        }
        
        if (this.selectedObject && this.selectedObject.name === name) {
            this.selectedObject = null;
        }
        
        this.objects.delete(name);
        if (this.initialState) {
            this.initialState.delete(name);
        }
        
        if (lowerName.includes('spirit') || lowerName.includes('lamp')) {
            this.spiritLamp = null;
            if (this.spiritLampFire) {
                this.scene.remove(this.spiritLampFire);
                if (this.spiritLampFire.dispose && typeof this.spiritLampFire.dispose === 'function') {
                    this.spiritLampFire.dispose();
                } else {
                    if (this.spiritLampFire.geometry) this.spiritLampFire.geometry.dispose();
                    if (this.spiritLampFire.material) {
                        if (Array.isArray(this.spiritLampFire.material)) {
                            this.spiritLampFire.material.forEach(mat => {
                                if (mat.map) mat.map.dispose();
                                mat.dispose();
                            });
                        } else {
                            if (this.spiritLampFire.material.map) this.spiritLampFire.material.map.dispose();
                            this.spiritLampFire.material.dispose();
                        }
                    }
                }
                this.spiritLampFire = null;
                this.effects.delete('spiritLamp_fire');
            }
            this.spiritLampFireOn = false;
            this.updateLampButtonVisibility();
        }
        
        console.log(`Labware ${name} removed successfully`);
        return true;
    }
    
    updateLampButtonVisibility() {
        const btn = document.getElementById('lamp-fire-btn');
        if (btn) {
            const hasSpiritLamp = this.spiritLamp !== null || 
                                 (this.objects.has('Spirit Lamp') && this.objects.get('Spirit Lamp').mesh);
            btn.style.display = hasSpiritLamp ? 'block' : 'none';
        }
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
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        if (!this.startTime) {
            this.startTime = currentTime;
        }
        
        this.performanceManager.updateFPS(deltaTime);
        
        requestAnimationFrame(() => this.animate());
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        if (this.camera.aspect !== width / height) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
        
      
        if (this.controls) {
            if (this.targetZoomDistance !== null) {
                const currentDistance = this.camera.position.distanceTo(this.controls.target);
                const diff = this.targetZoomDistance - currentDistance;
                
                if (Math.abs(diff) > 0.001) {
                    const newDistance = currentDistance + diff * this.zoomSmoothing;
                    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
                    this.camera.position.copy(this.controls.target.clone().add(direction.multiplyScalar(newDistance)));
                    this.currentZoomDistance = newDistance;
                } else {
                    this.targetZoomDistance = null;
                    this.currentZoomDistance = this.camera.position.distanceTo(this.controls.target);
                }
            }
            this.controls.update();
        }
        
        this.updateThrottleCounter++;
        if (!this.performanceManager.shouldThrottleUpdate(this.updateThrottleCounter)) {
            this.updatePhysics();
        }
        
        this.updateFireEffects();
       
        this.renderer.render(this.scene, this.camera);
    }

    updatePhysics() {
        if (this.physicsEnabled && this.physicsManager && this.physicsManager.world) {
            const deltaTime = (performance.now() - this.lastUpdateTime) / 1000;
            this.lastUpdateTime = performance.now();
            this.physicsManager.update(deltaTime);
            
            const objectList = Array.from(this.objects.entries());
            
            for (const [name, obj] of objectList) {
                if (obj.userData && obj.userData.isInsideBurnerStand) {
                    const burnerStandObj = this.objects.get('Burner Stand');
                    if (burnerStandObj && burnerStandObj.mesh) {
                        const burnerMesh = this.burnerStand || burnerStandObj.mesh;
                        burnerMesh.updateMatrixWorld(true);
                        obj.mesh.updateMatrixWorld(true);
                        
                        const burnerBox = new THREE.Box3().setFromObject(burnerMesh);
                        const burnerCenter = burnerBox.getCenter(new THREE.Vector3());
                        const burnerSize = burnerBox.getSize(new THREE.Vector3());
                        const burnerBottom = burnerBox.min.y;
                        
                        const lampBox = new THREE.Box3().setFromObject(obj.mesh);
                        const lampSize = lampBox.getSize(new THREE.Vector3());
                        const targetY = burnerBottom + (burnerSize.y * 0.02) + (lampSize.y * 0.05);
                        
                        obj.mesh.position.x = burnerCenter.x;
                        obj.mesh.position.z = burnerCenter.z;
                        obj.mesh.position.y = targetY;
                        obj.mesh.updateMatrixWorld(true);
                    }
                    continue;
                }
                
                if (obj.physicsBody) {
                    if (!this.isObjectBeingDragged(obj) && !obj.justReleased && !obj.initializing) {
                        if (obj.physicsBody.type === this.physicsManager.CANNON.Body.DYNAMIC) {
                            obj.physicsBody.wakeUp();
                            this.physicsManager.syncMeshToBody(obj.mesh, obj.physicsBody, obj.centerOffset);
                        } else {
                            this.physicsManager.syncBodyToMesh(obj.physicsBody, obj.mesh);
                        }
                    } else if (this.isObjectBeingDragged(obj)) {
                        this.physicsManager.syncBodyToMesh(obj.physicsBody, obj.mesh);
                    } else {
                        this.constrainToTable(obj);
                    }
                } else {
                    this.constrainToTable(obj);
                    this.constrainToBurnerStand(obj);
                }
                
                if (this.spiritLampFireOn && this.spiritLamp && obj.properties.isContainer) {
                    this.spiritLamp.updateMatrixWorld(true);
                    obj.mesh.updateMatrixWorld(true);
                    
                    const lampBox = new THREE.Box3().setFromObject(this.spiritLamp);
                    const lampTop = lampBox.max.y;
                    const lampCenter = lampBox.getCenter(new THREE.Vector3());
                    const flamePosition = new THREE.Vector3(lampCenter.x, lampTop, lampCenter.z);
                    
                    const objBox = new THREE.Box3().setFromObject(obj.mesh);
                    const objCenter = objBox.getCenter(new THREE.Vector3());
                    const objBottom = objBox.min.y;
                    
                    const horizontalDistance = Math.sqrt(
                        Math.pow(objCenter.x - flamePosition.x, 2) + 
                        Math.pow(objCenter.z - flamePosition.z, 2)
                    );
                    const verticalDistance = objBottom - flamePosition.y;
                    
                    const maxHorizontalDistance = 0.25;
                    const maxVerticalDistance = 0.3;
                    const minVerticalDistance = -0.1;
                    
                    const isNearFlame = horizontalDistance < maxHorizontalDistance && 
                                      verticalDistance >= minVerticalDistance && 
                                      verticalDistance <= maxVerticalDistance;
                    
                    if (isNearFlame) {
                        const heatRate = 0.5;
                        const oldTemp = obj.properties.temperature;
                        obj.properties.temperature = Math.min(obj.properties.temperature + heatRate, 200);
                        if (Math.floor(oldTemp) !== Math.floor(obj.properties.temperature)) {
                            console.log(`Heating ${obj.name} near flame: ${oldTemp.toFixed(1)}°C -> ${obj.properties.temperature.toFixed(1)}°C (distance: ${horizontalDistance.toFixed(3)}m, height: ${verticalDistance.toFixed(3)}m)`);
                        }
                    } else {
                        if (obj.name === 'Beaker' || obj.name.toLowerCase().includes('beaker')) {
                            console.log(`Beaker not near flame: horizontal=${horizontalDistance.toFixed(3)}m (max=${maxHorizontalDistance}), vertical=${verticalDistance.toFixed(3)}m (range: ${minVerticalDistance} to ${maxVerticalDistance}), flame at (${flamePosition.x.toFixed(3)}, ${flamePosition.y.toFixed(3)}, ${flamePosition.z.toFixed(3)}), beaker at (${objCenter.x.toFixed(3)}, ${objCenter.y.toFixed(3)}, ${objCenter.z.toFixed(3)})`);
                        }
                    }
                } else if (obj.properties.temperature > 20) {
                    obj.properties.temperature -= 0.05;
                }
                
                this.updateEffects(obj);
                
                if (obj.properties.isContainer && obj.properties.contents && obj.properties.contents.length > 0) {
                    const reaction = this.checkChemicalReaction(obj);
                    if (reaction) {
                        const hasReactants = obj.properties.contents.some(c => {
                            const type = (c.type || '').toLowerCase();
                            return reaction.reactants.some(r => {
                                const reactantType = r.toLowerCase();
                                const state = this.getChemicalState(c.type);
                                if (state === 'solid' && c.mass !== undefined) {
                                    return type.includes(reactantType) && c.mass > 0.001;
                                } else if (state === 'liquid' && c.volume !== undefined) {
                                    return type.includes(reactantType) && c.volume > 0.001;
                                }
                                return false;
                            });
                        });
                        
                        if (hasReactants && this.updateThrottleCounter % 30 === 0) {
                            this.processChemicalReaction(obj, reaction);
                        }
                    }
                }
                
                this.updateMeasurements(obj);
            }
            
            for (let i = 0; i < objectList.length; i++) {
                const [name, obj] = objectList[i];
                if (!obj.physicsBody || this.isObjectBeingDragged(obj) || obj.justReleased || obj.initializing) continue;
                
                obj.mesh.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(obj.mesh);
                const size = box.getSize(new THREE.Vector3());
                const radius = Math.max(size.x, size.z) / 2;
                const center = box.getCenter(new THREE.Vector3());
                const minY = box.min.y;
                
                if (this.tableBounds && minY < this.tableBounds.y) {
                    const correction = this.tableBounds.y - minY;
                    obj.mesh.position.y += correction;
                    obj.mesh.updateMatrixWorld(true);
                    const correctedBox = new THREE.Box3().setFromObject(obj.mesh);
                    const correctedCenter = correctedBox.getCenter(new THREE.Vector3());
                    if (obj.centerOffset) {
                        const bodyPos = new THREE.Vector3().addVectors(obj.mesh.position, obj.centerOffset);
                        this.physicsManager.setBodyPosition(obj.physicsBody, bodyPos);
                    } else {
                        this.physicsManager.setBodyPosition(obj.physicsBody, correctedCenter);
                    }
                    obj.physicsBody.velocity.set(0, 0, 0);
                    obj.physicsBody.angularVelocity.set(0, 0, 0);
                    obj.physicsBody.wakeUp();
                    continue;
                }
                
                for (let j = i + 1; j < objectList.length; j++) {
                    const [otherName, otherObj] = objectList[j];
                    if (!otherObj.physicsBody || this.isObjectBeingDragged(otherObj) || otherObj.justReleased || otherObj.initializing) continue;
                    
                    otherObj.mesh.updateMatrixWorld(true);
                    const otherBox = new THREE.Box3().setFromObject(otherObj.mesh);
                    const otherSize = otherBox.getSize(new THREE.Vector3());
                    const otherRadius = Math.max(otherSize.x, otherSize.z) / 2;
                    const otherCenter = otherBox.getCenter(new THREE.Vector3());
                    
                    const boxesIntersect = box.intersectsBox(otherBox);
                    const distance = center.distanceTo(otherCenter);
                    const minDistance = radius + otherRadius;
                    
                    if (boxesIntersect || (distance < minDistance && distance > 0.001)) {
                        let direction = new THREE.Vector3().subVectors(center, otherCenter);
                        if (direction.length() < 0.001) {
                            direction.set(1, 0, 0);
                        } else {
                            direction.normalize();
                        }
                        
                        const overlap = minDistance - distance;
                        const correction1 = overlap * 0.6;
                        const correction2 = overlap * 0.6;
                        
                        const offset1 = direction.clone().multiplyScalar(correction1);
                        const offset2 = direction.clone().multiplyScalar(-correction2);
                        
                        obj.mesh.position.add(offset1);
                        otherObj.mesh.position.add(offset2);
                        
                        obj.mesh.updateMatrixWorld(true);
                        otherObj.mesh.updateMatrixWorld(true);
                        
                        if (obj.physicsBody) {
                            const correctedBox1 = new THREE.Box3().setFromObject(obj.mesh);
                            const correctedCenter1 = correctedBox1.getCenter(new THREE.Vector3());
                            if (obj.centerOffset) {
                                const bodyPos = new THREE.Vector3().addVectors(obj.mesh.position, obj.centerOffset);
                                this.physicsManager.setBodyPosition(obj.physicsBody, bodyPos);
                            } else {
                                this.physicsManager.setBodyPosition(obj.physicsBody, correctedCenter1);
                            }
                            obj.physicsBody.velocity.set(0, 0, 0);
                            obj.physicsBody.angularVelocity.set(0, 0, 0);
                            obj.physicsBody.wakeUp();
                        }
                        
                        if (otherObj.physicsBody) {
                            const correctedBox2 = new THREE.Box3().setFromObject(otherObj.mesh);
                            const correctedCenter2 = correctedBox2.getCenter(new THREE.Vector3());
                            if (otherObj.centerOffset) {
                                const bodyPos = new THREE.Vector3().addVectors(otherObj.mesh.position, otherObj.centerOffset);
                                this.physicsManager.setBodyPosition(otherObj.physicsBody, bodyPos);
                            } else {
                                this.physicsManager.setBodyPosition(otherObj.physicsBody, correctedCenter2);
                            }
                            otherObj.physicsBody.velocity.set(0, 0, 0);
                            otherObj.physicsBody.angularVelocity.set(0, 0, 0);
                            otherObj.physicsBody.wakeUp();
                        }
                    }
                }
            }
        } else {
            for (const [name, obj] of this.objects) {
                this.constrainToTable(obj);
                
                if (this.spiritLampFireOn && this.spiritLamp) {
                    const lampBox = new THREE.Box3().setFromObject(this.spiritLamp);
                    const lampCenter = lampBox.getCenter(new THREE.Vector3());
                    const objBox = new THREE.Box3().setFromObject(obj.mesh);
                    const objCenter = objBox.getCenter(new THREE.Vector3());
                    const distance = lampCenter.distanceTo(objCenter);
                    const heatingDistance = 1.5;
                    
                    if (distance < heatingDistance && obj.properties.isContainer && obj.properties.volume > 0) {
                        const heatRate = 0.3 * (1 - distance / heatingDistance);
                        obj.properties.temperature = Math.min(obj.properties.temperature + heatRate, 200);
                    }
                } else if (obj.properties.temperature > 20) {
                    obj.properties.temperature -= 0.05;
                }
                
                if (obj.properties.isContainer && obj.properties.contents && obj.properties.contents.length > 0) {
                    const temp = obj.properties.temperature || 20;
                    
                    if (temp > 80) {
                        const indicatorSolutionIndex = obj.properties.contents.findIndex(c => 
                            (c.type || '').toLowerCase() === 'indicator_solution'
                        );
                        
                        if (indicatorSolutionIndex >= 0) {
                            const isAlreadyReacted = obj.properties.reactedReactions && 
                                obj.properties.reactedReactions.some(r => r.type === 'heated_indicator');
                            
                            if (!isAlreadyReacted) {
                                const indicatorContent = obj.properties.contents[indicatorSolutionIndex];
                                const volume = indicatorContent.volume;
                                
                                obj.properties.contents.splice(indicatorSolutionIndex, 1);
                                
                                const existingHeated = obj.properties.contents.find(c => 
                                    (c.type || '').toLowerCase() === 'heated_indicator'
                                );
                                if (existingHeated) {
                                    existingHeated.volume += volume;
                                } else {
                                    obj.properties.contents.push({
                                        type: 'heated_indicator',
                                        volume: volume
                                    });
                                }
                                
                                if (!obj.properties.reactedReactions) {
                                    obj.properties.reactedReactions = [];
                                }
                                obj.properties.reactedReactions.push({
                                    type: 'heated_indicator',
                                    timestamp: Date.now()
                                });
                                
                                if (this.updateLiquidMesh) {
                                    this.updateLiquidMesh(obj);
                                }
                            }
                        }
                    }
                    
                    const reaction = this.checkChemicalReaction(obj);
                    if (reaction) {
                        this.processChemicalReaction(obj, reaction);
                    }
                }
                
                this.updateEffects(obj);
                this.updateMeasurements(obj);
            }
        }
        
        if (this.scaleController) {
            this.scaleController.checkAndUpdateScaleButton();
        }
        
        this.updateParticles();
        this.handleKeyboardTilt();
        this.handleSwirling();
        this.checkPourConditions();
        this.handleCollisions();
    }
    
    isObjectBeingDragged(obj) {
        return this.activeController && 
               this.activeController.activeObject === obj;
    }
    
    handleCollisions() {
        if (!this.physicsEnabled || !this.physicsManager) return;
        
        const collisions = this.physicsManager.getCollisions();
        for (const collision of collisions) {
            const bodyA = collision.bodyA;
            const bodyB = collision.bj;
            
            for (const [name, obj] of this.objects) {
                if (obj.physicsBody === bodyA || obj.physicsBody === bodyB) {
                    this.onObjectCollision(obj, collision);
                }
            }
        }
    }
    
    onObjectCollision(obj, collision) {
        if (obj.properties.isContainer && obj.properties.contents.length > 0) {
            const impact = Math.sqrt(
                collision.normal.x ** 2 + 
                collision.normal.y ** 2 + 
                collision.normal.z ** 2
            );
            
            if (impact > 0.5) {
                const spillAmount = Math.min(impact * 10, obj.properties.volume * 0.1);
                obj.properties.volume = Math.max(0, obj.properties.volume - spillAmount);
                this.updateLiquidMesh(obj);
            }
        }
    }

    checkPourConditions() {
        const tiltController = this.interactions.get('tilt');
        if (!tiltController) return;
        
        if (tiltController.pourModal || tiltController.modalJustClosed) {
            return;
        }
        
        for (const [name, obj] of this.objects) {
            if (!obj.properties.isContainer) continue;
            
            const hasContents = (obj.properties.contents && 
                                obj.properties.contents.length > 0) ||
                               (obj.properties.volume > 0);
            
            if (!hasContents) continue;
            
            const tiltX = obj.mesh.rotation.x;
            const tiltZ = obj.mesh.rotation.z;
            const tiltAngle = Math.abs(tiltX) + Math.abs(tiltZ);
            
            if (tiltController.dismissedObjects && tiltController.dismissedObjects.has(obj)) {
                if (tiltAngle < 0.005) {
                    tiltController.dismissedObjects.delete(obj);
                    console.log('[Pour Detection] Object untilted, removed from dismissedObjects:', obj.name);
                    if (tiltController.dismissedObjects.size === 0) {
                        tiltController.hasShownModal = false;
                        tiltController.modalJustClosed = false;
                    }
                } else {
                    console.log('[Pour Detection] Skipping dismissed object:', obj.name, 'tiltAngle:', tiltAngle.toFixed(4));
                }
                continue;
            }
            
            if (tiltAngle > 0.01 && !tiltController.hasShownModal && !tiltController.pourModal && !tiltController.modalJustClosed) {
                tiltController.activeObject = obj;
                tiltController.findPourTarget();
                if (tiltController.pendingPourTarget) {
                    console.log('[Pour Detection] Found pour condition for:', obj.name, 'to', tiltController.pendingPourTarget.name);
                    tiltController.showPourModal();
                    tiltController.hasShownModal = true;
                    break;
                }
            }
        }
    }

    handleKeyboardTilt() {
        if (!this.selectedObject) return;
        
        const obj = this.selectedObject;
        const maxTilt = Math.PI / 2;
        const moveSpeed = 0.01;
        const verticalSpeed = 0.01;
        
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();
        
        let moved = false;
        
        if (this.keysPressed.has('w') || this.keysPressed.has('W')) {
            const moveVector = cameraDirection.clone().multiplyScalar(moveSpeed);
            obj.mesh.position.add(moveVector);
            moved = true;
        }
        
        if (this.keysPressed.has('s') || this.keysPressed.has('S')) {
            const moveVector = cameraDirection.clone().multiplyScalar(-moveSpeed);
            obj.mesh.position.add(moveVector);
            moved = true;
        }
        
        if (this.keysPressed.has('a') || this.keysPressed.has('A')) {
            const moveVector = cameraRight.clone().multiplyScalar(-moveSpeed);
            obj.mesh.position.add(moveVector);
            moved = true;
        }
        
        if (this.keysPressed.has('d') || this.keysPressed.has('D')) {
            const moveVector = cameraRight.clone().multiplyScalar(moveSpeed);
            obj.mesh.position.add(moveVector);
            moved = true;
        }
        
        if (this.keysPressed.has('y') || this.keysPressed.has('Y')) {
            obj.mesh.position.y += verticalSpeed;
            moved = true;
        }
        
        if (this.keysPressed.has('h') || this.keysPressed.has('H')) {
            const tableTopY = this.tableBounds ? this.tableBounds.y : 0;
            const box = new THREE.Box3().setFromObject(obj.mesh);
            const minY = box.min.y;
            const minAllowedY = tableTopY + Math.abs(obj.mesh.position.y - minY);
            if (obj.mesh.position.y - verticalSpeed >= minAllowedY) {
                obj.mesh.position.y -= verticalSpeed;
                moved = true;
            }
        }
        
        if (this.keysPressed.has('k') || this.keysPressed.has('K')) {
            const tiltAxis = cameraRight.clone();
            
            const currentRotation = obj.mesh.rotation.clone();
            const quaternion = new THREE.Quaternion().setFromEuler(currentRotation);
            
            const tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(tiltAxis, this.keyboardTiltSpeed);
            quaternion.multiply(tiltQuaternion);
            
            const newEuler = new THREE.Euler().setFromQuaternion(quaternion);
            
            obj.mesh.rotation.x = THREE.MathUtils.clamp(newEuler.x, -maxTilt, maxTilt);
            obj.mesh.rotation.z = THREE.MathUtils.clamp(newEuler.z, -maxTilt, maxTilt);
        }
        
        if (this.keysPressed.has('i') || this.keysPressed.has('I')) {
            const tiltAxis = cameraRight.clone();
            
            const currentRotation = obj.mesh.rotation.clone();
            const quaternion = new THREE.Quaternion().setFromEuler(currentRotation);
            
            const tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(tiltAxis, -this.keyboardTiltSpeed);
            quaternion.multiply(tiltQuaternion);
            
            const newEuler = new THREE.Euler().setFromQuaternion(quaternion);
            
            obj.mesh.rotation.x = THREE.MathUtils.clamp(newEuler.x, -maxTilt, maxTilt);
            obj.mesh.rotation.z = THREE.MathUtils.clamp(newEuler.z, -maxTilt, maxTilt);
        }
        
        if (this.keysPressed.has('j') || this.keysPressed.has('J')) {
            const tiltAxis = cameraDirection.clone();
            
            const currentRotation = obj.mesh.rotation.clone();
            const quaternion = new THREE.Quaternion().setFromEuler(currentRotation);
            
            const tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(tiltAxis, -this.keyboardTiltSpeed);
            quaternion.multiply(tiltQuaternion);
            
            const newEuler = new THREE.Euler().setFromQuaternion(quaternion);
            
            obj.mesh.rotation.x = THREE.MathUtils.clamp(newEuler.x, -maxTilt, maxTilt);
            obj.mesh.rotation.z = THREE.MathUtils.clamp(newEuler.z, -maxTilt, maxTilt);
        }
        
        if (this.keysPressed.has('l') || this.keysPressed.has('L')) {
            const tiltAxis = cameraDirection.clone();
            
            const currentRotation = obj.mesh.rotation.clone();
            const quaternion = new THREE.Quaternion().setFromEuler(currentRotation);
            
            const tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(tiltAxis, this.keyboardTiltSpeed);
            quaternion.multiply(tiltQuaternion);
            
            const newEuler = new THREE.Euler().setFromQuaternion(quaternion);
            
            obj.mesh.rotation.x = THREE.MathUtils.clamp(newEuler.x, -maxTilt, maxTilt);
            obj.mesh.rotation.z = THREE.MathUtils.clamp(newEuler.z, -maxTilt, maxTilt);
        }
        
        if (moved) {
            obj.mesh.updateMatrixWorld(true);
            const activeBox = new THREE.Box3().setFromObject(obj.mesh);
            const activeSize = activeBox.getSize(new THREE.Vector3());
            const activeRadius = Math.max(activeSize.x, activeSize.z) / 2;
            const activeCenter = activeBox.getCenter(new THREE.Vector3());
            
            for (const [name, otherObj] of this.objects) {
                if (otherObj !== obj && otherObj.physicsBody) {
                    otherObj.mesh.updateMatrixWorld(true);
                    const otherBox = new THREE.Box3().setFromObject(otherObj.mesh);
                    const otherSize = otherBox.getSize(new THREE.Vector3());
                    const otherRadius = Math.max(otherSize.x, otherSize.z) / 2;
                    const otherCenter = otherBox.getCenter(new THREE.Vector3());
                    
                    const boxesIntersect = activeBox.intersectsBox(otherBox);
                    const distance = activeCenter.distanceTo(otherCenter);
                    const minDistance = activeRadius + otherRadius;
                    
                    if (boxesIntersect || (distance < minDistance && distance > 0.001)) {
                        let direction = new THREE.Vector3().subVectors(activeCenter, otherCenter);
                        if (direction.length() < 0.001) {
                            direction.set(1, 0, 0);
                        } else {
                            direction.normalize();
                        }
                        const correction = boxesIntersect ? Math.max(minDistance - distance, 0.05) : (minDistance - distance);
                        obj.mesh.position.add(direction.multiplyScalar(correction));
                        obj.mesh.updateMatrixWorld(true);
                        activeCenter.copy(new THREE.Box3().setFromObject(obj.mesh).getCenter(new THREE.Vector3()));
                    }
                }
            }
            
            if (this.physicsEnabled && obj.physicsBody && this.physicsManager) {
                obj.mesh.updateMatrixWorld(true);
                const finalBox = new THREE.Box3().setFromObject(obj.mesh);
                const finalCenter = finalBox.getCenter(new THREE.Vector3());
                if (obj.centerOffset) {
                    const bodyPos = new THREE.Vector3().addVectors(obj.mesh.position, obj.centerOffset);
                    this.physicsManager.setBodyPosition(obj.physicsBody, bodyPos);
                } else {
                    this.physicsManager.setBodyPosition(obj.physicsBody, finalCenter);
                }
            }
        }
        
        this.constrainToTable(obj);
    }

    handleSwirling() {
        if (!this.isSwirling || !this.selectedObject) return;
        
        const obj = this.selectedObject;
        
        if (!obj.mesh.userData.originalRotation) {
            obj.mesh.userData.originalRotation = {
                x: obj.mesh.rotation.x,
                y: obj.mesh.rotation.y,
                z: obj.mesh.rotation.z
            };
        }
        
        obj.mesh.rotation.y += this.swirlSpeed;
        
        const time = performance.now() * 0.001;
        obj.mesh.rotation.x = obj.mesh.userData.originalRotation.x + Math.sin(time * 2) * this.swirlTiltAmount;
        obj.mesh.rotation.z = obj.mesh.userData.originalRotation.z + Math.cos(time * 2) * this.swirlTiltAmount;
        
        const objName = obj.name.toLowerCase();
        const isStirringTool = objName.includes('rod') || objName.includes('dropper') || objName.includes('stir');
        
        if (isStirringTool) {
            const nearbyContainer = this.findNearbyContainer(obj, 0.5);
            if (nearbyContainer && nearbyContainer.properties.isContainer) {
                if (!nearbyContainer.properties.stirCount) {
                    nearbyContainer.properties.stirCount = 0;
                }
                const currentTime = performance.now();
                if (!nearbyContainer.lastStirTime) {
                    nearbyContainer.lastStirTime = currentTime;
                }
                if (currentTime - nearbyContainer.lastStirTime > 500) {
                    nearbyContainer.properties.stirCount = (nearbyContainer.properties.stirCount || 0) + 1;
                    nearbyContainer.lastStirTime = currentTime;
                }
            }
        }
        
        obj.mesh.updateMatrixWorld(true);
    }

    onKeyDown(event) {
        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'y', 'i', 'j', 'k', 'h', 'l'].includes(key)) {
            this.keysPressed.add(key);
            event.preventDefault();
        } else if (key === 'u') {
            if (this.selectedObject) {
                this.isSwirling = true;
                event.preventDefault();
            }
        }
    }

    onKeyUp(event) {
        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'y', 'i', 'j', 'k', 'h', 'l'].includes(key)) {
            this.keysPressed.delete(key);
            event.preventDefault();
        } else if (key === 'u') {
            this.isSwirling = false;
            if (this.selectedObject) {
                const obj = this.selectedObject;
                obj.mesh.rotation.x = obj.mesh.userData.originalRotation?.x || 0;
                obj.mesh.rotation.z = obj.mesh.userData.originalRotation?.z || 0;
            }
            event.preventDefault();
        }
    }

    constrainToTable(obj) {
        if (!this.tableBounds || !obj.interactions.draggable) return;
        
        if (obj.userData && obj.userData.isInsideBurnerStand) {
            return;
        }
        
        obj.mesh.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(obj.mesh);
        const size = box.getSize(new THREE.Vector3());
        const minY = box.min.y;
        const position = obj.mesh.position;
        const tableTopY = this.tableBounds.y;
        
        let needsCorrection = false;
        
        if (minY < tableTopY) {
            const correction = tableTopY - minY;
            obj.mesh.position.y += correction;
            obj.mesh.updateMatrixWorld(true);
            needsCorrection = true;
        }
        
        const halfWidth = size.x / 2;
        const halfDepth = size.z / 2;
        let constrained = false;
        let newX = obj.mesh.position.x;
        let newZ = obj.mesh.position.z;
        
        if (obj.mesh.position.x - halfWidth < this.tableBounds.minX) {
            newX = this.tableBounds.minX + halfWidth;
            constrained = true;
        }
        if (obj.mesh.position.x + halfWidth > this.tableBounds.maxX) {
            newX = this.tableBounds.maxX - halfWidth;
            constrained = true;
        }
        
        if (obj.mesh.position.z - halfDepth < this.tableBounds.minZ) {
            newZ = this.tableBounds.minZ + halfDepth;
            constrained = true;
        }
        if (obj.mesh.position.z + halfDepth > this.tableBounds.maxZ) {
            newZ = this.tableBounds.maxZ - halfDepth;
            constrained = true;
        }
        
        if (constrained) {
            obj.mesh.position.x = newX;
            obj.mesh.position.z = newZ;
            obj.mesh.updateMatrixWorld(true);
            needsCorrection = true;
        }
        
        if (needsCorrection && this.physicsEnabled && obj.physicsBody && this.physicsManager) {
            const correctedBox = new THREE.Box3().setFromObject(obj.mesh);
            const correctedCenter = correctedBox.getCenter(new THREE.Vector3());
            if (obj.centerOffset) {
                const bodyPos = new THREE.Vector3().addVectors(obj.mesh.position, obj.centerOffset);
                this.physicsManager.setBodyPosition(obj.physicsBody, bodyPos);
            } else {
                this.physicsManager.setBodyPosition(obj.physicsBody, correctedCenter);
            }
            obj.physicsBody.velocity.set(0, 0, 0);
            obj.physicsBody.angularVelocity.set(0, 0, 0);
            obj.physicsBody.wakeUp();
        }
    }

    isSpiritLampInBurnerStand() {
        if (!this.burnerStand) return false;
        
        const spiritLampObj = this.objects.get('Spirit Lamp');
        if (!spiritLampObj || !spiritLampObj.mesh) {
            if (!this.spiritLamp) return false;
        }
        
        if (spiritLampObj && (spiritLampObj.userData?.isInsideBurnerStand || spiritLampObj.mesh.userData?.isInsideBurnerStand)) {
            return true;
        }
        
        const lampMesh = spiritLampObj ? spiritLampObj.mesh : this.spiritLamp;
        if (!lampMesh) return false;
        
        if (lampMesh.userData?.isInsideBurnerStand) {
            return true;
        }
        
        this.burnerStand.updateMatrixWorld(true);
        lampMesh.updateMatrixWorld(true);
        
        const burnerBox = new THREE.Box3().setFromObject(this.burnerStand);
        const lampBox = new THREE.Box3().setFromObject(lampMesh);
        
        const burnerCenter = burnerBox.getCenter(new THREE.Vector3());
        const lampCenter = lampBox.getCenter(new THREE.Vector3());
        
        const burnerSize = burnerBox.getSize(new THREE.Vector3());
        const horizontalDistance = Math.sqrt(
            Math.pow(lampCenter.x - burnerCenter.x, 2) + 
            Math.pow(lampCenter.z - burnerCenter.z, 2)
        );
        
        const maxHorizontalDistance = Math.min(burnerSize.x, burnerSize.z) * 0.3;
        const verticalDistance = Math.abs(lampCenter.y - burnerCenter.y);
        const maxVerticalDistance = burnerSize.y * 0.4;
        
        return horizontalDistance < maxHorizontalDistance && verticalDistance < maxVerticalDistance;
    }

    isObjectOnBurnerStand(obj) {
        if (!obj || !obj.mesh || !this.burnerStand) return false;
        const objName = obj.name.toLowerCase();
        if ((obj.name === 'Spirit Lamp' || obj.name === 'Alcohol Lamp' || objName.includes('spirit lamp') || objName.includes('alcohol lamp')) && !obj.userData?.isInsideBurnerStand) {
            obj.mesh.updateMatrixWorld(true);
            this.burnerStand.updateMatrixWorld(true);
            
            const burnerBox = new THREE.Box3().setFromObject(this.burnerStand);
            const objBox = new THREE.Box3().setFromObject(obj.mesh);
            
            const burnerTop = burnerBox.max.y;
            const burnerCenter = burnerBox.getCenter(new THREE.Vector3());
            const objBottom = objBox.min.y;
            const objCenter = objBox.getCenter(new THREE.Vector3());
            
            const burnerSize = burnerBox.getSize(new THREE.Vector3());
            const horizontalDistance = Math.sqrt(
                Math.pow(objCenter.x - burnerCenter.x, 2) + 
                Math.pow(objCenter.z - burnerCenter.z, 2)
            );
            
            const maxHorizontalDistance = Math.max(burnerSize.x, burnerSize.z) * 0.6;
            const verticalDistance = objBottom - burnerTop;
            const maxVerticalDistance = 0.1;
            
            return horizontalDistance < maxHorizontalDistance && 
                   verticalDistance >= -maxVerticalDistance && 
                   verticalDistance <= maxVerticalDistance;
        }
        if (obj.name === 'Spirit Lamp' || obj.name === 'Alcohol Lamp' || obj.name === 'Burner Stand') return false;
        
        obj.mesh.updateMatrixWorld(true);
        this.burnerStand.updateMatrixWorld(true);
        
        const burnerBox = new THREE.Box3().setFromObject(this.burnerStand);
        const objBox = new THREE.Box3().setFromObject(obj.mesh);
        
        const burnerTop = burnerBox.max.y;
        const burnerCenter = burnerBox.getCenter(new THREE.Vector3());
        const objBottom = objBox.min.y;
        const objCenter = objBox.getCenter(new THREE.Vector3());
        
        const burnerSize = burnerBox.getSize(new THREE.Vector3());
        const horizontalDistance = Math.sqrt(
            Math.pow(objCenter.x - burnerCenter.x, 2) + 
            Math.pow(objCenter.z - burnerCenter.z, 2)
        );
        
        const maxHorizontalDistance = Math.min(burnerSize.x, burnerSize.z) * 0.5;
        const verticalDistance = objBottom - burnerTop;
        const maxVerticalDistance = 0.3;
        
        const isOnTop = horizontalDistance < maxHorizontalDistance && 
                       verticalDistance >= -maxVerticalDistance && 
                       verticalDistance <= maxVerticalDistance;
        
        if (obj.properties?.isContainer && Math.abs(verticalDistance) < 0.5) {
            console.log(`Checking if ${obj.name} is on burner: horizontal=${horizontalDistance.toFixed(3)} (max=${maxHorizontalDistance.toFixed(3)}), vertical=${verticalDistance.toFixed(3)} (tolerance=${maxVerticalDistance}), result=${isOnTop}`);
        }
        
        return isOnTop;
        const verticalTolerance = 0.2;
        
        return horizontalDistance < maxHorizontalDistance && 
               objBottom >= burnerTop - verticalTolerance && 
               objBottom <= burnerTop + verticalTolerance;
    }

    constrainToBurnerStand(obj) {
        if (!this.burnerStand || !obj.interactions.draggable) return;
        
        const lowerName = obj.name.toLowerCase();
        if (lowerName.includes('spirit') || lowerName.includes('alcohol') || (lowerName.includes('lamp') && !lowerName.includes('beaker'))) {
            if (obj.mesh.userData.isInsideBurnerStand) {
                const burnerStandObj = this.objects.get('Burner Stand');
                if (burnerStandObj && burnerStandObj.mesh) {
                    const burnerMesh = this.burnerStand || burnerStandObj.mesh;
                    burnerMesh.updateMatrixWorld(true);
                    obj.mesh.updateMatrixWorld(true);
                    
                        const burnerBox = new THREE.Box3().setFromObject(burnerMesh);
                        const burnerCenter = burnerBox.getCenter(new THREE.Vector3());
                        const burnerSize = burnerBox.getSize(new THREE.Vector3());
                        const burnerBottom = burnerBox.min.y;
                        
                        const lampBox = new THREE.Box3().setFromObject(obj.mesh);
                        const lampSize = lampBox.getSize(new THREE.Vector3());
                        const targetY = burnerBottom + (burnerSize.y * 0.02) + (lampSize.y * 0.05);
                        
                        obj.mesh.position.x = burnerCenter.x;
                        obj.mesh.position.z = burnerCenter.z;
                        obj.mesh.position.y = targetY;
                        obj.mesh.updateMatrixWorld(true);
                    
                    if (obj.physicsBody && this.physicsManager) {
                        const targetPos = new THREE.Vector3(burnerCenter.x, targetY, burnerCenter.z);
                        obj.physicsBody.type = this.physicsManager.CANNON.Body.KINEMATIC;
                        this.physicsManager.setBodyPosition(obj.physicsBody, targetPos);
                        obj.physicsBody.velocity.set(0, 0, 0);
                        obj.physicsBody.angularVelocity.set(0, 0, 0);
                    }
                }
                return;
            }
        }
        
        const burnerStandObj = this.objects.get('Burner Stand');
        if (!burnerStandObj) return;
        
        const burnerMesh = this.burnerStand || burnerStandObj.mesh;
        if (!burnerMesh) return;
        
        burnerMesh.updateMatrixWorld(true);
        obj.mesh.updateMatrixWorld(true);
        
        const burnerBox = new THREE.Box3().setFromObject(burnerMesh);
        const burnerCenter = burnerBox.getCenter(new THREE.Vector3());
        const burnerTop = burnerBox.max.y;
        const burnerSize = burnerBox.getSize(new THREE.Vector3());
        
        const objBox = new THREE.Box3().setFromObject(obj.mesh);
        const objCenter = objBox.getCenter(new THREE.Vector3());
        const objSize = objBox.getSize(new THREE.Vector3());
        
        const horizontalDistance = Math.sqrt(
            Math.pow(objCenter.x - burnerCenter.x, 2) + 
            Math.pow(objCenter.z - burnerCenter.z, 2)
        );
        
        const maxHorizontalDistance = Math.min(burnerSize.x, burnerSize.z) * 0.4;
        
        if (horizontalDistance < maxHorizontalDistance) {
            if (lowerName.includes('spirit') || lowerName.includes('alcohol') || (lowerName.includes('lamp') && !lowerName.includes('beaker'))) {
                const burnerBottom = burnerBox.min.y;
                const targetY = burnerBottom + (burnerSize.y * 0.3) + (objSize.y * 0.5);
                const maxVerticalDistance = burnerSize.y * 0.4;
                const verticalDistance = Math.abs(objCenter.y - burnerCenter.y);
                
                if (verticalDistance < maxVerticalDistance) {
                    obj.mesh.position.x = burnerCenter.x;
                    obj.mesh.position.z = burnerCenter.z;
                    obj.mesh.position.y = targetY;
                    obj.mesh.updateMatrixWorld(true);
                    
                    if (obj.physicsBody && this.physicsManager) {
                        const targetPos = new THREE.Vector3(burnerCenter.x, targetY, burnerCenter.z);
                        obj.physicsBody.type = this.physicsManager.CANNON.Body.KINEMATIC;
                        this.physicsManager.setBodyPosition(obj.physicsBody, targetPos);
                        obj.physicsBody.velocity.set(0, 0, 0);
                        obj.physicsBody.angularVelocity.set(0, 0, 0);
                    }
                }
            } else {
                const objBottom = objBox.min.y;
                const targetY = burnerTop + objSize.y / 2;
                
                if (Math.abs(objBottom - burnerTop) < 0.3) {
                    obj.mesh.position.x = burnerCenter.x;
                    obj.mesh.position.z = burnerCenter.z;
                    obj.mesh.position.y = targetY;
                    obj.mesh.updateMatrixWorld(true);
                    
                    if (obj.physicsBody && this.physicsManager) {
                        const newCenter = new THREE.Vector3(burnerCenter.x, targetY, burnerCenter.z);
                        this.physicsManager.setBodyPosition(obj.physicsBody, newCenter);
                        obj.physicsBody.velocity.set(0, 0, 0);
                        obj.physicsBody.angularVelocity.set(0, 0, 0);
                    }
                }
            }
        }
    }

    placeSpiritLampInBurnerStand(spiritLampObj) {
        console.log('placeSpiritLampInBurnerStand called with:', spiritLampObj?.name);
        
        if (!spiritLampObj || !spiritLampObj.mesh) {
            console.log('Missing spiritLampObj or mesh');
            return;
        }
        
        const burnerStandObj = this.objects.get('Burner Stand');
        if (!burnerStandObj || !burnerStandObj.mesh) {
            console.log('Burner Stand object not found in objects map');
            return;
        }
        
        const burnerMesh = this.burnerStand || burnerStandObj.mesh;
        if (!burnerMesh) {
            console.log('Burner stand mesh not available');
            return;
        }
        
        burnerMesh.updateMatrixWorld(true);
        spiritLampObj.mesh.updateMatrixWorld(true);
        
        const burnerBox = new THREE.Box3().setFromObject(burnerMesh);
        const burnerCenter = burnerBox.getCenter(new THREE.Vector3());
        const burnerSize = burnerBox.getSize(new THREE.Vector3());
        const burnerBottom = burnerBox.min.y;
        const burnerTop = burnerBox.max.y;
        
        const lampBox = new THREE.Box3().setFromObject(spiritLampObj.mesh);
        const lampSize = lampBox.getSize(new THREE.Vector3());
        
        const targetY = burnerBottom + (burnerSize.y * 0.02) + (lampSize.y * 0.05);
        
        console.log('Burner box:', { bottom: burnerBottom, top: burnerTop, center: burnerCenter.y, size: burnerSize });
        console.log('Lamp size:', lampSize);
        console.log('Calculated targetY:', targetY, 'which is', ((targetY - burnerBottom) / burnerSize.y * 100).toFixed(1) + '% up from bottom');
        
        console.log('Moving spirit lamp INSIDE burner - center:', burnerCenter, 'bottom:', burnerBottom, 'targetY:', targetY);
        
        const targetPosition = new THREE.Vector3(burnerCenter.x, targetY, burnerCenter.z);
        
        spiritLampObj.mesh.position.x = targetPosition.x;
        spiritLampObj.mesh.position.z = targetPosition.z;
        spiritLampObj.mesh.position.y = targetPosition.y;
        spiritLampObj.mesh.updateMatrixWorld(true);
        
        if (!spiritLampObj.mesh.userData) {
            spiritLampObj.mesh.userData = {};
        }
        if (!spiritLampObj.userData) {
            spiritLampObj.userData = {};
        }
        spiritLampObj.mesh.userData.isInsideBurnerStand = true;
        spiritLampObj.userData.isInsideBurnerStand = true;
        
        if (spiritLampObj.physicsBody && this.physicsManager && this.physicsManager.world) {
            const world = this.physicsManager.world;
            
            if (world.bodies && world.bodies.includes(spiritLampObj.physicsBody)) {
                world.removeBody(spiritLampObj.physicsBody);
                console.log('Removed spirit lamp from physics world to prevent collision');
            }
            
            spiritLampObj.physicsBody.type = this.physicsManager.CANNON.Body.KINEMATIC;
            spiritLampObj.physicsBody.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
            spiritLampObj.physicsBody.velocity.set(0, 0, 0);
            spiritLampObj.physicsBody.angularVelocity.set(0, 0, 0);
        }
        
        const lowerName = spiritLampObj.name.toLowerCase();
        if (lowerName.includes('spirit') || lowerName.includes('alcohol') || lowerName.includes('lamp')) {
            this.spiritLamp = spiritLampObj.mesh;
            const spiritLampObjData = this.objects.get('Spirit Lamp');
            if (spiritLampObjData && spiritLampObjData !== spiritLampObj) {
                spiritLampObjData.mesh = spiritLampObj.mesh;
            }
        }
        
        console.log('Spirit/Alcohol lamp placed inside burner stand at:', spiritLampObj.mesh.position);
    }

    placeObjectOnBurnerStand(obj) {
        console.log('placeObjectOnBurnerStand called with:', obj?.name);
        
        if (!obj || !obj.mesh) {
            console.log('Missing obj or mesh');
            return;
        }
        
        const lowerName = obj.name.toLowerCase();
        if (obj.name === 'Burner Stand' || lowerName.includes('spirit') || lowerName.includes('alcohol') || (lowerName.includes('lamp') && !lowerName.includes('beaker'))) {
            console.log('Object is burner stand or lamp, skipping placement');
            return;
        }
        
        const burnerStandObj = this.objects.get('Burner Stand');
        if (!burnerStandObj || !burnerStandObj.mesh) {
            console.log('Burner Stand object not found in objects map');
            return;
        }
        
        const burnerMesh = this.burnerStand || burnerStandObj.mesh;
        if (!burnerMesh) {
            console.log('Burner stand mesh not available');
            return;
        }
        
        burnerMesh.updateMatrixWorld(true);
        obj.mesh.updateMatrixWorld(true);
        
        const burnerBox = new THREE.Box3().setFromObject(burnerMesh);
        const burnerCenter = burnerBox.getCenter(new THREE.Vector3());
        const burnerTop = burnerBox.max.y;
        
        obj.mesh.position.x = burnerCenter.x;
        obj.mesh.position.z = burnerCenter.z;
        obj.mesh.updateMatrixWorld(true);
        
        const objBox = new THREE.Box3().setFromObject(obj.mesh);
        const objBottom = objBox.min.y;
        const currentPositionY = obj.mesh.position.y;
        
        const offsetFromPivotToBottom = currentPositionY - objBottom;
        const targetY = burnerTop + offsetFromPivotToBottom;
        
        console.log('Moving object to burner top - center:', burnerCenter, 'top:', burnerTop);
        console.log('Object bottom:', objBottom, 'Current pivot position:', currentPositionY);
        console.log('Offset from pivot to bottom:', offsetFromPivotToBottom, 'Target Y:', targetY);
        
        obj.mesh.position.y = targetY;
        obj.mesh.updateMatrixWorld(true);
        
        const verifyBox = new THREE.Box3().setFromObject(obj.mesh);
        const verifyBottom = verifyBox.min.y;
        console.log('After placement - Object bottom:', verifyBottom, 'Burner top:', burnerTop, 'Difference:', (verifyBottom - burnerTop).toFixed(4));
        
        if (obj.physicsBody && this.physicsManager) {
            const newCenter = new THREE.Vector3(burnerCenter.x, targetY, burnerCenter.z);
            this.physicsManager.setBodyPosition(obj.physicsBody, newCenter);
            obj.physicsBody.velocity.set(0, 0, 0);
            obj.physicsBody.angularVelocity.set(0, 0, 0);
        }
        
        console.log('Object placed on top of burner stand at:', obj.mesh.position);
    }

    checkCollision(obj1, obj2) {
        const box1 = new THREE.Box3().setFromObject(obj1.mesh);
        const box2 = new THREE.Box3().setFromObject(obj2.mesh);
        return box1.intersectsBox(box2);
    }

    getChemicalState(contentType) {
        const type = (contentType || '').toLowerCase();
        if (this.chemicalStates.solid.some(solid => type.includes(solid))) {
            return 'solid';
        }
        if (this.chemicalStates.gas.some(gas => type.includes(gas))) {
            return 'gas';
        }
        return 'liquid';
    }

    hasGasContent(obj) {
        if (!obj.properties.contents || obj.properties.contents.length === 0) {
            return false;
        }
        return obj.properties.contents.some(content => {
            const state = this.getChemicalState(content.type);
            return state === 'gas';
        });
    }

    getGasContent(obj) {
        if (!obj.properties.contents || obj.properties.contents.length === 0) {
            return [];
        }
        return obj.properties.contents.filter(content => {
            const state = this.getChemicalState(content.type);
            return state === 'gas';
        });
    }

    processGasEscape(obj) {
        if (!obj.properties.contents || obj.properties.contents.length === 0) {
            return;
        }

        const gasContents = this.getGasContent(obj);
        if (gasContents.length === 0) {
            return;
        }

        const isSealed = obj.properties.isSealed || false;
        if (isSealed) {
            return;
        }

        gasContents.forEach((gasContent, index) => {
            const escapeRate = 0.1;
            const escaped = Math.min(gasContent.volume || 0, escapeRate);
            
            if (escaped > 0) {
                gasContent.volume -= escaped;
                if (gasContent.volume <= 0) {
                    const contentIndex = obj.properties.contents.indexOf(gasContent);
                    if (contentIndex !== -1) {
                        obj.properties.contents.splice(contentIndex, 1);
                    }
                }
                
                if (!this.effects.has(obj.name + '_smoke')) {
                    this.createSmokeEffect(obj);
                }
            }
        });
    }

    updateEffects(obj) {
        if (obj.properties.temperature > 100 && !this.effects.has(obj.name + '_boiling')) {
            this.createBoilingEffect(obj);
        }
        
        const hasGas = this.hasGasContent(obj);
        if (hasGas && !this.effects.has(obj.name + '_smoke')) {
            this.createSmokeEffect(obj);
        } else if (!hasGas && this.effects.has(obj.name + '_smoke')) {
            this.removeSmokeEffect(obj);
        }
        
        if (obj.properties.temperature > 80 && hasGas && !this.effects.has(obj.name + '_smoke')) {
            this.createSmokeEffect(obj);
        }
        
        const isFlammable = this.isFlammable(obj);
        if (isFlammable && obj.properties.temperature > 200 && !this.effects.has(obj.name + '_fire')) {
            this.createFireEffect(obj);
        } else if (!isFlammable || obj.properties.temperature <= 180) {
            if (this.effects.has(obj.name + '_fire')) {
                this.removeFireEffect(obj);
            }
        }
        
        this.processGasEscape(obj);
    }
    
    isFlammable(obj) {
        if (!obj.properties.contents || obj.properties.contents.length === 0) {
            return false;
        }
        
        const flammableSubstances = ['alcohol', 'ethanol', 'methanol', 'gasoline', 'oil', 'petrol', 'acetone', 'ether'];
        
        return obj.properties.contents.some(content => {
            const type = (content.type || '').toLowerCase();
            return flammableSubstances.some(flammable => type.includes(flammable));
        });
    }

    createBoilingEffect(obj) {
        const effect = {
            type: 'boiling',
            particles: [],
            active: true
        };
        
        const baseCount = 20;
        const particleCount = this.performanceManager.getParticleCount(baseCount);
        
        for (let i = 0; i < particleCount; i++) {
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
            active: true,
            object: obj,
            time: 0
        };
        
        const baseCount = 80;
        const particleCount = this.performanceManager.getParticleCount(baseCount);
        
        obj.mesh.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(obj.mesh);
        if (!box || box.isEmpty()) {
            console.warn(`Cannot create smoke effect for ${obj.name}: invalid bounding box`);
            return;
        }
        
        const sizeVec = box.getSize(new THREE.Vector3());
        const minYWorld = box.min.y;
        const maxYWorld = box.max.y;
        const containerCenter = box.getCenter(new THREE.Vector3());
        
        const volume = this.calculateVolume(obj);
        const liquidHeight = this.calculateLiquidHeight(obj, volume);
        const containerBottom = minYWorld;
        const liquidBottom = containerBottom + (sizeVec.y * 0.05);
        const liquidSurfaceY = liquidBottom + liquidHeight;
        const beakerTopY = maxYWorld - sizeVec.y * 0.02;
        const spawnY = volume > 0.001 ? liquidSurfaceY : beakerTopY;
        
        for (let i = 0; i < particleCount; i++) {
            const size = 0.008 + Math.random() * 0.012;
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(size, 6, 6),
                new THREE.MeshBasicMaterial({ 
                    color: 0xcccccc,
                    transparent: true, 
                    opacity: 0.15 + Math.random() * 0.25
                })
            );
            
            particle.position.set(
                containerCenter.x + (Math.random() - 0.5) * sizeVec.x * 0.3,
                spawnY + Math.random() * 0.05,
                containerCenter.z + (Math.random() - 0.5) * sizeVec.z * 0.3
            );
            
            const baseVelocityY = 0.04 + Math.random() * 0.06;
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                baseVelocityY,
                (Math.random() - 0.5) * 0.02
            );
            
            particle.userData = {
                baseSize: size,
                baseOpacity: particle.material.opacity,
                baseY: spawnY,
                spawnY: spawnY,
                life: 1.0,
                turbulence: {
                    x: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02,
                    phase: Math.random() * Math.PI * 2
                }
            };
            
            this.scene.add(particle);
            effect.particles.push(particle);
        }
        
        this.effects.set(obj.name + '_smoke', effect);
    }

    createFireEffect(obj) {
        const effect = {
            type: 'fire',
            particles: [],
            active: true,
            flickerTime: 0
        };
        
        const fireColors = [0xff4400, 0xff6600, 0xff8800, 0xffaa00, 0xffff00];
        const baseCount = 30;
        const particleCount = this.performanceManager.getParticleCount(baseCount);
        
        for (let i = 0; i < particleCount; i++) {
            const color = fireColors[Math.floor(Math.random() * fireColors.length)];
            const size = 0.03 + Math.random() * 0.04;
            
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(size, 8, 8),
                new THREE.MeshBasicMaterial({ 
                    color: color, 
                    transparent: true, 
                    opacity: 0.8 + Math.random() * 0.2 
                })
            );
            
            const box = obj.boundingBox;
            const sizeVec = box.getSize(new THREE.Vector3());
            const minY = box.min.y;
            
            particle.position.copy(obj.mesh.position);
            particle.position.y = minY + sizeVec.y * 0.3 + Math.random() * sizeVec.y * 0.4;
            particle.position.x += (Math.random() - 0.5) * sizeVec.x * 0.6;
            particle.position.z += (Math.random() - 0.5) * sizeVec.z * 0.6;
            
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.08,
                Math.random() * 0.15 + 0.1,
                (Math.random() - 0.5) * 0.08
            );
            
            particle.userData.baseY = particle.position.y;
            particle.userData.flickerSpeed = 0.5 + Math.random() * 0.5;
            particle.userData.flickerAmount = 0.05 + Math.random() * 0.05;
            particle.userData.life = 1.0;
            particle.userData.decayRate = 0.01 + Math.random() * 0.01;
            
            this.scene.add(particle);
            effect.particles.push(particle);
        }
        
        this.effects.set(obj.name + '_fire', effect);
    }

    removeSmokeEffect(obj) {
        const effect = this.effects.get(obj.name + '_smoke');
        if (effect) {
            effect.particles.forEach(particle => {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            });
            this.effects.delete(obj.name + '_smoke');
        }
    }

    removeFireEffect(obj) {
        const effect = this.effects.get(obj.name + '_fire');
        if (effect) {
            effect.particles.forEach(particle => {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            });
            this.effects.delete(obj.name + '_fire');
        }
    }

    updateFireEffects() {
        for (const [key, effect] of this.effects) {
            if (!effect.active) continue;
            
            if (effect.type === 'threefire' && effect.fire) {
                if (this.spiritLamp) {
                    const lampBox = new THREE.Box3().setFromObject(this.spiritLamp);
                    const lampTopY = lampBox.max.y;
                    const lampCenter = lampBox.getCenter(new THREE.Vector3());
                    const fireOffset = 0.2;
                    effect.fire.position.set(lampCenter.x, lampTopY + fireOffset, lampCenter.z);
                }
                if (effect.fire.update && typeof effect.fire.update === 'function') {
                    const time = (performance.now() - (this.startTime || 0)) / 1000;
                    effect.fire.update(time);
                }
            }
        }
    }

    updateParticles() {
        for (const [key, effect] of this.effects) {
            if (!effect.active) continue;
            
            if (effect.type === 'threefire' && effect.fire) {
                continue;
            }
            
            if (effect.type === 'fire') {
                effect.flickerTime += 0.1;
                
                effect.particles.forEach((particle, index) => {
                    particle.position.add(particle.velocity);
                    
                    const flicker = Math.sin(effect.flickerTime * particle.userData.flickerSpeed) * particle.userData.flickerAmount;
                    particle.position.y = particle.userData.baseY + flicker;
                    
                    particle.userData.life -= particle.userData.decayRate;
                    particle.material.opacity = particle.userData.life * 0.8;
                    
                    const sizeScale = 0.8 + Math.sin(effect.flickerTime * particle.userData.flickerSpeed * 2) * 0.2;
                    particle.scale.set(sizeScale, sizeScale, sizeScale);
                    
                    if (particle.userData.life <= 0 || particle.material.opacity < 0.01) {
                        if (key === 'spiritLamp_fire' && this.spiritLamp) {
                            const lampBox = new THREE.Box3().setFromObject(this.spiritLamp);
                            const lampTopY = lampBox.max.y;
                            const lampCenter = lampBox.getCenter(new THREE.Vector3());
                            
                            particle.position.set(
                                lampCenter.x + (Math.random() - 0.5) * 0.1,
                                lampTopY + Math.random() * 0.15,
                                lampCenter.z + (Math.random() - 0.5) * 0.1
                            );
                            
                            particle.userData.baseY = particle.position.y;
                            particle.userData.life = 1.0;
                            particle.material.opacity = 0.8 + Math.random() * 0.2;
                        } else {
                            const obj = this.findObjectByFireKey(key);
                            if (obj) {
                                const box = obj.boundingBox;
                                const sizeVec = box.getSize(new THREE.Vector3());
                                const minY = box.min.y;
                                
                                particle.position.copy(obj.mesh.position);
                                particle.position.y = minY + sizeVec.y * 0.3 + Math.random() * sizeVec.y * 0.4;
                                particle.position.x += (Math.random() - 0.5) * sizeVec.x * 0.6;
                                particle.position.z += (Math.random() - 0.5) * sizeVec.z * 0.6;
                                
                                particle.userData.life = 1.0;
                                particle.material.opacity = 0.8 + Math.random() * 0.2;
                            }
                        }
                    }
                });
            } else if (effect.type === 'smoke') {
                const obj = effect.object;
                if (!obj) {
                    const objectName = key.replace('_smoke', '');
                    obj = this.objects.get(objectName);
                    if (obj) effect.object = obj;
                }
                
                const hasGas = obj && this.hasGasContent(obj);
                effect.time += 0.016;
                
                if (!hasGas || !obj) {
                    effect.particles.forEach(particle => {
                        particle.material.opacity *= 0.95;
                        if (particle.material.opacity < 0.01) {
                            particle.position.y = -1000;
                            particle.velocity.multiplyScalar(0);
                        } else {
                            particle.position.add(particle.velocity);
                        }
                    });
                    return;
                }
                
                obj.mesh.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(obj.mesh);
                if (!box || box.isEmpty()) {
                    return;
                }
                
                const sizeVec = box.getSize(new THREE.Vector3());
                const minYWorld = box.min.y;
                const maxYWorld = box.max.y;
                const containerCenter = box.getCenter(new THREE.Vector3());
                
                const volume = this.calculateVolume(obj);
                const liquidHeight = this.calculateLiquidHeight(obj, volume);
                const containerBottom = minYWorld;
                const liquidBottom = containerBottom + (sizeVec.y * 0.05);
                const liquidSurfaceY = liquidBottom + liquidHeight;
                const beakerTopY = maxYWorld - sizeVec.y * 0.02;
                const spawnY = volume > 0.001 ? liquidSurfaceY : beakerTopY;
                const maxHeight = maxYWorld + 3;
                
                effect.particles.forEach(particle => {
                    const userData = particle.userData;
                    
                    particle.velocity.x += Math.sin(effect.time * 2 + userData.turbulence.phase) * 0.001;
                    particle.velocity.z += Math.cos(effect.time * 2 + userData.turbulence.phase) * 0.001;
                    particle.velocity.x *= 0.99;
                    particle.velocity.z *= 0.99;
                    
                    particle.position.add(particle.velocity);
                    
                    const heightAboveBase = particle.position.y - userData.spawnY;
                    const expansionFactor = 1 + heightAboveBase * 0.3;
                    const currentSize = userData.baseSize * expansionFactor;
                    particle.scale.set(currentSize / userData.baseSize, currentSize / userData.baseSize, currentSize / userData.baseSize);
                    
                    userData.life -= 0.0015;
                    const fadeStart = 0.3;
                    if (userData.life < fadeStart) {
                        particle.material.opacity = userData.baseOpacity * (userData.life / fadeStart);
                    }
                    
                    const shouldRegenerate = particle.material.opacity < 0.01 || 
                        particle.position.y > maxHeight ||
                        userData.life <= 0;
                    
                    if (shouldRegenerate) {
                        const size = 0.008 + Math.random() * 0.012;
                        particle.geometry.dispose();
                        particle.geometry = new THREE.SphereGeometry(size, 6, 6);
                        particle.material.opacity = 0.15 + Math.random() * 0.25;
                        
                        particle.position.set(
                            containerCenter.x + (Math.random() - 0.5) * sizeVec.x * 0.3,
                            spawnY + Math.random() * 0.05,
                            containerCenter.z + (Math.random() - 0.5) * sizeVec.z * 0.3
                        );
                        
                        const baseVelocityY = 0.04 + Math.random() * 0.06;
                        particle.velocity.set(
                            (Math.random() - 0.5) * 0.02,
                            baseVelocityY,
                            (Math.random() - 0.5) * 0.02
                        );
                        
                        particle.scale.set(1, 1, 1);
                        userData.baseSize = size;
                        userData.baseOpacity = particle.material.opacity;
                        userData.baseY = spawnY;
                        userData.spawnY = spawnY;
                        userData.life = 1.0;
                        userData.turbulence.phase = Math.random() * Math.PI * 2;
                    }
                });
            } else {
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
    }

    findObjectByFireKey(key) {
        const objectName = key.replace('_fire', '');
        return this.objects.get(objectName);
    }

    updateMeasurements(obj) {
        if (obj.properties.isContainer) {
            const volume = this.calculateVolume(obj);
            this.measurements.volume[obj.name] = volume;
            if (this.updateLiquidMesh) {
                this.updateLiquidMesh(obj);
            }
            if (this.updatePowderMesh) {
                this.updatePowderMesh(obj);
            }
        }
        
        this.measurements.temperature[obj.name] = obj.properties.temperature;
        this.measurements.time = (Date.now() - this.measurements.time) / 1000;
    }

    calculateVolume(obj) {
        if (!obj.properties.isContainer) return 0;
        
        let totalVolume = 0;
        
        if (obj.properties.contents && Array.isArray(obj.properties.contents) && obj.properties.contents.length > 0) {
            obj.properties.contents.forEach(content => {
                if (typeof content === 'object') {
                    const state = this.getChemicalState(content.type);
                    if (state === 'solid' && content.mass !== undefined) {
                        const density = 1.5;
                        totalVolume += (content.mass || 0) / density;
                    } else if (state === 'gas') {
                        totalVolume += (content.volume || 0) * 0.1;
                    } else if (content.volume !== undefined) {
                        totalVolume += content.volume || 0;
                    }
                } else if (typeof content === 'string') {
                    const volume = obj.properties.volume || 0;
                    if (totalVolume === 0) {
                        totalVolume = volume;
                    }
                }
            });
        }
        
        if (totalVolume === 0) {
            if (obj.properties.contents && Array.isArray(obj.properties.contents) && obj.properties.contents.length === 0) {
                return 0;
            }
            if (obj.properties.volume !== undefined && obj.properties.volume > 0) {
                totalVolume = obj.properties.volume;
            }
        }
        
        return Math.min(totalVolume, obj.properties.capacity || 1000);
    }

    calculateLiquidHeight(obj, volume) {
        if (!obj.properties.isContainer || volume <= 0) return 0;
        
        let box = obj.boundingBox;
        if (!box && obj.mesh) {
            obj.mesh.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(obj.mesh);
        }
        if (!box || box.isEmpty()) return 0;
        
        const size = box.getSize(new THREE.Vector3());
        const containerHeight = size.y;
        
        if (containerHeight <= 0) return 0;
        
        const capacity = obj.properties.capacity || 1000;
        const fillRatio = Math.min(volume / capacity, 1);
        
        let liquidHeight = containerHeight * fillRatio * 0.85;
        
        if (fillRatio > 0 && fillRatio < 0.05) {
            const minVisibleHeight = Math.max(containerHeight * 0.02, 0.05);
            liquidHeight = Math.max(liquidHeight, minVisibleHeight);
        }
        
        const maxHeight = containerHeight * 0.9;
        liquidHeight = Math.min(liquidHeight, maxHeight);
        
        return liquidHeight;
    }

    checkChemicalReaction(obj) {
        if (!obj.properties.contents || obj.properties.contents.length === 0) {
            return null;
        }
        
        const reactions = this.getReactionRules();
        const contentTypes = obj.properties.contents.map(c => (c.type || '').toLowerCase());
        const temp = obj.properties.temperature || 20;
        
        for (const reaction of reactions) {
            const reactants = reaction.reactants.map(r => r.toLowerCase());
            const hasAllReactants = reactants.every(reactant => 
                contentTypes.some(type => type === reactant || type.includes(reactant))
            );
            
            if (hasAllReactants) {
                if (reaction.minTemperature !== undefined && temp < reaction.minTemperature) {
                    continue;
                }
                if (reaction.maxTemperature !== undefined && temp > reaction.maxTemperature) {
                    continue;
                }
                
                return reaction;
            }
        }
        
        return null;
    }

    processChemicalReaction(obj, reaction) {
        if (!reaction || !obj.properties.contents) return;
        
        const reactants = reaction.reactants.map(r => r.toLowerCase());
        
        const reactantContents = [];
        obj.properties.contents.forEach((content) => {
            const type = (content.type || '').toLowerCase();
            const isReactant = reactants.some(reactant => type.includes(reactant));
            if (isReactant) {
                reactantContents.push({ content, type });
            }
        });
        
        if (reactantContents.length < reactants.length) {
            return;
        }
        
        const reactionRate = 0.1;
        let totalReactedVolume = 0;
        let totalReactedMass = 0;
        let hasReaction = false;
        
        reactantContents.forEach(({ content }) => {
            const state = this.getChemicalState(content.type);
            
            if (state === 'solid' && content.mass !== undefined && content.mass > 0.001) {
                const reactedMass = Math.min(content.mass * reactionRate, content.mass);
                if (reactedMass > 0.001) {
                    content.mass -= reactedMass;
                    totalReactedMass += reactedMass;
                    hasReaction = true;
                    
                    const density = 1.5;
                    totalReactedVolume += reactedMass / density;
                    
                    if (content.mass <= 0.001) {
                        content.mass = 0;
                    }
                }
            } else if (state === 'liquid' && content.volume !== undefined && content.volume > 0.001) {
                const reactedVolume = Math.min(content.volume * reactionRate, content.volume);
                if (reactedVolume > 0.001) {
                    content.volume -= reactedVolume;
                    totalReactedVolume += reactedVolume;
                    hasReaction = true;
                    
                    if (content.volume <= 0.001) {
                        content.volume = 0;
                    }
                }
            }
        });
        
        obj.properties.contents = obj.properties.contents.filter(c => {
            const state = this.getChemicalState(c.type);
            if (state === 'solid') {
                return (c.mass || 0) > 0.001;
            } else if (state === 'liquid') {
                return (c.volume || 0) > 0.001;
            } else {
                return (c.volume || 0) > 0.001;
            }
        });
        
        if (reaction.result && hasReaction && (totalReactedVolume > 0.001 || totalReactedMass > 0.001)) {
            const productType = reaction.result.type || 'product';
            const productState = this.getChemicalState(productType);
            
            const existingProduct = obj.properties.contents.find(
                c => (c.type || '').toLowerCase() === productType.toLowerCase()
            );
            
            const productAmount = totalReactedVolume > 0.001 ? totalReactedVolume : (totalReactedMass / 1.5);
            
            if (existingProduct) {
                if (productState === 'solid') {
                    existingProduct.mass = (existingProduct.mass || 0) + (productAmount * 0.5);
                } else if (productState === 'gas') {
                    existingProduct.volume = (existingProduct.volume || 0) + productAmount;
                } else {
                    existingProduct.volume = (existingProduct.volume || 0) + productAmount;
                }
            } else {
                const newProduct = {
                    type: productType,
                    volume: productState === 'solid' ? 0 : productAmount,
                    mass: productState === 'solid' ? (productAmount * 0.5) : undefined
                };
                obj.properties.contents.push(newProduct);
            }
            
            if (productState === 'gas') {
                if (!this.effects.has(obj.name + '_smoke')) {
                    this.createSmokeEffect(obj);
                }
            }
        }
        
        if (hasReaction) {
            if (!obj.properties.reactedReactions) {
                obj.properties.reactedReactions = [];
            }
            
            const hasReactedBefore = obj.properties.reactedReactions.some(r => r.type === reaction.result.type);
            if (!hasReactedBefore) {
                obj.properties.reactedReactions.push({
                    type: reaction.result.type,
                    timestamp: Date.now()
                });
                this.addFeedback(reaction.message || 'Chemical reaction occurred');
            }
        }
        
        if (this.updateLiquidMesh) {
            this.updateLiquidMesh(obj);
        }
        
        if (this.updatePowderMesh) {
            this.updatePowderMesh(obj);
        }
        
        if (this.updateEffects) {
            this.updateEffects(obj);
        }
        
        this.updateMeasurements(obj);
    }

    getReactionRules() {
        if (this.config.reactions && Array.isArray(this.config.reactions)) {
            return this.config.reactions;
        }
        
        return [
            {
                reactants: ['acid', 'base'],
                result: { type: 'salt', color: 0xffffff },
                message: 'Acid and base neutralized to form salt'
            },
            {
                reactants: ['acid', 'water'],
                result: { type: 'acidic_solution', color: 0xff6666 },
                message: 'Acid diluted in water'
            },
            {
                reactants: ['base', 'water'],
                result: { type: 'basic_solution', color: 0x6666ff },
                message: 'Base diluted in water'
            },
            {
                reactants: ['copper', 'acid'],
                result: { type: 'copper_salt', color: 0x00ff00 },
                message: 'Copper reacts with acid to form green salt'
            },
            {
                reactants: ['iron', 'acid'],
                result: { type: 'iron_salt', color: 0xffff00 },
                message: 'Iron reacts with acid to form yellow salt'
            },
            {
                reactants: ['phenolphthalein', 'base'],
                result: { type: 'pink_solution', color: 0xff69b4 },
                message: 'Phenolphthalein turns pink in base'
            },
            {
                reactants: ['litmus', 'acid'],
                result: { type: 'red_solution', color: 0xff0000 },
                message: 'Litmus turns red in acid'
            },
            {
                reactants: ['litmus', 'base'],
                result: { type: 'blue_solution', color: 0x0000ff },
                message: 'Litmus turns blue in base'
            },
            {
                reactants: ['acid', 'carbonate'],
                result: { type: 'co2', color: 0xcccccc },
                message: 'Acid reacts with carbonate to produce carbon dioxide gas'
            },
            {
                reactants: ['acid', 'metal'],
                result: { type: 'hydrogen', color: 0xffffff },
                message: 'Acid reacts with metal to produce hydrogen gas'
            },
            {
                reactants: ['water', 'temperature'],
                result: { type: 'steam', color: 0xeeeeee },
                message: 'Water heated to produce steam',
                minTemperature: 100
            }
        ];
    }

    getLiquidColor(obj) {
        if (!obj.properties.contents || obj.properties.contents.length === 0) {
            return new THREE.Color(0x4a90e2);
        }
        
        const allContents = obj.properties.contents;
        const liquidContents = allContents.filter(c => {
            const state = this.getChemicalState(c.type);
            return state === 'liquid' && (c.volume || 0) > 0.001;
        });
        
        if (liquidContents.length === 0) {
            return new THREE.Color(0x4a90e2);
        }
        
        const tempObj = { ...obj, properties: { ...obj.properties, contents: liquidContents } };
        const reaction = this.checkChemicalReaction(tempObj);
        if (reaction) {
            const resultState = this.getChemicalState(reaction.result.type);
            if (resultState === 'liquid') {
                return new THREE.Color(reaction.result.color);
            }
        }
        
        const contents = liquidContents;
        let baseColor = new THREE.Color(0x4a90e2);
        
        const reactions = this.getReactionRules();
        const colorMap = {
            'water': 0x4a90e2,
            'acid': 0xff4444,
            'base': 0x4444ff,
            'salt': 0xffffff,
            'sugar': 0xfff8dc,
            'alcohol': 0xfff8dc,
            'oil': 0xffd700,
            'copper': 0xb87333,
            'iron': 0x808080,
            'phenolphthalein': 0xffffff,
            'litmus': 0x9370db,
            'universal_indicator': 0x00ff00,
            'indicator': 0xffeb3b,
            'indicator_solution': 0xffeb3b,
            'yellow_solution': 0xffeb3b,
            'heated_indicator': 0xff9800,
            'acidic_solution': 0xe91e63
        };
        
        const getInitialStateForObject = (objectName) => {
            if (!this.config.initialState || !Array.isArray(this.config.initialState)) {
                return null;
            }
            const lowerObjectName = objectName.toLowerCase();
            const normalizedObjectName = lowerObjectName.replace(/\s+\d+$/, '');
            
            for (const state of this.config.initialState) {
                if (!state.objectName) continue;
                const lowerStateName = state.objectName.toLowerCase();
                const normalizedStateName = lowerStateName.replace(/\s+\d+$/, '');
                if (normalizedStateName === normalizedObjectName || lowerStateName === lowerObjectName) {
                    return state;
                }
            }
            return null;
        };
        
        const initialState = getInitialStateForObject(obj.name);
        
        const currentVolume = this.calculateVolume(obj);
        const initialVolume = initialState && initialState.volume ? initialState.volume : 0;
        const hasInitialContents = Math.abs(currentVolume - initialVolume) < 0.1;
        
        if (contents.length === 1) {
            const contentType = (contents[0].type || '').toLowerCase();
            
            if (hasInitialContents && initialState && initialState.initialColor) {
                const colorStr = initialState.initialColor.startsWith('#') ? initialState.initialColor : '#' + initialState.initialColor;
                baseColor = new THREE.Color(colorStr);
            } else {
                const reactionForContent = reactions.find(r => 
                    r.result && (r.result.type || '').toLowerCase() === contentType
                );
                if (reactionForContent && reactionForContent.result && reactionForContent.result.color !== undefined) {
                    baseColor = new THREE.Color(reactionForContent.result.color);
                } else {
                    baseColor = new THREE.Color(colorMap[contentType] || colorMap['water']);
                }
            }
        } else {
            const contentTypes = contents.map(c => (c.type || '').toLowerCase());
            const reactionForMixed = reactions.find(r => {
                if (!r.result || !r.reactants) return false;
                const reactants = r.reactants.map(react => react.toLowerCase());
                const hasAllReactants = reactants.every(reactant => 
                    contentTypes.some(type => type === reactant || type.includes(reactant))
                );
                return hasAllReactants;
            });
            
            if (reactionForMixed && reactionForMixed.result && reactionForMixed.result.color !== undefined) {
                baseColor = new THREE.Color(reactionForMixed.result.color);
            } else {
                let r = 0, g = 0, b = 0;
                let totalVolume = 0;
                
                contents.forEach(content => {
                    const vol = content.volume || 0;
                    totalVolume += vol;
                    const type = (content.type || 'water').toLowerCase();
                    const reactionForContent = reactions.find(r => 
                        r.result && (r.result.type || '').toLowerCase() === type
                    );
                    let color;
                    if (reactionForContent && reactionForContent.result && reactionForContent.result.color !== undefined) {
                        color = new THREE.Color(reactionForContent.result.color);
                    } else {
                        color = new THREE.Color(colorMap[type] || colorMap['water']);
                    }
                    r += color.r * vol;
                    g += color.g * vol;
                    b += color.b * vol;
                });
                
                if (totalVolume > 0 && (!hasInitialContents || !initialState || !initialState.initialColor)) {
                    baseColor = new THREE.Color(r / totalVolume, g / totalVolume, b / totalVolume);
                }
            }
        }
        
        const temp = obj.properties.temperature || 20;
        
        if (contents.length === 1) {
            const contentType = (contents[0].type || '').toLowerCase();
            if (contentType === 'indicator_solution' && temp > 80) {
                const heatedReaction = reactions.find(r => 
                    r.reactants && r.reactants.length === 1 && 
                    r.reactants[0].toLowerCase() === 'indicator_solution' &&
                    r.result && (r.result.type || '').toLowerCase() === 'heated_indicator'
                );
                if (heatedReaction && heatedReaction.result && heatedReaction.result.color !== undefined) {
                    return new THREE.Color(heatedReaction.result.color);
                }
                return new THREE.Color(0xff9800);
            }
        }
        
        if (temp > 80 && initialState && initialState.boilingColor) {
            const colorStr = initialState.boilingColor.startsWith('#') ? initialState.boilingColor : '#' + initialState.boilingColor;
            baseColor = new THREE.Color(colorStr);
        } else if (temp < 20 && initialState && initialState.coolingColor) {
            const colorStr = initialState.coolingColor.startsWith('#') ? initialState.coolingColor : '#' + initialState.coolingColor;
            baseColor = new THREE.Color(colorStr);
        } else if (temp > 80) {
            const heatFactor = Math.min((temp - 80) / 120, 1);
            baseColor.r = Math.min(baseColor.r + heatFactor * 0.3, 1);
            baseColor.g = Math.max(baseColor.g - heatFactor * 0.2, 0);
            baseColor.b = Math.max(baseColor.b - heatFactor * 0.3, 0);
        }
        
        return baseColor;
    }

    createLiquidMesh(obj) {
        if (!obj.properties.isContainer) return;
        
        if (this.liquidMeshes.has(obj.name)) {
            this.scene.remove(this.liquidMeshes.get(obj.name));
            this.liquidMeshes.get(obj.name).geometry.dispose();
            this.liquidMeshes.get(obj.name).material.dispose();
        }
        
        obj.mesh.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(obj.mesh);
        if (!box || box.isEmpty()) {
            console.warn(`No bounding box for ${obj.name}`);
            return;
        }
        
        const size = box.getSize(new THREE.Vector3());
        const minYWorld = box.min.y;
        
        const volume = this.calculateVolume(obj);
        const liquidHeight = this.calculateLiquidHeight(obj, volume);
        
        if (liquidHeight <= 0 || volume <= 0) {
            return;
        }
        
        const objName = obj.name.toLowerCase();
        const isRod = objName.includes('rod') || objName.includes('glass rod') || objName.includes('dropper');
        const isCylinder = objName.includes('cylinder') || objName.includes('graduated');
        
        let radius;
        if (isRod) {
            radius = Math.min(size.x, size.z) * 0.3;
        } else if (isCylinder) {
            radius = Math.min(size.x, size.z) * 0.2;
        } else {
            radius = Math.min(size.x, size.z) * 0.45;
        }
        
        const segments = this.performanceManager.getGeometrySegments();
        
        const geometry = new THREE.CylinderGeometry(radius, radius, liquidHeight, segments);
        const color = this.getLiquidColor(obj);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: isRod ? 0.9 : 0.85,
            side: THREE.DoubleSide,
            roughness: 0.2,
            metalness: 0.2,
            depthWrite: false
        });
        
        const liquidMesh = new THREE.Mesh(geometry, material);
        
        const containerCenter = box.getCenter(new THREE.Vector3());
        const containerBottom = minYWorld;
        let liquidBottom, liquidCenterY;
        
        if (isRod) {
            liquidBottom = containerBottom + (size.y * 0.1);
            liquidCenterY = liquidBottom + liquidHeight / 2;
        } else {
            liquidBottom = containerBottom + (size.y * 0.05);
            liquidCenterY = liquidBottom + liquidHeight / 2;
        }
        
        liquidMesh.position.set(containerCenter.x, liquidCenterY, containerCenter.z);
        liquidMesh.userData.isLiquid = true;
        liquidMesh.userData.containerName = obj.name;
        liquidMesh.renderOrder = 2;
        
        this.liquidMeshes.set(obj.name, liquidMesh);
        this.scene.add(liquidMesh);
        
        obj.mesh.renderOrder = 1;
    }

    updateLiquidMesh(obj) {
        if (!obj.properties.isContainer) return;
        
        const liquidContents = obj.properties.contents ? 
            obj.properties.contents.filter(c => this.getChemicalState(c.type) === 'liquid' && (c.volume || 0) > 0.001) : [];
        
        const volume = liquidContents.reduce((sum, c) => sum + (c.volume || 0), 0);
        const hasContents = liquidContents.length > 0;
        const liquidHeight = this.calculateLiquidHeight(obj, volume);
        
        const liquidMesh = this.liquidMeshes.get(obj.name);
        
        if (liquidHeight <= 0 || volume <= 0 || !hasContents) {
            if (liquidMesh) {
                this.scene.remove(liquidMesh);
                liquidMesh.geometry.dispose();
                liquidMesh.material.dispose();
                this.liquidMeshes.delete(obj.name);
            }
            if (obj.properties.volume !== undefined && volume <= 0) {
                obj.properties.volume = 0;
            }
            return;
        }
        
        if (!liquidMesh) {
            this.createLiquidMesh(obj);
            return;
        }
        
        obj.mesh.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(obj.mesh);
        if (!box || box.isEmpty()) {
            console.warn(`Cannot update liquid mesh for ${obj.name}: invalid bounding box`);
            return;
        }
        
        const size = box.getSize(new THREE.Vector3());
        const minYWorld = box.min.y;
        const objName = obj.name.toLowerCase();
        const isRod = objName.includes('rod') || objName.includes('glass rod') || objName.includes('dropper');
        const isCylinder = objName.includes('cylinder') || objName.includes('graduated');
        
        let radius;
        if (isRod) {
            radius = Math.min(size.x, size.z) * 0.3;
        } else if (isCylinder) {
            radius = Math.min(size.x, size.z) * 0.2;
        } else {
            radius = Math.min(size.x, size.z) * 0.45;
        }
        
        const currentHeight = liquidMesh.geometry.parameters.height;
        if (Math.abs(currentHeight - liquidHeight) > 0.01) {
            liquidMesh.geometry.dispose();
            const segments = this.performanceManager.getGeometrySegments();
            liquidMesh.geometry = new THREE.CylinderGeometry(radius, radius, liquidHeight, segments);
        }
        
        const containerCenter = box.getCenter(new THREE.Vector3());
        const containerBottom = minYWorld;
        let liquidBottom, liquidCenterY;
        
        if (isRod) {
            liquidBottom = containerBottom + (size.y * 0.1);
            liquidCenterY = liquidBottom + liquidHeight / 2;
        } else {
            liquidBottom = containerBottom + (size.y * 0.05);
            liquidCenterY = liquidBottom + liquidHeight / 2;
        }
        
        liquidMesh.position.set(containerCenter.x, liquidCenterY, containerCenter.z);
        
        const color = this.getLiquidColor(obj);
        liquidMesh.material.color.copy(color);
        liquidMesh.material.opacity = isRod ? 0.9 : 0.85;
        
        liquidMesh.rotation.copy(obj.mesh.rotation);
        liquidMesh.renderOrder = 2;
    }

    updatePowderMesh(obj) {
        if (!obj.properties.isContainer) return;
        
        const powderContents = obj.properties.contents ? 
            obj.properties.contents.filter(c => this.getChemicalState(c.type) === 'solid' && (c.mass || 0) > 0.001) : [];
        
        if (powderContents.length === 0) {
            const existingPowder = this.powderMeshes.get(obj.name);
            if (existingPowder) {
                this.scene.remove(existingPowder);
                existingPowder.geometry.dispose();
                existingPowder.material.dispose();
                this.powderMeshes.delete(obj.name);
            }
            return;
        }
        
        obj.mesh.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(obj.mesh);
        if (!box || box.isEmpty()) return;
        
        const size = box.getSize(new THREE.Vector3());
        const minYWorld = box.min.y;
        const containerCenter = box.getCenter(new THREE.Vector3());
        
        let totalMass = 0;
        powderContents.forEach(content => {
            totalMass += content.mass || 0;
        });
        
        const density = 1.5;
        const powderVolume = totalMass / density;
        const capacity = obj.properties.capacity || 1000;
        const fillRatio = Math.min(powderVolume / capacity, 1);
        const powderHeight = size.y * fillRatio * 0.85;
        
        if (powderHeight <= 0) return;
        
        const objName = obj.name.toLowerCase();
        const isCylinder = objName.includes('cylinder') || objName.includes('graduated');
        const containerDiameter = Math.min(size.x, size.z);
        const containerRadius = containerDiameter / 2;
        const areaRatio = 0.2;
        const powderRadius = containerRadius * Math.sqrt(areaRatio);
        const radius = powderRadius;
        
        let powderMesh = this.powderMeshes.get(obj.name);
        
        if (!powderMesh) {
            const segments = this.performanceManager.getGeometrySegments();
            const geometry = new THREE.CylinderGeometry(radius, radius, powderHeight, segments);
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                transparent: true,
                opacity: 0.9,
                roughness: 0.8,
                metalness: 0.1
            });
            powderMesh = new THREE.Mesh(geometry, material);
            this.powderMeshes.set(obj.name, powderMesh);
            this.scene.add(powderMesh);
        } else {
            if (Math.abs(powderMesh.geometry.parameters.height - powderHeight) > 0.01) {
                powderMesh.geometry.dispose();
                const segments = this.performanceManager.getGeometrySegments();
                powderMesh.geometry = new THREE.CylinderGeometry(radius, radius, powderHeight, segments);
            }
        }
        
        const powderBottom = minYWorld + (size.y * 0.05);
        const powderCenterY = powderBottom + powderHeight / 2;
        powderMesh.position.set(containerCenter.x, powderCenterY, containerCenter.z);
        powderMesh.rotation.copy(obj.mesh.rotation);
        powderMesh.renderOrder = 0;
        
        if (powderContents.length > 0) {
            const firstPowder = powderContents[0];
            const powderType = (firstPowder.type || '').toLowerCase();
            const powderColorMap = {
                'carbonate': 0xffffff,
                'salt': 0xffffff,
                'sugar': 0xfff8dc,
                'copper': 0xb87333,
                'iron': 0x808080,
                'calcium': 0xffffff,
                'sodium': 0xffffff
            };
            const powderColor = powderColorMap[powderType] || 0xcccccc;
            powderMesh.material.color.setHex(powderColor);
        }
    }

    onMouseDown(event) {
        console.log('onMouseDown called', 'objects count:', this.objects.size);
        
        if (event.button !== 0) {
            return;
        }
        
        if (this.isDraggingLabware) {
            this.isDraggingLabware = false;
            return;
        }
        
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const allMeshes = [];
        for (const [name, obj] of this.objects) {
            if (obj && obj.mesh) {
                allMeshes.push(obj.mesh);
                obj.mesh.updateMatrixWorld(true);
                obj.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.updateMatrixWorld(true);
                        allMeshes.push(child);
                    }
                });
            }
        }
        if (this.electricBalance) {
            this.electricBalance.traverse((child) => {
                if (child.isMesh) {
                    allMeshes.push(child);
                }
            });
        }
        if (this.spiritLamp) {
            this.spiritLamp.traverse((child) => {
                if (child.isMesh) {
                    allMeshes.push(child);
                }
            });
        }
        if (this.burnerStand) {
            this.burnerStand.traverse((child) => {
                if (child.isMesh) {
                    allMeshes.push(child);
                }
            });
        }
        const intersects = this.raycaster.intersectObjects(allMeshes, false);
        
        if (intersects.length > 0) {
            for (let i = 0; i < intersects.length; i++) {
                let clickedObject = null;
                const hitMesh = intersects[i].object;
                
                if (hitMesh.userData && hitMesh.userData.objectName) {
                    clickedObject = this.objects.get(hitMesh.userData.objectName);
                }
                
                if (!clickedObject) {
                    clickedObject = this.findObjectByMesh(hitMesh);
                }
                
                if (!clickedObject && hitMesh.parent) {
                    let parent = hitMesh.parent;
                    while (parent && !clickedObject) {
                        if (parent.userData && parent.userData.objectName) {
                            clickedObject = this.objects.get(parent.userData.objectName);
                        }
                        if (!clickedObject) {
                            clickedObject = this.findObjectByMesh(parent);
                        }
                        parent = parent.parent;
                    }
                }
                
                if (clickedObject) {
                    this.handleInteractionStart(clickedObject, event);
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            }
        }
        
        if (intersects.length === 0) {
            this.selectObject(null);
            if (this.controls && !this.controls.enabled) {
                this.controls.enabled = true;
            }
            return;
        }
        
        this.selectObject(null);
        
        if (this.controls && !this.controls.enabled) {
            this.controls.enabled = true;
        }
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (this.mouseDownPosition) {
            if (this.controls && (this.pendingDragObject || this.pendingTiltObject || this.pendingPourObject || this.pendingStirObject)) {
                this.controls.enabled = false;
                event.preventDefault();
            }
            
            const moveDistance = Math.sqrt(
                Math.pow(event.clientX - this.mouseDownPosition.x, 2) + 
                Math.pow(event.clientY - this.mouseDownPosition.y, 2)
            );
            
            if (this.pendingTiltObject && moveDistance <= 5) {
                console.log('[ExperimentEngine] Mouse moved but distance too small:', moveDistance.toFixed(2), 'need > 5');
            }
            
            if (moveDistance > 5) {
                if (this.pendingDragObject && !this.activeController) {
                    const obj = this.pendingDragObject;
                    const dragController = this.interactions.get('drag');
                    if (dragController && obj.interactions.draggable) {
                        if (this.controls) {
                            this.controls.enabled = false;
                        }
                        this.activeController = dragController;
                        dragController.start(obj, event);
                        this.pendingDragObject = null;
                        this.pendingTiltObject = null;
                        this.mouseDownPosition = null;
                        console.log('Drag started on move for:', obj.name);
                    }
                } else if (this.pendingTiltObject && !this.activeController) {
                    const obj = this.pendingTiltObject;
                    const tiltController = this.interactions.get('tilt');
                    if (tiltController && obj.interactions.tiltable) {
                        if (this.controls) {
                            this.controls.enabled = false;
                        }
                        this.activeController = tiltController;
                        tiltController.start(obj, event);
                        this.pendingDragObject = null;
                        this.pendingTiltObject = null;
                        this.pendingPourObject = null;
                        this.pendingStirObject = null;
                        this.mouseDownPosition = null;
                        console.log('[ExperimentEngine] Tilt started on move for:', obj.name);
                    } else {
                        console.log('[ExperimentEngine] Tilt blocked:', {
                            hasPendingTilt: !!this.pendingTiltObject,
                            hasActiveController: !!this.activeController,
                            activeControllerType: this.activeController?.constructor?.name,
                            hasTiltController: !!tiltController,
                            isTiltable: obj?.interactions?.tiltable,
                            objName: obj?.name
                        });
                    }
                } else if (this.pendingTiltObject) {
                    console.log('[ExperimentEngine] Tilt pending but activeController exists:', {
                        pendingTiltObject: this.pendingTiltObject?.name,
                        activeController: this.activeController?.constructor?.name
                    });
                } else if (this.pendingPourObject && !this.activeController) {
                    const obj = this.pendingPourObject;
                    const pourController = this.interactions.get('pour');
                    const canPour = (obj.interactions.canPour || obj.properties.canPour) && obj.properties.isContainer;
                    if (pourController && canPour) {
                        if (this.controls) {
                            this.controls.enabled = false;
                        }
                        this.activeController = pourController;
                        pourController.start(obj, event);
                        this.pendingDragObject = null;
                        this.pendingTiltObject = null;
                        this.pendingPourObject = null;
                        this.pendingStirObject = null;
                        this.mouseDownPosition = null;
                        console.log('Pour started on move for:', obj.name);
                    }
                } else if (this.pendingStirObject && !this.activeController) {
                    const obj = this.pendingStirObject;
                    const stirController = this.interactions.get('stir');
                    const canStir = (obj.interactions.stirable !== false) && obj.properties.isContainer;
                    if (stirController && canStir) {
                        if (this.controls) {
                            this.controls.enabled = false;
                        }
                        this.activeController = stirController;
                        stirController.start(obj, event);
                        this.pendingDragObject = null;
                        this.pendingTiltObject = null;
                        this.pendingPourObject = null;
                        this.pendingStirObject = null;
                        this.mouseDownPosition = null;
                        console.log('Stir started on move for:', obj.name);
                    }
                }
            }
        }
        
        if (this.activeController) {
            if (this.controls) {
                this.controls.enabled = false;
            }
            event.preventDefault();
            this.activeController.update(event);
        } else if (this.mouseDownPosition && (this.pendingDragObject || this.pendingTiltObject || this.pendingPourObject || this.pendingStirObject)) {
            if (this.controls) {
                this.controls.enabled = false;
            }
            event.preventDefault();
        }
    }

    onMouseUp(event) {
        if ((this.pendingDragObject || this.pendingTiltObject || this.pendingPourObject || this.pendingStirObject) && !this.activeController) {
            this.pendingDragObject = null;
            this.pendingTiltObject = null;
            this.pendingPourObject = null;
            this.pendingStirObject = null;
            this.mouseDownPosition = null;
        }
        
        if (this.activeController) {
            this.activeController.end();
            this.activeController = null;
        }
        
        this.mouseDownPosition = null;
        
        // Always re-enable controls when mouse is released
        this.controls.enabled = true;
        // Ensure canvas has focus for wheel events
        this.renderer.domElement.focus();
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
        if (!mesh) return null;
        
        if (mesh.userData && mesh.userData.objectName) {
            const obj = this.objects.get(mesh.userData.objectName);
            if (obj) return obj;
        }
        
        if (mesh.parent) {
            let parent = mesh.parent;
            while (parent) {
                if (parent.userData && parent.userData.objectName) {
                    const obj = this.objects.get(parent.userData.objectName);
                    if (obj) return obj;
                }
                parent = parent.parent;
            }
        }
        
        for (const [name, obj] of this.objects) {
            if (!obj || !obj.mesh) continue;
            
            if (obj.mesh === mesh) {
                return obj;
            }
            
            let found = false;
            obj.mesh.traverse((child) => {
                if (child === mesh) found = true;
            });
            if (found) return obj;
        }
        
        if (this.electricBalance) {
            let found = false;
            this.electricBalance.traverse((child) => {
                if (child === mesh) found = true;
            });
            if (found) return this.objects.get('Electric Balance');
        }
        
        if (this.spiritLamp) {
            let found = false;
            this.spiritLamp.traverse((child) => {
                if (child === mesh) found = true;
            });
            if (found) return this.objects.get('Spirit Lamp');
        }
        
        if (this.burnerStand) {
            let found = false;
            this.burnerStand.traverse((child) => {
                if (child === mesh) found = true;
            });
            if (found) return this.objects.get('Burner Stand');
        }
        
        return null;
    }

    handleInteractionStart(obj, event) {
        console.log('handleInteractionStart called with:', obj?.name, 'Selected object:', this.selectedObject?.name);
        
        if (!obj || !obj.interactions) {
            console.error('No interactions for object:', obj);
            return;
        }
        
        const objName = obj.name.toLowerCase();
        const isSpiritLampObj = objName === 'spirit lamp' || 
                               obj.name === 'Spirit Lamp' ||
                               obj.name === 'Alcohol Lamp' ||
                               objName.includes('spirit lamp') || 
                               objName.includes('alcohol lamp') ||
                               (objName.includes('lamp') && !objName.includes('beaker') && !objName.includes('burner') && !objName.includes('stand'));
        
        if (isSpiritLampObj && !obj.userData?.isInsideBurnerStand && this.isObjectOnBurnerStand(obj)) {
            console.log('Spirit lamp is on burner stand, placing it INSIDE');
            this.placeSpiritLampInBurnerStand(obj);
            this.selectObject(null);
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        
        if (this.selectedObject && this.selectedObject !== obj) {
            const selectedObj = this.selectedObject;
            const clickedName = obj.name.toLowerCase();
            const selectedName = selectedObj.name.toLowerCase();
            const selectedFullName = selectedObj.name;
            
            console.log('Checking sequential placement - Selected:', selectedName, 'Full name:', selectedFullName, 'Clicked:', clickedName);
            
            if (clickedName.includes('burner') && clickedName.includes('stand')) {
                console.log('Burner stand clicked with object selected:', selectedName, 'Full name:', selectedFullName);
                
                const isSpiritLamp = selectedName === 'spirit lamp' || 
                                     selectedName === 'alcohol lamp' ||
                                     selectedFullName === 'Spirit Lamp' ||
                                     selectedFullName === 'Alcohol Lamp' ||
                                     selectedName.includes('spirit lamp') || 
                                     selectedName.includes('alcohol lamp') ||
                                     (selectedName.includes('lamp') && !selectedName.includes('beaker') && !selectedName.includes('burner') && !selectedName.includes('stand'));
                
                console.log('isSpiritLamp check:', isSpiritLamp, 'selectedName:', selectedName, 'selectedFullName:', selectedFullName);
                
                if (isSpiritLamp) {
                    console.log('Placing spirit lamp INSIDE burner stand (sequential selection)');
                    this.placeSpiritLampInBurnerStand(selectedObj);
                    this.selectObject(null);
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                
                const isAnyLamp = selectedName.includes('lamp') && !selectedName.includes('beaker');
                if (selectedObj.properties && selectedObj.properties.isContainer && 
                    !selectedName.includes('burner') && 
                    !selectedName.includes('spirit') && 
                    !selectedName.includes('alcohol') &&
                    !isAnyLamp) {
                    console.log('Placing container ON TOP of burner stand:', selectedName);
                    this.placeObjectOnBurnerStand(selectedObj);
                    this.selectObject(null);
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                
                console.log('Object does not match placement criteria - isSpiritLamp:', isSpiritLamp, 'isAnyLamp:', isAnyLamp, 'isContainer:', selectedObj.properties?.isContainer, 'name:', selectedFullName);
            }
        }
        
        const previousSelected = this.selectedObject;
        this.selectObject(obj);
        
        if (this.isRunning) {
            const currentStep = this.config.steps?.[this.currentStep];
            if (currentStep) {
                const objNameNormalized = obj.name.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
                const equipmentNameNormalized = currentStep.equipment.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
                if (objNameNormalized !== equipmentNameNormalized) {
                    const objNameParts = objNameNormalized.split(' ');
                    const equipmentNameParts = equipmentNameNormalized.split(' ');
                    const isMatch = objNameParts.every(part => equipmentNameParts.includes(part)) || 
                                   equipmentNameParts.every(part => objNameParts.includes(part));
                    if (!isMatch) {
                        this.addFeedback(`Please use ${currentStep.equipment} for this step.`);
                    }
                }
            }
        }
        
        const hasInteraction = obj.interactions.draggable || obj.interactions.tiltable || 
                              ((obj.interactions.canPour || obj.properties.canPour) && obj.properties.isContainer) ||
                              ((obj.interactions.stirable !== false) && obj.properties.isContainer);
        
        if (hasInteraction && !previousSelected) {
            if (this.controls) {
                this.controls.enabled = false;
            }
        }
        
        if (obj.interactions.draggable && !previousSelected) {
            this.pendingDragObject = obj;
            this.mouseDownPosition = { x: event.clientX, y: event.clientY };
            console.log('Object clicked, waiting for mouse move to start drag:', obj.name);
        }
        
        if (obj.interactions.tiltable) {
            if (!previousSelected || previousSelected === obj || (obj.properties.isContainer && previousSelected?.properties?.isContainer)) {
                this.pendingTiltObject = obj;
                if (!this.mouseDownPosition) {
                    this.mouseDownPosition = { x: event.clientX, y: event.clientY };
                }
                console.log('[ExperimentEngine] Object clicked, waiting for mouse move to start tilt:', obj.name);
            }
        }
        
        const canPour = (obj.interactions.canPour || obj.properties.canPour) && obj.properties.isContainer;
        if (canPour && !previousSelected) {
            this.pendingPourObject = obj;
            if (!this.mouseDownPosition) {
                this.mouseDownPosition = { x: event.clientX, y: event.clientY };
            }
            console.log('Object clicked, waiting for mouse move to start pour:', obj.name);
        }
        
        const canStir = (obj.interactions.stirable !== false) && obj.properties.isContainer;
        if (canStir && !previousSelected) {
            this.pendingStirObject = obj;
            if (!this.mouseDownPosition) {
                this.mouseDownPosition = { x: event.clientX, y: event.clientY };
            }
            console.log('Object clicked, waiting for mouse move to start stir:', obj.name);
        }
    }

    selectObject(obj) {
        if (this.selectedObject && this.isSwirling) {
            const prevObj = this.selectedObject;
            if (prevObj && prevObj.mesh && prevObj.mesh.userData.originalRotation) {
                prevObj.mesh.rotation.x = prevObj.mesh.userData.originalRotation.x;
                prevObj.mesh.rotation.z = prevObj.mesh.userData.originalRotation.z;
            }
            this.isSwirling = false;
        }
        this.selectedObject = obj;
        if (obj) {
            console.log('Object selected:', obj.name);
            const event = new CustomEvent('objectSelected', { detail: { object: obj } });
            document.dispatchEvent(event);
        } else {
            const event = new CustomEvent('objectSelected', { detail: { object: null } });
            document.dispatchEvent(event);
        }
    }

    getObject(name) {
        if (!name) return null;
        if (this.objects.has(name)) {
            return this.objects.get(name);
        }
        const lowerName = name.toLowerCase().trim();
        const normalizedName = lowerName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
        
        for (const [objName, obj] of this.objects) {
            const lowerObjName = objName.toLowerCase().trim();
            const normalizedObjName = lowerObjName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
            
            if (lowerObjName === lowerName || normalizedObjName === normalizedName) {
                return obj;
            }
        }
        return null;
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
        if (!step.equipment) {
            return { valid: false, message: 'No equipment specified for this step' };
        }
        
        let equipment = this.getObject(step.equipment);
        if (!equipment) {
            const normalizedEquipment = step.equipment.toLowerCase().replace(/_/g, ' ').trim();
            equipment = this.getObject(normalizedEquipment);
        }
        if (!equipment) {
            const allObjectNames = Array.from(this.objects.keys()).join(', ');
            console.warn(`Equipment "${step.equipment}" not found. Available objects: ${allObjectNames}`);
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
            case 'drag':
                return this.validateDrag(equipment, step);
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
                let targetEquipment = equipment;
                if (condition.targetObject) {
                    const targetObj = this.getObject(condition.targetObject);
                    if (targetObj) {
                        targetEquipment = targetObj;
                    }
                } else if ((step.action === 'pour' || step.action === 'drag' || step.action === 'stir') && condition.message) {
                    const messageLower = condition.message.toLowerCase();
                    if (messageLower.includes('beaker') || messageLower.includes('solution') || messageLower.includes('mixed')) {
                        const beaker = this.getObject('Beaker') || this.getObject('beaker');
                        if (beaker) {
                            targetEquipment = beaker;
                        }
                    }
                } else if (step.action === 'stir') {
                    let beaker = this.getObject('Beaker') || this.getObject('beaker');
                    if (!beaker) {
                        for (const [name, obj] of this.objects) {
                            if (obj.properties.isContainer && name.toLowerCase().includes('beaker')) {
                                beaker = obj;
                                break;
                            }
                        }
                    }
                    if (beaker) {
                        targetEquipment = beaker;
                    }
                }
                const result = this.checkCondition(targetEquipment, condition);
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
            let volumeEquipment = equipment;
            if (step.action === 'pour' || step.action === 'drag' || step.action === 'stir') {
                let beaker = this.getObject('Beaker') || this.getObject('beaker');
                if (!beaker) {
                    for (const [name, obj] of this.objects) {
                        if (obj.properties.isContainer && name.toLowerCase().includes('beaker')) {
                            beaker = obj;
                            break;
                        }
                    }
                }
                if (beaker) {
                    volumeEquipment = beaker;
                }
            }
            const volume = this.measurements.volume[volumeEquipment.name] || 0;
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
                if (!equipment.properties.contents || equipment.properties.contents.length === 0) {
                    return { valid: false, message: condition.message || 'Container should have contents' };
                }
                if (condition.value) {
                    const contentTypes = equipment.properties.contents
                        .filter(c => c && (c.volume || 0) > 0.001)
                        .map(c => c.type || c)
                        .map(t => String(t).toLowerCase());
                    const targetContent = String(condition.value).toLowerCase();
                    const hasTarget = contentTypes.includes(targetContent);
                    
                    if (!hasTarget && this.config.reactions) {
                        const reactions = Array.isArray(this.config.reactions) ? this.config.reactions : [];
                        const reactionForContent = reactions.find(r => {
                            if (!r.reactants || !r.result) return false;
                            const reactants = Array.isArray(r.reactants) ? r.reactants : (r.reactants.split ? r.reactants.split(',').map(s => s.trim()) : []);
                            const resultType = String(r.result.type || '').toLowerCase();
                            return reactants.some(reactant => String(reactant).toLowerCase() === targetContent) &&
                                   contentTypes.includes(resultType);
                        });
                        if (reactionForContent) {
                            return { 
                                valid: true, 
                                points: condition.points || 0,
                                message: condition.message || `Container contains ${reactionForContent.result.type} (reaction product)` 
                            };
                        }
                    }
                    
                    return { 
                        valid: hasTarget, 
                        points: hasTarget ? (condition.points || 0) : 0,
                        message: condition.message || `Container should contain ${condition.value}` 
                    };
                }
                return { valid: true, points: condition.points || 0, message: condition.message || 'Container has contents' };
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

    validateDrag(equipment, step) {
        if (step.rules && step.rules.length > 0) {
            return this.validateRules(equipment, step);
        }
        if (step.targetValue !== undefined) {
            return this.validateMeasure(equipment, step);
        }
        return { valid: true, points: step.points || 10, message: 'Object dragged successfully' };
    }

    addFeedback(message) {
        this.feedback.push({
            message,
            timestamp: Date.now(),
            step: this.currentStep
        });
    }

    start() {
        if (!this.config) {
            throw new Error('Experiment configuration is missing');
        }
        
        this.isRunning = true;
        this.currentStep = 0;
        this.score = 0;
        this.feedback = [];
        this.stepHistory = [];
        this.measurements.time = Date.now();
        
        if (this.config.steps && Array.isArray(this.config.steps)) {
            this.maxScore = this.config.steps.reduce((sum, step) => {
                const points = step.points || 10;
                return sum + (typeof points === 'number' ? points : 10);
            }, 0);
        } else {
            this.maxScore = 0;
            console.warn('No steps configured for this experiment');
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
            
            if (this.physicsEnabled && obj.physicsBody && this.physicsManager) {
                this.physicsManager.setBodyPosition(obj.physicsBody, obj.originalPosition);
                const quaternion = new THREE.Quaternion().setFromEuler(obj.originalRotation);
                this.physicsManager.setBodyRotation(obj.physicsBody, quaternion);
            }
            
            if (this.initialState && this.initialState.has(name)) {
                const initialState = this.initialState.get(name);
                obj.properties.volume = initialState.volume;
                obj.properties.temperature = initialState.temperature;
                obj.properties.contents = [...initialState.contents];
            } else {
                obj.properties.temperature = obj.properties.temperature || 20;
                obj.properties.contents = [];
            }
            
            obj.properties.stirCount = 0;
            
            if (this.measurements.volume) {
                this.measurements.volume[name] = obj.properties.volume;
            }
            if (this.measurements.temperature) {
                this.measurements.temperature[name] = obj.properties.temperature;
            }
            
            if (obj.properties.isContainer) {
                this.updateLiquidMesh(obj);
            }
        }
        
        for (const [key, effect] of this.effects) {
            effect.particles.forEach(particle => {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            });
        }
        this.effects.clear();
        
        for (const [name, liquidMesh] of this.liquidMeshes) {
            this.scene.remove(liquidMesh);
            liquidMesh.geometry.dispose();
            liquidMesh.material.dispose();
        }
        this.liquidMeshes.clear();
        
        for (const [name, obj] of this.objects) {
            if (obj.properties.isContainer) {
                this.createLiquidMesh(obj);
            }
        }
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

    findNearbyContainer(obj, maxDistance = 0.5) {
        if (!obj || !obj.mesh) return null;
        
        obj.mesh.updateMatrixWorld(true);
        const objBox = new THREE.Box3().setFromObject(obj.mesh);
        const objCenter = objBox.getCenter(new THREE.Vector3());
        let closest = null;
        let minDistance = Infinity;
        const maxVerticalDistance = 0.3;
        
        for (const [name, otherObj] of this.objects) {
            if (otherObj === obj || !otherObj.properties.isContainer) continue;
            if (!otherObj.mesh) continue;
            
            otherObj.mesh.updateMatrixWorld(true);
            const otherBox = new THREE.Box3().setFromObject(otherObj.mesh);
            const otherCenter = otherBox.getCenter(new THREE.Vector3());
            
            const horizontalDistance = Math.sqrt(
                Math.pow(objCenter.x - otherCenter.x, 2) + 
                Math.pow(objCenter.z - otherCenter.z, 2)
            );
            const verticalDistance = Math.abs(objCenter.y - otherCenter.y);
            
            if (horizontalDistance < maxDistance && verticalDistance < maxVerticalDistance && horizontalDistance < minDistance) {
                minDistance = horizontalDistance;
                closest = otherObj;
            }
        }
        
        if (closest) {
            console.log(`Found nearby container: ${closest.name} at distance ${minDistance.toFixed(3)}m`);
        } else {
            console.log(`No nearby container found within ${maxDistance}m horizontal and ${maxVerticalDistance}m vertical`);
        }
        
        return closest;
    }

    fillFromNearbyContainer(rodObj) {
        if (!rodObj || !rodObj.properties.isContainer) {
            console.log('Selected object is not a container');
            return { success: false, message: 'Selected object is not a container' };
        }
        
        const nearbyContainer = this.findNearbyContainer(rodObj);
        if (!nearbyContainer) {
            console.log('No nearby container found');
            const toolName = rodObj.name.toLowerCase().includes('dropper') ? 'dropper' : 'glass rod';
            return { success: false, message: `No nearby container found. Position the ${toolName} closer to a container.` };
        }
        
        if (nearbyContainer.properties.contents.length === 0) {
            console.log('Nearby container has no liquid');
            return { success: false, message: 'The nearby container has no liquid to transfer.' };
        }
        
        const transferAmount = 10;
        const sourceContent = nearbyContainer.properties.contents[0];
        const transferVolume = Math.min(transferAmount, sourceContent.volume);
        
        if (transferVolume <= 0) {
            return { success: false, message: 'No liquid available to transfer.' };
        }
        
        sourceContent.volume -= transferVolume;
        if (sourceContent.volume <= 0) {
            nearbyContainer.properties.contents.shift();
        }
        
        const rodCapacity = rodObj.properties.capacity || 100;
        const currentRodVolume = this.calculateVolume(rodObj);
        const availableSpace = rodCapacity - currentRodVolume;
        const actualTransfer = Math.min(transferVolume, availableSpace);
        
        if (actualTransfer > 0) {
            const existingContent = rodObj.properties.contents.find(c => c.type === sourceContent.type);
            if (existingContent) {
                existingContent.volume += actualTransfer;
            } else {
                rodObj.properties.contents.push({
                    type: sourceContent.type,
                    volume: actualTransfer
                });
            }
            
            if (sourceContent.volume < transferVolume) {
                sourceContent.volume += (transferVolume - actualTransfer);
            }
            
            this.measurements.volume[rodObj.name] = this.calculateVolume(rodObj);
            this.measurements.volume[nearbyContainer.name] = this.calculateVolume(nearbyContainer);
            
            rodObj.properties.volume = this.calculateVolume(rodObj);
            
            if (this.updateLiquidMesh) {
                this.updateLiquidMesh(rodObj);
                this.updateLiquidMesh(nearbyContainer);
            }
            
            this.updateMeasurements(rodObj);
            this.updateMeasurements(nearbyContainer);
            
            console.log(`Filled ${rodObj.name} with ${actualTransfer.toFixed(1)}ml from ${nearbyContainer.name}`);
            return { success: true, amount: actualTransfer, source: nearbyContainer.name };
        } else {
            const toolName = rodObj.name.toLowerCase().includes('dropper') ? 'dropper' : 'glass rod';
            return { success: false, message: `${toolName.charAt(0).toUpperCase() + toolName.slice(1)} is full or no space available.` };
        }
    }

    drawToNearbyContainer(rodObj) {
        if (!rodObj || !rodObj.properties.isContainer) {
            console.log('Selected object is not a container');
            return { success: false, message: 'Selected object is not a container' };
        }
        
        if (rodObj.properties.contents.length === 0) {
            const toolName = rodObj.name.toLowerCase().includes('dropper') ? 'dropper' : 'glass rod';
            console.log(`${toolName} has no liquid`);
            return { success: false, message: `${toolName.charAt(0).toUpperCase() + toolName.slice(1)} has no liquid to transfer.` };
        }
        
        const nearbyContainer = this.findNearbyContainer(rodObj);
        if (!nearbyContainer) {
            console.log('No nearby container found');
            const toolName = rodObj.name.toLowerCase().includes('dropper') ? 'dropper' : 'glass rod';
            return { success: false, message: `No nearby container found. Position the ${toolName} closer to a container.` };
        }
        
        const rodContent = rodObj.properties.contents[0];
        const totalRodVolume = rodContent.volume;
        
        if (totalRodVolume <= 0) {
            return { success: false, message: 'No liquid available to transfer.' };
        }
        
        const containerCapacity = nearbyContainer.properties.capacity || 1000;
        const currentContainerVolume = this.calculateVolume(nearbyContainer);
        const availableSpace = containerCapacity - currentContainerVolume;
        const actualTransfer = Math.min(totalRodVolume, availableSpace);
        
        if (actualTransfer > 0) {
            rodContent.volume -= actualTransfer;
            if (rodContent.volume <= 0 || Math.abs(rodContent.volume) < 0.001) {
                rodObj.properties.contents.shift();
                rodContent.volume = 0;
            }
            
            if (rodObj.properties.contents.length === 0) {
                rodObj.properties.volume = 0;
            }
            
            const existingContent = nearbyContainer.properties.contents.find(c => c.type === rodContent.type);
            if (existingContent) {
                existingContent.volume += actualTransfer;
            } else {
                nearbyContainer.properties.contents.push({
                    type: rodContent.type,
                    volume: actualTransfer
                });
            }
            
            rodObj.properties.volume = this.calculateVolume(rodObj);
            if (rodObj.properties.volume < 0.001) {
                rodObj.properties.volume = 0;
            }
            if (rodObj.properties.contents.length === 0) {
                rodObj.properties.volume = 0;
            }
            
            this.measurements.volume[rodObj.name] = rodObj.properties.volume;
            this.measurements.volume[nearbyContainer.name] = this.calculateVolume(nearbyContainer);
            
            const temp = nearbyContainer.properties.temperature || 20;
            if (nearbyContainer.properties.contents && nearbyContainer.properties.contents.length > 0) {
                const contentTypes = nearbyContainer.properties.contents.map(c => (c.type || '').toLowerCase());
                console.log('[Glass Rod] Beaker contents before reaction:', contentTypes, 'Temp:', temp);
                
                const reactions = this.getReactionRules();
                
                if (temp > 80) {
                    const indicatorSolutionIndex = nearbyContainer.properties.contents.findIndex(c => 
                        (c.type || '').toLowerCase() === 'indicator_solution'
                    );
                    
                    if (indicatorSolutionIndex >= 0) {
                        const isAlreadyReacted = nearbyContainer.properties.reactedReactions && 
                            nearbyContainer.properties.reactedReactions.some(r => r.type === 'heated_indicator');
                        
                        if (!isAlreadyReacted) {
                            console.log('[Glass Rod] Converting indicator_solution to heated_indicator (temp > 80°C)');
                            const indicatorContent = nearbyContainer.properties.contents[indicatorSolutionIndex];
                            const volume = indicatorContent.volume;
                            
                            nearbyContainer.properties.contents.splice(indicatorSolutionIndex, 1);
                            
                            const existingHeated = nearbyContainer.properties.contents.find(c => 
                                (c.type || '').toLowerCase() === 'heated_indicator'
                            );
                            if (existingHeated) {
                                existingHeated.volume += volume;
                            } else {
                                nearbyContainer.properties.contents.push({
                                    type: 'heated_indicator',
                                    volume: volume
                                });
                            }
                            
                            if (!nearbyContainer.properties.reactedReactions) {
                                nearbyContainer.properties.reactedReactions = [];
                            }
                            nearbyContainer.properties.reactedReactions.push({
                                type: 'heated_indicator',
                                timestamp: Date.now()
                            });
                            
                            const newContentTypes = nearbyContainer.properties.contents.map(c => (c.type || '').toLowerCase());
                            console.log('[Glass Rod] Converted to heated_indicator. New contents:', newContentTypes);
                        }
                    }
                }
                
                if (this.checkChemicalReaction) {
                    const reaction = this.checkChemicalReaction(nearbyContainer);
                    if (reaction) {
                        console.log('[Glass Rod] Found reaction:', reaction.result?.type, 'Color:', reaction.result?.color);
                        this.processChemicalReaction(nearbyContainer, reaction);
                        const afterContentTypes = nearbyContainer.properties.contents.map(c => (c.type || '').toLowerCase());
                        console.log('[Glass Rod] Beaker contents after reaction:', afterContentTypes);
                    } else {
                        const currentContentTypes = nearbyContainer.properties.contents.map(c => (c.type || '').toLowerCase());
                        console.log('[Glass Rod] No reaction found for contents:', currentContentTypes);
                    }
                }
            }
            
            if (this.updateLiquidMesh) {
                this.updateLiquidMesh(rodObj);
                this.updateLiquidMesh(nearbyContainer);
            }
            
            this.updateMeasurements(rodObj);
            this.updateMeasurements(nearbyContainer);
            
            if (rodObj.properties.volume <= 0 && this.liquidMeshes.has(rodObj.name)) {
                const liquidMesh = this.liquidMeshes.get(rodObj.name);
                if (liquidMesh) {
                    this.scene.remove(liquidMesh);
                    liquidMesh.geometry.dispose();
                    liquidMesh.material.dispose();
                    this.liquidMeshes.delete(rodObj.name);
                }
            }
            
            this.updateMeasurements(rodObj);
            this.updateMeasurements(nearbyContainer);
            
            if (this.checkChemicalReaction) {
                const reaction = this.checkChemicalReaction(nearbyContainer);
                if (reaction) {
                    this.processChemicalReaction(nearbyContainer, reaction);
                }
            }
            
            console.log(`Drew ${actualTransfer.toFixed(1)}ml from ${rodObj.name} to ${nearbyContainer.name}. Remaining in rod: ${rodObj.properties.volume.toFixed(1)}ml`);
            return { success: true, amount: actualTransfer, target: nearbyContainer.name };
        } else {
            return { success: false, message: 'Target container is full or no space available.' };
        }
    }
}

