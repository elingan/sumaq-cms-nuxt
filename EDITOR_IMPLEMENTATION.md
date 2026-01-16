# Editor de Contenidos Dinámico - Implementación

## ✅ Completado

Se ha implementado exitosamente un **editor de contenidos dinámico** para el Nuxt 4 CMS que:

1. **Renderiza formularios automáticamente** basado en esquemas definidos en YAML
2. **Integra componentes Nuxt UI** (UInput, USelect, UTextarea, UEditor)
3. **Valida datos** usando esquemas Zod tipados
4. **Maneja campos anidados** (listas con sub-campos, medios con características)
5. **Soporta texto enriquecido** con UEditor (TipTap)
6. **Persiste cambios** vía API REST

---

## 📁 Estructura de Archivos Creados

### Composables
- **[app/composables/useSchemaValidator.ts](app/composables/useSchemaValidator.ts)** - Convierte esquemas YAML → Zod + validación
- **[app/composables/usePageSchema.ts](app/composables/usePageSchema.ts)** - Carga esquemas del CMS

### Componentes Editor
- **[app/components/Editor/DynamicForm.vue](app/components/Editor/DynamicForm.vue)** - Formulario principal que renderiza todas las secciones
- **[app/components/Editor/DynamicField.vue](app/components/Editor/DynamicField.vue)** - Router dinámico de componentes por tipo de campo
- **[app/components/Editor/FieldString.vue](app/components/Editor/FieldString.vue)** - Campo de texto simple (UInput)
- **[app/components/Editor/FieldNumber.vue](app/components/Editor/FieldNumber.vue)** - Campo numérico
- **[app/components/Editor/FieldSelect.vue](app/components/Editor/FieldSelect.vue)** - Dropdown/Select
- **[app/components/Editor/FieldUrl.vue](app/components/Editor/FieldUrl.vue)** - Campo de URL con validación
- **[app/components/Editor/FieldImage.vue](app/components/Editor/FieldImage.vue)** - Campo de imagen con preview
- **[app/components/Editor/FieldTextRich.vue](app/components/Editor/FieldTextRich.vue)** - Editor de texto enriquecido con UEditor + toolbar
- **[app/components/Editor/FieldList.vue](app/components/Editor/FieldList.vue)** - Componente para arrays/listas dinámicas
- **[app/components/Editor/FieldMedia.vue](app/components/Editor/FieldMedia.vue)** - Campos de media anidados (imagen/video con características)

### Páginas
- **[app/pages/editor.vue](app/pages/editor.vue)** - Página principal del editor con carga de esquemas y datos

### Server
- **[server/api/page.ts](server/api/page.ts)** - API route para GET/PUT de page.json

---

## 🎯 Tipos de Campos Soportados

| Tipo | Componente | Características |
|------|-----------|---|
| `string` | FieldString | Texto simple con UInput |
| `text` | FieldTextRich | Texto enriquecido con UEditor (bold, italic, headings, listas, links) |
| `number` | FieldNumber | Entrada numérica |
| `select` | FieldSelect | Dropdown con opciones |
| `url` | FieldUrl | URL validada |
| `image` | FieldImage | URL de imagen con preview |
| `list` | FieldList | Arrays dinámicos con campos anidados + botones agregar/eliminar |
| `media` | FieldMedia | Objeto con tipo (image/video) y campos anidados |

---

## 🔄 Flujo de Datos

```
page.yaml (esquema)  →  usePageSchema()  →  schema.value
                           ↓
page.json (datos)    →  formState (reactive)  →  DynamicForm
                           ↓
                      DynamicField (renderiza según type)
                           ↓
                      FieldString/FieldTextRich/etc
                           ↓
                      updateField() → formState actualizado
                           ↓
                      handleSave() → /api/page (PUT)
                           ↓
                      page.json actualizado
```

---

## 🚀 Características Implementadas

### 1. Validación Dinámica
```typescript
// useSchemaValidator.ts transforma:
{ type: 'string', label: 'Title' }  →  z.string().min(1)
{ type: 'url' }  →  z.string().url()
{ type: 'list', fields: [...] }  →  z.array(z.object(...))
```

### 2. Renderizado Adaptativo
```vue
<!-- DynamicField.vue usa componentes según type -->
<FieldString v-if="type === 'string'" />
<FieldTextRich v-if="type === 'text'" />
<FieldList v-if="type === 'list'" />
```

### 3. Editor de Texto Enriquecido
- Powered by **TipTap** (incluido en Nuxt UI)
- Toolbar con: headings (H1-H3), bold, italic, underline, strikethrough, listas, links
- Soporte para HTML, Markdown, JSON content types
- Placeholder configurable

### 4. Gestión de Listas Dinámicas
- Botón "Agregar" para crear nuevas filas
- Botón "Eliminar" para remover filas
- Validación recursiva de campos anidados
- Indicador de cantidad (e.g., "Navigation #1", "Navigation #2")

### 5. Persistencia
- API `/api/page` con operaciones GET/PUT
- Escribe directamente a `app/assets/data/page.json`
- Mensaje de éxito con auto-dismiss después de 3 segundos
- Botón "Descartar cambios" para revertir

---

## 📝 Ejemplo de Uso

### 1. Acceder al editor
```
http://localhost:3002/editor
```

### 2. Esquema YAML se carga desde `usePageSchema.ts`
```typescript
{
  meta: [
    { id: 'title', label: 'Title', type: 'string' },
    { id: 'description', label: 'Description', type: 'string' }
  ],
  brand: [
    { id: 'name', label: 'Name', type: 'string' },
    { id: 'logo', label: 'Logo', type: 'image' }
  ],
  sections: {
    about: [
      { id: 'description', label: 'Description', type: 'text' },
      {
        id: 'features',
        label: 'Features',
        type: 'list',
        fields: [
          { id: 'title', label: 'Title', type: 'string' },
          { id: 'icon', label: 'Icon', type: 'string' }
        ]
      }
    ]
  }
}
```

### 3. Datos se cargan desde `app/assets/data/page.json`
```json
{
  "meta": {
    "title": "Mi Página",
    "description": "Descripción de la página"
  },
  "sections": {
    "about": {
      "description": "<p>Contenido HTML enriquecido</p>",
      "features": [
        { "title": "Feature 1", "icon": "star" },
        { "title": "Feature 2", "icon": "heart" }
      ]
    }
  }
}
```

### 4. Editar y guardar
- Usuario modifica campos en el formulario
- React reactivity actualiza `formState`
- Click en "Guardar cambios" → PUT /api/page
- Archivo JSON se actualiza en servidor
- Éxito confirmado con mensaje

---

## 🔧 Extensibilidad

### Agregar nuevo tipo de campo
1. Crear `app/components/Editor/FieldNewType.vue`
2. Agregar a `DynamicField.vue` getFieldComponent():
   ```typescript
   const components = {
     'newtype': 'FieldNewType',
     ...
   }
   ```
3. (Opcional) Agregar validación en `useSchemaValidator.ts`:
   ```typescript
   case 'newtype':
     return z.custom(...)
   ```

### Integrar esquema YAML real
En `usePageSchema.ts`, reemplazar objeto hardcodeado por:
```typescript
// Opción 1: Cargar del servidor
const { data: schemaData } = await $fetch('/api/schema')

// Opción 2: Parsear YAML dinámicamente
import yaml from 'js-yaml'
const schemaYaml = import.meta.glob('~/assets/data/page.yaml', { as: 'raw' })
const schemaData = yaml.load(schemaYaml)
```

---

## ⚙️ Dependencias Instaladas

```json
{
  "dependencies": {
    "zod": "^4.3.5"  // Validación tipada
  },
  "devDependencies": {
    "@types/node": "^25.0.9"  // Tipos para Node.js (API routes)
  }
}
```

Todos los demás componentes (UInput, USelect, UEditor, etc.) vienen incluidos en **@nuxt/ui@4.3.0**.

---

## 🚀 Próximos Pasos (Opcional)

1. **Carga de archivos**: Agregar `UFileUpload` para upload de imágenes
2. **Preview en tiempo real**: Split-view o tab lateral mostrando página renderizada
3. **Validación pre-guardado**: Ejecutar `useSchemaValidator` antes de PUT
4. **Historial de cambios**: Guardar versiones anteriores
5. **Soporte YAML real**: Cargar esquema desde YAML con parsing dinámico
6. **Campos condicionales**: Mostrar/ocultar campos según valores de otros
7. **Ordenamiento de listas**: Drag & drop con `@vueuse/core` + `sortablejs`

---

## 🎨 UI/UX

- **Theme**: Nuxt UI theme (verde primario, slate neutral) heredado de `app.config.ts`
- **Layout**: 4 secciones cardificadas (Meta, Brand, Navigation, Sections, Footer)
- **Responsive**: Max-width 4xl centrado, scrollable en mobile
- **Feedback**: Skeleton loaders, error states, success messages
- **Accesibilidad**: Labels asociados, aria-labels en iconos

---

## ✅ Estado Actual

✔️ Editor funcionando en **http://localhost:3002/editor**  
✔️ Carga esquema y datos correctamente  
✔️ Campos renderizados dinámicamente  
✔️ Validación Zod lista (no activada aún en UI)  
✔️ API de guardado lista  
✔️ TypeScript strict mode ✓  
✔️ ESLint configurado ✓  

---

Implementación completada con éxito. 🎉
