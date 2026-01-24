import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class HeatController {
    constructor(engine) {
        this.engine = engine;
        this.activeObject = null;
        this.isHeating = false;
        this.heatRate = 2;
        this.animationFrame = null;
    }

    start(obj, event) {
        if (!obj.interactions.heatable || !obj.properties.canHeat) return;
        
        this.activeObject = obj;
        this.isHeating = true;
        this.startHeating();
    }

    startHeating() {
        const heat = () => {
            if (this.isHeating && this.activeObject) {
                this.activeObject.properties.temperature += this.heatRate;
                
                const isFlammable = this.engine.isFlammable && this.engine.isFlammable(this.activeObject);
                const maxTemp = isFlammable ? 300 : 200;
                
                if (this.activeObject.properties.temperature > maxTemp) {
                    this.activeObject.properties.temperature = maxTemp;
                }
                
                if (this.engine.updateLiquidMesh) {
                    this.engine.updateLiquidMesh(this.activeObject);
                }
                
                if (this.engine.updateEffects) {
                    this.engine.updateEffects(this.activeObject);
                }
                
                this.animationFrame = requestAnimationFrame(heat);
            }
        };
        heat();
    }

    update(event) {
    }

    end() {
        this.isHeating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.activeObject = null;
    }
}

