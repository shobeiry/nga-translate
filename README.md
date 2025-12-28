# ngaTranslate

**A wrapper for ngx-translate library that supports default and prefixed translations.**

[![npm version](https://badge.fury.io/js/nga-translate.svg)](http://badge.fury.io/js/nga-translate)
[![GitHub issues](https://img.shields.io/github/issues/mehrabisajad/nga-translate.svg)](https://github.com/mehrabisajad/nga-translate/issues)
[![GitHub stars](https://img.shields.io/github/stars/mehrabisajad/nga-translate.svg)](https://github.com/mehrabisajad/nga-translate/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mehrabisajad/nga-translate/master/LICENSE)

**ngaTranslate** is an Angular library that provides pipes and directives to simplify text translation in Angular applications.  
It is a wrapper for the popular **ngx-translate** library and adds useful features such as **default translations** and **prefix-based translations**.

---

## Compatibility

- Angular: 17–20
- ngx-translate: 17.x

---

## Installation

To install ngaTranslate, run the following command in your terminal:

```bash
npm install nga-translate --save
```

---

## Getting Started

Make sure ngx-translate is [configured](https://ngx-translate.org/reference/configuration/) in your app (examples below are minimal).

```ts
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/' }),
      fallbackLang: 'en',
      lang: 'fa',
    }),
  ],
};
```

---

## Usage

### 1. Pipe

The `ngaTranslate` pipe can be used to translate text inside Angular templates.  
It accepts up to three arguments:

- **Translation key**
- **Default translation** (string or object, used if key is not found)
- **Params** (object, for dynamic values)

If the default translation is an object and it does not contain the current language, the first available value will be used.

Supported signatures:

- `{{ 'key' | ngaTranslate }}`
- `{{ 'key' | ngaTranslate : 'default' }}`
- `{{ 'key' | ngaTranslate : { en: 'Hello', fa: 'سلام' } }}`
- `{{ { en: 'default' } | ngaTranslate }}`

#### Examples

```html
{{ 'key' | ngaTranslate }} {{ 'key' | ngaTranslate : 'default translate' }} {{ 'key' | ngaTranslate : 'default translate' : { p1: 'value'
}}} {{ 'key' | ngaTranslate : 'default translate [{ p1 }]' : { p1: 'value' } }} {{ 'key' | ngaTranslate : { en: 'Hello [{ p1 }]', fr:
'Bonjour [{ p1 }]' } : { p1: 'value' } }}
```

You can also use the pipe with only default values (without an explicit key):

```html
{{ { en: 'default translate' } | ngaTranslate }} {{ { en: 'default translate [{ p1 }]' } | ngaTranslate : { p1: 'value' } }} {{ { en:
'default [{ p1 }]', fr: 'par défaut [{ p1 }]' } | ngaTranslate : { p1: 'value' } }}
```

You can pass params as a string in templates:

```html
{{ 'key' | ngaTranslate : 'default' : "{ p1: 'value' }" }}
```

---

### 2. Directive

The `ngaTranslate` directive can be used directly on elements.  
It supports both a **translation key** and the element’s content (as default translation).

If the default translation is an object and it does not contain the current language, the first available value will be used.

Inputs:

- `ngaTranslate`: translation key (optional)
- `translateValues`: params object

#### Examples

```html
<p ngaTranslate>Hello, world!</p>
<p ngaTranslate="key">Hello, world!</p>
<p ngaTranslate="key" [translateValues]="{ p1: 'value' }">Hello, [{ p1 }]</p>
<p ngaTranslate="key" [translateValues]="{ p1: 'value' }">&lcub; en: 'Hello, [&lcub; p1 }]', fr: 'Bonjour, [&lcub; p1 }]' }</p>
```

---

### 3. Prefix Directive

The `ngaTranslatePrefix` directive allows you to define a translation **prefix** for all child elements.  
This is useful for grouping translations under a common namespace.

#### Examples

```html
<div ngaTranslatePrefix="prefix">
  <label ngaTranslate="df.bank">Bank</label>
  <!-- Translates using key: prefix.df.bank -->

  <button>{{ 'submit' | ngaTranslate : 'Submit' }}</button>
  <!-- Translates using key: prefix.submit -->

  <button>{{ '.root.submit' | ngaTranslate : 'Root Submit' }}</button>
  <!-- Translates using key: root.submit (ignores prefix) -->
</div>
```

#### Note:

If the key starts with a dot (.), the prefix will be ignored, and the translation will resolve from the root namespace.

---

## Features

1. **Simplified syntax** – Easier and cleaner than raw ngx-translate usage.
2. **Default translations** – Specify fallbacks when keys are missing.
3. **Contextual translations** – Support for parameterized translations.
4. **Prefix translations** – Automatically prepend a prefix to all translation keys within a scope.
5. **Root override** – Use keys starting with `.` to bypass the prefix.

---

## Contributing

We welcome contributions to ngaTranslate.  
Feel free to open an issue or submit a pull request on GitHub.

---

## Testing

Run the unit tests with:

```bash
npm test
```

---

## License

ngaTranslate is licensed under the **MIT License**.
