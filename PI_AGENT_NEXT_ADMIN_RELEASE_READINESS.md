# PI Agent Handoff — Next.js Admin Boilerplate Release Readiness

## `JhonMA82/next-shadcn-admin-dashboard`

> **Objetivo:** aplicar únicamente las correcciones necesarias para considerar este fork listo como boilerplate curado de **Engineering Platform**, manteniendo scaffolding determinista para que Gentle AI pueda evolucionar el proyecto derivado.
>
> **Repositorio:** https://github.com/JhonMA82/next-shadcn-admin-dashboard  
> **Rama:** `feat/phase1-scaffolding`  
> **Baseline auditado:** `c3d7858` — `chore(release): bump version to 2.3.0`  
> **Fecha de auditoría:** 2026-09-09

---

# 1. Resultado de la auditoría

El repositorio ya contiene una Phase 1 sólida:

- `AGENTS.md`
- `PROJECT.md`
- `docs/architecture.md`
- ADRs y patterns
- `docs/ai/project-map.yaml`
- `docs/ai/canonical-examples.yaml`
- contexto AI generado
- `generate:project`
- `generate:feature`
- `generate:dashboard`
- `generate:crud`
- validadores de arquitectura y navegación
- perfil `full`
- perfil `minimal`
- self-test

La dirección arquitectónica es correcta y **no debe rediseñarse**.

Sin embargo, todavía no debe marcarse como release-ready para Engineering Platform porque existen pendientes específicos.

## Blockers confirmados

1. El perfil `minimal` solo elimina directorios bajo:

```text
src/app/(main)/dashboard/
```

pero el repositorio también contiene rutas standalone:

```text
src/app/(main)/chat/
src/app/(main)/mail/
```

Por lo tanto el derived project `minimal` conserva demos que deberían desaparecer.

2. El sidebar minimal conserva un grupo vacío:

```text
Pages
└── []
```

Debe desaparecer en un perfil realmente mínimo.

3. `phase1:self-test` solo genera un proyecto derivado `full`.

No prueba:

- `minimal`;
- eliminación de rutas standalone;
- sidebar minimal;
- proyecto derivado real;
- ejecución de generators desde el proyecto derivado;
- `--singular`;
- cleanup de source-only tooling.

4. El proyecto derivado copia actualmente todo el source boilerplate, incluyendo:

```text
generate:project
scripts/create-project.ts
templates/project/
scripts/self-test.ts
phase1:self-test
```

El proyecto derivado debería poder evolucionarse con Gentle AI, pero **no debería convertirse en otra fábrica de proyectos**.

5. `docs/ai/project-map.yaml` anuncia comandos, pero no describe de forma machine-readable los argumentos de los generators.

Gentle debe poder saber sin inferencia manual:

```text
generate:feature
  name
  --nav
  --nav-group
  --nav-icon
  --nav-title

generate:dashboard
  name
  --no-nav
  --nav-icon
  --nav-title

generate:crud
  plural
  --singular
  --no-nav
  --nav-group
  --nav-icon
  --nav-title
```

6. `AGENTS.md` solo muestra las formas básicas y no documenta los argumentos que Gentle puede utilizar.

7. README continúa siendo esencialmente el README upstream y sus instrucciones de clone apuntan al repositorio original.

---

# 2. Diferencias importantes respecto al fork TanStack

No copies mecánicamente todos los cambios de `tanstack-shadcn-admin-dashboard`.

Este repositorio es Next.js.

## NO existe `routeTree.gen.ts`

Next.js App Router descubre rutas desde:

```text
src/app/
```

Por lo tanto:

- no agregar TanStack Router CLI;
- no agregar regeneración de route tree;
- no agregar lógica `tsr`;
- no agregar dependencias de TanStack Router.

El equivalente de validación para este boilerplate es:

```text
App Router filesystem
+
validate:navigation
+
validate:architecture
+
typecheck
+
next build
```

El `npm run validate` actual ya culmina con:

```bash
npm run build
```

y debe seguir siendo el quality gate final.

## Tooling

Este fork ya mantiene un contrato consistente:

```text
package manager: npm
script runtime: ts-node
```

No migrar a Bun únicamente para igualarlo al fork TanStack.

No migrar a `tsx` ni a otro runtime en esta fase salvo que exista un fallo real demostrado.

Mantener:

```text
npm + ts-node
```

y documentarlo claramente.

---

# 3. Misión

Trabaja sobre:

```bash
feat/phase1-scaffolding
```

No agregues nuevas funcionalidades de producto.

No rediseñes la arquitectura.

No hagas merge a `main`.

No hagas tag ni release.

No hagas push salvo autorización explícita.

Debes dejar la rama en estado:

```text
READY FOR MERGE
```

solo después de cumplir todos los criterios de aceptación de este documento.

---

# 4. Arquitectura que debe conservarse

Mantener:

- Next.js 16.
- App Router.
- React 19.
- React Server Components por defecto.
- TypeScript strict.
- Tailwind CSS v4.
- shadcn/ui.
- estilo local `radix-nova`.
- Biome.
- Husky.
- TanStack Table.
- React Hook Form.
- Zod.
- Zustand solo cuando corresponda.
- colocation por rutas.
- server-first.
- `src/components/ui/` como primitive protegido.
- `src/components/calendar/` como primitive protegido.
- navegación bajo `src/navigation/sidebar/sidebar-items.ts`.
- `docs/`.
- `AGENTS.md`.
- `PROJECT.md`.
- machine-readable AI context.
- canonical examples.
- validators.

No conviertas este fork en un monorepo.

No agregues una nueva abstracción de módulos.

No reemplaces App Router.

---

# 5. Flujo objetivo con Engineering Platform

El flujo de integración futuro debe poder ser:

```text
Engineering Platform
        │
        ▼
selecciona next-admin
        │
        ▼
clona temporalmente el fork/tag
        │
        ▼
prepara tooling necesario
        │
        ▼
npm run generate:project -- <project> --profile minimal
        │
        ▼
crea proyecto derivado fuera del clon
        │
        ▼
elimina clon temporal
        │
        ▼
Gentle AI trabaja dentro del derived project
```

Engineering Platform no debe mantener una copia permanente del boilerplate.

Este trabajo NO implementa todavía el adapter de Engineering Platform.

---

# 6. Corregir el perfil `minimal`

## 6.1 Problema actual

`templates/project/minimal-profile.json` contiene solamente:

```json
{
  "removeDashboardDirectories": [...]
}
```

y `applyMinimalProfile()` elimina exclusivamente bajo:

```text
src/app/(main)/dashboard/
```

Pero existen además:

```text
src/app/(main)/chat/
src/app/(main)/mail/
```

Esas rutas sobreviven actualmente al perfil minimal.

## 6.2 Cambio requerido

Extiende el profile declarativo.

Estructura recomendada:

```json
{
  "removeDashboardDirectories": [
    "(legacy)",
    "academy",
    "analytics",
    "calendar",
    "chat",
    "coming-soon",
    "crm",
    "ecommerce",
    "file-manager",
    "finance",
    "infrastructure",
    "invoice",
    "kanban",
    "logistics",
    "mail",
    "patient-monitoring",
    "productivity",
    "profile",
    "roles",
    "tasks",
    "users"
  ],
  "removeStandaloneDirectories": [
    "chat",
    "mail"
  ]
}
```

Adapta el typing de `create-project.ts`.

`applyMinimalProfile()` debe eliminar:

```text
src/app/(main)/dashboard/<configured>
```

y:

```text
src/app/(main)/<configured standalone>
```

## 6.3 Qué debe conservar minimal

Conservar:

```text
src/app/(main)/dashboard/default/
src/app/(main)/auth/
src/app/(main)/unauthorized/
```

y toda infraestructura requerida por el shell.

No elimines auth ni unauthorized solamente por hacer el proyecto más pequeño.

El objetivo es:

> eliminar demos y superficies de ejemplo, no romper el shell ni el flujo de seguridad.

## 6.4 Sidebar minimal

Actualmente `minimal-sidebar-items.ts.tpl` conserva:

```text
Dashboards
└── Dashboard

Pages
└── []
```

El derived minimal debe quedar sin grupos vacíos.

Resultado esperado:

```text
Dashboards
└── Dashboard
```

No conservar:

```text
Pages []
```

El validator de navegación debe seguir pasando.

## 6.5 Canonical examples

Después de aplicar minimal:

- no deben apuntar a rutas eliminadas;
- deben conservar únicamente ejemplos todavía existentes;
- deben seguir siendo útiles para Gentle.

---

# 7. No implementar dependency pruning ahora

No agregar en esta fase:

```text
removeDependencies
unused dependency analyzer
profile-specific package pruning
automatic package.json slimming
```

`minimal` significa aquí:

> superficie funcional mínima y limpia

No:

> dependency graph absolutamente mínimo.

Esto puede evaluarse después si representa una ganancia real.

---

# 8. Separar SOURCE BOILERPLATE de DERIVED PROJECT

Esta corrección es obligatoria.

## Source boilerplate

Debe conservar:

```text
generate:project
generate:feature
generate:dashboard
generate:crud
ai:context
validators
self-test
templates/project
templates/feature
templates/dashboard
templates/crud
```

## Derived project

Debe conservar:

```text
generate:feature
generate:dashboard
generate:crud
ai:context
ai:context:check
validate:architecture
validate:navigation
validate
typecheck
templates/feature
templates/dashboard
templates/crud
scripts/_lib
AGENTS.md
PROJECT.md
docs/
.boilerplate.json
```

El derived project NO debe conservar la capacidad de crear otro derived project.

---

# 9. Cleanup obligatorio del derived project

Añade una fase explícita después de generar identidad/profile/context y antes de finalizar.

Nombre sugerido:

```text
cleanupDerivedProject()
```

No es obligatorio usar ese nombre.

## Eliminar del derived project

Como mínimo:

```text
scripts/create-project.ts
templates/project/
```

Eliminar de `package.json`:

```text
generate:project
```

Eliminar source-only test tooling:

```text
scripts/self-test.ts
phase1:self-test
```

si no existe una razón real para mantenerlo en el producto derivado.

## Evaluar y normalmente eliminar del derived

Estos archivos pertenecen al proceso de preparación del boilerplate fuente:

```text
apply-phase1.mjs
package-scripts.phase1.json
MANIFEST.md
PROJECT.template.md
INSTALL.es.md
```

No deben viajar al derived project si su única función es instalar/documentar la Phase 1 del source template.

No eliminar:

```text
PROJECT.md
AGENTS.md
docs/architecture.md
docs/patterns/
docs/ai/
```

porque son parte del contrato de desarrollo AI-friendly.

## Dependencias transitivas

Antes de eliminar archivos, confirma que:

```text
generate:feature
generate:dashboard
generate:crud
generate-ai-context
validators
```

no dependan de ellos.

No eliminar:

```text
scripts/_lib/
```

si los generators lo usan.

---

# 10. El derived project debe conservar scaffolding para Gentle AI

Gentle debe poder trabajar dentro del resultado ejecutando:

```bash
npm run generate:feature -- reports
```

```bash
npm run generate:feature -- reports --nav
```

```bash
npm run generate:dashboard -- operations
```

```bash
npm run generate:crud -- customers
```

```bash
npm run generate:crud -- inventory-items --singular inventory-item
```

Los comandos anteriores son parte del contrato del boilerplate.

No deben ser tratados como herramientas temporales.

---

# 11. Formalizar todos los argumentos útiles

Actualmente los scripts ya soportan más opciones que las mostradas en `AGENTS.md`.

No inventes flags nuevos.

Documenta los que YA existen.

## 11.1 Feature generator

Contrato:

```bash
npm run generate:feature -- <name>
```

Opciones:

```text
--description <text>
--nav
--nav-group <Pages|Dashboards>
--nav-icon <LucideExport>
--nav-title <text>
--force
--no-context
```

Gentle debe entender especialmente:

```text
--nav
```

como:

> registrar la feature en navegación.

## 11.2 Dashboard generator

Contrato:

```bash
npm run generate:dashboard -- <name>
```

Opciones existentes:

```text
--description <text>
--no-nav
--nav-icon <LucideExport>
--nav-title <text>
--force
--no-context
```

El comportamiento default actual es:

```text
navigation = true
```

Conservarlo salvo bug demostrado.

## 11.3 CRUD generator

Contrato:

```bash
npm run generate:crud -- <plural-route>
```

Opciones:

```text
--singular <kebab-name>
--description <text>
--no-nav
--nav-group <Pages|Dashboards>
--nav-icon <LucideExport>
--nav-title <text>
--force
--no-context
```

Gentle debe entender especialmente:

```text
--singular
```

como:

> definir el nombre singular de una entidad cuando la inferencia no sea suficiente o cuando se quiera hacer explícito el dominio.

Ejemplo canónico:

```bash
npm run generate:crud -- inventory-items --singular inventory-item
```

---

# 12. Actualizar `AGENTS.md`

Mantener el contrato actual de arquitectura.

Extender únicamente `Deterministic scaffolding`.

Debe enseñar a los agentes:

```bash
npm run generate:feature -- <name>
npm run generate:feature -- <name> --nav

npm run generate:dashboard -- <name>

npm run generate:crud -- <plural-entity>
npm run generate:crud -- <plural-entity> --singular <singular-entity>
```

También mencionar las opciones de navegación relevantes sin convertir `AGENTS.md` en una referencia CLI enorme.

Agregar una regla equivalente a:

> Prefer repository generators over manually creating standard feature, dashboard, or CRUD structures. Inspect the generated files, then implement approved business behavior. Create those structures manually only when the existing generator cannot represent the requested shape.

Después de scaffolding estructural:

```bash
npm run ai:context
npm run validate
```

cuando corresponda.

---

# 13. `project-map.yaml` machine-readable

El `project-map.yaml` actual contiene:

```yaml
commands:
  generateProject: ...
  generateFeature: ...
  generateCrud: ...
  generateDashboard: ...
```

Eso es útil, pero insuficiente para Gentle.

Añade capacidades estructuradas.

Ejemplo conceptual:

```yaml
tooling:
  packageManager: npm
  scriptRuntime: ts-node

scaffolding:
  feature:
    command: npm run generate:feature --
    arguments:
      name:
        required: true
        format: kebab-case
      nav:
        required: false
        type: boolean
      navGroup:
        required: false
        values:
          - Pages
          - Dashboards
      navIcon:
        required: false
      navTitle:
        required: false

  dashboard:
    command: npm run generate:dashboard --
    defaults:
      navigation: true
    arguments:
      name:
        required: true
        format: kebab-case
      noNav:
        required: false
        type: boolean
      navIcon:
        required: false
      navTitle:
        required: false

  crud:
    command: npm run generate:crud --
    defaults:
      navigation: true
    arguments:
      plural:
        required: true
        format: kebab-case
      singular:
        required: false
        format: kebab-case
      noNav:
        required: false
        type: boolean
      navGroup:
        required: false
        values:
          - Pages
          - Dashboards
      navIcon:
        required: false
      navTitle:
        required: false
```

Adapta nombres y schema al documento real.

No agregues complejidad innecesaria.

## Source vs derived contract

En el source boilerplate puede existir:

```yaml
generateProject
```

En el derived project NO debe anunciarse:

```text
generateProject
```

si el script ya fue eliminado.

`createProject()` debe ajustar el machine-readable contract del destino.

El derived project debe anunciar únicamente las capacidades que realmente conserva.

---

# 14. Next.js-specific AI contract

Este fork tiene reglas que NO deben perderse al limpiar el proyecto.

## Server Components

Gentle debe conservar:

```text
page.tsx = Server Component por defecto
```

No agregar `"use client"` a `page.tsx` generado salvo necesidad excepcional y justificada.

Interactividad debe vivir en componentes cliente focalizados.

## Next.js local docs

Conservar en AGENTS:

```text
Before Next.js implementation, inspect:
node_modules/next/dist/docs/
```

Esto es especialmente útil porque Next.js cambia frecuentemente.

## App Router

Los generators deben seguir creando dentro de:

```text
src/app/(main)/dashboard/<feature>/
```

y usar:

```text
_components/
_schemas/
_data/
_lib/
```

solo cuando corresponda.

## Protected primitives

No modificar automáticamente:

```text
src/components/ui/
src/components/calendar/
```

durante scaffolding de features.

---

# 15. Revisar templates de generators

Los templates actuales mantienen `page.tsx` como Server Component, lo cual es correcto.

No agregar `"use client"` a:

```text
templates/feature/page.tsx.tpl
templates/dashboard/page.tsx.tpl
templates/crud/page.tsx.tpl
```

si no es estrictamente necesario.

Cuando una plantilla requiera interactividad, debe aislarla en un componente específico dentro de `_components`.

No romper el validator:

```text
PAGE_CLIENT_COMPONENT
```

No debilitar el validator para hacer pasar una plantilla incorrecta.

---

# 16. Mejorar `phase1:self-test`

El self-test actual cubre generators básicos en una fixture y genera solamente un derived project `full`.

Debe extenderse.

---

## 16.1 Test de feature con navegación

Ejecutar el equivalente a:

```bash
npm run generate:feature -- reports --nav
```

Verificar:

```text
✓ page.tsx
✓ private components esperados
✓ navegación contiene /dashboard/reports
✓ validate:navigation pasa
```

---

## 16.2 Test dashboard

Ejecutar:

```bash
npm run generate:dashboard -- operations
```

Verificar:

```text
✓ page.tsx
✓ dashboard components
✓ navegación automática
```

---

## 16.3 CRUD básico

Ejecutar:

```bash
npm run generate:crud -- customers
```

Verificar al menos:

```text
✓ list page
✓ new page
✓ [id] route
✓ edit page
✓ table/forms/data/schema que defina la template actual
✓ navegación
```

No necesitas agregar nuevos artefactos al generator; solo probar los que ya genera.

---

## 16.4 CRUD con singular explícito

Añadir prueba obligatoria:

```bash
npm run generate:crud -- inventory-items --singular inventory-item
```

Verificar que templates y nombres utilicen correctamente:

```text
inventory-items
inventory-item
InventoryItems
InventoryItem
inventoryItems
inventoryItem
```

según corresponda.

---

# 17. Self-test del perfil `minimal`

Añadir derived project minimal.

Debe demostrar:

```text
✓ /dashboard/default existe
✗ /dashboard/crm
✗ /dashboard/finance
✗ /dashboard/analytics
✗ /dashboard/chat
✗ /dashboard/mail
✗ /(main)/chat
✗ /(main)/mail
```

Además:

```text
✓ auth permanece
✓ unauthorized permanece
```

cuando existan en la fixture/derived real.

Verificar sidebar:

```text
✓ Dashboard existe
✗ Pages vacío
```

Verificar canonical examples:

```text
✗ no referencias a rutas eliminadas
```

Verificar AI context:

```text
✗ no rutas demo eliminadas
✓ default dashboard
```

---

# 18. Self-test del derived project

No basta con probar los generators antes de llamar `createProject()`.

El contrato importante es:

> Gentle ejecuta los generators DESDE el proyecto derivado.

Después de generar el derived project, probar ahí:

```bash
npm run generate:feature -- reports --nav
npm run generate:dashboard -- operations
npm run generate:crud -- customers
npm run generate:crud -- inventory-items --singular inventory-item
```

Puede hacerse mediante funciones importadas o CLI real según sea más estable, pero debe validar el mismo resultado que producirían los scripts npm.

Verificar:

```text
✓ scripts permanecen
✓ templates permanecen
✓ _lib permanece
✓ navegación se modifica
✓ AI context puede regenerarse
✓ validators funcionan
```

---

# 19. Self-test del cleanup source/derived

Después de `createProject()` verificar:

```text
✓ generate:feature
✓ generate:dashboard
✓ generate:crud
✓ ai:context
✓ validate:architecture
✓ validate:navigation
✓ validate
✓ typecheck
```

y:

```text
✗ generate:project
✗ scripts/create-project.ts
✗ templates/project/
✗ phase1:self-test
✗ scripts/self-test.ts
```

si se decidió correctamente que self-test es source-only.

También verificar:

```text
✗ project-map.yaml anuncia generateProject
```

en el derived project.

---

# 20. Validación Next.js real

Las fixtures rápidas son útiles, pero release readiness exige una prueba real.

## Full

Crear:

```bash
npm run generate:project -- release-test-full \
  --profile full \
  --destination <temp-path>
```

Instalar si corresponde:

```bash
cd <temp-path>
npm install
```

Ejecutar:

```bash
npm run validate
```

Debe terminar incluyendo:

```text
Biome
TypeScript
architecture
navigation
AI context
Next.js build
```

---

## Minimal

Crear:

```bash
npm run generate:project -- release-test-minimal \
  --profile minimal \
  --install \
  --destination <temp-path>
```

Después:

```bash
cd <temp-path>
npm run validate
```

Verificar:

```text
✓ next build
✓ typecheck
✓ navigation
✓ architecture
✓ AI context
```

El App Router build es el gate equivalente al route-tree test del fork TanStack.

No agregar una etapa de route generation inexistente.

---

# 21. Gentle AI simulation

Dentro de un derived minimal instalado:

```bash
npm run generate:feature -- reports --nav
npm run generate:dashboard -- operations
npm run generate:crud -- customers
npm run generate:crud -- inventory-items --singular inventory-item
npm run ai:context
npm run validate
```

Debe pasar sin:

- reparar manualmente rutas;
- editar navigation a mano para corregir el generator;
- cambiar `"use client"` en `page.tsx`;
- debilitar validators.

Este escenario representa el uso real dentro de Engineering Platform.

---

# 22. README del fork

El README actual sigue hablando como el upstream y el clone principal apunta a:

```text
arhamkhnz/next-shadcn-admin-dashboard
```

Adáptalo sin borrar créditos.

## Encabezado

Explicar que este repositorio es un fork preparado para:

```text
Engineering Platform
AI-assisted development
deterministic scaffolding
derived project generation
```

Descripción sugerida conceptualmente:

```text
Engineering Platform-ready fork of Studio Admin
```

No es obligatorio usar ese texto exacto.

## Crédito

Mantener claramente:

```text
Upstream:
https://github.com/arhamkhnz/next-shadcn-admin-dashboard
```

No presentar el diseño original como propio.

## Clone del fork

Cuando el README explique cómo usar ESTA edición:

```bash
git clone https://github.com/JhonMA82/next-shadcn-admin-dashboard.git
```

## Perfiles

Documentar:

```bash
npm run generate:project -- inventory-admin --profile minimal
```

y:

```bash
npm run generate:project -- demo-admin --profile full
```

## Gentle scaffolding

Mostrar:

```bash
npm run generate:feature -- reports
npm run generate:feature -- reports --nav

npm run generate:dashboard -- operations

npm run generate:crud -- customers
npm run generate:crud -- inventory-items --singular inventory-item
```

Explicar que estos comandos permanecen disponibles en el derived project.

---

# 23. `INSTALL.es.md`

Actualizarlo para describir el estado real final.

Debe aclarar:

- npm es package manager;
- `ts-node` ejecuta repository tooling;
- diferencias entre `full` y `minimal`;
- minimal elimina demos standalone además de dashboard demos;
- derived project conserva generators de feature/dashboard/CRUD;
- derived project NO conserva `generate:project`;
- Gentle debe preferir generators;
- finalizar cambios estructurales con AI context + validation.

Ruta recomendada:

```bash
npm run generate:project -- inventory-admin \
  --profile minimal \
  --install
```

---

# 24. `MANIFEST.md`

`MANIFEST.md` puede seguir describiendo el source boilerplate.

Pero si se elimina del derived project, no debe formar parte de su machine-readable contract ni ser requerido por sus validators/generators.

No dupliques documentación solamente para conservarlo.

---

# 25. Source bootstrap con `ts-node`

Este punto NO es blocker de esta fase si funciona según el contrato actual, pero debes validarlo y documentarlo.

`generate:project` se ejecuta mediante:

```text
ts-node -P tsconfig.scripts.json scripts/create-project.ts
```

Por lo tanto un clon completamente limpio del source necesita tener disponible `ts-node`, normalmente mediante:

```bash
npm install
```

antes de poder ejecutar el generator.

No migres el runtime automáticamente.

En el informe final registra uno de estos estados:

```text
SOURCE_BOOTSTRAP: npm install required
```

o, si ya existe un mecanismo comprobado sin instalación completa:

```text
SOURCE_BOOTSTRAP: install-free
```

No inventes una optimización.

La futura integración de Engineering Platform podrá decidir cómo bootstrapear cada boilerplate.

---

# 26. No agregar nuevos generators ahora

Fuera de alcance:

```text
generate:page
generate:server-action
generate:api
generate:auth
generate:rbac
generate:table
generate:form
```

Aunque algunos pudieran ser útiles en el futuro, no forman parte de release readiness.

Conservar solamente:

```text
feature
dashboard
crud
```

y sus argumentos actuales.

---

# 27. No agregar más perfiles

No crear ahora:

```text
crud
dashboard-only
saas
enterprise
auth-only
blank
```

Mantener:

```text
full
minimal
```

Engineering Platform podrá seleccionar entre ellos.

---

# 28. No actualizar dependencias por iniciativa propia

El upstream cambia con frecuencia.

No hacer una actualización masiva de:

```text
Next.js
React
shadcn
Tailwind
Biome
```

como parte de este trabajo.

Solo cambiar dependencias si una corrección de release-readiness lo exige realmente.

---

# 29. No debilitar validadores

Nunca resolver un fallo haciendo:

```text
error -> warning
skip path
disable validator
remove build from validate
```

sin causa arquitectónica real.

Los validators son parte del valor AI-friendly del boilerplate.

En particular conservar:

```text
PAGE_CLIENT_COMPONENT
BROWSER_API_IN_PAGE
CROSS_FEATURE_PRIVATE_IMPORT
LEGACY_IMPORT
PRIMITIVE_DEPENDS_ON_FEATURE
SERVER_IMPORTS_APP
LIB_IMPORTS_APP
```

según su implementación actual.

---

# 30. Criterios de aceptación

Solo declarar `READY FOR MERGE` si TODOS se cumplen.

## Minimal

- [ ] elimina dashboards demo configurados.
- [ ] elimina standalone `/chat`.
- [ ] elimina standalone `/mail`.
- [ ] conserva `/dashboard/default`.
- [ ] conserva infraestructura auth necesaria.
- [ ] sidebar no contiene grupos vacíos.
- [ ] canonical examples no apuntan a rutas eliminadas.
- [ ] AI context no anuncia rutas eliminadas.
- [ ] `npm run validate` pasa en derived minimal.

## Full

- [ ] conserva demos.
- [ ] identidad del package se actualiza.
- [ ] `PROJECT.md` se genera correctamente.
- [ ] `.boilerplate.json` conserva provenance.
- [ ] `npm run validate` pasa en derived full.

## Derived project

- [ ] conserva `generate:feature`.
- [ ] conserva `generate:dashboard`.
- [ ] conserva `generate:crud`.
- [ ] conserva `ai:context`.
- [ ] conserva validators.
- [ ] conserva templates de feature/dashboard/crud.
- [ ] conserva `scripts/_lib`.
- [ ] conserva `AGENTS.md`.
- [ ] conserva `PROJECT.md`.
- [ ] conserva docs arquitectónicos/AI útiles.
- [ ] NO conserva `generate:project`.
- [ ] NO conserva `scripts/create-project.ts`.
- [ ] NO conserva `templates/project/`.
- [ ] no anuncia `generateProject` en project-map.
- [ ] no conserva source-only self-test si fue clasificado como tal.

## Gentle

- [ ] feature normal funciona.
- [ ] feature `--nav` funciona.
- [ ] dashboard funciona.
- [ ] CRUD plural funciona.
- [ ] CRUD `--singular` funciona.
- [ ] generators funcionan DESDE el derived project.
- [ ] navegación generada pasa validator.
- [ ] contexto AI puede regenerarse.
- [ ] `npm run validate` pasa después de scaffolding.

## Next.js

- [ ] generated `page.tsx` permanece Server Component.
- [ ] interactividad continúa aislada.
- [ ] `npm run typecheck` pasa.
- [ ] `npm run build` pasa.
- [ ] App Router resuelve las rutas nuevas.
- [ ] no se agregó route-tree tooling ajeno a Next.js.

## AI contract

- [ ] AGENTS documenta generators y argumentos esenciales.
- [ ] project-map describe scaffolding de forma machine-readable.
- [ ] derived project-map coincide con capacidades reales.
- [ ] Gentle no necesita inventar estructura estándar.
- [ ] `npm run ai:context` mantiene inventario actualizado.

## Docs

- [ ] README identifica el fork.
- [ ] README mantiene crédito upstream.
- [ ] README usa clone del fork cuando corresponde.
- [ ] README explica `full` y `minimal`.
- [ ] README explica scaffolding persistente.
- [ ] INSTALL.es.md coincide con el flujo final.

---

# 31. Validaciones obligatorias

Ejecutar y guardar evidencia.

## Source

```bash
npm run phase1:self-test
npm run validate
```

## Derived full

```bash
npm run generate:project -- release-test-full \
  --profile full \
  --destination <temp-full>
```

Después:

```bash
cd <temp-full>
npm install
npm run validate
```

## Derived minimal

```bash
npm run generate:project -- release-test-minimal \
  --profile minimal \
  --install \
  --destination <temp-minimal>
```

Después:

```bash
cd <temp-minimal>
npm run validate
```

## Gentle simulation

Dentro del derived minimal:

```bash
npm run generate:feature -- reports --nav

npm run generate:dashboard -- operations

npm run generate:crud -- customers

npm run generate:crud -- inventory-items \
  --singular inventory-item

npm run ai:context

npm run validate
```

No marcar PASS si el comando no fue ejecutado.

---

# 32. Estrategia de commits sugerida

Mantener commits pequeños.

Ejemplo:

```text
fix: clean standalone routes from minimal profile
feat: preserve scaffolding in derived projects
test: validate minimal and derived generator contract
docs: document next admin boilerplate workflow
```

No es obligatorio usar exactamente esos mensajes.

No hacer commit si el entorno/agente host requiere autorización previa.

---

# 33. Fuera de alcance

No implementar ahora:

- integración con Engineering Platform;
- catálogo/adaptador de Engineering Platform;
- dependency pruning;
- cambio de arquitectura;
- monorepo;
- backend;
- auth real adicional;
- RBAC real;
- database integration;
- nuevo state manager;
- nuevas dashboards;
- nuevos generators;
- nuevos perfiles;
- actualización masiva de dependencias;
- migración npm → Bun;
- migración `ts-node` → otro runtime;
- cambios visuales;
- merge;
- tag;
- GitHub Release;
- push sin autorización.

---

# 34. Informe final requerido a PI Agent

Al terminar, responder con esta estructura.

## Baseline

```text
repository:
branch:
starting commit:
ending commit:
```

## Cambios realizados

Lista breve por archivo/componente.

## Validaciones

Formato:

```text
PASS npm run phase1:self-test
PASS npm run validate

PASS derived full
PASS derived minimal

PASS feature
PASS feature --nav
PASS dashboard
PASS crud
PASS crud --singular

PASS derived npm run validate
PASS next build
```

No escribir PASS sin ejecución real.

## Source bootstrap

Declarar:

```text
SOURCE_BOOTSTRAP: npm install required
```

o el estado realmente demostrado.

## Pendientes

Usar:

```text
None blocking release readiness.
```

o listar blockers concretos.

## Veredicto

Solo uno:

```text
READY FOR MERGE
```

o:

```text
NOT READY
```

---

# 35. Estado arquitectónico esperado al concluir

```text
SOURCE NEXT.JS BOILERPLATE
│
├── generate:project
├── generate:feature
├── generate:dashboard
├── generate:crud
├── validators
├── AI context
├── self-test
└── project templates
        │
        │ generate:project
        ▼
DERIVED NEXT.JS PROJECT
│
├── generate:feature
├── generate:dashboard
├── generate:crud
├── validators
├── AI context
├── AGENTS.md
├── PROJECT.md
├── architecture/pattern docs
└── feature/dashboard/crud templates

NO:
├── generate:project
├── create-project.ts
├── templates/project/
└── source-only phase self-test
```

---

# 36. Ejemplos de uso esperados por Gentle AI

## Feature sin navegación

Petición:

```text
Crea un módulo interno de auditoría que todavía no debe mostrarse en el menú.
```

Gentle:

```bash
npm run generate:feature -- audit
```

Después implementa comportamiento de negocio.

---

## Feature navegable

Petición:

```text
Agrega una sección Reports visible en la navegación.
```

Gentle:

```bash
npm run generate:feature -- reports --nav
```

---

## Dashboard

Petición:

```text
Agrega el dashboard de operaciones.
```

Gentle:

```bash
npm run generate:dashboard -- operations
```

---

## CRUD

Petición:

```text
Agrega administración de clientes.
```

Gentle:

```bash
npm run generate:crud -- customers
```

---

## CRUD con singular explícito

Petición:

```text
Agrega administración de artículos de inventario.
```

Gentle:

```bash
npm run generate:crud -- inventory-items --singular inventory-item
```

---

# 37. Principio final

El objetivo no es convertir Studio Admin en un framework propio.

El objetivo es:

```text
upstream visual/technical foundation
        +
thin deterministic scaffolding layer
        +
machine-readable AI contract
        +
executable architecture validation
        =
curated Engineering Platform boilerplate
```

Engineering Platform elegirá y generará el proyecto.

El derived project conservará las herramientas necesarias para evolucionar.

Gentle AI utilizará esas herramientas antes de inventar estructuras manualmente.

Ese es el criterio de finalización de esta fase.
