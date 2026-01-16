<template>
  <div class="space-y-4">
    <div ref="listContainer" class="space-y-3">
      <div
        v-for="(item, idx) in modelValue"
        :key="idx"
        :data-id="idx"
        class="border border-gray-300 rounded-lg p-4 space-y-3 bg-white cursor-move hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <Icon name="i-lucide-grip-vertical" class="text-gray-400 cursor-grab active:cursor-grabbing" />
            <h4 class="font-semibold text-sm">{{ field.label }} #{{ idx + 1 }}</h4>
          </div>
          <UButton
            color="error"
            variant="ghost"
            size="xs"
            icon="i-lucide-trash-2"
            @click="removeItem(idx)"
          />
        </div>

        <template v-if="field.fields">
          <div v-for="nestedField in field.fields" :key="nestedField.id" class="space-y-1">
            <label class="block text-sm font-medium">{{ nestedField.label }}</label>
            <DynamicField
              :field="nestedField"
              :model-value="item[nestedField.id]"
              :error="getNestedError(idx, nestedField.id)"
              @update:model-value="updateNestedField(idx, nestedField.id, $event)"
            />
          </div>
        </template>
      </div>
    </div>

    <UButton
      color="success"
      variant="soft"
      icon="i-lucide-plus"
      @click="addItem"
    >
      Agregar {{ field.label.toLowerCase() }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { SchemaField } from '~/composables/useSchemaValidator'
import DynamicField from '~/components/Editor/DynamicField.vue'
import Sortable from 'sortablejs'

const props = defineProps<{
  field: SchemaField
  modelValue: any[]
  errors?: Record<string, string[]> | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

const listContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  if (listContainer.value) {
    Sortable.create(listContainer.value, {
      animation: 150,
      handle: '.i-lucide-grip-vertical',
      ghostClass: 'opacity-50',
      dragClass: 'shadow-xl',
      onEnd: (event) => {
        const { oldIndex, newIndex } = event
        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
          const items = [...props.modelValue]
          const [movedItem] = items.splice(oldIndex, 1)
          items.splice(newIndex, 0, movedItem)
          emit('update:modelValue', items)
        }
      }
    })
  }
})

const addItem = () => {
  if (!props.field.fields) return

  const newItem: Record<string, any> = {}
  props.field.fields.forEach((f) => {
    newItem[f.id] = f.type === 'number' ? 0 : ''
  })
  emit('update:modelValue', [...props.modelValue, newItem])
}

const removeItem = (idx: number) => {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== idx))
}

const updateNestedField = (idx: number, fieldId: string, value: any) => {
  const updated = [...props.modelValue]
  updated[idx][fieldId] = value
  emit('update:modelValue', updated)
}

const getNestedError = (idx: number, fieldId: string) => {
  if (!props.errors) return null
  const key = `${idx}.${fieldId}`
  return props.errors[key]?.[0] || null
}
</script>
