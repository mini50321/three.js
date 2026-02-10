import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class TiltController {
    constructor(engine) {
        this.engine = engine;
        this.activeObject = null;
        this.startMouse = new THREE.Vector2();
        this.startRotation = new THREE.Euler();
        this.maxTilt = Math.PI / 2;
        this.pourModal = null;
        this.pendingPourTarget = null;
        this.hasShownModal = false;
        this.modalJustClosed = false;
        this.dismissedObjects = new Set();
    }
    
    formatModelName(name) {
        return name
            .replace(/_/g, ' ')
            .replace(/\s+/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .trim();
    }

    start(obj, event) {
        if (!obj.interactions.tiltable) {
            console.log('[TiltController] Object not tiltable:', obj.name);
            return;
        }
        
        if (this.pourModal) {
            this.hidePourModal();
        }
        this.activeObject = obj;
        this.hasShownModal = false;
        this.modalJustClosed = false;
        this.pendingPourTarget = null;
        this.dismissedObjects.delete(obj);
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        this.startMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.startMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.startRotation.copy(obj.mesh.rotation);
        console.log('[TiltController] Started tilt for', obj.name, {
            wasDismissed: this.dismissedObjects.has(obj),
            dismissedObjectsSize: this.dismissedObjects.size,
            dismissedObjects: Array.from(this.dismissedObjects).map(o => o.name)
        });
    }

    update(event) {
        if (!this.activeObject) {
            return;
        }
        
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
        
        if (this.engine.physicsEnabled && this.activeObject.physicsBody && this.engine.physicsManager) {
            const quaternion = new THREE.Quaternion().setFromEuler(this.activeObject.mesh.rotation);
            this.engine.physicsManager.setBodyRotation(this.activeObject.physicsBody, quaternion);
        }
        
        if (this.activeObject.properties.isContainer) {
            const currentVolume = this.engine.calculateVolume(this.activeObject);
            const hasContents = currentVolume > 0.001;
            
            const tiltAngle = Math.abs(tiltX) + Math.abs(tiltZ);
            
            if (hasContents) {
                if (this.engine.isSwirling && this.engine.selectedObject === this.activeObject) {
                    return;
                }
                
                const tiltThreshold = 0.001;
                if (tiltAngle > tiltThreshold) {
                    const isDismissed = this.dismissedObjects.has(this.activeObject);
                    if (!this.hasShownModal && !this.modalJustClosed && !isDismissed) {
                        this.findPourTarget();
                        if (this.pendingPourTarget) {
                            console.log('[TiltController] Showing pour modal for', this.activeObject.name, 'to', this.pendingPourTarget.name);
                            this.showPourModal();
                            this.hasShownModal = true;
                        } else {
                            console.log('[TiltController] No pour target found for', this.activeObject.name, {
                                tiltAngle: tiltAngle.toFixed(3),
                                volume: currentVolume.toFixed(2),
                                objectsCount: this.engine.objects.size
                            });
                        }
                    } else {
                        console.log('[TiltController] Modal blocked for', this.activeObject.name, {
                            hasShownModal: this.hasShownModal,
                            modalJustClosed: this.modalJustClosed,
                            isDismissed: isDismissed,
                            tiltAngle: tiltAngle.toFixed(3),
                            dismissedObjects: Array.from(this.dismissedObjects).map(o => o.name)
                        });
                    }
                }
            } else {
                console.log('[TiltController] No contents in', this.activeObject.name, 'volume:', currentVolume.toFixed(2));
            }
        }
    }
    
    findPourTarget() {
        if (!this.activeObject) {
            return;
        }
        
        const activePos = this.activeObject.mesh.position;
        const tiltX = this.activeObject.mesh.rotation.x;
        const tiltZ = this.activeObject.mesh.rotation.z;
        
        let closest = null;
        let minDistance = Infinity;
        let bestScore = -1;
        
        for (const [name, obj] of this.engine.objects) {
            if (obj === this.activeObject) {
                continue;
            }
            if (!obj.properties.isContainer) {
                continue;
            }
            
            const targetPos = obj.mesh.position;
            const toTarget = new THREE.Vector3().subVectors(targetPos, activePos);
            const distance = toTarget.length();
            
            if (distance < 15 && distance > 0.01) {
                const distanceScore = 1 / (1 + distance);
                const score = distanceScore;
                
                if (score > bestScore) {
                    bestScore = score;
                    minDistance = distance;
                    closest = obj;
                }
            }
        }
        
        this.pendingPourTarget = closest;
    }
    
    showPourModal() {
        if (this.pourModal) {
            this.hidePourModal();
        }
        
        if (!this.activeObject || !this.pendingPourTarget) {
            console.warn('Cannot show pour modal: missing activeObject or target');
            return;
        }
        
        const sourceVolume = this.engine.calculateVolume(this.activeObject);
        const maxPour = Math.min(sourceVolume, this.pendingPourTarget.properties.capacity || 1000);
        
        if (maxPour <= 0) {
            console.warn('Cannot show pour modal: no volume to pour');
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'pour-modal-overlay';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.6) !important;
            z-index: 10000 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            pointer-events: auto !important;
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(20, 25, 50, 0.98) 100%);
                border-radius: 16px;
                padding: 0;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <div style="
                    background: linear-gradient(135deg, rgba(24, 24, 48, 0.98) 0%, rgba(30, 30, 60, 0.98) 100%);
                    padding: 24px 30px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px 16px 0 0;
                ">
                    <h2 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700;">Pour Liquid</h2>
                </div>
                <div style="padding: 30px;">
                    <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 20px; font-size: 16px;">
                        Pour from <strong>${this.formatModelName(this.activeObject.name)}</strong> to <strong>${this.formatModelName(this.pendingPourTarget.name)}</strong>
                    </p>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: rgba(255, 255, 255, 0.8); margin-bottom: 10px; font-size: 14px;">
                            Amount (ml):
                        </label>
                        <input type="number" id="pour-amount-input" 
                               min="0" max="${maxPour}" step="1" value="${Math.min(100, maxPour)}"
                               style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); 
                                      border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 8px; 
                                      color: white; font-size: 16px; box-sizing: border-box;">
                        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
                            <span>0 ml</span>
                            <span>${maxPour.toFixed(0)} ml</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="pour-confirm-btn" 
                                style="flex: 1; padding: 12px; background: rgba(59, 130, 246, 0.8); 
                                       border: 2px solid rgba(59, 130, 246, 1); border-radius: 8px; 
                                       color: white; font-size: 16px; font-weight: 600; cursor: pointer; 
                                       transition: all 0.2s;">
                            Pour
                        </button>
                        <button id="pour-cancel-btn" 
                                style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1); 
                                       border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 8px; 
                                       color: white; font-size: 16px; font-weight: 600; cursor: pointer; 
                                       transition: all 0.2s;">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        try {
            document.body.appendChild(modal);
            this.pourModal = modal;
            console.log('Pour modal appended to body, modal element:', modal);
            
            const input = modal.querySelector('#pour-amount-input');
            const confirmBtn = modal.querySelector('#pour-confirm-btn');
            const cancelBtn = modal.querySelector('#pour-cancel-btn');
            
            if (!input || !confirmBtn || !cancelBtn) {
                console.error('Failed to find modal elements');
                return;
            }
        
        const handleConfirm = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const amount = parseFloat(input.value) || 0;
            if (amount > 0 && amount <= maxPour) {
                this.executePour(amount);
            }
            this.hidePourModal();
        };
        
        const handleCancel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[TiltController] Cancel button clicked');
            this.hidePourModal();
        };
        
        confirmBtn.addEventListener('click', handleConfirm, { capture: true });
        cancelBtn.addEventListener('click', handleCancel, { capture: true });
        
        const modalContent = modal.firstElementChild;
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('[TiltController] Modal background clicked');
                this.hidePourModal();
            }
        });
        } catch (error) {
            console.error('Error showing pour modal:', error);
        }
    }
    
    executePour(amount) {
        if (!this.activeObject || !this.pendingPourTarget || amount <= 0) return;
        
        const sourceVolume = this.engine.calculateVolume(this.activeObject);
        const pourAmount = Math.min(amount, sourceVolume);
        
        if (pourAmount <= 0) return;
        
        const targetCapacity = this.pendingPourTarget.properties.capacity || 1000;
        const targetCurrentVolume = this.engine.calculateVolume(this.pendingPourTarget);
        const availableSpace = targetCapacity - targetCurrentVolume;
        const actualPour = Math.min(pourAmount, availableSpace);
        
        if (actualPour <= 0) return;
        
        if (!this.activeObject.properties.contents || this.activeObject.properties.contents.length === 0) {
            if (this.activeObject.properties.volume > 0) {
                this.activeObject.properties.contents = [{ type: 'water', volume: this.activeObject.properties.volume }];
            } else {
                return;
            }
        }
        
        const sourceContent = this.activeObject.properties.contents[0];
        const transferVolume = Math.min(actualPour, sourceContent.volume);
        
        if (transferVolume > 0) {
            sourceContent.volume -= transferVolume;
            
            if (sourceContent.volume <= 0) {
                this.activeObject.properties.contents.shift();
            }
            
            if (!this.pendingPourTarget.properties.contents) {
                this.pendingPourTarget.properties.contents = [];
            }
            
            const existingContent = this.pendingPourTarget.properties.contents.find(c => c.type === sourceContent.type);
            if (existingContent) {
                existingContent.volume += transferVolume;
            } else {
                this.pendingPourTarget.properties.contents.push({
                    type: sourceContent.type,
                    volume: transferVolume
                });
            }
            
            if (this.engine.checkChemicalReaction && this.engine.canReactionProceed) {
                if (this.engine.canReactionProceed(this.pendingPourTarget)) {
                    const reaction = this.engine.checkChemicalReaction(this.pendingPourTarget);
                    if (reaction) {
                        this.engine.processChemicalReaction(this.pendingPourTarget, reaction);
                    }
                }
            }
            
            const newSourceVolume = this.engine.calculateVolume(this.activeObject);
            const newTargetVolume = this.engine.calculateVolume(this.pendingPourTarget);
            
            this.engine.measurements.volume[this.activeObject.name] = newSourceVolume;
            this.engine.measurements.volume[this.pendingPourTarget.name] = newTargetVolume;
            
            this.activeObject.properties.volume = newSourceVolume;
            this.pendingPourTarget.properties.volume = newTargetVolume;
            
            if (this.engine.updateLiquidMesh) {
                this.engine.updateLiquidMesh(this.activeObject);
                this.engine.updateLiquidMesh(this.pendingPourTarget);
            }
            
            setTimeout(() => {
                if (typeof window.updateMeasurements === 'function') {
                    window.updateMeasurements();
                }
            }, 50);
        }
    }
    
    hidePourModal() {
        console.log('[TiltController] hidePourModal called', { hasModal: !!this.pourModal });
        if (this.pourModal) {
            try {
                if (this.pourModal.parentNode) {
                    this.pourModal.style.display = 'none';
                    this.pourModal.parentNode.removeChild(this.pourModal);
                } else if (document.body.contains(this.pourModal)) {
                    this.pourModal.style.display = 'none';
                    document.body.removeChild(this.pourModal);
                }
                this.pourModal = null;
                console.log('[TiltController] Modal removed successfully');
            } catch (error) {
                console.error('[TiltController] Error removing modal:', error);
                if (this.pourModal && this.pourModal.parentNode) {
                    this.pourModal.style.display = 'none';
                }
                this.pourModal = null;
            }
        }
        const dismissedObject = this.activeObject;
        if (dismissedObject) {
            this.dismissedObjects.add(dismissedObject);
            console.log('[TiltController] Modal closed, object added to dismissedObjects:', dismissedObject.name, 'Set size:', this.dismissedObjects.size);
        } else {
            console.log('[TiltController] Modal closed, but no activeObject to dismiss');
        }
        this.pendingPourTarget = null;
        this.hasShownModal = false;
        this.modalJustClosed = false;
        console.log('[TiltController] Modal closed, state reset');
    }

    end() {
        this.hidePourModal();
        if (this.activeObject && this.engine.physicsEnabled && this.activeObject.physicsBody && this.engine.physicsManager) {
            const quaternion = new THREE.Quaternion().setFromEuler(this.activeObject.mesh.rotation);
            this.engine.physicsManager.setBodyRotation(this.activeObject.physicsBody, quaternion);
        }
        const endedObject = this.activeObject;
        this.activeObject = null;
        
        if (endedObject) {
            const tiltAngle = Math.abs(endedObject.mesh.rotation.x) + Math.abs(endedObject.mesh.rotation.z);
            if (tiltAngle < 0.005 && this.dismissedObjects.has(endedObject)) {
                this.dismissedObjects.delete(endedObject);
                console.log('[TiltController] Tilt ended, object untilted, removed from dismissedObjects:', endedObject.name);
            }
            if (this.dismissedObjects.size === 0) {
                this.hasShownModal = false;
                this.modalJustClosed = false;
            }
        } else {
            this.hasShownModal = false;
            this.modalJustClosed = false;
        }
    }
}

