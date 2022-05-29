import { describe, expect, test, vi } from 'vitest'
import { fireEvent } from '@testing-library/dom'
import { VanillaVal } from '../src/vanilla-val'
import { ErrorMessages } from '../src/enums'
import { ValidationRule } from '../src/interfaces'

describe('VanillaVal', () => {
  /**
   * @vitest-environment jsdom
   */
  test('HTML form should correctly generate form rules on initialization', () => {
    const form = `
      <form>
        <input type="text" name="name" data-vval-rules="minLength:2|maxLength:10">
        <ul class="vval-name-errors"></ul>
        <input type="email" name="email" data-vval-rules="required|email">
        <ul class="vval-email-errors"></ul>
        <input type="number" name="age" data-vval-rules="min:13|max:100">
        <ul class="vval-age-errors"></ul>
        <button type="submit">Submit</button>
      </form>
    `
    const formRules = [
      {
        formField: 'name',
        value: '',
        rules: ['minLength:2', 'maxLength:10'],
      },
      {
        formField: 'email',
        value: '',
        rules: ['required', 'email'],
      },
      {
        formField: 'age',
        value: '',
        rules: ['min:13', 'max:100'],
      },
    ]
    document.body.innerHTML = form
    const val = new VanillaVal()
    expect(new VanillaVal()).toHaveProperty('_formRules', formRules)
  })

  test('Validation on Entry configuration should validate rule after input changes instead of only on form submit', () => {
    const form = `
      <form>
        <input type="text" name="name" data-vval-rules="required" />
        <ul class="vval-name-errors"></ul>
      </form>
    `
    document.body.innerHTML = form
    const val = new VanillaVal({
      htmlFormSelector: 'form',
      validateOnEntry: true,
    })
    const nameEl = document.querySelector('input[name="name"]')
    fireEvent.change(nameEl, { target: { value: '' } })
    const nameElErrors = document.querySelector('.vval-name-errors')
    expect(nameElErrors.innerHTML).toBeTruthy()
  })

  test('Get Error Message should return correct message from ErrorMessages Enum', () => {
    const message = new VanillaVal().getErrorMessage(
      'name',
      ErrorMessages.REQUIRED
    )
    expect(message).toEqual('name is required')
  })

  test('Required method should return false success with error message or true success if valid', () => {
    document.body.innerHTML = null
    const val = new VanillaVal()
    const formField = 'name'
    const message = `${formField} is required`
    expect(val.required(formField, null)).toEqual({ success: false, message })
    expect(val.required(formField, '')).toEqual({ success: false, message })
    expect(val.required(formField, ' ')).toEqual({ success: false, message })
    expect(val.required(formField, 'Grant')).toEqual({ success: true })
  })

  test('Email should return false success with error message or true success if valid', () => {
    const val = new VanillaVal()
    const formField = 'email'
    const message = `${formField} has incorrect format`
    expect(val.email(formField, 'name')).toEqual({ success: false, message })
    expect(val.email(formField, 'name@company')).toEqual({
      success: false,
      message,
    })
    expect(val.email(formField, 'name@company.co')).toEqual({ success: true })
  })

  test('Max Length should return false success with error message or true success if valid', () => {
    const val = new VanillaVal()
    const formField = 'name'
    const value = 'This is my text'
    const message = `${formField} is more than maximum length supplied`
    expect(val.maxLength(formField, value, 5)).toEqual({
      success: false,
      message,
    })
    expect(val.maxLength(formField, value, 10)).toEqual({
      success: false,
      message,
    })
    expect(val.maxLength(formField, value, 15)).toEqual({ success: true })
    expect(val.maxLength(formField, value, 50)).toEqual({ success: true })
  })

  test('Min Length should return false success with error message or true success if valid', () => {
    const val = new VanillaVal()
    const formField = 'name'
    const value = 'test'
    const message = `${formField} is less than minimum length supplied`
    expect(val.minLength(formField, value, 5)).toEqual({
      success: false,
      message,
    })
    expect(val.minLength(formField, value, 10)).toEqual({
      success: false,
      message,
    })
    expect(val.minLength(formField, value, 4)).toEqual({ success: true })
    expect(val.minLength(formField, value, 2)).toEqual({ success: true })
  })

  test('Max should return false success with error message or true success if valid', () => {
    const val = new VanillaVal()
    const formField = 'max'
    const message = `${formField} is more than maximum number supplied`
    expect(val.max(formField, 6, 5)).toEqual({ success: false, message })
    expect(val.max(formField, 15, 10)).toEqual({ success: false, message })
    expect(val.max(formField, 10, 10)).toEqual({ success: true })
    expect(val.max(formField, 10, 50)).toEqual({ success: true })
  })

  test('Min should return false success with error message or true success if valid', () => {
    const val = new VanillaVal()
    const key = 'min'
    const message = `${key} is less than minimum number supplied`
    expect(val.min(key, 4, 5)).toEqual({ success: false, message })
    expect(val.min(key, 9, 10)).toEqual({ success: false, message })
    expect(val.min(key, 3, 3)).toEqual({ success: true })
    expect(val.min(key, 3, 2)).toEqual({ success: true })
  })

  test('URL should return false success with error message or true success if valid', () => {
    const val = new VanillaVal()
    const formField = 'url'
    const message = `${formField} is not a valid url`
    expect(val.url(formField, 'https://localhost')).toEqual({
      success: false,
      message,
    })
    expect(val.url(formField, 'name')).toEqual({ success: false, message })
    expect(val.url(formField, 'www.google.com')).toEqual({ success: true })
    expect(val.url(formField, 'http://www.name.dev')).toEqual({ success: true })
  })

  test('Matches should return false success with error message or true success if valid', () => {
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    const val = new VanillaVal()
    const formField = 'phone'
    const message = `${formField} has incorrect format`
    expect(val.matches(formField, '123', phoneRegex)).toEqual({
      success: false,
      message,
    })
    expect(val.matches(formField, 'name', phoneRegex)).toEqual({
      success: false,
      message,
    })
    expect(val.matches(formField, '(123) 456-7890', phoneRegex)).toEqual({
      success: true,
    })
    expect(val.matches(formField, '123-456-7890', phoneRegex)).toEqual({
      success: true,
    })
  })

  test('Validate should work when matches is used in a form', () => {
    const form = `
      <form>
        <input type="number" name="my-num" data-vval-rules="matches:[3-9]\\d\\d" value="300" />
        <ul class="vval-my-num-errors"></ul>
        <input type="text" name="phone" data-vval-rules="matches:^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$" />
        <ul class="vval-phone-errors"></ul>
      </form>
    `
    document.body.innerHTML = form
    const val = new VanillaVal()
    expect(val.validate()).toBe(false)
    const phoneEl = document.querySelector('input[name="phone"]')
    fireEvent.change(phoneEl, { target: { value: '(123) 456-7890' } })
    expect(val.validate()).toBe(true)
  })

  test('An undefined rule validation method should return an error message', () => {
    const val = new VanillaVal()
    const method = 'if'
    expect(
      () =>
        val.validateRule({ formField: 'name', value: '', rules: ['if'] }).errors
    ).toThrowError(`Validation method (${method}) was not found`)
  })

  test("A form should add an empty array for rules on an element when generating the form rules on initialization and the 'data-vval-rules' attribute isn't found", () => {
    const form = `
      <form>
        <input type="text" name="name" />
      </form>
    `
    document.body.innerHTML = form

    const val = new VanillaVal()
    const formRules = [
      {
        formField: 'name',
        value: '',
        rules: [],
      },
    ]
    expect(val).toHaveProperty('_formRules', formRules)
  })

  test("A form with no rules attached will return true when calling 'validate'", () => {
    const form = `
      <form>
        <input type="text" name="name" />
      </form>
    `
    document.body.innerHTML = form

    const val = new VanillaVal()
    const formRules = [
      {
        formField: 'name',
        value: '',
        rules: [],
      },
    ]
    expect(val.validate()).toBe(true)
  })

  test('Select inputs validate/invalidate rules as expected', () => {
    const form = `
      <form>
        <select name="package" data-vval-rules="required">
          <option value="">Select a package</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
        </select>
        <ul class="vval-package-errors"></ul>
      </form>
    `
    document.body.innerHTML = form
    const val = new VanillaVal()
    expect(val.validate()).toBe(false)
    const packageEl = document.querySelector('select[name="package"]')
    fireEvent.change(packageEl, { target: { value: 'basic' } })
    expect(val.validate()).toBe(true)
    fireEvent.change(packageEl, { target: { value: '' } })
    expect(val.validate()).toBe(false)
  })

  test("Select inputs update error list on change when 'validateOnEntry' config is used", () => {
    const form = `
      <form>
        <select name="package" data-vval-rules="required">
          <option value="">Select a package</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
        </select>
        <ul class="vval-package-errors"></ul>
      </form>
    `
    document.body.innerHTML = form
    const val = new VanillaVal({
      htmlFormSelector: 'form',
      validateOnEntry: true,
    })
    const packageEl = document.querySelector('select[name="package"]')
    fireEvent.change(packageEl, { target: { value: 'basic' } })
    fireEvent.change(packageEl, { target: { value: '' } })
    const packageElErrors = document.querySelector('.vval-package-errors')
    expect(packageElErrors.innerHTML).toBeTruthy()
  })

  test('Rules for a form should be generated as expected when using an html form selector other than the default', () => {
    const form = `
      <form id="my-form">
        <input type="text" name="name" data-vval-rules="required" />
      </form>
    `
    document.body.innerHTML = form

    const val = new VanillaVal({
      htmlFormSelector: '#my-form',
      validateOnEntry: false,
    })
    const formRules = [
      {
        formField: 'name',
        value: '',
        rules: ['required'],
      },
    ]
    expect(val).toHaveProperty('_formRules', formRules)
  })

  test('Validate should return true if all inputs pass rule validation', () => {
    const form = `
      <form>
        <input type="text" name="name" data-vval-rules="minLength:2|maxLength:10">
        <ul class="vval-name-errors"></ul>
        <input type="email" name="email" data-vval-rules="required|email">
        <ul class="vval-email-errors"></ul>
        <input type="number" name="age" data-vval-rules="min:13|max:100">
        <ul class="vval-age-errors"></ul>
        <button type="submit">Submit</button>
      </form>
    `
    document.body.innerHTML = form
    const val = new VanillaVal()

    // Enter valid data
    const nameEl = document.querySelector('input[name="name"]')
    fireEvent.change(nameEl, { target: { value: 'Grant' } })
    const nameElErrors = document.querySelector('.vval-name-errors')
    expect(nameElErrors.innerHTML).toBeFalsy()

    const emailEl = document.querySelector('input[name="email"]')
    fireEvent.change(emailEl, { target: { value: 'grant@company.co' } })
    const emailElErrors = document.querySelector('.vval-email-errors')
    expect(emailElErrors.innerHTML).toBeFalsy()

    const ageEl = document.querySelector('input[name="age"]')
    fireEvent.change(ageEl, { target: { value: 29 } })
    const ageElErrors = document.querySelector('.vval-age-errors')
    expect(ageElErrors.innerHTML).toBeFalsy()

    // Click submit
    expect(val.validate()).toBe(true)
  })

  test("Validate should return false if even one input doesn't pass rule validation", () => {
    const form = `
      <form>
        <input type="text" name="url" data-vval-rules="url" />
        <ul class="vval-url-errors"></ul>
      </form>
    `
    document.body.innerHTML = form
    const val = new VanillaVal({
      htmlFormSelector: 'form',
      validateOnEntry: true,
    })

    expect(val.validate()).toBe(false)

    // Enter valid data
    const urlEl = document.querySelector('input[name="url"]')
    fireEvent.change(urlEl, { target: { value: 'G' } })
    const urlElErrors = document.querySelector('.vval-url-errors')
    expect(urlElErrors.innerHTML).toBeTruthy()

    // Click submit again
    expect(val.validate()).toBe(false)
  })

  test('Validate with no form rules configured should throw an error', () => {
    expect(() =>
      new VanillaVal({
        htmlFormSelector: null,
        validateOnEntry: false,
      }).validate()
    ).toThrowError(
      'No validation rules were set through the constructor; form cannot be validated'
    )
  })

  test("Validate should warn when the form doesn't have the appropriate ul element for form field errors", () => {
    const warn = vi.spyOn(globalThis.console, 'warn')
    const form = `
      <form>
        <input type="text" name="url" data-vval-rules="url" />
        <p class="vval-url-errors"></p>
      </form>
    `
    document.body.innerHTML = form
    const val = new VanillaVal({
      htmlFormSelector: 'form',
      validateOnEntry: true,
    })

    expect(val.validate()).toBe(false)

    // Enter valid data
    const urlEl = document.querySelector('input[name="url"]')
    fireEvent.change(urlEl, { target: { value: 'G' } })
    const urlElErrors = document.querySelector('.vval-url-errors')
    expect(urlElErrors.innerHTML).toBeFalsy()
    expect(warn).toHaveBeenCalled()
  })

  test('ValidateMinMaxValue method should handle a string being null or not a number', () => {
    // Test null
    document.body.innerHTML = `
      <form>
        <input name="age" data-vval-rules="min:" />
        <input name="age" data-vval-rules="min:two" />
        <input name="age" data-vval-rules="min:NaN" />
      </form>
    `
    expect(() => new VanillaVal().validate()).toThrowError(
      'No min/max value to check against was passed in'
    )

    // Test 'two'
    document.body.innerHTML = `
      <form>
        <input name="age" data-vval-rules="min:two" />
      </form>
    `
    expect(() => new VanillaVal().validate()).toThrowError(
      'The min/max value passed in is not a number'
    )

    // Test NaN
    document.body.innerHTML = `
      <form>
        <input name="age" data-vval-rules="min:NaN" />
      </form>
    `
    expect(() => new VanillaVal().validate()).toThrowError(
      'The min/max value passed in is not a number'
    )
  })

  /**
   * @vitest-environment node
   */
  test('Init method will allow for adding validation rules manually', () => {
    const formRules: ValidationRule[] = [
      {
        formField: 'name',
        value: 'Grant',
        rules: ['required', 'minLength:2', 'maxLength:20'],
      },
    ]
    const val = new VanillaVal()
    val.init(formRules)
    expect(val).toHaveProperty('_formRules', formRules)
    expect(val).toHaveProperty('_serverInitialized', true)
  })

  test('Validate method will work as expected when using the Init method', () => {
    const formRules: ValidationRule[] = [
      {
        formField: 'name',
        value: 'Grant',
        rules: ['required', 'minLength:2', 'maxLength:20'],
      },
    ]
    const val = new VanillaVal()
    val.init(formRules)
    expect(val.validate()).toBe(true)
    // Invalidate value
    formRules[0].value = 'G'
    val.init(formRules)
    expect(val.validate()).toBe(false)
  })
})
