import { readFile, writeFile } from 'node:fs/promises'
import { build } from '../build.mjs'

await build()
const production = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const preview = production
  .replace('<head>', '<head>\n  <meta name="robots" content="noindex">')
  .replace('<title>Quique Fdez Guerra · Engineering, Operations &amp; AI</title>', '<title>Quique Fdez Guerra · Design proposal</title>')
  .replace('href="styles.css"', 'href="../dist/styles.css"')
  .replace('src="script.js"', 'src="../dist/script.js"')
  .replace('src="assets/quique.jpg"', 'src="../dist/assets/quique.jpg"')

await writeFile(new URL('proposal.html', import.meta.url), preview)
console.log('Built design/proposal.html using the production page.')
