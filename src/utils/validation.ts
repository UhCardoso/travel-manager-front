import * as yup from 'yup'

// User login validation schema
export const userLoginSchema = yup.object({
  email: yup.string().required('Email é obrigatório').email('Digite um email válido').trim(),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .trim(),
})

// Admin login validation schema
export const adminLoginSchema = yup.object({
  email: yup
    .string()
    .required('Email administrativo é obrigatório')
    .email('Digite um email válido')
    .trim(),
  password: yup
    .string()
    .required('Senha administrativa é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .trim(),
})

// Inferred types from schemas
export type UserLoginForm = yup.InferType<typeof userLoginSchema>
export type AdminLoginForm = yup.InferType<typeof adminLoginSchema>

// Utility function to validate forms
export const validateForm = async <T>(
  schema: yup.ObjectSchema<any, any, any>,
  data: T
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(data, { abortEarly: false })
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {}
      error.inner.forEach(err => {
        if (err.path) {
          errors[err.path] = err.message
        }
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { general: 'Erro de validação' } }
  }
}
