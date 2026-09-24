import { animate, inView, stagger } from 'motion'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const ease = [0.16, 1, 0.3, 1]

// Articles (from articles.js), newest first. The first 6 show; the rest sit behind a button.
const VISIBLE = 6
const list = document.getElementById('posts')
const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date))
sorted.forEach((article, i) => {
    const li = document.createElement('li')
    li.className = 'post'
    li.hidden = i >= VISIBLE
    const a = Object.assign(document.createElement('a'), { href: article.link, target: '_blank', rel: 'noopener noreferrer' })
    const figure = document.createElement('figure')
    const img = Object.assign(document.createElement('img'), { src: article.image, alt: '', loading: 'lazy' })
    // Some thumbnails no longer exist upstream: fall back to a typographic tile.
    img.addEventListener('error', () => img.replaceWith(Object.assign(document.createElement('span'), { className: 'post-fallback', textContent: article.category })))
    figure.append(img)
    const body = document.createElement('div')
    const meta = Object.assign(document.createElement('p'), { className: 'post-meta', textContent: `${article.category} - ${article.date}` })
    body.append(meta, Object.assign(document.createElement('h3'), { textContent: article.title }))
    const arrow = Object.assign(document.createElement('i'), { className: 'ph ph-arrow-up-right' })
    arrow.setAttribute('aria-hidden', 'true')
    a.append(figure, body, arrow)
    li.append(a)
    list.append(li)
})
const more = document.getElementById('more-posts')
if (sorted.length > VISIBLE) {
    more.hidden = false
    more.textContent = `Show all ${sorted.length} articles`
    more.addEventListener('click', () => {
        const hidden = [...list.querySelectorAll('.post[hidden]')]
        hidden.forEach((li) => (li.hidden = false))
        more.remove()
        if (!reduce) animate(hidden, { opacity: [0, 1], y: [16, 0] }, { delay: stagger(0.04), duration: 0.6, ease })
    })
}

// Email is assembled at runtime so it never appears in the HTML that scrapers read.
const mail = ['anthony.rimet03', 'gmail.com'].join('@')
document.querySelectorAll('[data-mail]').forEach((a) => {
    a.href = `mailto:${mail}`
    if (a.hasAttribute('data-mail-text')) a.textContent = mail
})

// Theme toggle: flips <html data-theme> (hero.js watches it) and remembers the choice.
const toggle = document.getElementById('theme-toggle')
const syncToggle = () => toggle.setAttribute('aria-label', `Switch to ${document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'} theme`)
syncToggle()
toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
        localStorage.setItem('theme', next)
    } catch {}
    syncToggle()
    if (!reduce) animate(toggle.querySelectorAll('i'), { rotate: [-90, 0], scale: [0.6, 1] }, { duration: 0.5, ease })
})

// Skills: highlight one at a time.
const skills = [...document.querySelectorAll('.hero-skills li')]
let current = skills.findIndex((li) => li.classList.contains('is-active'))
if (!reduce) {
    setInterval(() => {
        skills[current].classList.remove('is-active')
        current = (current + 1) % skills.length
        skills[current].classList.add('is-active')
    }, 2400)
}

// A background tab never runs the intro (no animation frames): just show the text.
if (reduce || document.hidden) {
    clearTimeout(window.introFallback)
    document.documentElement.classList.remove('js')
} else {
    clearTimeout(window.introFallback)
    // Wait for Anton/Outfit so the name does not jump from the fallback font mid-animation.
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))])

    // Hero: the name rises out of its line box, then the copy follows.
    animate('.name .word > span', { y: ['105%', '0%'] }, { delay: stagger(0.08, { startDelay: 0.1 }), duration: 1.1, ease })
    animate('.nav, .hero-intro, .hero-skills, .hero-clients', { opacity: [0, 1], y: [14, 0] }, { delay: stagger(0.1, { startDelay: 0.5 }), duration: 0.9, ease })

    // Sections: fade up once when they enter the viewport.
    inView('.reveal', (el) => {
        animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.8, ease })
    }, { amount: 0.2 })
}
