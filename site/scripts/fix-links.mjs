/**
 * Link codemod for ko/ markdown.
 *
 * Rewrites:
 *   - bare hub paths that resolve to <dir>/index.md  →  trailing-slash form
 *     e.g. /channels  →  /channels/
 *   - subdirectory hub paths whose target is itself an index dir
 *     e.g. /gateway/security  →  /gateway/security/
 *
 * Leaves untouched (still broken — needs new pages or human action):
 *   - /tools/acp-agents
 *   - /plugins/architecture
 *
 * Builds the route manifest from ko/** so this is data-driven, not hard-coded.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const KO = join(import.meta.dirname, '..', '..', 'ko')

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (['assets', 'images', 'snippets'].includes(e.name)) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...await walk(p))
    else if (e.name.endsWith('.md')) out.push(p)
  }
  return out
}

function buildManifest(files) {
  // Map: route (no trailing slash) -> 'leaf' | 'index'
  const m = new Map()
  for (const f of files) {
    const rel = relative(KO, f).replace(/\\/g, '/')
    if (rel.endsWith('/index.md')) {
      m.set('/' + rel.slice(0, -'/index.md'.length), 'index')
    } else if (rel === 'index.md') {
      m.set('/', 'index')
    } else {
      m.set('/' + rel.slice(0, -3), 'leaf')
    }
  }
  return m
}

// Matches both `](/path)` markdown links and `href="/path"` JSX-style attributes
// (used inside Mintlify <Card>, <Step>, etc., before they get converted).
const LINK_RE = /(\]\()(\/[^)\s#]+)((?:#[^)]*)?\))|(href=")(\/[^"\s#]+)((?:#[^"]*)?")/g

async function main() {
  const files = await walk(KO)
  const manifest = buildManifest(files)

  let touchedFiles = 0
  let totalRewrites = 0
  const samples = []

  for (const f of files) {
    let src = await readFile(f, 'utf8')
    let changed = false
    src = src.replace(LINK_RE, (whole, mdOpen, mdTarget, mdRest, hrefOpen, hrefTarget, hrefRest) => {
      const open = mdOpen || hrefOpen
      const target = mdTarget || hrefTarget
      const rest = mdRest || hrefRest
      // strip /ko prefix if present
      let t = target.startsWith('/ko/') ? target.slice(3) : target
      // ignore asset paths
      if (/^\/(images|assets|static|snippets)\b/.test(t)) return whole
      if (/\.(png|jpe?g|svg|gif|webp|json|zip|tar|gz|mp4|pdf)$/i.test(t)) return whole
      // already has trailing slash → only normalize /ko prefix if needed
      if (t.endsWith('/')) {
        if (t === target) return whole
        changed = true
        totalRewrites++
        return `${open}${t}${rest}`
      }
      // Check manifest. If target maps to index, add trailing slash.
      const kind = manifest.get(t)
      if (kind === 'index') {
        changed = true
        totalRewrites++
        if (samples.length < 8) samples.push(`${relative(KO, f)}: ${target} → ${t}/`)
        return `${open}${t}/${rest}`
      }
      // leaf or unknown → leave as-is (only normalize /ko prefix)
      if (t !== target) {
        changed = true
        totalRewrites++
        return `${open}${t}${rest}`
      }
      return whole
    })
    if (changed) {
      await writeFile(f, src, 'utf8')
      touchedFiles++
    }
  }

  console.log(`Files touched: ${touchedFiles}`)
  console.log(`Total link rewrites: ${totalRewrites}`)
  console.log('Samples:')
  for (const s of samples) console.log('  ' + s)
}

main().catch((e) => { console.error(e); process.exit(1) })
