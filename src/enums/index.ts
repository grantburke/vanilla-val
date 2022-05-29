export enum MethodNames {
  REQUIRED = 'required',
  EMAIL = 'email',
  MAX_LENGTH = 'maxLength',
  MIN_LENGTH = 'minLength',
  MAX = 'max',
  MIN = 'min',
  URL = 'url',
  MATCHES = 'matches',
}

export enum ErrorMessages {
  REQUIRED = '[FORM_FIELD] is required',
  EMAIL = '[FORM_FIELD] has incorrect format',
  MAX_LENGTH = '[FORM_FIELD] is more than maximum length supplied',
  MIN_LENGTH = '[FORM_FIELD] is less than minimum length supplied',
  MAX = '[FORM_FIELD] is more than maximum number supplied',
  MIN = '[FORM_FIELD] is less than minimum number supplied',
  URL = '[FORM_FIELD] is not a valid url',
  MATCHES = '[FORM_FIELD] has incorrect format',
}
