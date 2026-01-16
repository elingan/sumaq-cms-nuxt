<template>
  <div class="space-y-2">
    <UEditor
      :model-value="modelValue"
      content-type="html"
      :placeholder="`Escribe ${field.label.toLowerCase()}...`"
      class="min-h-64 border border-gray-300 rounded-lg"
    >
      <template #default="{ editor }">
        <UEditorToolbar
          v-if="editor"
          :editor="editor"
          :items="toolbarItems"
          class="border-b border-gray-300"
        />
      </template>
    </UEditor>
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import type { SchemaField } from '~/composables/useSchemaValidator'

defineProps<{
  field: SchemaField
  modelValue: any
  error?: string | null
}>()

defineEmits<{
  'update:modelValue': [value: any]
}>()

const toolbarItems: EditorToolbarItem[][] = [
  [
    {
      icon: 'i-lucide-heading',
      tooltip: { text: 'Headings' },
      content: {
        align: 'start'
      },
      items: [
        {
          kind: 'heading',
          level: 1,
          icon: 'i-lucide-heading-1',
          label: 'Heading 1'
        },
        {
          kind: 'heading',
          level: 2,
          icon: 'i-lucide-heading-2',
          label: 'Heading 2'
        },
        {
          kind: 'heading',
          level: 3,
          icon: 'i-lucide-heading-3',
          label: 'Heading 3'
        }
      ]
    }
  ],
  [
    {
      kind: 'mark',
      mark: 'bold',
      icon: 'i-lucide-bold',
      tooltip: { text: 'Bold' }
    },
    {
      kind: 'mark',
      mark: 'italic',
      icon: 'i-lucide-italic',
      tooltip: { text: 'Italic' }
    },
    {
      kind: 'mark',
      mark: 'underline',
      icon: 'i-lucide-underline',
      tooltip: { text: 'Underline' }
    },
    {
      kind: 'mark',
      mark: 'strike',
      icon: 'i-lucide-strikethrough',
      tooltip: { text: 'Strikethrough' }
    }
  ],
  [
    {
      kind: 'bulletList',
      icon: 'i-lucide-list',
      tooltip: { text: 'Bullet List' }
    },
    {
      kind: 'orderedList',
      icon: 'i-lucide-list-ordered',
      tooltip: { text: 'Ordered List' }
    }
  ],
  [
    {
      kind: 'link',
      icon: 'i-lucide-link',
      tooltip: { text: 'Link' }
    }
  ]
]
</script>
