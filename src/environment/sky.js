// src/environment/sky.js
import * as THREE from 'three';

/* adds sky object to the 3D scene and creates a shader materialwith custom vertex and fragment shader, which generates
generates a gradient sky with light blue at the top and light green at the bottom */
export function initSky(scene) {
    const skyShader = {
        uniforms: {
            "topColor": { value: new THREE.Color(0xB2DAE8) },
            "bottomColor": { value: new THREE.Color(0xB2DAE8) },
            "offset": { value: 33 },
            "exponent": { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `
    };

    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(skyShader.uniforms),
        vertexShader: skyShader.vertexShader,
        fragmentShader: skyShader.fragmentShader,
        side: THREE.BackSide
    });

    const skyGeometry = new THREE.SphereGeometry(1000, 32, 15);
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}
