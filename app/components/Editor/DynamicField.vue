<template>
  <component
    :is="getFieldComponent(field.type)"
    :field="field"
    :model-value="modelValue"
    :error="error"
    :errors="errors"
    :preview="preview"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import type { SchemaField } from '~/composables/useSchemaValidator'
import FieldString from '~/components/Editor/FieldString.vue'
import FieldTextRich from '~/components/Editor/FieldTextRich.vue'
import FieldNumber from '~/components/Editor/FieldNumber.vue'
import FieldSelect from '~/components/Editor/FieldSelect.vue'
import FieldUrl from '~/components/Editor/FieldUrl.vue'
import FieldImage from '~/components/Editor/FieldImage.vue'
import FieldList from '~/components/Editor/FieldList.vue'
import FieldMedia from '~/components/Editor/FieldMedia.vue'

const props = defineProps<{
  field: SchemaField
  modelValue: any
  error?: string | null
  errors?: Record<string, string[]> | null
  preview?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: any]
}>()

const getFieldComponent = (type: string) => {
  const components: Record<string, any> = {
    string: FieldString,
    text: FieldTextRich,
    number: FieldNumber,
    select: FieldSelect,
    url: FieldUrl,
    image: FieldImage,
    video: FieldImage,
    list: FieldList,
    media: FieldMedia
  }

  return components[type] || FieldString
}
</script>
