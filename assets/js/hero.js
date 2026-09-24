// Hero portrait: the photo is drawn in pencil, then painted in, and reacts to the cursor
// with parallax and depth of field. Planes: halftone dots (back) and the cutout (front).
// The cutout mask comes from tools/mask.swift.
import * as THREE from 'three'
import { animate, frame } from 'motion'
import { vertexShader, fragmentShader, token, load, whenVisible } from './sketch.js'


const hero = document.querySelector('.hero')
const canvas = hero.querySelector('.hero-canvas')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

const [photo, mask] = await Promise.all([load('./assets/images/anthony.png'), load('./assets/images/anthony-mask.png')])

function cutout() {
    const c = Object.assign(document.createElement('canvas'), { width: photo.width, height: photo.height })
    const g = c.getContext('2d', { willReadFrequently: true })
    g.drawImage(mask, 0, 0)
    const m = g.getImageData(0, 0, c.width, c.height).data
    g.drawImage(photo, 0, 0)
    const px = g.getImageData(0, 0, c.width, c.height)
    for (let i = 0; i < m.length; i += 4) px.data[i + 3] = m[i]
    g.putImageData(px, 0, 0)
    return c
}

// Halftone halo: dot size falls off from the centre, with a little noise.
const dotsCanvas = Object.assign(document.createElement('canvas'), { width: 1600, height: 1100 })
function paintDots() {
    const g = dotsCanvas.getContext('2d')
    const { width: w, height: h } = dotsCanvas
    g.clearRect(0, 0, w, h)
    const [from, to] = [token('--dots-from'), token('--dots-to')]
    const fill = g.createLinearGradient(0, 0, w, 0)
    fill.addColorStop(0, from)
    fill.addColorStop(1, to)
    g.fillStyle = fill
    let seed = 7
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    for (let y = 8; y < h; y += 16) {
        for (let x = 8; x < w; x += 16) {
            const d = Math.hypot((x - w / 2) / (w / 2), (y - h * 0.46) / (h / 2))
            const r = 4.2 * Math.max(0, 1 - d) ** 1.3 * (0.55 + 0.45 * rnd())
            if (r < 0.6) continue
            g.beginPath()
            g.arc(x, y, r, 0, Math.PI * 2)
            g.fill()
        }
    }
}
paintDots()

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
const scene = new THREE.Scene()
const D = 10
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
camera.position.z = D
const VIEW_H = 2 * D * Math.tan(THREE.MathUtils.degToRad(15))

const shared = {
    ink: { value: 0 },
    focus: { value: -0.8 },
    dof: { value: 0 },
    lineCol: { value: new THREE.Color() },
    paperCol: { value: new THREE.Color() },
    screen: { value: new THREE.Vector2(1, 1) },
}

// Layout is in fractions of the view at each plane's depth, so it survives any hero size.
const LAYERS = [
    { name: 'dots', canvas: dotsCanvas, z: -3, height: 1.2, bottom: -0.12, origin: [0.5, 0.5], hatch: 0, fade: 0.2, sharpen: 0, drawn: 0, at: 1.9, dur: 1.6 },
    { name: 'person', canvas: cutout(), z: -0.8, height: 0.95, bottom: -0.09, origin: [0.5, 0.8], hatch: 0.4, fade: 0.3, sharpen: 0.5, drawn: 1, at: 0.9, dur: 2.2 },
]

const meshes = LAYERS.map((L, i) => {
    const tex = new THREE.CanvasTexture(L.canvas)
    tex.premultiplyAlpha = true
    tex.anisotropy = 4
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShaderMaterial({
            uniforms: {
                map: { value: tex },
                texSize: { value: new THREE.Vector2(L.canvas.width, L.canvas.height) },
                origin: { value: new THREE.Vector2(...L.origin) },
                reveal: { value: reduce ? 1 : 0 },
                depth: { value: L.z },
                hatchAmt: { value: L.hatch },
                fade: { value: L.fade },
                sharpen: { value: L.sharpen },
                drawn: { value: L.drawn },
                ...shared,
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            premultipliedAlpha: true,
        }),
    )
    mesh.renderOrder = i
    mesh.userData = { L, tex }
    scene.add(mesh)
    return mesh
})
const person = meshes[1]
const personAlpha = person.userData.L.canvas.getContext('2d').getImageData(0, 0, photo.width, photo.height).data

function applyTheme() {
    // The shader writes raw sRGB, so skip three's sRGB -> linear conversion.
    shared.lineCol.value.setStyle(token('--sketch'), THREE.LinearSRGBColorSpace)
    shared.paperCol.value.setStyle(token('--bg'), THREE.LinearSRGBColorSpace)
    paintDots()
    meshes[0].userData.tex.needsUpdate = true
}
applyTheme()
new MutationObserver(applyTheme).observe(document.documentElement, { attributeFilter: ['data-theme'] })

function layout() {
    const { width, height } = hero.getBoundingClientRect()
    renderer.setSize(width, height, false)
    renderer.getDrawingBufferSize(shared.screen.value)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    const mobile = width < 900 // same breakpoint as the skill chips in style.css
    // On narrow screens the copy stacks above the portrait: size the portrait so the top of
    // the hair (HAIR = its height in the photo) starts just under the lowest line of copy.
    let scale = 1
    if (mobile) {
        const HAIR = 0.89
        const person = LAYERS[1]
        const copyBottom = Math.max(...[...hero.querySelectorAll('.hero-intro, .hero-skills')].map((el) => el.getBoundingClientRect().bottom)) - hero.getBoundingClientRect().top
        const free = (height - copyBottom - 24) / height
        scale = Math.min(1, Math.max(0.35, (free - person.bottom) / (HAIR * person.height)))
    }
    for (const m of meshes) {
        const { L } = m.userData
        // The fade is in screen heights: shrink it with the portrait so it only eats its bottom.
        m.material.uniforms.fade.value = mobile ? L.fade * scale * 0.7 : L.fade
        const vh = (VIEW_H * (D - L.z)) / D
        const h = L.height * scale * vh
        m.scale.set((h * L.canvas.width) / L.canvas.height, h, 1)
        m.position.set(0, -vh / 2 + h / 2 + L.bottom * vh, L.z)
    }
}
new ResizeObserver(layout).observe(hero)
layout()
// Web fonts change the height of the copy above the portrait.
document.fonts.ready.then(layout)

// Render only while the hero is on screen.
let visible = true
new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero)
const look = new THREE.Vector3(0, 0, -2.5)
frame.render(() => {
    if (!visible) return
    camera.lookAt(look)
    renderer.render(scene, camera)
}, true)

// ?sketch freezes the intro on the pencil drawing, for tuning the lines.
const freeze = new URLSearchParams(location.search).has('sketch')
let ready = reduce
if (reduce || freeze) shared.ink.value = 1
if (freeze) meshes.forEach((m) => (m.material.uniforms.reveal.value = 0))
else if (!reduce) {
    await whenVisible()
    Promise.all([
        animate(shared, { ink: [0, 1] }, { duration: 1.2, ease: 'easeOut' }),
        ...meshes.map((m) => animate(m, { reveal: [0, 1] }, { delay: m.userData.L.at, duration: m.userData.L.dur, ease: [0.45, 0, 0.2, 1] })),
    ]).then(() => (ready = true))
}

// Pointer: parallax everywhere in the hero; depth of field only while over the portrait.
const spring = { type: 'spring', stiffness: 38, damping: 13 }
const ray = new THREE.Raycaster()
const ndc = new THREE.Vector2()
let focused = false

hero.addEventListener('pointermove', (e) => {
    if (reduce || e.pointerType === 'touch') return
    const r = hero.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    animate(camera, { x: ndc.x * 0.9, y: ndc.y * 0.5 }, spring)
    if (!ready) return
    ray.setFromCamera(ndc, camera)
    const hit = ray.intersectObject(person, false)[0]
    const over = !!hit && personAlpha[(Math.floor((1 - hit.uv.y) * photo.height) * photo.width + Math.floor(hit.uv.x * photo.width)) * 4 + 3] > 110
    if (over !== focused) {
        focused = over
        animate(shared, { dof: over ? 1 : 0 }, { duration: 0.6, ease: [0.3, 0, 0.2, 1] })
    }
})
hero.addEventListener('pointerleave', () => {
    animate(camera, { x: 0, y: 0 }, spring)
    if (focused) animate(shared, { dof: 0 }, { duration: 0.6 })
    focused = false
})
