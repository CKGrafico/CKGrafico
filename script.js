// ============================================================
// ckgrafico.com v3 - spotlight, reveals, counters, card glow,
// magnetic buttons, install-command copy
// ============================================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- Cursor spotlight ----------
if (!reduceMotion) {
  document.addEventListener('pointermove', (e) => {
    document.documentElement.style.setProperty('--mx', e.clientX + 'px')
    document.documentElement.style.setProperty('--my', e.clientY + 'px')
  })
}

// ---------- Scroll reveal ----------
if (!reduceMotion && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'))
}

// ---------- Animated counters ----------
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10)
  const duration = 1400
  const start = performance.now()

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    el.textContent = Math.round(target * eased)
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

if ('IntersectionObserver' in window && !reduceMotion) {
  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target)
          counterObs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.5 }
  )
  document.querySelectorAll('.stat-num').forEach((el) => counterObs.observe(el))
} else {
  document.querySelectorAll('.stat-num').forEach((el) => (el.textContent = el.dataset.count))
}

// ---------- OSS card glow follows cursor ----------
document.querySelectorAll('.oss').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--cx', e.clientX - rect.left + 'px')
    card.style.setProperty('--cy', e.clientY - rect.top + 'px')
  })
})

// ---------- Magnetic buttons ----------
if (!reduceMotion) {
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`
    })
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = ''
    })
  })
}

// ---------- Install-command copy (inside links: don't navigate) ----------
document.querySelectorAll('.oss-install').forEach((pill) => {
  pill.addEventListener('click', async (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    try {
      await navigator.clipboard.writeText(pill.dataset.copy)
      pill.classList.add('copied')
      setTimeout(() => pill.classList.remove('copied'), 1800)
    } catch {
      /* clipboard unavailable, ignore */
    }
  })
})

// ---------- Footer year ----------
const year = document.getElementById('year')
if (year) year.textContent = new Date().getFullYear()
