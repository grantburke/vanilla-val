# VanillaVal 🍦

This a project for making form validation simple. I created this to have a small, no-dependency option for frontend form validation. I plan to update this package with more rules and features as needed - PRs are welcome!

## How to Use ⌨️

Create a good ole HTML form and give your inputs their respectful names. You can add rules by utilizing a `data-vval-rules` attribute on the input element like so. Rules are separated by a `|` and parameters for certain rules are by a `:`. You can find a list of current form rules and how to use them down [below](#current-rules-and-how-to-use-them).

```html
<form id="form" action="/">
  <input type="text" name="first" data-vval-rules="minLength:2|maxLength:20" />
  <button id="submit-btn" type="submit">Submit</button>
</form>
```

Add a script tag to your HTML.

```javascript
<script src="https://unpkg.com/@grantburke/vanilla-val@1.x.x/dist/vanilla-val.umd.js"></script>
```

### Steps for Validation

- Grab your form.
- Add a `submit` event listener to the form and prevent the default event.
- Instantiate the `VanillaVal` class and call `validate` to verify all validation passes. The `validate` method will return true or false based on whether validation was successful or not.
- Configuration options are listed [below](#configuration-object)

```html
<script>
  const form = document.getElementById('form')
  form.addEventListener('submit', onSubmit)
  // Default configuration looks for the 'form' selector and can be overridden by passing in a config
  const val = new VanillaVal()

  // Methods
  function onSubmit(e) {
    e.preventDefault()
    const validated = val.validate()

    // Explicitly check true
    if (validated === true) {
      form.submit()
      return
    }

    console.log(validated)
  }
</script>
```

You can also instantiate the class to use rule validation methods individually like so:

```javascript
const val = new VanillaVal()
val.max('age', 29, 30) // returns { success: true }
```

- Note: the validate method will not work if no form element is present or found with the selector in the configuration object.

### Use In Node

This package supports both ESM and UMD. You will need to initialize the `VanillaVal` class with a configuration object of `{ htmlFormSelector: null, validateOnEntry: false }` to prevent any errors related to calling the DOM on the server. You can call the `init` method and pass in a list of form rules. This will allow for the usage of the `validate` method like usual. A demo can be found <a href="https://codepen.io/grant_s_burke/pen/vYdZWpm" target="_blank">here</a>.

```javascript
// ESM
import VanillaVal from '@grantburke/vanilla-val'
// UMD
const VanillaVal = require('@grantburke/vanilla-val')

const val = new VanillaVal({ htmlFormSelector: null, validateOnEntry: false })
const formRules = [
  {
    formField: 'name',
    value: 'Grant',
    rules: ['required'],
  },
]
val.init(formRules)
```

### Configuration Object

```javascript
// Default config object:
{ htmlFormSelector: 'form', validateOnEntry: false }
```

```javascript
// You can override these values for your own form id or class selector and pass in true if you would like the form to validate/show errors on input value changes
{ htmlFormSelector: '#my-form', validateOnEntry: true }
```

## Current Rules and How To Use Them 📜

There are currently seven rules. They are listed below with an example:

- `'required'` - validates if the value is not null and not empty
- `'email'` - validates if the value is a valid email address
- `'url'` - validates if the value is a valid url
- `'maxLength:n'` - validates the max length of a string by passing in the length for `n` after a colon; ex. `'maxLength:10'`
- `'minLength:n'` - validates the min length of a string by passing in the length for `n` after a colon; ex. `'minLength:10'`
- `'max:n'` - validates the max value of a number by passing in the value for `n` after a colon; ex. `'max:10'`
- `'min:n'` - validates the min value of a number by passing in the value for `n` after a colon; ex. `'min:10'`

You can pass in multiple rules for one value in your `data-vval-rules` attribute as seen [above](#how-to-use).

## TODO 📝

- Add `matches` method for regex
- Add `password` and `passwordConfirmation` methods?
- Add configuration for custom error messages?

## Contribution 👨🏻‍💻

- Clone the repo locally.
- Run `npm install` and `npm run dev` - then you should be good to go!
- I usually try to follow TDD.

## Testing 🧪

- This project was built in TypeScript and uses Vite/Vitest to build/test.
- The test commands are in the `package.json`.
