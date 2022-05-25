import {
  ValidateRuleResponse,
  ValidationRule,
  ValidatedResponse,
  VanillaValConfig,
} from './interfaces'
import { MethodNames, ErrorMessages } from './enums'

export class VanillaVal {
  private _form: Element | null = null
  private _formRules: ValidationRule[] = []
  private _config: VanillaValConfig = {
    htmlFormSelector: 'form',
    validateOnEntry: false,
  }
  private _serverInitialized: boolean = false

  /**
   * Constructor for VanillaVal class
   * @constructor
   * @param userConfig - configuration object passed in from the user
   */
  constructor(
    userConfig: VanillaValConfig = {
      htmlFormSelector: 'form',
      validateOnEntry: false,
    }
  ) {
    const { _config: config } = this
    this._config = {
      ...config,
      ...userConfig,
    }

    const { htmlFormSelector, validateOnEntry } = this._config
    let form: Element | null = null
    if (htmlFormSelector) {
      form = document.querySelector(htmlFormSelector)
    }

    if (form) {
      this._form = form
      this._formRules = this.generateFormRules(form)
    }
    this.initializeValueBinding(validateOnEntry)
  }

  /**
   * Generates validation rules from the form element passed in from the user
   * @param form - form that was found using the htmlFormSelector from the config
   * @returns a list of validation rules
   */
  private generateFormRules(form: Element): ValidationRule[] {
    let formRules: ValidationRule[] = []
    const formData = new FormData(form as HTMLFormElement)
    const formObj = Object.fromEntries(formData.entries())
    for (const formField in formObj) {
      const rulesStr = form
        .querySelector(`[name=${formField}]`)
        ?.getAttribute('data-vval-rules')
      const rulesArr = rulesStr?.split('|')
      formRules.push({
        formField: formField,
        value: formObj[formField],
        rules: rulesArr ?? [],
      })
    }
    return formRules
  }

  /**
   * Adds form input value to validation rule binding so that validation rules update based on user input
   * @param validateOnEntry - determines whether the form should show validation errors on input change; passed in from the config
   */
  private initializeValueBinding(validateOnEntry: boolean) {
    this._formRules.forEach((rule) => {
      const ruleEl = this._form?.querySelector(`input[name="${rule.formField}"`)
      ruleEl?.addEventListener('change', () => {
        const updatedValue = (ruleEl as HTMLInputElement).value
        rule.value = updatedValue
        if (validateOnEntry) this.validateRule(rule)
      })
    })
  }

  /**
   * A method to initialize the VanillaVal class with form rules instead of relying on an HTML form
   * @param formRules list of validation rules to be initialized with
   */
  public init(formRules: ValidationRule[]): void {
    this._formRules = formRules
    this._serverInitialized = true
  }

  /**
   * Retrieves specific error message for a validation rule
   * @param formField input element's name attribute used to generate a specific error message
   * @param errorMessage error message related to the rule being validated
   * @returns error message specific to input element's name and validation rule
   */
  public getErrorMessage(
    formField: string,
    errorMessage: ErrorMessages
  ): string {
    const message: string = errorMessage.replace('[FORM_FIELD]', formField)
    return message
  }

  /**
   * Validates if form field has a value
   * @param formField input element's name attribute
   * @param value value of input element
   * @returns an object with a success value and an error message if unsuccessful
   */
  public required(formField: string, value: any): ValidatedResponse {
    if (typeof value === 'string') {
      value = value.trim()
    }

    if (!value) {
      return {
        success: false,
        message: this.getErrorMessage(formField, ErrorMessages.REQUIRED),
      }
    }

    return { success: true }
  }

  /**
   * Validates if form field has a valid email address
   * @param formField input element's name attribute
   * @param value value of input element
   * @returns an object with a success value and an error message if unsuccessful
   */
  public email(formField: string, value: string): ValidatedResponse {
    const rgx: RegExp =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (rgx.test(value)) {
      return { success: true }
    } else {
      return {
        success: false,
        message: this.getErrorMessage(formField, ErrorMessages.EMAIL),
      }
    }
  }

  /**
   * Validates if form field's length is greater than the maximum length allowed
   * @param formField input element's name attribute
   * @param value value of input element
   * @param length maximum length value
   * @returns an object with a success value and an error message if unsuccessful
   */
  public maxLength(
    formField: string,
    value: string,
    length: number
  ): ValidatedResponse {
    if (value.length > length)
      return {
        success: false,
        message: this.getErrorMessage(formField, ErrorMessages.MAX_LENGTH),
      }

    return { success: true }
  }

  /**
   * Validates if form field's length is less than the minimum length allowed
   * @param formField input element's name attribute
   * @param value value of input element
   * @param length minimum length value
   * @returns an object with a success value and an error message if unsuccessful
   */
  public minLength(
    formField: string,
    value: string,
    length: number
  ): ValidatedResponse {
    if (value?.length < length)
      return {
        success: false,
        message: this.getErrorMessage(formField, ErrorMessages.MIN_LENGTH),
      }

    return { success: true }
  }

  /**
   * Validates if form field's value is greater than the maximum value allowed
   * @param formField input element's name attribute
   * @param value value of input element
   * @param max maximum value
   * @returns an object with a success value and an error message if unsuccessful
   */
  public max(formField: string, value: number, max: number): ValidatedResponse {
    if (value > max)
      return {
        success: false,
        message: this.getErrorMessage(formField, ErrorMessages.MAX),
      }

    return { success: true }
  }

  /**
   * Validates if form field's value is less than the minimum value allowed
   * @param formField input element's name attribute
   * @param value value of input element
   * @param min minimum value
   * @returns an object with a success value and an error message if unsuccessful
   */
  public min(formField: string, value: number, min: number): ValidatedResponse {
    if (value < min)
      return {
        success: false,
        message: this.getErrorMessage(formField, ErrorMessages.MIN),
      }

    return { success: true }
  }

  /**
   * Validates if form field has a valid url
   * @param formField input element's name attribute
   * @param value value of input element
   * @returns an object with a success value and an error message if unsuccessful
   */
  public url(formField: string, value: string): ValidatedResponse {
    let regex: RegExp =
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

    if (regex.test(String(value).toLowerCase())) return { success: true }
    return {
      success: false,
      message: this.getErrorMessage(formField, ErrorMessages.URL),
    }
  }

  /**
   * Validates a validation rule
   * @param validationRule validation rule to be validated
   * @returns the form field name and errors found in validation if any
   */
  public validateRule(validationRule: ValidationRule): ValidateRuleResponse {
    let errorsForRule: string[] = []
    validationRule.rules.forEach((r) => {
      let validationResponse: ValidatedResponse = { success: true }
      const [method, length] = r.split(':')
      switch (method) {
        case MethodNames.REQUIRED:
          validationResponse = this.required(
            validationRule.formField,
            validationRule.value
          )
          break
        case MethodNames.EMAIL:
          validationResponse = this.email(
            validationRule.formField,
            validationRule.value.toString()
          )
          break
        case MethodNames.MAX_LENGTH:
          validationResponse = this.maxLength(
            validationRule.formField,
            validationRule.value.toString(),
            Number(this.validateMinMaxValue(length))
          )
          break
        case MethodNames.MIN_LENGTH:
          validationResponse = this.minLength(
            validationRule.formField,
            validationRule.value.toString(),
            Number(this.validateMinMaxValue(length))
          )
          break
        case MethodNames.MAX:
          validationResponse = this.max(
            validationRule.formField,
            Number(validationRule.value),
            Number(this.validateMinMaxValue(length))
          )
          break
        case MethodNames.MIN:
          validationResponse = this.min(
            validationRule.formField,
            Number(validationRule.value),
            Number(this.validateMinMaxValue(length))
          )
          break
        case MethodNames.URL:
          validationResponse = this.url(
            validationRule.formField,
            validationRule.value
          )
          break
        default:
          throw new Error(`Validation method (${method}) was not found`)
      }
      if (!validationResponse.success)
        errorsForRule.push(validationResponse.message!)
    })
    const formField = validationRule['formField']
    if (!this._serverInitialized) {
      const errorList = document.querySelector(`ul.vval-${formField}-errors`)
      if (errorList) {
        errorList.innerHTML = ''
        errorsForRule.forEach((error) => {
          var li = document.createElement('li')
          li.appendChild(document.createTextNode(error))
          errorList.appendChild(li)
        })
      } else
        console.warn(
          `Form input ${formField} does not have an error list ul element with the class name of 'vval-${formField}-errors'`
        )
    }
    return { formField, errors: errorsForRule }
  }

  /**
   * Validates all rules generated for the form
   * @returns whether validation for all rules passed or not
   */
  public validate(): boolean {
    let errors: ValidateRuleResponse[] = []
    if (this._formRules.length === 0)
      throw new Error(
        'No validation rules were set through the constructor; form cannot be validated'
      )

    this._formRules.forEach((rule) => {
      const errorsForRule: ValidateRuleResponse = this.validateRule(rule)
      if (errorsForRule.errors.length > 0) {
        errors.push(errorsForRule)
      }
    })

    return errors.length == 0
  }

  /**
   * Validates the minimum or maximum value to check against passed in from the related min/max/minLength/maxLength rules
   * @param minMax minimum or maximum value passed in via a rule
   * @returns the validated minimum or maximum value
   */
  private validateMinMaxValue(minMax: string): number {
    if (!minMax)
      throw new Error('No min/max value to check against was passed in')

    let minMaxValue = Number(minMax)
    if (Number.isNaN(minMaxValue))
      throw new Error('The min/max value passed in is not a number')

    return minMaxValue
  }
}
