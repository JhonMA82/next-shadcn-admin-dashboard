# Instalación de la fase 1

Esta entrega prepara el boilerplate para desarrollo asistido por IA. No instala todavía
OpenCode, OpenSpec, Superpowers ni Comet.

## 1. Copiar el overlay

Copia el contenido de esta carpeta en la raíz de
`next-shadcn-admin-dashboard`.

La raíz debe terminar con:

```text
AGENTS.md
PROJECT.template.md
apply-phase1.mjs
docs/
templates/
scripts/
src/
package.json
```

El directorio `src/` sigue siendo el del boilerplate original.

## 2. Aplicar scripts y configuración

```bash
node apply-phase1.mjs
```

Este comando:

- Conserva los scripts existentes.
- Agrega generadores y validadores a `package.json`.
- Amplía `tsconfig.scripts.json`.
- Crea `PROJECT.md` cuando no existe.
- Genera `docs/ai/generated-context.md`.

## 3. Completar el contrato

Edita `PROJECT.md` antes de implementar funcionalidades de producto.

No deben quedar marcadores `[Complete]`.

## 4. Verificar la instalación

```bash
npm run phase1:self-test
npm run ai:context
npm run validate
```

## 5. Crear un proyecto derivado

Con todos los ejemplos:

```bash
npm run generate:project -- inventory-admin
```

Base mínima con un solo dashboard canónico:

```bash
npm run generate:project -- inventory-admin --profile minimal
```

Por defecto se crea como directorio hermano del boilerplate. Puedes indicar otra ruta:

```bash
npm run generate:project -- inventory-admin \
  --destination ../projects/inventory-admin \
  --profile minimal
```

Después:

```bash
cd ../inventory-admin
npm install
```

Completa su `PROJECT.md` y ejecuta:

```bash
npm run validate
```

## 6. Generadores disponibles

Feature general:

```bash
npm run generate:feature -- reports
npm run generate:feature -- reports --nav
```

Dashboard:

```bash
npm run generate:dashboard -- operations
```

CRUD:

```bash
npm run generate:crud -- customers
npm run generate:crud -- inventory-items --singular inventory-item
```

Los generadores no sobrescriben archivos salvo que se use `--force`.

## 7. Contexto y validaciones

Después de cambios estructurales:

```bash
npm run ai:context
```

Para comprobar que el contexto no está desactualizado:

```bash
npm run ai:context:check
```

Validaciones individuales:

```bash
npm run validate:architecture
npm run validate:navigation
```

Validación completa:

```bash
npm run validate
```

## 8. Entrada de Comet

Comet se incorpora después de que:

- `PROJECT.md` esté completo.
- Los generadores funcionen.
- `npm run phase1:self-test` pase.
- `npm run validate` pase.
- Los ejemplos canónicos hayan sido revisados.

Comet utilizará esta infraestructura; no la reemplazará.
