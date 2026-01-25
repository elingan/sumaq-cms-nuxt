import { ref } from 'vue'
import type { SchemaSection } from '~/composables/useSchemaValidator'
import schemaYaml from '~/assets/cms/page.yaml?raw'
import yaml from 'js-yaml'

export const usePageSchema = () => {
  const schema = ref<Record<string, SchemaSection>>({})

  const loadSchema = async () => {
    try {
      // Parsear el esquema YAML
      const schemaData = yaml.load(schemaYaml) as Record<string, SchemaSection>

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
