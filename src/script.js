const toggle = document.querySelector('.theme')
toggle?.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark'
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  toggle.textContent = dark ? 'Light' : 'Dark'
  toggle.setAttribute('aria-label', dark ? 'Use light background' : 'Use dark background')
})

const year = document.getElementById('year')
if (year) year.textContent = new Date().getFullYear()
