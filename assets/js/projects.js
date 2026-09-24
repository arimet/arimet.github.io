// Project tiles: each screenshot is drawn in pencil, then painted in once, when it scrolls
// into view; afterwards it stays in colour. One small WebGL canvas per tile, rendered only
// while something changes.
import * as THREE from 'three'
import { animate, frame } from 'motion'
import { vertexShader, fragmentShader, token, load } from './sketch.js'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const lineCol = { value: new THREE.Color() }
const paperCol = { value: new THREE.Color() }
const tiles = []

async function mount(media) {
    const img = await load(media.querySelector('img').src)
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    media.append(canvas)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    const tex = new THREE.Texture(img)
    tex.premultiplyAlpha = true
    tex.anisotropy = 4
    tex.needsUpdate = true
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial({
            uniforms: {
                map: { value: tex },
                texSize: { value: new THREE.Vector2(img.width, img.height) },
                origin: { value: new THREE.Vector2(0.5, 0.5) },
                screen: { value: new THREE.Vector2(1, 1) },
                reveal: { value: reduce ? 1 : 0 },
                ink: { value: 1 },
                depth: { value: 0 },
                focus: { value: 0 },
                dof: { value: 0 },
                hatchAmt: { value: 0.1 },
                fade: { value: 0 },
                sharpen: { value: 0.3 },
                drawn: { value: 1 },
                lineCol,
                paperCol,
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            premultipliedAlpha: true,
        }),
    )
    const scene = new THREE.Scene().add(mesh)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const tile = { media, renderer, mesh, visible: false, busy: 0, dirty: true, render: () => renderer.render(scene, camera) }

    // object-fit: cover, done in the plane's UVs.
    const uv = geometry.attributes.uv
    function layout() {
        const { width, height } = media.getBoundingClientRect()
        renderer.setSize(width, height, false)
        const box = width / height, pic = img.width / img.height
        const [sx, sy] = box > pic ? [1, pic / box] : [box / pic, 1]
        for (let i = 0; i < uv.count; i++) {
            uv.setXY(i, 0.5 + (i % 2 ? 0.5 : -0.5) * sx, 0.5 + (i < 2 ? 0.5 : -0.5) * sy)
        }
        uv.needsUpdate = true
        tile.dirty = true
    }
    new ResizeObserver(layout).observe(media)
    new IntersectionObserver(([e]) => (tile.visible = e.isIntersecting)).observe(media)
    tiles.push(tile)
    media.classList.add('is-drawn')
    return tile
}

function paint(tile, to) {
    if (reduce) return
    tile.mesh.material.uniforms.origin.value.set(0.15, 0.85)
    tile.busy++
    animate(tile.mesh, { reveal: to }, { duration: 1.4, ease: [0.45, 0, 0.2, 1] }).then(() => {
        tile.busy--
        tile.dirty = true
    })
}

function applyTheme() {
    // The shader writes raw sRGB, so skip three's sRGB -> linear conversion.
    lineCol.value.setStyle(token('--sketch'), THREE.LinearSRGBColorSpace)
    paperCol.value.setStyle(token('--bg'), THREE.LinearSRGBColorSpace)
    tiles.forEach((t) => (t.dirty = true))
}

applyTheme()
new MutationObserver(applyTheme).observe(document.documentElement, { attributeFilter: ['data-theme'] })

for (const media of document.querySelectorAll('.project-media')) {
    mount(media).then((tile) => {
        new IntersectionObserver(([e], io) => {
            if (!e.isIntersecting) return
            paint(tile, 1)
            io.disconnect()
        }, { threshold: 0.5 }).observe(media)
    })
}

frame.render(() => {
    for (const t of tiles) {
        if (t.visible && (t.busy || t.dirty)) {
            t.render()
            t.dirty = false
        }
    }
}, true)
