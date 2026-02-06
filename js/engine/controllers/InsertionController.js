import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class InsertionController {
    constructor(engine) {
        this.engine = engine;
        this.insertionModal = null;
        this.activeInsertion = null;
        this.hasShownModal = false;
        this.dismissedInsertions = new Set();
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

    checkInsertionReady(object) {
        if (!object || !object.mesh) {
            console.log('[InsertionController] checkInsertionReady: no object or mesh');
            return null;
        }
        
        object.mesh.updateMatrixWorld(true);
        const objectBox = new THREE.Box3().setFromObject(object.mesh);
        const objectCenter = objectBox.getCenter(new THREE.Vector3());
        const objectSize = objectBox.getSize(new THREE.Vector3());
        const objectRadius = Math.max(objectSize.x, objectSize.z) / 2;
        const objectBottomY = objectBox.min.y;
        
        console.log(`[InsertionController] Checking insertion for ${object.name}:`, {
            objectCenter: `${objectCenter.x.toFixed(2)}, ${objectCenter.y.toFixed(2)}, ${objectCenter.z.toFixed(2)}`,
            objectBottomY: objectBottomY.toFixed(3),
            objectRadius: objectRadius.toFixed(3)
        });
        
        let bestContainer = null;
        let bestScore = -1;
        let containersChecked = 0;
        
        for (const [name, container] of this.engine.objects) {
            if (container === object) continue;
            if (!container.properties.isContainer) continue;
            
            containersChecked++;
            const containerName = name.toLowerCase();
            const isBeaker = containerName.includes('beaker');
            const isWaterBath = containerName.includes('water') || containerName.includes('bath');
            const isFlask = containerName.includes('flask');
            
            console.log(`[InsertionController] Checking container: ${name} (isBeaker: ${isBeaker}, isWaterBath: ${isWaterBath}, isFlask: ${isFlask})`);
            
            if (!isBeaker && !isWaterBath && !isFlask) {
                console.log(`[InsertionController] Skipping ${name} - not a beaker/flask/water bath`);
                continue;
            }
            
            container.mesh.updateMatrixWorld(true);
            const containerBox = new THREE.Box3().setFromObject(container.mesh);
            const containerCenter = containerBox.getCenter(new THREE.Vector3());
            const containerSize = containerBox.getSize(new THREE.Vector3());
            const containerRadius = Math.max(containerSize.x, containerSize.z) / 2;
            
            const containerTopY = containerBox.max.y;
            
            const horizontalDistance = Math.sqrt(
                Math.pow(objectCenter.x - containerCenter.x, 2) + 
                Math.pow(objectCenter.z - containerCenter.z, 2)
            );
            
            const isHorizontallyAligned = horizontalDistance < containerRadius * 1.5;
            const isAboveContainer = objectBottomY >= containerTopY - 0.5 && objectBottomY <= containerTopY + 2.0;
            const isSmallEnough = objectRadius < containerRadius * 1.2;
            
            console.log(`[InsertionController] ${object.name} vs ${name}:`, {
                horizontalDistance: horizontalDistance.toFixed(3),
                containerRadius: containerRadius.toFixed(3),
                threshold: (containerRadius * 1.5).toFixed(3),
                objectBottomY: objectBottomY.toFixed(3),
                containerTopY: containerTopY.toFixed(3),
                isHorizontallyAligned,
                isAboveContainer,
                isSmallEnough
            });
            
            if (isHorizontallyAligned && isAboveContainer && isSmallEnough) {
                const horizontalScore = 1 - (horizontalDistance / containerRadius);
                const verticalScore = 1 - Math.abs(objectBottomY - containerTopY);
                const sizeScore = objectRadius < containerRadius * 0.5 ? 1 : 0.8;
                const score = horizontalScore * verticalScore * sizeScore;
                
                console.log(`[InsertionController] ${object.name} above ${name}:`, {
                    horizontalDistance: horizontalDistance.toFixed(3),
                    containerRadius: containerRadius.toFixed(3),
                    objectBottomY: objectBottomY.toFixed(3),
                    containerTopY: containerTopY.toFixed(3),
                    isHorizontallyAligned,
                    isAboveContainer,
                    isSmallEnough,
                    score: score.toFixed(3)
                });
                
                if (score > bestScore) {
                    bestScore = score;
                    bestContainer = container;
                }
            }
        }
        
        console.log(`[InsertionController] Checked ${containersChecked} containers, best match:`, bestContainer ? bestContainer.name : 'none');
        return bestContainer;
    }

    checkInsertion(object) {
        if (!object || !object.mesh) return null;
        
        object.mesh.updateMatrixWorld(true);
        const objectBox = new THREE.Box3().setFromObject(object.mesh);
        const objectCenter = objectBox.getCenter(new THREE.Vector3());
        const objectSize = objectBox.getSize(new THREE.Vector3());
        const objectRadius = Math.max(objectSize.x, objectSize.z) / 2;
        
        let bestContainer = null;
        let bestScore = -1;
        
        for (const [name, container] of this.engine.objects) {
            if (container === object) continue;
            if (!container.properties.isContainer) continue;
            
            const containerName = name.toLowerCase();
            const isBeaker = containerName.includes('beaker');
            const isWaterBath = containerName.includes('water') || containerName.includes('bath');
            const isFlask = containerName.includes('flask');
            const isContainer = container.properties.isContainer;
            
            if (!isBeaker && !isWaterBath && !isFlask && !isContainer) continue;
            
            container.mesh.updateMatrixWorld(true);
            const containerBox = new THREE.Box3().setFromObject(container.mesh);
            const containerCenter = containerBox.getCenter(new THREE.Vector3());
            const containerSize = containerBox.getSize(new THREE.Vector3());
            const containerRadius = Math.max(containerSize.x, containerSize.z) / 2;
            
            const containerTopY = containerBox.max.y;
            const containerBottomY = containerBox.min.y;
            const containerHeight = containerSize.y;
            
            const objectBottomY = objectBox.min.y;
            const objectTopY = objectBox.max.y;
            
            const horizontalDistance = Math.sqrt(
                Math.pow(objectCenter.x - containerCenter.x, 2) + 
                Math.pow(objectCenter.z - containerCenter.z, 2)
            );
            
            const isHorizontallyInside = horizontalDistance < containerRadius * 0.7;
            const isVerticallyInside = (
                objectBottomY >= containerBottomY + containerHeight * 0.1 &&
                objectBottomY <= containerTopY - containerHeight * 0.1 &&
                objectTopY <= containerTopY
            );
            
            if (isHorizontallyInside && isVerticallyInside) {
                const verticalScore = (objectBottomY - containerBottomY) / containerHeight;
                const horizontalScore = 1 - (horizontalDistance / containerRadius);
                const sizeScore = objectRadius < containerRadius * 0.5 ? 1 : 0.5;
                const score = verticalScore * horizontalScore * sizeScore;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestContainer = container;
                }
            }
        }
        
        return bestContainer;
    }

    showInsertionModal(object, container) {
        if (this.insertionModal) {
            this.hideInsertionModal();
        }
        
        if (!object || !container) {
            console.warn('Cannot show insertion modal: missing object or container');
            return;
        }
        
        const insertionKey = `${object.name}_${container.name}`;
        if (this.dismissedInsertions.has(insertionKey)) {
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'insertion-modal-overlay';
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
                    <h2 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700;">Equipment Insertion</h2>
                </div>
                <div style="padding: 30px;">
                    <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
                        Insertion successful!
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 20px; font-size: 14px; line-height: 1.5;">
                        <strong>${this.formatModelName(object.name)}</strong> has been inserted into <strong>${this.formatModelName(container.name)}</strong>
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px; font-size: 14px; line-height: 1.5;">
                        The equipment is now positioned inside the container.
                    </p>
                    <div style="display: flex; gap: 10px;">
                        <button id="insertion-confirm-btn" 
                                style="flex: 1; padding: 12px; background: rgba(59, 130, 246, 0.8); 
                                       border: 2px solid rgba(59, 130, 246, 1); border-radius: 8px; 
                                       color: white; font-size: 16px; font-weight: 600; cursor: pointer; 
                                       transition: all 0.2s;">
                            OK
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        try {
            document.body.appendChild(modal);
            this.insertionModal = modal;
            this.activeInsertion = { object, container, key: insertionKey };
            console.log('Insertion modal shown for', object.name, 'inside', container.name);
            
            const confirmBtn = modal.querySelector('#insertion-confirm-btn');
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    this.hideInsertionModal();
                });
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideInsertionModal();
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.insertionModal) {
                    this.hideInsertionModal();
                }
            }, { once: true });
            
        } catch (error) {
            console.error('Error showing insertion modal:', error);
        }
    }

    hideInsertionModal() {
        if (this.insertionModal) {
            try {
                if (this.insertionModal.parentNode) {
                    this.insertionModal.parentNode.removeChild(this.insertionModal);
                }
            } catch (error) {
                console.error('Error removing insertion modal:', error);
            }
            this.insertionModal = null;
            
            if (this.activeInsertion) {
                this.dismissedInsertions.add(this.activeInsertion.key);
                this.activeInsertion = null;
            }
            
            this.hasShownModal = false;
        }
    }

    reset() {
        this.hideInsertionModal();
        this.dismissedInsertions.clear();
        this.hasShownModal = false;
    }
}

