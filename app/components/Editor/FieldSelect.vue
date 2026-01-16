<template>
  <div>
    <USelect
      :model-value="modelValue"
      :options="options"
      :placeholder="`Selecciona ${field.label.toLowerCase()}`"
      :error="!!error"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { SchemaField } from '~/composables/useSchemaValidator'

const props = defineProps<{
  field: SchemaField
  modelValue: any
  error?: string | null
}>()

const options = computed(() => {
  return (props.field.options || []).map(opt => ({
    label: opt,
    value: opt
  }))
})

defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>
