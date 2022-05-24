export interface ValidationRule {
  formField: string
  value: any
  rules: string[]
}

export interface ValidateRuleResponse {
  formField: string
  errors: string[]
}

export interface ValidatedResponse {
  success: boolean
  message?: string
}

export interface VanillaValConfig {
  htmlFormSelector: string
  validateOnEntry: boolean
}
