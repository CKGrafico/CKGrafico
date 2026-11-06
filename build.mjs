#!/usr/bin/env node
import { readFile, writeFile, rm, mkdir, cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { renderPage } from './scripts/render-page.mjs'

const root = dirname(fileURLToPath(import.meta.url))
const src = join(root, 'src')
const dist = join(root, 'dist')

export async function build() {
  const names = ['projects', 'writing', 'speaking', 'startups']
  const [template, ...values] = await Promise.all([
    readFile(join(src, 'template.html'), 'utf8'),
    ...names.map(async (name) => JSON.parse(await readFile(join(root, 'data', `${name}.json`), 'utf8'))),
  ])
  const data = Object.fromEntries(names.map((name, i) => [name, values[i]]))
  const html = renderPage(template, data)
  await rm(dist, { recursive: true, force: true })
  await mkdir(dist, { recursive: true })
  await writeFile(join(dist, 'index.html'), html)
  await Promise.all([
    cp(join(src, 'styles.css'), join(dist, 'styles.css')),
    cp(join(src, 'script.js'), join(dist, 'script.js')),
    cp(join(src, 'assets'), join(dist, 'assets'), { recursive: true }),
    cp(join(root, 'CNAME'), join(dist, 'CNAME')),
    cp(join(root, '.nojekyll'), join(dist, '.nojekyll')),
  ])
  console.log(`Built dist/: ${data.projects.length} projects, ${data.writing.articles.length} articles, ${data.speaking.talks.length} talks.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch((error) => { console.error(error); process.exitCode = 1 })
}
