import { validateWriting } from './writing.mjs'
import { visuals } from './project-visuals.mjs'

const text = (value) => String(value).replaceAll('&amp;', '&').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const link = (url, title) => `<a href="${text(url)}">${text(title)}</a>`
const project = (p) => `<li>${p.group === 'platform' ? visuals[p.title] || '' : ''}<div class="project-name">${link(p.url, p.title)}</div><p>${p.desc}</p></li>`
const talk = (t) => `<li><div>${t.url ? link(t.url, t.desc) : text(t.desc)}</div><p class="meta">${text(t.title)} · ${t.year} · ${text(t.location)}${t.kind ? ` · ${text(t.kind)}` : ''}</p></li>`
const date = (value) => new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))

export function renderPage(template, { projects, writing, speaking, startups }) {
  const selected = validateWriting(writing)
  const replacements = {
    WRITING: selected.articles.map((a) => `<li><a lang="${a.lang}" href="${text(a.url)}">${text(a.title)}</a><p class="meta"><span><time datetime="${a.publishedAt}">${date(a.publishedAt)}</time></span><span>${a.lang === 'es' ? 'Spanish' : 'English'}</span><span>${a.readingMinutes} min read</span></p></li>`).join(''),
    PLATFORM_PROJECTS: projects.filter((p) => p.group === 'platform').map(project).join(''),
    OTHER_PROJECTS: projects.filter((p) => p.group !== 'platform').map(project).join(''),
    FEATURED_TALKS: speaking.talks.slice(0, 4).map(talk).join(''),
    MORE_TALKS: speaking.talks.slice(4).map(talk).join(''),
    TALK_COUNT: String(speaking.talks.length),
    COLLABORATIONS: startups.cards.map((c) => link(c.url, c.title)).join(', '),
    YEAR: String(new Date().getFullYear()),
  }
  let html = template
  for (const [key, value] of Object.entries(replacements)) {
    const marker = `<!--{{${key}}}-->`
    if (!html.includes(marker)) throw new Error(`Missing template marker: ${key}`)
    html = html.replaceAll(marker, value)
  }
  if (html.includes('<!--{{')) throw new Error('Unresolved template marker.')
  return html
}
