# codemirror-lang-rst

reStructuredText language support for CodeMirror 6.

[Try the live demo](https://tokuhirom.github.io/codemirror-lang-rst/).

```sh
npm install codemirror-lang-rst
```

```ts
import {EditorView, basicSetup} from "codemirror"
import {reStructuredText} from "codemirror-lang-rst"

new EditorView({
  doc: "Title\n=====\n",
  extensions: [basicSetup, reStructuredText()],
  parent: document.querySelector("#editor")!,
})
```

The package recognizes section adornments, directives and comments, field and
option lists, bullet and enumerated lists, literal and doctest blocks, tables,
roles, substitutions, links, references, emphasis, strong text, and inline
literals.

Exports: `reStructuredText()`, `reStructuredTextLanguage`, and their `rst` /
`rstLanguage` aliases. `rstState()` is a small convenience for consumers that
only need an `EditorState`.

## Development

Run `npm run check` to type-check, lint with Biome, test, and build both the
package and demo. GitHub Actions references are commit-pinned with pinact.
