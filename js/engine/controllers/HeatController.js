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
                
                if (this.activeObject.properties.temperature > 200) {
                    this.activeObject.properties.temperature = 200;
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

