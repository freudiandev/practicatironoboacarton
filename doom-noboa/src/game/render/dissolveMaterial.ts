import * as THREE from 'three'

export function createDissolveSpriteMaterial(options: {
  map: THREE.Texture
  tint?: THREE.ColorRepresentation
}) {
  const tint = new THREE.Color(options.tint ?? '#ffffff')

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: options.map },
      uTint: { value: new THREE.Vector3(tint.r, tint.g, tint.b) },
      uTime: { value: 0 },
      uDissolve: { value: 0 }, // 0 visible, 1 gone
      uEdgeWidth: { value: 0.08 },
      uEdgeColor: { value: new THREE.Vector3(1.0, 0.2, 0.65) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;

      uniform sampler2D uMap;
      uniform vec3 uTint;
      uniform float uTime;
      uniform float uDissolve;
      uniform float uEdgeWidth;
      uniform vec3 uEdgeColor;

      // Hash / noise rápido para UV (sin textura extra).
      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      void main() {
        vec4 tex = texture2D(uMap, vUv);
        if (tex.a < 0.08) discard;

        // Pixel feel: cuantización leve de UV (simula dithering/pixel grid).
        vec2 pixUv = floor(vUv * 220.0) / 220.0;
        float n = hash21(pixUv * 64.0 + uTime * 0.35);

        float t = clamp(uDissolve, 0.0, 1.0);
        float edge0 = t;
        float edge1 = t + uEdgeWidth;

        // Se disuelve “por ruido”.
        if (n < edge0) discard;

        vec3 base = tex.rgb * uTint;

        // Borde de quemado/confeti: acentuar cerca del umbral.
        float edge = smoothstep(edge0, edge1, n);
        vec3 color = mix(uEdgeColor, base, edge);

        // Pequeño glow en borde.
        float glow = (1.0 - edge) * 0.45;
        color += uEdgeColor * glow;

        gl_FragColor = vec4(color, tex.a);
      }
    `
  })

  return material
}

