<template>
  <div class="space-y-2">
    <UEditor
      :model-value="modelValue"
      content-type="html"
      :placeholder="`Escribe ${field.label.toLowerCase()}... (Presiona / para comandos rápidos)`"
      class="min-h-64 border border-gray-300 rounded-lg"
      :extensions="editorExtensions"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #default="{ editor }">
        <div class="border-b border-gray-300">
          <UEditorToolbar
            v-if="editor"
            :editor="editor"
            :items="toolbarItems"
          />
          <!-- Custom alignment toolbar -->
          <div v-if="editor" class="flex gap-1 p-2 border-t border-gray-200">
            <UButton
              size="xs"
              variant="ghost"
              icon="i-lucide-align-left"
              :color="editor.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'"
              @click="editor.chain().focus().setTextAlign('left').run()"
            />
            <UButton
              size="xs"
              variant="ghost"
              icon="i-lucide-align-center"
              :color="editor.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'"
              @click="editor.chain().focus().setTextAlign('center').run()"
            />
            <UButton
              size="xs"
              variant="ghost"
              icon="i-lucide-align-right"
              :color="editor.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'"
              @click="editor.chain().focus().setTextAlign('right').run()"
            />
            <UButton
              size="xs"
              variant="ghost"
              icon="i-lucide-align-justify"
              :color="editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'neutral'"
              @click="editor.chain().focus().setTextAlign('justify').run()"
            />
          </div>
        </div>
      </template>
    </UEditor>
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import type { SchemaField } from '~/composables/useSchemaValidator'
import { TextAlign } from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Image } from '@tiptap/extension-image'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Placeholder } from '@tiptap/extension-placeholder'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'

defineProps<{
  field: SchemaField
  modelValue: any
  error?: string | null
}>()

defineEmits<{
  'update:modelValue': [value: any]
}>()

// TipTap extensions configuration
const editorExtensions = [
  TextAlign.configure({
    types: ['heading', 'paragraph']
  }),
  Table.configure({
    resizable: true
  }),
  TableRow,
  TableCell,
  TableHeader,
  Image.configure({
    inline: true,
    allowBase64: true,
    HTMLAttributes: {
      class: 'max-w-full h-auto rounded'
    }
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: 'bg-gray-100 rounded p-4 font-mono text-sm'
    }
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-gray-300 pl-4 italic'
    }
  }),
  HorizontalRule,
  Placeholder.configure({
    placeholder: 'Escribe algo o presiona / para ver comandos...'
  })
]

const toolbarItems: EditorToolbarItem[][] = [
  [
    {
      icon: 'i-lucide-heading',
      tooltip: { text: 'Títulos' },
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
        },
        {
          kind: 'paragraph',
          icon: 'i-lucide-pilcrow',
          label: 'Paragraph'
        }
      ]
    }
  ],
  [
    {
      kind: 'mark',
      mark: 'bold',
      icon: 'i-lucide-bold',
      tooltip: { text: 'Negrita' }
    },
    {
      kind: 'mark',
      mark: 'italic',
      icon: 'i-lucide-italic',
      tooltip: { text: 'Cursiva' }
    },
    {
      kind: 'mark',
      mark: 'underline',
      icon: 'i-lucide-underline',
      tooltip: { text: 'Subrayado' }
    },
    {
      kind: 'mark',
      mark: 'strike',
      icon: 'i-lucide-strikethrough',
      tooltip: { text: 'Tachado' }
    },
    {
      kind: 'mark',
      mark: 'code',
      icon: 'i-lucide-code',
      tooltip: { text: 'Código' }
    }
  ],
  [
    {
      kind: 'bulletList',
      icon: 'i-lucide-list',
      tooltip: { text: 'Lista con viñetas' }
    },
    {
      kind: 'orderedList',
      icon: 'i-lucide-list-ordered',
      tooltip: { text: 'Lista numerada' }
    },
    {
      kind: 'blockquote',
      icon: 'i-lucide-quote',
      tooltip: { text: 'Cita' }
    },
    {
      kind: 'codeBlock',
      icon: 'i-lucide-code-xml',
      tooltip: { text: 'Bloque de código' }
    }
  ],
  [
    {
      kind: 'table',
      icon: 'i-lucide-table',
      tooltip: { text: 'Tabla' }
    },
    {
      kind: 'image',
      icon: 'i-lucide-image',
      tooltip: { text: 'Imagen' }
    },
    {
      kind: 'link',
      icon: 'i-lucide-link',
      tooltip: { text: 'Enlace' }
    },
    {
      kind: 'horizontalRule',
      icon: 'i-lucide-minus',
      tooltip: { text: 'Línea horizontal' }
    }
  ]
] as EditorToolbarItem[][]
</script>
