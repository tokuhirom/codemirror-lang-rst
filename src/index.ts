import {
  LanguageSupport,
  StreamLanguage,
  type StreamParser,
  type StringStream,
} from "@codemirror/language"
import { EditorState } from "@codemirror/state"

interface RSTState {
  literalPending: boolean
  literalIndent: number | null
  blockIndent: number | null
  blockKind: "comment" | "directive" | null
}

function indentation(stream: StringStream): number {
  return stream.indentation()
}

function consumeInline(stream: StringStream): string | null {
  if (stream.match(/\\[\s\S]/)) return "string2"
  if (stream.match(/\*\*[^*\n]+\*\*/)) return "strong"
  if (stream.match(/\*(?!\s)[^*\n]+\*/)) return "emphasis"
  if (stream.match(/``[^`\n]+``/)) return "monospace"
  if (stream.match(/\|[^|\n]+\|/)) return "variableName"
  if (stream.match(/:[A-Za-z][\w-]*:`[^`\n]+`/)) return "typeName"
  if (stream.match(/`[^`\n]+`_{1,2}/)) return "link"
  if (stream.match(/`[^`\n]+`/)) return "string"
  if (stream.match(/[A-Za-z][\w.+-]*:\/\/[^\s<>]+/)) return "link"
  if (stream.match(/\b(?:https?|ftp|mailto):[^\s<>]+/)) return "link"
  if (stream.match(/\[[^\]\n]+\]_/)) return "link"
  if (stream.match(/\b\w+_{1,2}\b/)) return "link"
  if (stream.match(/::(?=\s*$)/)) return "operator"
  if (stream.match(/[*|`_:]+/)) return "punctuation"
  stream.match(/^[^\\*|`_:]+/)
  if (stream.start === stream.pos) stream.next()
  return null
}

const parser: StreamParser<RSTState> = {
  name: "reStructuredText",
  startState: () => ({
    literalPending: false,
    literalIndent: null,
    blockIndent: null,
    blockKind: null,
  }),
  copyState: (state) => ({ ...state }),
  blankLine(state) {
    // A blank line starts a literal block promised by a trailing "::".
    // Existing indented blocks remain open until the next non-blank line.
    if (state.literalPending) state.literalIndent = -1
  },
  token(stream, state) {
    if (stream.sol()) {
      const indent = indentation(stream)

      if (state.literalIndent != null) {
        if (state.literalIndent < 0 && indent > 0) state.literalIndent = indent
        if (state.literalIndent >= 0 && indent >= state.literalIndent) {
          stream.skipToEnd()
          return "monospace"
        }
        state.literalIndent = null
        state.literalPending = false
      }

      if (state.blockIndent != null) {
        if (indent > state.blockIndent) {
          stream.skipToEnd()
          return state.blockKind === "comment" ? "comment" : "meta"
        }
        state.blockIndent = null
        state.blockKind = null
      }

      if (stream.match(/^\s*\.\.\s+[\w-]+::/)) {
        state.blockIndent = indent
        state.blockKind = "directive"
        stream.skipToEnd()
        return "meta"
      }
      if (stream.match(/^\s*\.\.\s+_[^:]+:/)) {
        stream.skipToEnd()
        return "link"
      }
      if (stream.match(/^\s*\.\.\s+\|[^|]+\|\s+(?:replace|image|unicode)::/)) {
        state.blockIndent = indent
        state.blockKind = "directive"
        stream.skipToEnd()
        return "meta"
      }
      if (stream.match(/^\s*\.\.\s+/)) {
        state.blockIndent = indent
        state.blockKind = "comment"
        stream.skipToEnd()
        return "comment"
      }
      if (stream.match(/^\s*:[\w-]+:/)) return "propertyName"
      if (stream.match(/^\s*(?:[-+*]|\u2022)\s+/)) return "list"
      if (stream.match(/^\s*(?:\(?\d+[.)]|\(?[A-Za-z][.)]|\(?[ivxlcdmIVXLCDM]+[.)]|#\.)\s+/))
        return "list"
      if (stream.match(/^\s*(?:-{2,}\S*|\/[\w-]+|--?[\w-]+)(?:[ =]\S+)*\s{2,}/))
        return "attributeName"
      if (stream.match(/^\s*>>>?\s?/)) {
        stream.skipToEnd()
        return "monospace"
      }
      if (stream.match(/^\s*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{4,}\s*$/)) {
        stream.skipToEnd()
        return "heading"
      }
      if (stream.match(/^\s*\+[-+=]+(?=\+)/)) {
        stream.skipToEnd()
        return "punctuation"
      }
      if (stream.match(/^\s*\|/)) return "punctuation"
    }

    const style = consumeInline(stream)
    if (stream.eol()) {
      // A single trailing colon is normal prose; a double colon announces a
      // literal block after the following blank line.
      const text = stream.string
      state.literalPending = /(^|[^:])::\s*$/.test(text)
    }
    return style
  },
  languageData: {
    commentTokens: { line: ".. " },
  },
}

/** The reStructuredText stream language. */
export const reStructuredTextLanguage = StreamLanguage.define(parser)

/** Alias using the conventional short name. */
export const rstLanguage = reStructuredTextLanguage

/** CodeMirror 6 language support for reStructuredText documents. */
export function reStructuredText(): LanguageSupport {
  return new LanguageSupport(reStructuredTextLanguage)
}

/** Short alias for {@link reStructuredText}. */
export const rst = reStructuredText

/** Create an editor state configured for reStructuredText. */
export function rstState(doc = ""): EditorState {
  return EditorState.create({ doc, extensions: [reStructuredText()] })
}
