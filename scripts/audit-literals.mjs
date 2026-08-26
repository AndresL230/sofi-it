/**
 * Audit rule (claude-code-prompt §Boundaries): no literal money, date, or percentage values in
 * /src/cards JSX. The only literals allowed are geometry (viewBox, sizes, stroke widths, durations,
 * CSS lengths, indices). This scans JSX *text* and string props for $-amounts, percentages, month
 * names + day numbers, and bare multi-digit numbers in text nodes.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// One folder per card: src/cards/<id>/{index.tsx, meta.ts, graphic.tsx?}. Shared kit/_ranking are skipped.
const dir = new URL('../src/cards', import.meta.url).pathname
const files = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(join(dir, d.name)).filter((f) => f.endsWith('.tsx')).map((f) => `${d.name}/${f}`))
const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'
const patterns = [
  { name: 'money literal', re: /[$€£]\s?\d/g },
  { name: 'percent literal', re: />[^<{]*\b\d+(\.\d+)?%[^<{]*</g },
  { name: 'date literal', re: new RegExp(`\\b(${MONTHS})\\s+\\d{1,2}\\b`, 'g') },
  // multi-digit numbers inside JSX text nodes (between > and <), excluding template braces
  { name: 'number in JSX text', re: />[^<{}]*\b\d{2,}\b[^<{}]*</g },
]
let failures = 0
for (const f of files) {
  const src = readFileSync(join(dir, f), 'utf8')
  // strip comments so docblocks quoting the spec don't count
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    // gallery sample descriptors name a matrix query ('$60 dinner') — an identifier, never rendered text
    .replace(/samples:\s*\[[\s\S]*?\]\s*(,|\})/g, 'samples: []$1')
    // aria-labels / toast strings built from props are fine; strip string literals that contain no digits' neighbours
    .replace(/label:\s*'[^']*'/g, "label: ''")
  for (const p of patterns) {
    for (const m of code.matchAll(p.re)) {
      const line = code.slice(0, m.index).split('\n').length
      // allow pure-geometry contexts
      const ctx = code.slice(Math.max(0, m.index - 40), m.index + m[0].length + 10)
      if (/viewBox|stroke|width|height|r=|cx=|cy=|x1=|y1=|x2=|y2=|d="|points=|gridTemplateColumns|animation|translate|rotate|px|em\b|duration/.test(ctx) && p.name !== 'money literal') continue
      // `>` inside a TS expression (comparison / arrow), not a JSX tag boundary
      if (p.name === 'number in JSX text' && /[?:=(]|Math\.|=>|&&|\|\|/.test(m[0])) continue
      failures++
      console.log(`${f}:${line}: ${p.name}: ${m[0].trim().slice(0, 70)}`)
    }
  }
}
console.log(failures ? `\n✗ ${failures} literal(s) found in ${files.length} card files` : `✓ no stray money/date/percent literals in ${files.length} card files`)
process.exit(failures ? 1 : 0)
