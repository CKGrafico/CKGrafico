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
function formatStat(el, value) {
  if (el.dataset.format === 'k') return (value / 1000).toFixed(1) + 'K'
  return Math.round(value).toString()
}

function getTarget(el) {
  if (el.dataset.since) return new Date().getFullYear() - parseInt(el.dataset.since, 10)
  return parseInt(el.dataset.count, 10)
}

function animateCount(el) {
  const target = getTarget(el)
  const duration = 1400
  const start = performance.now()

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    el.textContent = formatStat(el, target * eased)
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
  document.querySelectorAll('.stat-num').forEach((el) => (el.textContent = formatStat(el, getTarget(el))))
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

// ---------- Talk list expander ----------
const talkMore = document.getElementById('talk-more')
const talkToggle = document.getElementById('talk-toggle')
if (talkMore && talkToggle) {
  const hiddenCount = talkMore.querySelectorAll('.row').length
  const visibleCount = document.querySelectorAll('#speaking .rows > .row').length
  const total = visibleCount + hiddenCount
  talkMore.classList.add('collapsed') // collapse only when JS is available
  talkToggle.textContent = `Show all ${total} talks ↓`
  talkToggle.hidden = false
  talkToggle.addEventListener('click', () => {
    const open = talkMore.classList.toggle('collapsed') === false
    talkToggle.setAttribute('aria-expanded', String(open))
    talkToggle.textContent = open ? 'Show fewer talks ↑' : `Show all ${total} talks ↓`
  })
}

// ---------- Footer year ----------
const year = document.getElementById('year')
if (year) year.textContent = new Date().getFullYear()
