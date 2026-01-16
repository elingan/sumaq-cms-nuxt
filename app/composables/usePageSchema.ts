import { ref } from 'vue'
import type { SchemaField } from '~/composables/useSchemaValidator'
import schemaYaml from '~/assets/data/page.yaml?raw'
import yaml from 'js-yaml'

export const usePageSchema = () => {
  const schema = ref<{
    meta?: SchemaField[]
    brand?: SchemaField[]
    navigation?: SchemaField
    sections?: Record<string, any>
    footer?: SchemaField[]
  }>({})

  const loadSchema = async () => {
    try {
      // Parsear el esquema YAML
      const schemaData = yaml.load(schemaYaml) as any

      Object.assign(schema.value, schemaData)
      return schema.value
    } catch (error) {
      console.error('Error loading schema:', error)
      throw error
    }
  }

  return {
    schema,
    loadSchema
  }
}
