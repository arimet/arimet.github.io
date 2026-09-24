// The pencil-then-watercolour shader, shared by the hero portrait and the project tiles.
// Uniforms: reveal 0 = pencil drawing, 1 = painted; origin = where the paint starts (uv);
// ink fades the pencil in; dof/focus/depth blur out-of-focus planes; fade trims the bottom.
import { animate } from 'motion'
import { threeEffect } from 'motion/three'

// Lets animate() drive three.js objects and uniforms. Registered once, here.
animate.addEffect(threeEffect)

export const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// 'load' rather than img.decode(): decode() never settles while the tab is hidden.
export const load = (src) =>
    new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })

// Resolves once the tab is visible, so intros are not played to a background tab.
export const whenVisible = () =>
    document.hidden ? new Promise((r) => document.addEventListener('visibilitychange', r, { once: true })) : Promise.resolve()

export const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
export const fragmentShader = /* glsl */ `
    uniform sampler2D map;
    uniform vec2 texSize, origin, screen;
    uniform vec3 lineCol, paperCol;
    uniform float reveal, ink, depth, focus, dof, hatchAmt, fade, sharpen, drawn;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }
    vec4 tap(vec2 uv, float b) { return texture2D(map, uv, b); }
    float lumA(vec4 c) { vec3 rgb = c.rgb / max(c.a, 1e-3); return mix(1.0, dot(rgb, vec3(0.299, 0.587, 0.114)), c.a); }

    void main() {
        float blur = dof * min(abs(depth - focus) * 0.9, 3.5);
        vec2 px = 1.0 / texSize;
        vec2 o = px * exp2(blur) * 0.8;
        vec4 col = tap(vUv, blur);
        vec4 around = (tap(vUv + o, blur) + tap(vUv - o, blur) + tap(vUv + vec2(o.x, -o.y), blur) + tap(vUv + vec2(-o.x, o.y), blur)) / 4.0;
        if (blur > 0.01) col = (col * 2.0 + around * 4.0) / 6.0;
        else col = clamp(col + (col - around) * sharpen, 0.0, 1.0);
        float side = (vUv.x - 0.5) * 2.0;
        float keep = fade > 0.0 ? smoothstep(0.0, fade, gl_FragCoord.y / screen.y - 0.14 * side * side) : 1.0;
        vec4 paint = vec4(min(col.rgb, vec3(col.a)), col.a);

        if (reveal >= 1.0) { gl_FragColor = paint * keep; return; }

        // Pencil: wobbly outlines + cross-hatching.
        vec2 p = vUv * texSize;
        vec2 w = (vec2(noise(p * 0.05), noise(p * 0.05 + 7.0)) - 0.5) * px * 4.0;
        // Detail is dropped by the blurred mip + high threshold; thinness comes from the 1px offset.
        const float COARSE = 1.2;
        vec2 s = px;
        float tl = lumA(tap(vUv + w + vec2(-s.x, s.y), COARSE)), t = lumA(tap(vUv + w + vec2(0, s.y), COARSE)), tr = lumA(tap(vUv + w + s, COARSE));
        float l = lumA(tap(vUv + w - vec2(s.x, 0), COARSE)), r = lumA(tap(vUv + w + vec2(s.x, 0), COARSE));
        float bl = lumA(tap(vUv + w - s, COARSE)), b = lumA(tap(vUv + w - vec2(0, s.y), COARSE)), br = lumA(tap(vUv + w + vec2(s.x, -s.y), COARSE));
        float strong = smoothstep(0.08, 0.26, length(vec2(-tl - 2.0 * l - bl + tr + 2.0 * r + br, -bl - 2.0 * b - br + tl + 2.0 * t + tr)));
        // Keep only the thin dark side of each strong edge: one line instead of Sobel's double stroke.
        float thin = smoothstep(0.004, 0.02, lumA(tap(vUv + w, 2.0)) - lumA(tap(vUv + w, 0.4)));
        float line = min(1.0, strong * thin * 1.8);
        float dark = (1.0 - lumA(tap(vUv, COARSE))) * col.a;
        float h1 = 1.0 - smoothstep(0.0, 0.18, abs(fract((p.x + p.y) / 7.0) - 0.5) * 2.0);
        float h2 = 1.0 - smoothstep(0.0, 0.18, abs(fract((p.x - p.y) / 7.0) - 0.5) * 2.0);
        float hatch = (h1 * smoothstep(0.5, 0.85, dark) + h2 * smoothstep(0.75, 1.0, dark)) * hatchAmt * (0.3 + 0.7 * noise(p * 0.04));
        float pencil = clamp(line + hatch * 0.45, 0.0, 1.0) * ink * (0.75 + 0.25 * noise(p * 0.35));
        // Paper in the page colour hides the layers behind the drawing; drawn = 0 skips the pencil entirely.
        pencil *= drawn;
        float fill = col.a * drawn * (1.0 - pencil);
        vec4 sketch = vec4(paperCol * fill + lineCol * pencil, fill + pencil);

        // Watercolour reveal spreading from origin, darker at the wet edge.
        float n = distance(vUv, origin) * 1.2 + (fbm(vUv * 5.0 + depth) - 0.5) * 0.5;
        float rr = reveal * 1.9 - 0.3;
        float m = 1.0 - smoothstep(rr - 0.1, rr, n);
        float wet = smoothstep(rr - 0.1, rr - 0.03, n) * m;
        paint.rgb *= 1.0 - 0.2 * wet;
        gl_FragColor = mix(sketch, paint, m) * keep;
    }
`
