/**
 * Copies ko/ markdown files into site/docs/, transforming:
 * - Mintlify frontmatter → VitePress frontmatter
 * - Mintlify components → VitePress-native markdown:
 *   <Tip>      → ::: tip
 *   <Info>     → ::: info
 *   <Warning>  → ::: warning
 *   <Note>     → ::: info NOTE
 *   <Accordion>→ <details><summary>
 *   <Steps>/<Step> → ordered list with bold titles
 *   <Tabs>/<Tab>   → ### tab titles
 *   <Card>/<CardGroup>/<Columns> → blockquote cards
 * - Escapes unknown <placeholder> tags
 * - Injects BookBanner into index.md
 */

import { readdir, readFile, writeFile, mkdir, cp } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { existsSync } from 'node:fs'

const KO_DIR = join(import.meta.dirname, '..', '..', 'ko')
const DOCS_DIR = join(import.meta.dirname, '..', 'docs')

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['assets', 'images', 'snippets'].includes(entry.name)) continue
      files.push(...await getAllFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function transformFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/)
  if (!fmMatch) return content

  const fmBlock = fmMatch[1]
  const rest = content.slice(fmMatch[0].length)

  const titleMatch = fmBlock.match(/^title:\s*["']?(.+?)["']?\s*$/m)
  const summaryMatch = fmBlock.match(/^summary:\s*["']?([\s\S]*?)["']?\s*$/m)

  const newFm = []
  if (titleMatch) newFm.push(`title: "${titleMatch[1].replace(/"/g, '\\"')}"`)
  if (summaryMatch) {
    const desc = summaryMatch[1].replace(/"/g, '\\"').replace(/\n/g, ' ').trim()
    newFm.push(`description: "${desc}"`)
  }

  if (newFm.length === 0) return rest
  return `---\n${newFm.join('\n')}\n---\n${rest}`
}

function transformLinks(content) {
  content = content.replace(/\]\(\/ko\//g, '](/')
  return content
}

function convertMintlifyComponents(content) {
  // 1. Simple callouts: <Tip>, <Info>, <Warning>, <Note>
  content = content.replace(/<Tip>\s*\n?([\s\S]*?)\n?\s*<\/Tip>/g, (_, body) => {
    return `::: tip\n${body.trim()}\n:::\n`
  })
  content = content.replace(/<Info>\s*\n?([\s\S]*?)\n?\s*<\/Info>/g, (_, body) => {
    return `::: info\n${body.trim()}\n:::\n`
  })
  content = content.replace(/<Warning>\s*\n?([\s\S]*?)\n?\s*<\/Warning>/g, (_, body) => {
    return `::: warning\n${body.trim()}\n:::\n`
  })
  content = content.replace(/<Note>\s*\n?([\s\S]*?)\n?\s*<\/Note>/g, (_, body) => {
    return `::: info NOTE\n${body.trim()}\n:::\n`
  })

  // 2. Accordion → ::: details
  content = content.replace(/<Accordion\s+title="([^"]*)"[^>]*>\s*\n?([\s\S]*?)\n?\s*<\/Accordion>/g,
    (_, title, body) => `::: details ${title}\n${body.trim()}\n:::\n`
  )

  // 3. Steps/Step → numbered list
  content = content.replace(/<Steps>\s*\n?([\s\S]*?)\n?\s*<\/Steps>/g, (_, body) => {
    let stepNum = 0
    const converted = body.replace(/<Step\s+title="([^"]*)"[^>]*>\s*\n?([\s\S]*?)\n?\s*<\/Step>/g,
      (_, title, stepBody) => {
        stepNum++
        const indented = stepBody.trim().split('\n').map(l => `   ${l}`).join('\n')
        return `${stepNum}. **${title}**\n\n${indented}\n`
      }
    )
    return converted
  })

  // 4. Tabs/Tab → section headers
  content = content.replace(/<Tabs>\s*\n?([\s\S]*?)\n?\s*<\/Tabs>/g, (_, body) => {
    const converted = body.replace(/<Tab\s+title="([^"]*)"[^>]*>\s*\n?([\s\S]*?)\n?\s*<\/Tab>/g,
      (_, title, tabBody) => `**${title}**\n\n${tabBody.trim()}\n\n`
    )
    return converted
  })

  // 5. Card/CardGroup/Columns → blockquote style
  content = content.replace(/<Card\s+title="([^"]*)"(?:\s+href="([^"]*)")?[^>]*>\s*\n?([\s\S]*?)\n?\s*<\/Card>/g,
    (_, title, href, body) => {
      const link = href ? ` [→](${href})` : ''
      return `> **${title}**${link}\n> ${body.trim().split('\n').join('\n> ')}\n\n`
    }
  )

  // Remove wrapper-only components
  for (const tag of ['CardGroup', 'Columns', 'AccordionGroup', 'Frame', 'CodeGroup']) {
    content = content.replace(new RegExp(`<${tag}[^>]*>\\s*\\n?`, 'g'), '')
    content = content.replace(new RegExp(`</${tag}>\\s*\\n?`, 'g'), '')
  }

  return content
}

const HTML_TAGS = new Set([
  'a','abbr','address','area','article','aside','audio','b','base','bdi','bdo',
  'blockquote','body','br','button','canvas','caption','cite','code','col',
  'colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl',
  'dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2',
  'h3','h4','h5','h6','head','header','hgroup','hr','html','i','iframe','img',
  'input','ins','kbd','label','legend','li','link','main','map','mark','menu',
  'meta','meter','nav','noscript','object','ol','optgroup','option','output',
  'p','param','picture','pre','progress','q','rp','rt','ruby','s','samp',
  'script','section','select','slot','small','source','span','strong','style',
  'sub','summary','sup','table','tbody','td','template','textarea','tfoot','th',
  'thead','time','title','tr','track','u','ul','var','video','wbr',
])

const KEEP_COMPONENTS = new Set(['BookBanner'])

function escapeUnknownTags(content) {
  return content.replace(/<\/?([a-zA-Z][a-zA-Z0-9_-]*)([^>]*?)>/g, (match, tag) => {
    if (KEEP_COMPONENTS.has(tag)) return match
    if (HTML_TAGS.has(tag.toLowerCase())) return match
    return match.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  })
}

function convertJsxStyles(content) {
  // Convert JSX style={{ prop: value, ... }} to HTML style="prop: value; ..."
  return content.replace(/style=\{\{([\s\S]*?)\}\}/g, (_, inner) => {
    const pairs = inner
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => {
        const [key, ...rest] = p.split(':')
        if (!key || rest.length === 0) return ''
        const cssKey = key.trim().replace(/([A-Z])/g, '-$1').toLowerCase()
        let val = rest.join(':').trim().replace(/^["']|["']$/g, '')
        // Handle numeric values (add px for certain properties)
        if (/^\d+$/.test(val) && !['opacity', 'zIndex', 'flex', 'fontWeight'].includes(key.trim())) {
          val += 'px'
        }
        return `${cssKey}: ${val}`
      })
      .filter(Boolean)
      .join('; ')
    return `style="${pairs}"`
  })
}

function transformContent(content, relPath) {
  content = transformFrontmatter(content)
  content = transformLinks(content)
  content = convertMintlifyComponents(content)
  content = convertJsxStyles(content)
  content = escapeUnknownTags(content)

  // Inject BookBanner into index.md
  if (relPath === 'index.md') {
    content = content.replace(
      /(^# .+\n)/m,
      '$1\n<BookBanner />\n\n'
    )
  }

  return content
}

async function copyAssets() {
  const assetsDirs = ['assets', 'images']
  for (const dir of assetsDirs) {
    const src = join(KO_DIR, dir)
    const dest = join(DOCS_DIR, 'public', dir)
    if (existsSync(src)) {
      await mkdir(dest, { recursive: true })
      await cp(src, dest, { recursive: true })
      console.log(`  Copied ${dir}/`)
    }
  }

  // Copy static assets (committed in repo) and fallback to repo/docs/
  for (const subdir of ['assets', 'images']) {
    const dest = join(DOCS_DIR, 'public', subdir)
    await mkdir(dest, { recursive: true })

    // Primary: static/ directory (committed to git)
    const staticSrc = join(import.meta.dirname, '..', '..', 'static', subdir)
    if (existsSync(staticSrc)) {
      await cp(staticSrc, dest, { recursive: true })
      console.log(`  Copied static/${subdir}/`)
    }

    // Fallback: repo/docs/ (local dev only)
    const repoSrc = join(import.meta.dirname, '..', '..', 'repo', 'docs', subdir)
    if (existsSync(repoSrc)) {
      await cp(repoSrc, dest, { recursive: true })
      console.log(`  Copied repo/docs/${subdir}/`)
    }
  }
}

async function main() {
  console.log('Preparing docs from ko/ → site/docs/')
  await copyAssets()

  const files = await getAllFiles(KO_DIR)
  console.log(`  Found ${files.length} markdown files`)

  let processed = 0
  for (const file of files) {
    const relPath = relative(KO_DIR, file)
    const destPath = join(DOCS_DIR, relPath)
    await mkdir(dirname(destPath), { recursive: true })

    let content = await readFile(file, 'utf-8')
    content = transformContent(content, relPath)
    await writeFile(destPath, content, 'utf-8')
    processed++
  }

  console.log(`  Processed ${processed} files`)
  console.log('Done!')
}

main().catch(console.error)
