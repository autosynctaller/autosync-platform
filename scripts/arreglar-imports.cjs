#!/usr/bin/env node
// Arreglar imports rotos de lucide-react en todas las páginas del panel taller
const fs = require('fs');
const path = require('path');

const files = [
  'carga-rapida/page.tsx',
  'diagnosticos/page.tsx',
  'estadisticas/page.tsx',
  'perfil/page.tsx',
  'presupuestos/page.tsx',
  'presupuestos/nuevo/page.tsx',
  'servicios/page.tsx',
  'turnos/page.tsx',
];

const basePath = '/home/z/my-project/autosync-platform/src/app/app/taller';

for (const rel of files) {
  const filePath = path.join(basePath, rel);
  if (!fs.existsSync(filePath)) {
    console.log('❌ NO EXISTE:', filePath);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Arreglar el patrón roto: "import { import { Loader2... } from 'lucide-react' } from 'lucide-react'"
  const brokenRegex = /import \{ import \{ ([^}]+) \} from 'lucide-react' \} from 'lucide-react'/;
  const match = content.match(brokenRegex);
  if (match) {
    const icons = match[1];
    content = content.replace(brokenRegex, `import { ${icons} } from 'lucide-react'`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Arreglado:', rel);
  } else {
    console.log('⚠️  No match en:', rel, '(quizás ya estaba OK o patrón distinto)');
  }
}
