import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

const oldProjectPath = '/home/z/my-project/scripts'

async function main() {
  console.log('Migrando cronogramas del proyecto anterior...')
  const seedFiles = ['seed-cronogramas.ts', 'seed-cronogramas-extra.ts', 'seed-km-altos.ts', 'seed-modelos-faltantes.ts']
  let total = 0

  for (const file of seedFiles) {
    try {
      const content = readFileSync(join(oldProjectPath, file), 'utf-8')
      const match = content.match(/const cronogramas[^=]*=\s*(\[[\s\S]*?\])\s*\n/)
      if (match) {
        const cronogramas = eval(match[1])
        for (const c of cronogramas) {
          try {
            await prisma.cronogramaService.create({ data: { marca: c.marca, modelo: c.modelo, kilometraje: c.kilometraje, items: c.items, notas: c.notas || null } })
            total++
          } catch (e) { /* ya existe */ }
        }
        console.log(`✓ ${file}: ${cronogramas.length} procesados`)
      }
    } catch (e) { console.log(`⚠ ${file}: ${e}`) }
  }

  const count = await prisma.cronogramaService.count()
  console.log(`\nTotal migrados: ${total}`)
  console.log(`Total en base: ${count}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
