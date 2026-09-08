#!/usr/bin/env node
// ============================================================
// ckgrafico.com static build
// Reads data/*.json + src/template.html -> dist/
// Zero dependencies. Output is fully static HTML (SEO-friendly).
// ============================================================

import { readFile, writeFile, rm, mkdir, cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const SRC = join(root, 'src')
const DATA = join(root, 'data')
const DIST = join(root, 'dist')

const readJson = async (name) => JSON.parse(await readFile(join(DATA, name), 'utf8'))

// ---------- Section renderers ----------

const VISIBLE_TALKS = 6

// Resolve an emoji field to an <img> src.
// A plain emoji character -> Apple-styled CDN image.
// A path/URL (e.g. "assets/onboard-logo.png") is used verbatim.
function emojiSrc(value) {
  if (!value) return value
  if (value.includes('/')) return value
  return `https://emoji-cdn.mqrio.dev/${encodeURIComponent(value)}?style=apple`
}

// Scoped package names are long. Keep each segment unbreakable so the chip never
// splits mid-word ("agent-" / "harness"), and only wraps after the scope slash.
const LONG_INSTALL = 30

function installLabel(cmd) {
  const parts = cmd.split('/')
  const segments = parts
    .map((seg, i) => `<span class="nb">${seg}${i < parts.length - 1 ? '/' : ''}</span>`)
    .join('<wbr>')
  return `<span class="oss-cmd">${segments}</span>`
}

function renderProjects(items) {
  const delay = (i) => (i === 0 ? '' : ` d${i}`)
  return items
    .map((p, i) => {
      const long = p.install && p.install.length > LONG_INSTALL ? ' long' : ''
      const action = p.install
        ? `<span class="oss-install mono${long}" data-copy="${p.install}">${installLabel(p.install)}<i>⧉</i></span>`
        : `<span class="oss-link mono">${p.linkLabel}</span>`
      const tag = p.tag ? `\n            <span class="oss-tag mono">${p.tag}</span>` : ''
      return `          <a class="oss reveal${delay(i)}" href="${p.url}" target="_blank" rel="noopener">
            <img class="oss-emoji" src="${emojiSrc(p.logo)}" alt="" width="56" height="56" loading="lazy" />
            <h3>${p.title}</h3>${tag}
            <p>${p.desc}</p>
            ${action}
          </a>`
    })
    .join('\n')
}

function renderTags(tags) {
  return `          <div class="tag-row">
${tags.map((t) => `            <span class="tag">${t}</span>`).join('\n')}
          </div>`
}

function renderIntro(intro, tags) {
  return `          <p class="lede">${intro}</p>
${renderTags(tags)}`
}

function renderStrategyRows(rows) {
  return rows
    .map(
      (r) => `          <a class="row reveal" href="${r.url}" target="_blank" rel="noopener">
            <img class="row-emoji" src="${emojiSrc(r.emoji)}" alt="" width="44" height="44" loading="lazy" />
            <div class="row-main">
              <h3>${r.title}</h3>
              <p>${r.desc}</p>
            </div>
            <span class="row-meta mono">${r.meta}</span>
            <span class="row-arrow" aria-hidden="true">→</span>
          </a>`
    )
    .join('\n')
}

function talkRow(t, { reveal, indent }) {
  const cls = reveal ? 'row reveal' : 'row'
  const meta = t.kind ? `${t.location} · ${t.kind}` : t.location
  const pad = ' '.repeat(indent)
  const inner = `${pad}  <span class="row-year mono">${t.year}</span>
${pad}  <div class="row-main">
${pad}    <h3>${t.title}</h3>
${pad}    <p>${t.desc}</p>
${pad}  </div>
${pad}  <span class="row-meta mono">${meta}</span>`
  if (t.url) {
    return `${pad}<a class="${cls}" href="${t.url}" target="_blank" rel="noopener">
${inner}
${pad}  <span class="row-arrow" aria-hidden="true">→</span>
${pad}</a>`
  }
  return `${pad}<div class="${cls}">
${inner}
${pad}</div>`
}

function renderSpeakingRows(talks) {
  const visible = talks.slice(0, VISIBLE_TALKS)
  const hidden = talks.slice(VISIBLE_TALKS)
  const visibleHtml = visible.map((t) => talkRow(t, { reveal: true, indent: 10 })).join('\n')
  const hiddenHtml = hidden.map((t) => talkRow(t, { reveal: false, indent: 12 })).join('\n')
  return `${visibleHtml}
          <div class="talk-more" id="talk-more">
${hiddenHtml}
          </div>`
}

function renderStartupRows(cards) {
  return cards
    .map(
      (c) => `          <a class="row reveal" href="${c.url}" target="_blank" rel="noopener">
            <img class="row-emoji" src="${emojiSrc(c.emoji)}" alt="" width="44" height="44" loading="lazy" />
            <div class="row-main">
              <h3>${c.title}</h3>
              <p>${c.desc}</p>
            </div>
            <span class="row-meta mono">${c.meta}</span>
            <span class="row-arrow" aria-hidden="true">→</span>
          </a>`
    )
    .join('\n')
}

// ---------- Build ----------

async function build() {
  const [template, projects, strategy, speaking, startups] = await Promise.all([
    readFile(join(SRC, 'template.html'), 'utf8'),
    readJson('projects.json'),
    readJson('strategy.json'),
    readJson('speaking.json'),
    readJson('startups.json'),
  ])

  const replacements = {
    '<!--{{PROJECTS}}-->': '\n' + renderProjects(projects) + '\n        ',
    '<!--{{STRATEGY_INTRO}}-->': '\n' + renderIntro(strategy.intro, strategy.tags) + '\n        ',
    '<!--{{STRATEGY_ROWS}}-->': '\n' + renderStrategyRows(strategy.rows) + '\n        ',
    '<!--{{SPEAKING_INTRO}}-->': '\n' + renderIntro(speaking.intro, speaking.tags) + '\n        ',
    '<!--{{SPEAKING_ROWS}}-->': '\n' + renderSpeakingRows(speaking.talks) + '\n        ',
    '<!--{{STARTUPS_ROWS}}-->': '\n' + renderStartupRows(startups.cards) + '\n        ',
    '<!--{{STARTUPS_ASIDE}}-->': startups.aside,
  }

  let html = template
  for (const [marker, value] of Object.entries(replacements)) {
    if (marker.startsWith('<!--') && !html.includes(marker)) {
      throw new Error(`Marker ${marker} not found in template.html`)
    }
    html = html.split(marker).join(value)
  }

  // Fresh dist
  await rm(DIST, { recursive: true, force: true })
  await mkdir(DIST, { recursive: true })

  await writeFile(join(DIST, 'index.html'), html)
  await cp(join(SRC, 'styles.css'), join(DIST, 'styles.css'))
  await cp(join(SRC, 'script.js'), join(DIST, 'script.js'))
  await cp(join(SRC, 'assets'), join(DIST, 'assets'), { recursive: true })

  // Root files needed by GitHub Pages / custom domain
  for (const f of ['CNAME', '.nojekyll']) {
    await cp(join(root, f), join(DIST, f)).catch(() => {})
  }

  console.log(
    `Built dist/ — ${projects.length} projects, ${strategy.rows.length} strategy rows, ${speaking.talks.length} talks, ${startups.cards.length} startups.`
  )
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
