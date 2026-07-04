// ============================================================
// ckgrafico.com v4 - reveals, counters, install-command copy
// ============================================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
