import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { bracketMatching } from "@codemirror/language"
import { EditorState } from "@codemirror/state"
import { oneDark } from "@codemirror/theme-one-dark"
import {
  EditorView,
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view"
import { reStructuredText } from "../src/index"
import "./style.css"

const documentText = `reStructuredText in CodeMirror 6
================================

This live editor highlights **strong text**, *emphasis*, \`\`inline literals\`\`,
and links such as \`CodeMirror <https://codemirror.net/>\`_.

Features
--------

* Bullet and enumerated lists
* Field lists and directives
* Literal and doctest blocks

.. note::

   Directive bodies are highlighted as a block.

:language: TypeScript
:editor: CodeMirror 6

Literal example::

    import {reStructuredText} from "codemirror-lang-rst"

    const extensions = [reStructuredText()]

>>> 20 + 22
42
`

const parent = document.querySelector<HTMLElement>("#editor")
if (!parent) throw new Error("Editor container was not found")

const state = EditorState.create({
  doc: documentText,
  extensions: [
    lineNumbers(),
    highlightSpecialChars(),
    history(),
    highlightActiveLine(),
    bracketMatching(),
    oneDark,
    keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
    reStructuredText(),
    EditorView.lineWrapping,
  ],
})

new EditorView({ state, parent })
