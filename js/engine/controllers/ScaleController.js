import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class ScaleController {
    constructor(engine) {
        this.engine = engine;
        this.scaleObject = null;
        this.objectOnScale = null;
        this.scalePopup = null;
        this.currentWeight = 0;
        this.maxWeight = 1000;
    }

    findScaleObject() {
        for (const [name, obj] of this.engine.objects) {
            if (name.toLowerCase().includes('scale') || 
                name.toLowerCase().includes('electronic_scale') ||
                obj.properties.isScale) {
                this.scaleObject = obj;
                return obj;
            }
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
            minX: scaleCenter.x - scaleSize.x * 0.3,
            maxX: scaleCenter.x + scaleSize.x * 0.3,
            minZ: scaleCenter.z - scaleSize.z * 0.3,
            maxZ: scaleCenter.z + scaleSize.z * 0.3,
            y: scaleTopY + 0.05
        };
        
        const objectBottomY = objectBox.min.y;
        const horizontalDistance = Math.sqrt(
            Math.pow(objectCenter.x - scaleCenter.x, 2) + 
            Math.pow(objectCenter.z - scaleCenter.z, 2)
        );
        
        const isOnScale = (
            objectCenter.x >= scaleTopArea.minX &&
            objectCenter.x <= scaleTopArea.maxX &&
            objectCenter.z >= scaleTopArea.minZ &&
            objectCenter.z <= scaleTopArea.maxZ &&
            objectBottomY <= scaleTopArea.y &&
            objectBottomY >= scaleTopArea.y - 0.2 &&
            horizontalDistance < scaleSize.x * 0.4
        );
        
        return isOnScale;
    }

    showScalePopup(object) {
        if (this.scalePopup) {
            this.hideScalePopup();
        }
        
        this.objectOnScale = object;
        this.currentWeight = this.engine.measurements.mass[object.name] || 0;
        
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
                
                <input type="range" 
                       id="scale-weight-slider" 
                       min="0" 
                       max="${this.maxWeight}" 
                       step="0.1" 
                       value="${this.currentWeight}"
                       style="width: 100%; height: 8px; border-radius: 4px; outline: none; background: rgba(255, 255, 255, 0.3); cursor: pointer;">
                
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; opacity: 0.8;">
                    <span>0 g</span>
                    <span>${this.maxWeight} g</span>
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
        
        const slider = popup.querySelector('#scale-weight-slider');
        const display = popup.querySelector('#scale-weight-display');
        const confirmBtn = popup.querySelector('#scale-confirm-btn');
        const closeBtn = popup.querySelector('#scale-close-btn');
        
        slider.addEventListener('input', (e) => {
            this.currentWeight = parseFloat(e.target.value);
            display.textContent = this.currentWeight.toFixed(1);
        });
        
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
        
        slider.style.cssText += `
            -webkit-appearance: none;
            appearance: none;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #scale-weight-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }
            #scale-weight-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
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
        this.objectOnScale = null;
    }

    onObjectPlaced(object) {
        if (this.checkObjectOnScale(object)) {
            setTimeout(() => {
                if (this.checkObjectOnScale(object)) {
                    this.showScalePopup(object);
                }
            }, 300);
        }
    }
}

