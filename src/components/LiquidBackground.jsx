import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CausticsShaderMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uIntensity: { value: 1.0 },
        uSpeed: { value: 1.0 }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uIntensity;
    uniform float uSpeed;
    varying vec2 vUv;

    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      float time = uTime * uSpeed * 0.5;
      
      // Multi-layer noise for liquid effect
      float n1 = snoise(uv * 3.0 + vec2(time * 0.2, time * 0.3));
      float n2 = snoise(uv * 6.0 - vec2(time * 0.4, time * 0.1));
      float n3 = snoise(uv * 12.0 + vec2(time * 0.1, time * 0.5));
      
      float caustics = smoothstep(0.2, 0.8, (n1 + n2 * 0.5 + n3 * 0.25) * 0.5 + 0.5);
      
      // Add sharply refracted bands
      caustics = pow(caustics, 3.0) * 1.5;
      
      // Hedera Green #00C16E (0.0, 0.757, 0.431)
      vec3 color = vec3(0.0, 0.757, 0.431);
      
      // Adjust intensity and base opacity (15%)
      float alpha = caustics * 0.15 * uIntensity;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
};

const ShaderPlane = ({ isPending }) => {
    const materialRef = useRef();
    const { size } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uIntensity: { value: 1.0 },
        uSpeed: { value: 1.0 }
    }), [size]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

            // Dynamic state changes based on isPending prop
            // 3x speed and 1.5x intensity when pending
            const targetSpeed = isPending ? 3.0 : 1.0;
            const targetIntensity = isPending ? 1.5 : 1.0;

            // Smoothly interpolate to target values
            materialRef.current.uniforms.uSpeed.value += (targetSpeed - materialRef.current.uniforms.uSpeed.value) * 0.05;
            materialRef.current.uniforms.uIntensity.value += (targetIntensity - materialRef.current.uniforms.uIntensity.value) * 0.05;
        }
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                attach="material"
                args={[CausticsShaderMaterial]}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
};

export default function LiquidBackground({ isPending = false }) {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
            <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
                <ShaderPlane isPending={isPending} />
            </Canvas>
        </div>
    );
}
