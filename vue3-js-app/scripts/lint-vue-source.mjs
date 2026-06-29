import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const sourceRoots = [
  'src/components/RequirementCenter.vue',
  'src/components/requirement-center',
  'src/components/requirement-detail',
]

const checks = [
  { pattern: /debugger\b/, message: 'debugger statement' },
  { pattern: /console\.log\b/, message: 'console.log statement' },
  { pattern: /<select\b/i, message: 'native select in requirement center scope' },
  { pattern: /待按 React|继续迁移|未迁移|待迁移|该模块待|后续补|占位/, message: 'visible migration placeholder text' },
]

const walk = async (path) => {
  if (path.endsWith('.vue') || path.endsWith('.js')) return [path]
  const entries = await readdir(path, { withFileTypes: true })
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith('.'))
      .map((entry) => walk(join(path, entry.name))),
  )
  return nested.flat()
}

const files = (await Promise.all(sourceRoots.map((root) => walk(root)))).flat()
const failures = []

for (const file of files) {
  const source = await readFile(file, 'utf8')
  checks.forEach((check) => {
    source.split('\n').forEach((line, index) => {
      if (check.pattern.test(line)) {
        failures.push(`${file}:${index + 1} ${check.message}`)
      }
    })
  })
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`lint-vue-source: checked ${files.length} files`)
