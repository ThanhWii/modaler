# Modaler.js

A lightweight, dependency-free modal library built with modern JavaScript (ES6+).

Modaler.js is a **personal learning and portfolio project**. It provides a reusable way to create modal dialogs from an HTML `<template>` or an HTML string, configure how they close, and add optional footer content and buttons.

> **Project background:** I built this project as a learning exercise after studying the [JavaScript Pro course by F8](https://f8.edu.vn/landing/js). The tutorial implementation I followed used prototype-based JavaScript; I reimplemented and adapted the concepts using ES6 classes, private fields, and private methods for use in my own projects. This is a tutorial-inspired project, not a claim that the original idea or every design decision is entirely original.

## Features

- Create a modal from an HTML `<template>` or an HTML string.
- Configure closing behavior: close button, backdrop click, and Escape key.
- Choose whether the modal DOM is removed when it closes.
- Add custom CSS classes to the modal container.
- Add optional footer content and action buttons.
- Enable or disable scroll locking and choose a scroll-lock target.
- Run `onOpen` and `onClose` callbacks after the corresponding CSS transition completes.
- Use the library directly in a browser without a framework or additional runtime dependencies.

## Installation

### Use the CDN

Add the stylesheet in the document `<head>`:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/thanhwii/modaler@v1.0.3/modaler.min.css"
/>
```

Load the JavaScript file after your page markup, for example just before `</body>`:

```html
<script src="https://cdn.jsdelivr.net/gh/thanhwii/modaler@v1.0.3/modaler.min.js"></script>
```

### Use the files locally

If you have cloned or downloaded this repository, include the source files in your page:

```html
<link rel="stylesheet" href="./src/modaler.css" />
<script src="./src/modaler.js"></script>
```

The repository also includes minified files at the project root (`modaler.min.css` and `modaler.min.js`). Adjust paths to match your project structure.

## Quick start

### 1. Create a template

```html
<button id="open-modal" type="button">Open modal</button>

<template id="welcome-modal">
  <h2>Welcome</h2>
  <p>This modal was created with Modaler.js.</p>
</template>
```

### 2. Create and open the modal

```html
<script>
  const modal = new Modaler({
    templateId: 'welcome-modal',
    closeMethods: ['button', 'overlay', 'escape'],
    onOpen: () => {
      console.log('Modal opened');
    },
    onClose: () => {
      console.log('Modal closed');
    },
  });

  document.querySelector('#open-modal').addEventListener('click', () => {
    modal.open();
  });
</script>
```

The `templateId` option accepts the template's **ID without the `#` prefix**.

## Create a modal from an HTML string

Instead of `templateId`, you can pass `content`:

```js
const modal = new Modaler({
  content: `
    <h2>Quick message</h2>
    <p>This content is supplied as an HTML string.</p>
  `,
  closeMethods: ['button', 'escape'],
});

modal.open();
```

Provide either `templateId` or `content`. If both are provided, `content` takes precedence.

> **Security note:** `content`, footer content, and button titles are inserted as HTML. Only pass trusted, developer-controlled markup to these options. Do not insert untrusted user input without appropriate sanitization.

## Configuration options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `templateId` | `string` | `null` | ID of an HTML `<template>` element, without `#`. Provide this or `content`. |
| `content` | `string` | `undefined` | HTML string to use as the modal content. Takes precedence if both `content` and `templateId` are supplied. |
| `closeMethods` | `string[]` | `['button', 'overlay', 'escape']` | Allowed close methods: `'button'`, `'overlay'`, and `'escape'`. |
| `destroyOnClose` | `boolean` | `true` | Remove the modal element from the DOM when it closes. Set to `false` to keep it for reuse. |
| `cssClasses` | `string[]` | `[]` | Additional CSS classes applied to the modal container. |
| `footer` | `boolean` | `false` | Enable the modal footer. |
| `enableScrollLock` | `boolean` | `true` | Enable scroll locking while a modal is open, when the target has a scrollbar. |
| `scrollLockTarget` | `() => Element` | `() => document.body` | Function returning the element whose scrolling should be locked. |
| `onOpen` | `function` | `() => {}` | Callback invoked after the opening `transform` transition completes. |
| `onClose` | `function` | `() => {}` | Callback invoked after the closing `transform` transition completes. |

## API

### `modal.open()`

Creates the modal element if needed, displays it, and returns the modal backdrop element. Use the returned element to work with content inside the modal.

```js
const modalElement = modal.open();
```

### `modal.close(destroy)`

Closes the modal. If `destroy` is omitted, the value of `destroyOnClose` is used. Pass `true` to remove the modal element or `false` to keep it for reuse.

```js
modal.close();      // Uses destroyOnClose
modal.close(false); // Close but keep the modal element
modal.close(true);  // Close and remove the modal element
```

### `modal.destroy()`

Closes the modal and requests removal of its DOM element.

```js
modal.destroy();
```

### `modal.setContent(content)`

Sets the modal's content using an HTML string. If the modal is already rendered, the displayed content is updated.

```js
modal.setContent('<h2>Updated content</h2><p>New message.</p>');
```

### `modal.setFooterContent(content)`

Sets the HTML content displayed in the footer. The modal must be configured with `footer: true` for the footer to be rendered.

```js
modal.setFooterContent('<p>By continuing, you agree to the terms.</p>');
```

### `modal.addFooterButton(title, cssClass, callback)`

Adds a button to the modal footer. Enable the footer with `footer: true`.

```js
const modal = new Modaler({
  templateId: 'confirm-template',
  footer: true,
});

modal.setFooterContent('<p>Are you sure you want to continue?</p>');
modal.addFooterButton('Cancel', 'modaler-button', () => modal.close());
modal.addFooterButton('Continue', 'modaler-button modaler-button--primary', () => {
  console.log('Continue clicked');
});
```

The `title` argument may contain HTML. Use trusted markup only.

## Example: configure close behavior

```js
const modal = new Modaler({
  templateId: 'login-template',
  closeMethods: ['button', 'escape'],
  destroyOnClose: false,
  cssClasses: ['login-dialog'],
  enableScrollLock: true,
  onOpen: () => console.log('Login modal opened'),
  onClose: () => console.log('Login modal closed'),
});

document.querySelector('#open-login').addEventListener('click', () => {
  modal.open();
});
```

In this example, clicking the backdrop does not close the modal because `'overlay'` is not included in `closeMethods`.

## Styling and transitions

The library stylesheet defines the modal's base styles and transition classes. The opening and closing callbacks depend on a `transitionend` event for the backdrop's `transform` property. If you customize the stylesheet, preserve the relevant transition behavior or update the lifecycle logic to match your styles.

You can pass additional class names using `cssClasses` and target them from your own stylesheet:

```js
const modal = new Modaler({
  templateId: 'welcome-modal',
  cssClasses: ['my-custom-modal'],
});
```

## Development

The repository is structured as follows:

```text
.
├── src/
│   ├── modaler.css
│   └── modaler.js
├── modaler.min.css
├── modaler.min.js
├── index.html
├── styles.css
├── package.json
└── README.md
```

The `index.html` and `styles.css` files are used for the demo page. The source files are in `src/`, and minified assets are available at the project root.

## Limitations

- Modaler.js is designed for personal projects and learning. It is not presented as a fully production-hardened or extensively tested modal framework.
- The library relies on modern browser support for ES6 classes, private fields, and private methods.
- Content-related options accept HTML strings; use trusted content or sanitize it before passing it to the library.
- Scroll locking and callbacks depend on the DOM and CSS behavior described above.

## Acknowledgements

This project was inspired by lessons from the **JavaScript Pro** course on F8. The course material provided the learning reference for the modal-library exercise. The implementation in this repository was rewritten and adapted using ES6 classes and private fields/methods, rather than following the prototype-based implementation verbatim.

- **Course:** [JavaScript Pro — F8](https://f8.edu.vn/landing/js)
- **Purpose:** Learning, experimentation, and use in my own personal projects.

## License

No license has been specified for this repository yet. Before redistributing this project or adding an open-source license, review the applicable F8 course terms and any other rights relevant to the tutorial material.
