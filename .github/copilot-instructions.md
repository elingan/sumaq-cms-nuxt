# Copilot Instructions - sumaq-cms-nuxt

## Project Overview
A **Nuxt 4 CMS application** with a dynamic content editor that generates forms from YAML schemas and validates/persists data. Built with Nuxt UI, TypeScript, Zod validation, and Tailwind CSS.

**Tech Stack**: Nuxt 4.2.2, Vue 3.5.26, TypeScript 5.9.3, Nuxt UI, Zod (validation), js-yaml, TipTap editor  
**Package Manager**: pnpm v10.26.1  
**Key Features**: Dynamic form generation from schemas, field-level validation, rich text editing, real-time preview

## Directory Structure
```
app/
├── pages/             # File-based routes; editor.vue is main CMS UI
├── components/Editor/ # Form rendering: DynamicForm → DynamicField → Field*
├── composables/       # usePageSchema (load YAML), useSchemaValidator (Zod builder)
├── assets/data/       # page.yaml (schema), page.json (content data)
├── layouts/editor.vue # Layout wrapper for editor page
└── utils/             # buildPreviewHtml.ts (generates iframe preview HTML)
server/api/page.ts     # REST endpoint: GET/PUT for /api/page
```

## Critical Architecture: Dynamic Form System

### Schema-to-Form Pipeline
1. **usePageSchema.ts** loads `app/assets/data/page.yaml` (imported via `?raw` syntax to avoid 404s)
2. YAML defines schema structure: `{ meta: SchemaField[], brand: SchemaField[], sections: {...}, footer: SchemaField[] }`
3. **useSchemaValidator.ts** converts schema to Zod validation: `fieldTypeToZod()` maps `type: 'string'` → `z.string().min(1)`
4. **DynamicForm.vue** renders sections with UCard headers (icons: info, palette, menu, layout-panel, footer)
5. **DynamicField.vue** routes to specific field component based on field.type
6. Field components (FieldString, FieldTextRich, FieldList, etc.) handle user input
7. **updateField()** mutates formState via path array: `['sections', 'about', 'title']`
8. **saveChanges()** validates with Zod, collects errors into `validationErrors` map, calls props.onSave
9. **Detailed error reporting**: errorDetails computed property maps error paths to human-readable field labels (e.g., "Navegación → Ítem 2 → Link")

### Field Types & Components
| Type | Component | Behavior |
|------|-----------|----------|
| `string`, `text` | FieldString / FieldTextRich | Single line / rich editor (TipTap toolbar) |
| `number` | FieldNumber | Numeric input with type coercion |
| `url` | FieldUrl | Validates http(s) URLs, relative paths `/about`, anchors `#top`, simple names |
| `select` | FieldSelect | Dropdown; options from field.options array |
| `image` | FieldImage | URL input with preview thumbnail |
| `list` | FieldList | Dynamic arrays with add/remove buttons; can nest fields/media |
| `media` | FieldMedia | Composite field with type selector (image/video) + nested fields |

### Data Flow Example
```yaml
# page.yaml schema
meta:
  - id: title
    type: string
    label: Title
sections:
  about:
    - id: features
      type: list
      label: Features
      fields:
        - id: title
          type: string
```
→ formState: `{ meta: { title: 'My Site' }, sections: { about: { features: [{ title: 'Feature 1' }] } } }`  
→ Error path on validation fail: `sections.about.features.0.title`  
→ Human label: `Sección About → Features → Ítem 1 → Title`

### Real-time Preview
**buildPreviewHtml.ts** generates iframe HTML from formState. Used by **PreviewPanel.vue** to display live page preview as user edits. Supports gradient backgrounds, Tailwind classes, responsive grid layouts.

## Critical Architectural Patterns

### 1. **File-Based Routing**
- Files in `app/pages/` automatically become routes
- Example: `app/pages/index.vue` → `/` route
- Use `NuxtLink` and `<NuxtPage />` for navigation

### 2. **Layout System**
- Define layouts in `app/layouts/` (default.vue, editor.vue, main.vue)
- Wrap pages with `<NuxtLayout>`
- In `app.vue`: `<NuxtLayout><NuxtPage /></NuxtLayout>`

### 3. **Component Auto-Import**
- Components in `app/components/` are auto-imported (PascalCase)
- Nuxt UI components (prefixed with `U`) are automatically available
- Example: `<UButton>`, `<UCard>`, `<UApp>`, `<UPageHero>`

### 4. **Data Files**
- JSON/YAML files in `app/assets/data/` (page.json, page.yaml)
- Import and use in components with `import data from '~/assets/data/page.json'`

### 5. **Styling**
- Primary CSS: `app/assets/css/main.css` (configured in nuxt.config.ts)
- Tailwind CSS via Nuxt UI (no separate Tailwind config needed)
- Color theme: `primary: 'green'`, `neutral: 'slate'` (defined in app.config.ts)

## Development Workflow

### Essential Commands
```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Build for production
pnpm preview      # Preview production build locally
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript type checking
```

### SEO & Head Management
- Use `useHead()` in components for meta tags, favicon, lang attributes
- Use `useSeoMeta()` for OG tags, Twitter cards, SEO metadata
- See `app.vue` for examples

## Code Conventions & Patterns

### Dynamic Form Component Pattern
When adding new field types:
1. Create `FieldXxxx.vue` in `app/components/Editor/`
2. Receive props: `:field`, `:model-value`, `:error`, `@update:model-value`
3. Add case in `useSchemaValidator.ts` fieldTypeToZod(): map field.type → z.ZodType
4. Wire in DynamicField.vue: `<FieldXxxx v-if="field.type === 'xxx'"`
5. Include error display: `{{ error }}` (passed from parent)

### Composable Pattern for Schema Management
**usePageSchema.ts** template:
```typescript
import schemaYaml from '~/assets/data/page.yaml?raw' // ← Use ?raw for static YAML
const schema = ref<SchemaType>({})
const loadSchema = async () => {
  schema.value = yaml.load(schemaYaml) // Synchronous parse
}
onMounted(() => loadSchema())
return { schema, loadSchema }
```

### Validation Pattern with Zod Custom Refinements
URL validator example (from useSchemaValidator.ts):
```typescript
.refine(isUrlOrRelativeAnchor, '...error message')
// isUrlOrRelativeAnchor accepts: http(s), /paths, #anchors, relative names
```

### Vue Component Structure
```vue
<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <Icon name="i-lucide-info" />
        <div>
          <h2 class="font-semibold text-lg">{{ title }}</h2>
          <p class="text-sm text-gray-500">{{ subtitle }}</p>
        </div>
      </div>
    </template>
    <!-- Content -->
  </UCard>
</template>

<script setup lang="ts">
// Always use <script setup lang="ts">
const formState = reactive<FormData>({})
const updateField = (path: string[], value: any) => { /* navigate path, set value */ }
</script>
```

### Linting & Type Safety
- **ESLint**: stylistic rules enforce `commaDangle: 'never'`, `braceStyle: '1tbs'`, arrow function parens
- **No backticks** in component attributes; use explicit attribute arrays `['class1', 'class2']`
- **TypeScript strict mode**: Type all prop interfaces; use `Record<string, any>` sparingly
- **Run before commits**: `pnpm lint && pnpm typecheck`

## Integration Points

### Server API
**server/api/page.ts** handles two operations:
- **GET /api/page**: Returns `app/assets/data/page.json` (form data)
- **PUT /api/page**: Accepts validated formState, writes to `page.json`
Pattern: Use `useAsyncData` or `$fetch` from pages to call; always validate before PUT

### Data Persistence Flow
```
DynamicForm.saveChanges()
  ↓ (validates with Zod)
$fetch('/api/page', { method: 'PUT', body: formState })
  ↓
server/api/page.ts (writes to page.json)
  ↓
Editor page receives success message
```

### Nuxt Modules
- `@nuxt/ui` - Component library (UButton, UCard, UInput, UEditor)
- `@nuxt/image` - Image optimization
- `@nuxt/eslint` - Linting integration

### External Dependencies for Editor Features
- **js-yaml** - Parse YAML schemas in usePageSchema.ts
- **zod** - Runtime validation via createZodSchemaFromFields()
- **TipTap (via Nuxt UI)** - Rich text editor in FieldTextRich.vue
- **Lucide Icons** - Icons in section headers (i-lucide-*)

## Critical Development Workflows

### Adding a New Field Type
1. Create `app/components/Editor/FieldMyType.vue` with props: `:field`, `:model-value`, `:error`
2. Add validation in `useSchemaValidator.ts`:
   ```typescript
   case 'mytype':
     return z.string().transform(val => processValue(val))
   ```
3. Register in `DynamicField.vue`: `<FieldMyType v-if="field.type === 'mytype'" ...`
4. Test with schema entry: `{ id: 'test', type: 'mytype', label: 'Test Field' }`

### Debugging the Form Editor
- **Schema not loading**: Check `page.yaml` import in usePageSchema.ts uses `?raw` syntax
- **Validation errors**: Look at validationErrors ref in DynamicForm; errorDetails computed shows human-readable paths
- **Field not rendering**: Check DynamicField.vue has case for field.type; verify field.type string matches exactly
- **Preview broken**: buildPreviewHtml.ts may have syntax errors; check stderr for HTML parsing issues

### Testing Changes Locally
```bash
pnpm dev                  # Start dev server (http://localhost:3002)
# Edit schema: app/assets/data/page.yaml
# Edit data: app/assets/data/page.json
# Editor auto-reloads via HMR (Hot Module Replacement)
pnpm lint && pnpm typecheck  # Validate before commit
```

## Common Tasks

### Adding a New Page
1. Create `app/pages/new-page.vue`
2. Page auto-routes to `/new-page`
3. Wrap with layout: `<script setup>definePageMeta({ layout: 'default' })</script>`

### Creating a Reusable Component
1. Create `app/components/MyComponent.vue`
2. Auto-imported as `<MyComponent />`
3. Use Nuxt UI components inside: `<UCard>`, `<UButton>`, etc.

### Modifying Theme Colors
Edit `app/app.config.ts`:
```typescript
export default defineAppConfig({
  ui: { colors: { primary: 'green', neutral: 'slate' } }
})
```

## Important Notes
- **No custom build config needed** - Nuxt handles everything
- **Auto-import enabled** - Components and composables don't need explicit imports
- **Production prerender** - Only `/` is prerendered; adjust `routeRules` if needed
- **pnpm workspaces configured** - Ignores certain build dependencies (esbuild, unrs-resolver, etc.)
- **Error details for forms** - Use errorDetails computed property in DynamicForm to show human-readable validation errors
- **Asset imports** - Use `import data from '~/assets/data/file.json'` or `?raw` for YAML to avoid 404 in static deployment
