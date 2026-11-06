import { readFile, writeFile, rename } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value).toISOString().slice(0, 10) !== value) {
    throw new Error('Writing dates must be real dates in YYYY-MM-DD format.')
  }
  return value
}

export function validateWriting(data) {
  if (!Array.isArray(data.articles) || data.articles.length < 1 || data.articles.length > 3) {
    throw new Error('Writing needs between one and three articles.')
  }
  const seen = new Set()
  const articles = data.articles.map((article) => {
    const url = new URL(article.url)
    if (url.protocol !== 'https:' || url.hostname !== 'www.linkedin.com' || !url.pathname.startsWith('/pulse/') || url.username || url.password) {
      throw new Error('Writing links must point to HTTPS LinkedIn articles.')
    }
    url.search = ''
    url.hash = ''
    if (seen.has(url.href)) throw new Error('Duplicate writing link.')
    seen.add(url.href)
    if (typeof article.title !== 'string' || !article.title.trim() || article.title.length > 300) throw new Error('Missing or invalid article title.')
    if (!['es', 'en'].includes(article.lang)) throw new Error('Article language must be es or en.')
    if (!Number.isInteger(article.readingMinutes) || article.readingMinutes < 1 || article.readingMinutes > 120) throw new Error('Invalid reading time.')
    return {
      title: article.title.trim(),
      url: url.href,
      publishedAt: date(article.publishedAt),
      lang: article.lang,
      readingMinutes: article.readingMinutes,
    }
  })
  // Only public fields leave this boundary. Analytics never enter the site data.
  return { checkedOn: date(data.checkedOn), articles }
}

export function selectWriting(snapshot) {
  if (snapshot.complete !== true || !Array.isArray(snapshot.articles)) throw new Error('Incomplete LinkedIn collection; keep the previous selection.')
  const recent = [...snapshot.articles]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)
      || (Number.isSafeInteger(b.impressions) ? b.impressions : -1) - (Number.isSafeInteger(a.impressions) ? a.impressions : -1)
      || a.url.localeCompare(b.url))
    .slice(0, 3)
  return validateWriting({ checkedOn: snapshot.checkedOn, articles: recent })
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [source, destination] = process.argv.slice(2)
    if (!source || !destination) throw new Error('Usage: node scripts/writing.mjs PRIVATE_SNAPSHOT PUBLIC_WRITING_JSON')
    const snapshot = JSON.parse(await readFile(source, 'utf8'))
    let previous
    try { previous = validateWriting(JSON.parse(await readFile(destination, 'utf8'))) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    const selected = selectWriting(snapshot, previous)
    const temporary = `${destination}.tmp`
    await writeFile(temporary, JSON.stringify(selected, null, 2) + '\n')
    await rename(temporary, destination)
    console.log(`Selected ${selected.articles.length} articles using verified impressions. Public output contains no analytics.`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
