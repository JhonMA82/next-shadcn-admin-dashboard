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

El tooling del repositorio corre con **npm** como package manager y **ts-node**
como runtime de scripts (`ts-node -P tsconfig.scripts.json scripts/*.ts`).
Antes de generar, instala dependencias en el boilerplate fuente:

```bash
npm install
```

Con todos los ejemplos (`full`, por defecto):

```bash
npm run generate:project -- inventory-admin
```

Base mínima con un solo dashboard canónico:

```bash
npm run generate:project -- inventory-admin --profile minimal
```

`minimal` elimina las dashboards demo configuradas **y** las rutas standalone
`chat` y `mail`; conserva `/dashboard/default`, `auth` y `unauthorized`, y deja
un sidebar sin grupos vacíos. `full` conserva todas las demos.

El proyecto derivado conserva los generadores de feature, dashboard y CRUD,
`ai:context` y los validadores, pero **no** conserva `generate:project` ni el
tooling solo-fuente (`scripts/create-project.ts`, `templates/project/`,
`scripts/self-test.ts`, `phase1:self-test`): es un producto para evolucionar,
no otra fábrica de proyectos. Prefiere siempre los generadores antes de crear
estructuras estándar a mano.

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

(O en un solo paso con `npm run generate:project -- inventory-admin --profile minimal --install`.)

Completa su `PROJECT.md` y ejecuta:

```bash
npm run validate
```

Tras cambios estructurales con los generadores, regenera el contexto y valida:

```bash
npm run ai:context
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

### Qué esperar de cada generador

**Feature con navegación:**

```bash
npm run generate:feature -- reports --nav
```

Crea `src/app/(main)/dashboard/reports/` con `page.tsx`, `loading.tsx`,
`error.tsx` y `_components/reports-overview.tsx`; registra `Reports` en el
sidebar (grupo `Pages`, icono `SquareArrowUpRight`) y regenera
`docs/ai/generated-context.md`. Sin `--nav`, la ruta se crea pero queda fuera
de la navegación hasta ser aprobada.

**Dashboard (navegación activada por defecto):**

```bash
npm run generate:dashboard -- operations
```

Crea `src/app/(main)/dashboard/operations/` con `page.tsx`, `loading.tsx`,
`error.tsx` y `_components/operations-{header,kpis,activity}.tsx`; registra
`Operations` en el grupo `Dashboards` (icono `LayoutDashboard`). Las métricas
son placeholders: hay que reemplazarlas por el boundary de servidor aprobado.
Con `--no-nav` la ruta se genera sin registro en el sidebar.

**CRUD (navegación activada por defecto):**

```bash
npm run generate:crud -- customers
```

Crea `src/app/(main)/dashboard/customers/` con tabla, formulario, columnas,
esquema, `_data/customers.ts`, páginas `new/` y `[id]/edit/`, más `loading.tsx`
y `error.tsx`. El singular (`customer`) se infiere solo; si el plural es
irregular, fíjalo con `--singular person`. `_data/` es un placeholder
compilable: reemplazarlo por el boundary de servidor antes de entregar.

### Escenarios comunes

- **El comando solo imprime la ayuda y no crea nada.** Falta el espacio después
  de `--`: `npm run generate:feature --reports` no reenvía argumentos.
  La forma correcta es `npm run generate:feature -- reports --nav`.
- **La ruta ya existe.** El generador se niega a sobrescribir. Usa `--force`
  solo cuando descartar el scaffold anterior sea intencional.
- **Generar varias rutas seguidas.** Pasa `--no-context` en cada una y corre
  `npm run ai:context` una sola vez al final.
- **CRUD recortado.** CRUD no implica todas las operaciones: si crear está fuera
  de alcance, elimina `new/`; si editar lo está, elimina `[id]/edit/`.
- **Dashboard oculto.** `--no-nav` genera la ruta sin sidebar, útil tras un
  feature flag o pendiente de aprobación.
- **Proyecto derivado.** `--profile minimal` deja un solo dashboard canónico y
  resetea el sidebar; `full` (por defecto) conserva todos los ejemplos.
  `--install` corre `npm install` y `--git-init` reinicia git en el destino.
- **Destino inválido.** El proyecto derivado debe quedar fuera del boilerplate;
  si el destino existe, pide `--force` explícito.
- **Contexto desactualizado.** Tras editar patrones o generar rutas fuera de
  línea, `npm run ai:context:check` avisa; `npm run ai:context` lo regenera.

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
