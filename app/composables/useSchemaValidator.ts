import { z } from 'zod'

export interface SchemaField {
  id: string
  label: string
  type: string
  options?: string[]
  fields?: SchemaField[]
  [key: string]: any
}

export interface SchemaSection {
  [key: string]: SchemaField[] | { id: string; label: string; type: string; fields?: SchemaField[] }
}

/**
 * Convierte un tipo de esquema YAML a un esquema Zod
 */
function fieldTypeToZod(field: SchemaField): z.ZodTypeAny {
  switch (field.type) {
    case 'string':
      return z.string().min(1, `${field.label} es requerido`)

    case 'text':
      return z.string().min(1, `${field.label} es requerido`)

    case 'number':
      return z.number().or(z.string().transform(Number))

    case 'url': {
      const isUrlOrRelativeAnchor = (value: string) => {
        if (typeof value !== 'string' || value.trim().length === 0) return false
        const v = value.trim()
        if (v.startsWith('#')) return true
        if (v.startsWith('/') || v.startsWith('./') || v.startsWith('../')) return true
        try {
          const u = new URL(v)
          return u.protocol === 'http:' || u.protocol === 'https:'
        } catch {
          // Aceptar rutas relativas simples como "about" o "blog/post"
          return /^[a-zA-Z0-9][a-zA-Z0-9\-._~\/]*$/.test(v)
        }
      }

      return z
        .string()
        .min(1, `${field.label} es requerido`)
        .refine(isUrlOrRelativeAnchor, `${field.label} debe ser una URL válida (http(s), relativa o ancla #) `)
    }

    case 'image':
      return z.string().url(`${field.label} debe ser una URL de imagen válida`)

    case 'select':
      if (field.options?.length) {
        return z.enum(field.options as [string, ...string[]])
      }
      return z.string()

    case 'list': {
      // Lista con campos anidados
      if (field.fields?.length) {
        const nestedSchema = z.object(
          field.fields.reduce((acc, nestedField) => {
            acc[nestedField.id] = fieldTypeToZod(nestedField)
            return acc
          }, {} as Record<string, z.ZodTypeAny>)
        )
        return z.array(nestedSchema)
      }
      return z.array(z.any())
    }

    case 'media': {
      // Media object con tipo (image/video) y campos anidados
      if (field.fields?.length) {
        const mediaSchema = z.object(
          field.fields.reduce((acc, mediaField) => {
            acc[mediaField.id] = fieldTypeToZod(mediaField)
            return acc
          }, {} as Record<string, z.ZodTypeAny>)
        )
        return mediaSchema
      }
      return z.object({ type: z.string(), link: z.string().url() })
    }

    default:
      return z.string()
  }
}

/**
 * Crea un esquema Zod a partir de la estructura del YAML
 */
export function createZodSchemaFromFields(fields: SchemaField[]): z.ZodTypeAny {
  const schemaObj = fields.reduce((acc, field) => {
    acc[field.id] = fieldTypeToZod(field)
    return acc
  }, {} as Record<string, z.ZodTypeAny>)

  return z.object(schemaObj)
}

/**
 * Composable para validar datos usando esquema dinámico
 */
export const useSchemaValidator = (schema: SchemaField[] | z.ZodTypeAny) => {
  let zodSchema: z.ZodTypeAny

  // Convertir schema a Zod si es necesario
  if (Array.isArray(schema)) {
    zodSchema = createZodSchemaFromFields(schema)
  } else {
    // Si es un objeto, asumir que ya es un esquema Zod
    zodSchema = schema as z.ZodTypeAny
  }

  const validate = async (data: any) => {
    try {
      const result = await zodSchema.parseAsync(data)
      return { success: true, data: result, errors: null }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as any
        const errors: Record<string, string[]> = {}
        zodError.issues?.forEach((issue: any) => {
          const path = issue.path.join('.')
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(issue.message)
        })
        return { success: false, data: null, errors }
      }
      return { success: false, data: null, errors: { general: ['Error desconocido'] } }
    }
  }

  const getFieldError = (fieldPath: string, errors: Record<string, string[]> | null) => {
    if (!errors) return null
    return errors[fieldPath]?.[0] || null
  }

  return {
    validate,
    getFieldError,
    schema: zodSchema
  }
}
