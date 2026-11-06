import test from 'node:test'
import assert from 'node:assert/strict'
import { selectWriting, validateWriting } from './writing.mjs'

const article = (id, impressions, extra = {}) => ({ title: `Article ${id}`, url: `https://www.linkedin.com/pulse/${id}/`, publishedAt: '2026-01-01', lang: 'en', readingMinutes: 3, impressions, articleViews: 9999 - impressions, analyticsUrl: 'private', ...extra })
const snapshot = (articles) => ({ complete: true, checkedOn: '2026-11-06', articles })

test('ranks by impressions, not views or recency; exports no private fields', () => {
  const result = selectWriting(snapshot([article('a', 100), article('b', 400), article('c', 200), article('d', 300)]))
  assert.deepEqual(result.articles.map((a) => a.title), ['Article b', 'Article d', 'Article c'])
  assert.deepEqual(Object.keys(result.articles[0]), ['title', 'url', 'publishedAt', 'lang', 'readingMinutes'])
  assert(!JSON.stringify(result).includes('analytics'))
})

test('breaks impression ties by newest publication, then stable URL', () => {
  const result = selectWriting(snapshot([article('b', 100), article('c', 100, { publishedAt: '2026-02-01' }), article('a', 100)]))
  assert.deepEqual(result.articles.map((a) => a.title), ['Article c', 'Article a', 'Article b'])
})

test('does not treat missing, negative or string metrics as impressions', () => {
  assert.throws(() => selectWriting(snapshot([article('a', null), article('b', -1), article('c', '500')])) , /No verified impressions/)
  assert.equal(selectWriting(snapshot([article('a', 0)])).articles.length, 1)
})

test('rejects partial collections and loss of a featured metric', () => {
  assert.throws(() => selectWriting({ ...snapshot([article('a', 100)]), complete: false }), /Incomplete/)
  const previous = selectWriting(snapshot([article('a', 100)]))
  assert.throws(() => selectWriting(snapshot([article('b', 300)]), previous), /no fresh metric/)
})

test('rejects unsafe destinations, duplicate articles and invalid dates', () => {
  for (const url of ['javascript:alert(1)', 'https://evil.example/pulse/a/', 'https://www.linkedin.com/feed/', 'https://user:password@www.linkedin.com/pulse/a/']) {
    assert.throws(() => validateWriting(snapshot([article('a', 100, { url })])))
  }
  assert.throws(() => validateWriting(snapshot([article('a', 100), article('a', 200)])), /Duplicate/)
  assert.throws(() => validateWriting(snapshot([article('a', 100, { publishedAt: '2026-02-30' })])), /real dates/)
})
