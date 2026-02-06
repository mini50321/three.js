import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class ScaleController {
    constructor(engine) {
        this.engine = engine;
        this.scaleObject = null;
        this.objectOnScale = null;
        this.scalePopup = null;
        this.currentWeight = 0;
        this.maxWeight = 1000;
        this.hasWarnedAboutMissingScale = false;
        this.lastUpdateTime = 0;
    }

    findScaleObject() {
        for (const [name, obj] of this.engine.objects) {
            if (name.toLowerCase().includes('scale') || 
                name.toLowerCase().includes('electronic_scale') ||
                name.toLowerCase().includes('electronic scale') ||
                obj.properties.isScale) {
                this.scaleObject = obj;
                if (!this.hasWarnedAboutMissingScale) {
                    console.log('[ScaleController] Found scale object:', name);
                }
                this.hasWarnedAboutMissingScale = false;
                return obj;
            }
        }
        if (!this.hasWarnedAboutMissingScale) {
            console.warn('[ScaleController] Scale object not found! (This is normal if scale hasn\'t been added to the scene yet)');
            this.hasWarnedAboutMissingScale = true;
        }
        return null;
    }

    checkObjectOnScale(object) {
        if (!this.scaleObject) {
            this.findScaleObject();
        }
        
        if (!this.scaleObject || !object) return false;
        
        const scaleBox = new THREE.Box3().setFromObject(this.scaleObject.mesh);
        const objectBox = new THREE.Box3().setFromObject(object.mesh);
        
        const scaleCenter = scaleBox.getCenter(new THREE.Vector3());
        const objectCenter = objectBox.getCenter(new THREE.Vector3());
        
        const scaleSize = scaleBox.getSize(new THREE.Vector3());
        const scaleTopY = scaleBox.max.y;
        const scaleTopArea = {
            minX: scaleCenter.x - scaleSize.x * 0.4,
            maxX: scaleCenter.x + scaleSize.x * 0.4,
            minZ: scaleCenter.z - scaleSize.z * 0.4,
            maxZ: scaleCenter.z + scaleSize.z * 0.4,
            y: scaleTopY + 0.05
        };
        
        const objectBottomY = objectBox.min.y;
        const objectTopY = objectBox.max.y;
        const horizontalDistance = Math.sqrt(
            Math.pow(objectCenter.x - scaleCenter.x, 2) + 
            Math.pow(objectCenter.z - scaleCenter.z, 2)
        );
        
        const verticalDistance = objectBottomY - scaleTopY;
        const maxVerticalGap = 0.5;
        const maxHorizontalDistance = Math.max(scaleSize.x * 0.5, scaleSize.z * 0.5);
        
        const isOnScale = (
            objectCenter.x >= scaleTopArea.minX &&
            objectCenter.x <= scaleTopArea.maxX &&
            objectCenter.z >= scaleTopArea.minZ &&
            objectCenter.z <= scaleTopArea.maxZ &&
            verticalDistance >= -0.1 &&
            verticalDistance <= maxVerticalGap &&
            horizontalDistance < maxHorizontalDistance
        );
        
        if (isOnScale) {
            console.log('[ScaleController] Object', object.name, 'is on scale. Distance:', horizontalDistance.toFixed(3), 'Y diff:', (objectBottomY - scaleTopArea.y).toFixed(3));
        }
        
        return isOnScale;
    }

    showScalePopup(object) {
        if (this.scalePopup) {
            this.hideScalePopup();
        }
        
        this.objectOnScale = object;
        
        let calculatedWeight = 0;
        if (object.properties.isContainer && this.engine.calculateVolume) {
            const volume = this.engine.calculateVolume(object);
            if (volume > 0 && object.properties.contents && object.properties.contents.length > 0) {
                const densityMap = {
                    'water': 1.0,
                    'acid': 1.05,
                    'base': 1.0,
                    'indicator': 1.0,
                    'indicator_solution': 1.0,
                    'heated_indicator': 1.0,
                    'acidic_solution': 1.05,
                    'salt': 1.2,
                    'sugar': 1.6,
                    'alcohol': 0.79,
                    'oil': 0.92
                };
                
                let totalWeight = 0;
                object.properties.contents.forEach(content => {
                    const contentType = (content.type || 'water').toLowerCase();
                    const contentVolume = content.volume || 0;
                    const density = densityMap[contentType] || 1.0;
                    totalWeight += contentVolume * density;
                });
                calculatedWeight = totalWeight;
            } else if (volume > 0) {
                calculatedWeight = volume * 1.0;
            }
        }
        
        const existingWeight = this.engine.measurements.mass[object.name];
        this.currentWeight = existingWeight !== undefined && existingWeight > 0 ? existingWeight : calculatedWeight;
        
        const popup = document.createElement('div');
        popup.id = 'scale-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #9b8cff 0%, #ff2ea8 100%);
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            min-width: 400px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        popup.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">Electronic Scale</h3>
                <p style="margin: 0; opacity: 0.9; font-size: 14px;">Object: ${object.name}</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.15); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 10px; font-size: 14px; font-weight: 600; opacity: 0.9;">Weight (grams)</label>
                    <div style="font-size: 48px; font-weight: 700; font-family: 'Courier New', monospace;">
                        <span id="scale-weight-display">${this.currentWeight.toFixed(1)}</span>
                        <span style="font-size: 24px; margin-left: 5px;">g</span>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button id="scale-confirm-btn" 
                        style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.2); border: 2px solid white; border-radius: 8px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    Confirm
                </button>
                <button id="scale-close-btn" 
                        style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.5); border-radius: 8px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(popup);
        this.scalePopup = popup;
        
        const display = popup.querySelector('#scale-weight-display');
        const confirmBtn = popup.querySelector('#scale-confirm-btn');
        const closeBtn = popup.querySelector('#scale-close-btn');
        
        confirmBtn.addEventListener('click', () => {
            this.confirmWeight();
        });
        
        closeBtn.addEventListener('click', () => {
            this.hideScalePopup();
        });
        
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        });
    }

    confirmWeight() {
        if (this.objectOnScale) {
            this.engine.measurements.mass[this.objectOnScale.name] = this.currentWeight;
            
            if (this.objectOnScale.properties) {
                this.objectOnScale.properties.mass = this.currentWeight;
            }
            
            this.engine.addFeedback(`Weight recorded: ${this.objectOnScale.name} = ${this.currentWeight.toFixed(2)} g`);
            
            if (typeof this.engine.updateMeasurements === 'function') {
                this.engine.updateMeasurements();
            }
        }
        
        this.hideScalePopup();
    }

    hideScalePopup() {
        if (this.scalePopup) {
            this.scalePopup.remove();
            this.scalePopup = null;
        }
    }

    onObjectPlaced(object) {
        if (this.checkObjectOnScale(object)) {
            setTimeout(() => {
                if (this.checkObjectOnScale(object)) {
                    this.objectOnScale = object;
                    this.updateScaleButton();
                }
            }, 300);
        } else {
            this.objectOnScale = null;
            this.updateScaleButton();
        }
    }

    updateScaleButton() {
        const scaleControls = document.getElementById('scale-controls');
        const scaleObjectName = document.getElementById('scale-object-name');
        
        if (scaleControls) {
            if (this.objectOnScale) {
                scaleControls.style.display = 'block';
                if (scaleObjectName) {
                    scaleObjectName.textContent = `Object on scale: ${this.objectOnScale.name}`;
                }
            } else {
                scaleControls.style.display = 'none';
                if (scaleObjectName) {
                    scaleObjectName.textContent = '';
                }
            }
        }
    }

    checkAndUpdateScaleButton() {
        const now = Date.now();
        if (now - this.lastUpdateTime < 100) {
            return;
        }
        this.lastUpdateTime = now;
        
        if (!this.scaleObject) {
            this.findScaleObject();
        }
        
        if (!this.scaleObject) {
            if (this.objectOnScale !== null) {
                this.objectOnScale = null;
                this.updateScaleButton();
            }
            return;
        }

        let foundObject = null;
        for (const [name, obj] of this.engine.objects) {
            if (obj !== this.scaleObject && this.checkObjectOnScale(obj)) {
                foundObject = obj;
                break;
            }
        }

        if (foundObject !== this.objectOnScale) {
            this.objectOnScale = foundObject;
            this.updateScaleButton();
        }
    }
}

