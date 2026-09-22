import fs from 'node:fs'
import crypto from 'node:crypto'
const sourcePath = '1790113740726_rxvb9f.html'
const original = fs.readFileSync(sourcePath, 'utf8')
const adapted = original
  .replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', '/archive/three.min.js')
  .replace('</head>', '<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n</head>')
  .replace('</body>', '<script src="/editor-bridge.js"></script>\n</body>')
fs.writeFileSync('public/editor.html', adapted)
fs.writeFileSync('public/archive/source-integrity.json', JSON.stringify({ file: 'world-wedding-original.html', sha256: crypto.createHash('sha256').update(original).digest('hex'), originalBytes: Buffer.byteLength(original), originalEditions: 12, originalYear: 2025, activeYear: 2026, activeCoffrets: 365, momentsPerCoffret: 24, adapter: 'editor-bridge.js' }, null, 2))
console.log('Original editor preserved. Additive bridge installed.')
