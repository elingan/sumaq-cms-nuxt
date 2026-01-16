<template>
  <div class="space-y-8 max-w-4xl">
    <!-- Meta Section -->
    <UCard v-if="schema.meta">
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="i-lucide-info" class="w-5 h-5" />
          <div>
            <h2 class="font-semibold text-lg">Metadatos</h2>
            <p class="text-sm text-gray-500">Información general de la página</p>
          </div>
        </div>
      </template>
      <div class="space-y-4">
        <div v-for="field in schema.meta" :key="field.id" class="space-y-1">
          <label class="block text-sm font-medium">{{ field.label }}</label>
          <DynamicField
            :field="field"
            :model-value="formState.meta?.[field.id]"
            :error="getFieldError(`meta.${field.id}`)"
            @update:model-value="updateField(['meta', field.id], $event)"
          />
        </div>
      </div>
    </UCard>

    <!-- Brand Section -->
    <UCard v-if="schema.brand">
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="i-lucide-palette" class="w-5 h-5" />
          <div>
            <h2 class="font-semibold text-lg">Marca</h2>
            <p class="text-sm text-gray-500">Logo, nombre y enlace de marca</p>
          </div>
        </div>
      </template>
      <div class="space-y-4">
        <div v-for="field in schema.brand" :key="field.id" class="space-y-1">
          <label class="block text-sm font-medium">{{ field.label }}</label>
          <DynamicField
            :field="field"
            :model-value="formState.brand?.[field.id]"
            :error="getFieldError(`brand.${field.id}`)"
            :preview="field.type === 'image'"
            @update:model-value="updateField(['brand', field.id], $event)"
          />
        </div>
      </div>
    </UCard>

    <!-- Navigation Section -->
    <UCard v-if="schema.navigation">
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="i-lucide-menu" class="w-5 h-5" />
          <div>
            <h2 class="font-semibold text-lg">Navegación</h2>
            <p class="text-sm text-gray-500">Enlaces principales del sitio</p>
          </div>
        </div>
      </template>
      <div class="space-y-4">
        <FieldList
          :field="schema.navigation"
          :model-value="formState.navigation || []"
          :errors="validationErrors"
          @update:model-value="updateField(['navigation'], $event)"
        />
      </div>
    </UCard>

    <!-- Sections (dynamic) -->
    <template v-if="schema.sections">
      <template v-for="(sectionData, sectionKey) in schema.sections" :key="sectionKey">
        <UCard
          v-if="Array.isArray(sectionData)"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <Icon name="i-lucide-layout-panel" class="w-5 h-5" />
              <div>
                <h2 class="font-semibold text-lg">{{ capitalize(sectionKey) }}</h2>
                <p class="text-sm text-gray-500">Contenido de la sección {{ sectionKey }}</p>
              </div>
            </div>
          </template>
          <div class="space-y-4">
            <div v-for="field in sectionData" :key="field.id" class="space-y-1">
              <label class="block text-sm font-medium">{{ field.label }}</label>
              <DynamicField
                :field="field"
                :model-value="formState.sections?.[sectionKey]?.[field.id]"
                :error="getFieldError(`sections.${sectionKey}.${field.id}`)"
                :errors="validationErrors"
                :preview="field.type === 'image'"
                @update:model-value="updateField(['sections', sectionKey, field.id], $event)"
              />
            </div>
          </div>
        </UCard>
      </template>
    </template>

    <!-- Footer Section -->
    <UCard v-if="schema.footer">
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="i-lucide-footer" class="w-5 h-5" />
          <div>
            <h2 class="font-semibold text-lg">Pie de página</h2>
            <p class="text-sm text-gray-500">Información del footer del sitio</p>
          </div>
        </div>
      </template>
      <div class="space-y-4">
        <div v-for="field in schema.footer" :key="field.id" class="space-y-1">
          <label class="block text-sm font-medium">{{ field.label }}</label>
          <DynamicField
            :field="field"
            :model-value="formState.footer?.[field.id]"
            :error="getFieldError(`footer.${field.id}`)"
            :errors="validationErrors"
            @update:model-value="updateField(['footer', field.id], $event)"
          />
        </div>
      </div>
    </UCard>

    <!-- Actions -->
    <div class="flex gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-300 rounded-lg">
      <UButton
        icon="i-lucide-save"
        :loading="isSaving"
        @click="saveChanges"
      >
        Guardar cambios
      </UButton>
      <UButton
        variant="ghost"
        icon="i-lucide-refresh-cw"
        @click="resetForm"
      >
        Descartar cambios
      </UButton>
      <div v-if="successMessage" class="flex items-center gap-2 text-green-600 text-sm">
        <Icon name="i-lucide-check" />
        {{ successMessage }}
      </div>
      <div v-if="validationErrors && Object.keys(validationErrors).length > 0" class="flex items-center gap-2 text-red-600 text-sm">
        <Icon name="i-lucide-alert-circle" />
        Hay {{ Object.keys(validationErrors).length }} error(es) en el formulario: {{ errorDetails.join('; ') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { SchemaField } from '~/composables/useSchemaValidator'
import { createZodSchemaFromFields } from '~/composables/useSchemaValidator'
import DynamicField from '~/components/Editor/DynamicField.vue'
import FieldList from '~/components/Editor/FieldList.vue'
import { z } from 'zod'

const props = defineProps<{
  schema: {
    meta?: SchemaField[]
    brand?: SchemaField[]
    navigation?: SchemaField
    sections?: Record<string, SchemaField[]>
    footer?: SchemaField[]
  }
  initialData: Record<string, any>
  onSave?: (data: Record<string, any>) => Promise<void>
}>()

const formState = reactive({ ...props.initialData })
const validationErrors = ref<Record<string, string[]> | null>(null)
const isSaving = ref(false)
const successMessage = ref('')

// Crear esquema de validación completo
const validationSchema = computed(() => {
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  if (props.schema.meta) {
    schemaFields.meta = createZodSchemaFromFields(props.schema.meta)
  }
  if (props.schema.brand) {
    schemaFields.brand = createZodSchemaFromFields(props.schema.brand)
  }
  if (props.schema.navigation) {
    const navFields = props.schema.navigation.fields || []
    schemaFields.navigation = z.array(createZodSchemaFromFields(navFields))
  }
  if (props.schema.sections) {
    const sectionSchemas: Record<string, z.ZodTypeAny> = {}
    Object.entries(props.schema.sections).forEach(([key, fields]) => {
      if (Array.isArray(fields)) {
        sectionSchemas[key] = createZodSchemaFromFields(fields)
      }
    })
    schemaFields.sections = z.object(sectionSchemas)
  }
  if (props.schema.footer) {
    schemaFields.footer = createZodSchemaFromFields(props.schema.footer)
  }

  return z.object(schemaFields)
})

const updateField = (path: string[], value: any): void => {
  if (path.length === 0) return

  let current: any = formState

  // Navegar hasta el penúltimo nivel
  for (let i = 0; i < path.length - 1; i++) {
    const key: string = path[i]!
    if (!(key in current)) {
      current[key] = {}
    }
    current = current[key] as Record<string, any>
  }

  // Establecer el valor en la última clave
  const lastKey: string = path[path.length - 1]!
  current[lastKey] = value
}

const getFieldError = (fieldPath: string): string | null => {
  if (!validationErrors.value) return null
  return validationErrors.value[fieldPath]?.[0] || null
}

const saveChanges = async () => {
  isSaving.value = true
  successMessage.value = ''
  validationErrors.value = null

  try {
    // Validar datos antes de guardar
    const result = await validationSchema.value.safeParseAsync(formState)

    if (!result.success) {
      // Mapear errores de Zod a formato de errores
      const errors: Record<string, string[]> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(issue.message)
      })
      validationErrors.value = errors

      // Mostrar mensaje de error
      successMessage.value = ''
      throw new Error('Por favor corrige los errores antes de guardar')
    }

    if (props.onSave) {
      await props.onSave(result.data)
      validationErrors.value = null
      successMessage.value = '¡Cambios guardados exitosamente!'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar'
    if (!validationErrors.value) {
      // Solo mostrar error genérico si no hay errores de validación
      console.error('Error guardando cambios:', error)
    }
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  Object.assign(formState, props.initialData)
  validationErrors.value = null
  successMessage.value = ''
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

// Genera descripciones legibles de los errores por campo
const errorDetails = computed(() => {
  if (!validationErrors.value) return [] as string[]

  const details: string[] = []

  const getLabelFromArray = (arr: SchemaField[] | undefined, id: string) => {
    const field = arr?.find(f => f.id === id)
    return field?.label ?? id
  }

  const describeNavigation = (segments: string[]) => {
    // navigation.<index>.<fieldId>
    const index = Number(segments[1])
    const fieldId = segments[2]
    const fieldLabel = getLabelFromArray(props.schema.navigation?.fields || [], fieldId!)
    return `Navegación → Ítem ${isNaN(index) ? '?' : index + 1} → ${fieldLabel}`
  }

  const describeSection = (segments: string[]) => {
    // sections.<sectionKey>.<fieldId | listId>.[index].<nestedFieldId>
    const sectionKey = segments[1]
    const sectionFields = props.schema.sections?.[sectionKey!]
    if (!Array.isArray(sectionFields)) return `Sección ${capitalize(sectionKey!)} → ${segments.slice(2).join('.')}`

    const first = segments[2]
    const second = segments[3]
    const third = segments[4]

    // Caso lista anidada: features.0.title
    const listField = sectionFields.find(f => f.id === first)
    if (listField?.type === 'list' && listField.fields && second !== undefined && third !== undefined) {
      const idx = Number(second)
      const nestedLabel = getLabelFromArray(listField.fields, third!)
      return `Sección ${capitalize(sectionKey!)} → ${listField.label} → Ítem ${isNaN(idx) ? '?' : idx + 1} → ${nestedLabel}`
    }

    // Campo simple
    const fieldLabel = getLabelFromArray(sectionFields, first!)
    return `Sección ${capitalize(sectionKey!)} → ${fieldLabel}`
  }

  Object.entries(validationErrors.value).forEach(([path]) => {
    const segments = path.split('.')
    const root = segments[0]

    if (root === 'meta') {
      const label = getLabelFromArray(props.schema.meta, segments[1]!)
      details.push(`Metadatos → ${label}`)
      return
    }

    if (root === 'brand') {
      const label = getLabelFromArray(props.schema.brand, segments[1]!)
      details.push(`Marca → ${label}`)
      return
    }

    if (root === 'footer') {
      const label = getLabelFromArray(props.schema.footer, segments[1]!)
      details.push(`Pie de página → ${label}`)
      return
    }

    if (root === 'navigation') {
      details.push(describeNavigation(segments))
      return
    }

    if (root === 'sections') {
      details.push(describeSection(segments))
      return
    }

    // Fallback
    details.push(path)
  })

  return details
})
</script>
