#!/bin/bash
# Script para reemplazar fetch por authFetch en todas las páginas del panel taller

FILES=(
  "/home/z/my-project/autosync-platform/src/app/app/taller/carga-rapida/page.tsx"
  "/home/z/my-project/autosync-platform/src/app/app/taller/diagnosticos/page.tsx"
  "/home/z/my-project/autosync-platform/src/app/app/taller/estadisticas/page.tsx"
  "/home/z/my-project/autosync-platform/src/app/app/taller/perfil/page.tsx"
  "/home/z/my-project/autosync-platform/src/app/app/taller/presupuestos/page.tsx"
  "/home/z/my-project/autosync-platform/src/app/app/taller/presupuestos/nuevo/page.tsx"
  "/home/z/my-project/autosync-platform/src/app/app/taller/servicios/page.tsx"
  "/home/z/my-project/autosync-platform/src/app/app/taller/stock/page.tsx"
  "/home/z/my-project/autosync-platform/src/app/app/taller/turnos/page.tsx"
)

for FILE in "${FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "❌ NO EXISTE: $FILE"
    continue
  fi
  
  echo "=== Procesando: $(basename $(dirname $FILE))/$(basename $FILE) ==="
  
  # 1. Agregar import si no está
  if ! grep -q "from '@/lib/auth-client'" "$FILE"; then
    # Buscar el último import de lucide-react o next/navigation
    sed -i "s|import { .* } from 'lucide-react'|import { & } from 'lucide-react'\nimport { authFetch } from '@/lib/auth-client'|" "$FILE" 2>/dev/null
    
    # Si no tenía lucide-react, agregar después del último import
    if ! grep -q "from '@/lib/auth-client'" "$FILE"; then
      awk -v RS= 'BEGIN{imports=""} /^import/{imports=imports $0 "\n"; next} {print imports; print; imports=""}' "$FILE" > /tmp/temp.tsx
      # Más simple: agregar al inicio del archivo
      sed -i '1i import { authFetch } from "@/lib/auth-client"' "$FILE"
    fi
  fi
  
  # 2. Reemplazar todas las llamadas fetch('/api... y fetch(`/api...
  sed -i "s|fetch('/api|authFetch('/api|g" "$FILE"
  sed -i "s|fetch(\`/api|authFetch(\`/api|g" "$FILE"
  
  # Verificar
  COUNT=$(grep -c "authFetch" "$FILE")
  echo "  → authFetch agregado ($COUNT usos)"
done

echo ""
echo "=== Verificar que se agregó el import en cada archivo ==="
for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    if grep -q "from '@/lib/auth-client'" "$FILE" || grep -q 'from "@/lib/auth-client"' "$FILE"; then
      echo "✅ $(basename $(dirname $FILE))/$(basename $FILE)"
    else
      echo "⚠️  FALTA import en: $FILE"
    fi
  fi
done
