// ============================================================
// ckgrafico.com — confetti hero + scroll reveals + tag links
// ============================================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- Scroll reveal ----------
if (!reduceMotion && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          obs.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'))
}

// ---------- Secondary tag links (npm/GitHub inside a card that links elsewhere) ----------
document.querySelectorAll('.tag[data-href]').forEach((tag) => {
  tag.addEventListener('click', (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    window.open(tag.dataset.href, '_blank', 'noopener')
  })
})

// ---------- Confetti hero ----------
const canvas = document.getElementById('confetti')
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d')
  const colors = ['#3ecf8e', '#2bb673', '#ffd166', '#ef8354', '#ffffff', '#8ce0bd']
  let pieces = []
  let raf = null

  function size() {
    const hero = canvas.parentElement
    canvas.width = hero.offsetWidth
    canvas.height = hero.offsetHeight
  }

  function make() {
    const count = Math.min(70, Math.round(canvas.width / 18))
    pieces = Array.from({ length: count }, (_, i) => ({
      x: ((i * 97) % canvas.width),
      y: ((i * 53) % canvas.height) - canvas.height,
      w: 6 + (i % 5),
      h: 9 + (i % 4),
      color: colors[i % colors.length],
      rot: (i * 0.7) % (Math.PI * 2),
      vr: 0.02 + (i % 5) * 0.01,
      vy: 0.5 + (i % 6) * 0.18,
      sway: 0.5 + (i % 4) * 0.4,
      phase: i,
    }))
  }

  let t = 0
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    t += 0.01
    pieces.forEach((p) => {
      p.y += p.vy
      p.rot += p.vr
      const x = p.x + Math.sin(t + p.phase) * p.sway * 6
      if (p.y > canvas.height + 20) {
        p.y = -20
      }
      ctx.save()
      ctx.translate(x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.globalAlpha = 0.85
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    })
    raf = requestAnimationFrame(draw)
  }

  function start() {
    size()
    make()
    if (!raf) draw()
  }

  window.addEventListener('resize', () => {
    size()
    make()
  })
  start()
}
