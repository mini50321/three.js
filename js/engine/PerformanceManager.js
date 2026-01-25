import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class PerformanceManager {
    constructor() {
        this.quality = 'auto';
        this.targetFPS = 30;
        this.frameTime = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsHistory = [];
        this.maxFPSHistory = 60;
        this.adaptiveQuality = true;
        this.qualityLevels = {
            'low': {
                pixelRatio: 0.75,
                antialias: false,
                shadows: false,
                shadowMapType: THREE.BasicShadowMap,
                particleMultiplier: 0.3,
                geometrySegments: 8,
                updateThrottle: 2
            },
            'medium': {
                pixelRatio: 1.0,
                antialias: false,
                shadows: true,
                shadowMapType: THREE.PCFShadowMap,
                particleMultiplier: 0.6,
                geometrySegments: 16,
                updateThrottle: 1
            },
            'high': {
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                antialias: true,
                shadows: true,
                shadowMapType: THREE.PCFSoftShadowMap,
                particleMultiplier: 1.0,
                geometrySegments: 32,
                updateThrottle: 0
            }
        };
        this.currentQuality = null;
        this.detectDeviceCapabilities();
    }

    detectDeviceCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            this.setQuality('low');
            return;
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
        
        const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
        const isLowEndGPU = /adreno|mali|powervr|intel.*hd|intel.*iris/i.test(renderer.toLowerCase());
        const cores = navigator.hardwareConcurrency || 2;
        const memory = navigator.deviceMemory || 2;
        const pixelRatio = window.devicePixelRatio || 1;
        
        let suggestedQuality = 'medium';
        
        if (isMobile || isLowEndGPU || cores < 4 || memory < 4 || pixelRatio > 2) {
            suggestedQuality = 'low';
        } else if (cores >= 8 && memory >= 8 && !isMobile) {
            suggestedQuality = 'high';
        }
        
        if (this.quality === 'auto') {
            this.setQuality(suggestedQuality);
        } else {
            this.setQuality(this.quality);
        }
    }

    setQuality(quality) {
        if (this.qualityLevels[quality]) {
            this.currentQuality = this.qualityLevels[quality];
            this.quality = quality;
            return true;
        }
        return false;
    }

    getQuality() {
        return this.currentQuality || this.qualityLevels['medium'];
    }

    updateFPS(deltaTime) {
        const fps = 1000 / deltaTime;
        this.fpsHistory.push(fps);
        
        if (this.fpsHistory.length > this.maxFPSHistory) {
            this.fpsHistory.shift();
        }
        
        this.frameCount++;
        
        if (this.adaptiveQuality && this.frameCount % 120 === 0) {
            this.adaptQuality();
        }
    }

    adaptQuality() {
        if (!this.adaptiveQuality) return;
        
        const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        
        if (avgFPS < 20 && this.quality !== 'low') {
            this.setQuality('low');
            console.log('Performance: Auto-switched to LOW quality');
        } else if (avgFPS < 30 && this.quality === 'high') {
            this.setQuality('medium');
            console.log('Performance: Auto-switched to MEDIUM quality');
        } else if (avgFPS > 50 && this.quality === 'low') {
            this.setQuality('medium');
            console.log('Performance: Auto-switched to MEDIUM quality');
        } else if (avgFPS > 60 && this.quality === 'medium') {
            this.setQuality('high');
            console.log('Performance: Auto-switched to HIGH quality');
        }
    }

    shouldThrottleUpdate(frameCount) {
        const throttle = this.getQuality().updateThrottle;
        if (throttle === 0) return false;
        return frameCount % (throttle + 1) !== 0;
    }

    getParticleCount(baseCount) {
        return Math.floor(baseCount * this.getQuality().particleMultiplier);
    }

    getGeometrySegments() {
        return this.getQuality().geometrySegments;
    }

    getPixelRatio() {
        return this.getQuality().pixelRatio;
    }

    getAntialias() {
        return this.getQuality().antialias;
    }

    getShadowsEnabled() {
        return this.getQuality().shadows;
    }

    getShadowMapType() {
        return this.getQuality().shadowMapType;
    }

    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }

    reset() {
        this.fpsHistory = [];
        this.frameCount = 0;
    }
}

