import { describe, expect, it } from "vitest"
import { reStructuredTextLanguage, rstState } from "../src/index.js"

function classes(doc: string): string[] {
  const result: string[] = []
  reStructuredTextLanguage.parser.parse(doc).iterate({
    enter(node) {
      if (node.name !== "Document") result.push(node.name)
    },
  })
  return result
}

describe("reStructuredText", () => {
  it("recognizes common block constructs", () => {
    const doc = [
      "Title",
      "=====",
      "",
      ".. note:: Be careful",
      "",
      "   directive body",
      "",
      ".. a comment",
      "   continued",
      "",
      ":author: Jane",
      "",
      "- item",
      "1. numbered",
      "",
      ">>> print('hello')",
    ].join("\n")
    const names = classes(doc)
    expect(names).toContain("heading")
    expect(names).toContain("meta")
    expect(names).toContain("comment")
    expect(names).toContain("propertyName")
    expect(names.filter((n) => n === "list").length).toBe(2)
    expect(names).toContain("monospace")
  })

  it("recognizes inline markup and references", () => {
    const names = classes(
      "*em* **strong** ``code`` :ref:`target` `site <https://example.com>`_ |name|",
    )
    expect(names).toContain("emphasis")
    expect(names).toContain("strong")
    expect(names).toContain("monospace")
    expect(names).toContain("typeName")
    expect(names).toContain("link")
    expect(names).toContain("variableName")
  })

  it("keeps indented literal blocks highlighted", () => {
    const names = classes("Example::\n\n    one\n    two\n\nafter")
    expect(names.filter((n) => n === "monospace").length).toBe(2)
  })

  it("ends block highlighting when indentation ends", () => {
    const names = classes(".. warning::\n\n   body\n\nordinary *text*")
    expect(names.filter((name) => name === "meta")).toHaveLength(2)
    expect(names[names.length - 1]).toBe("emphasis")
  })

  it("recognizes targets and substitution definitions", () => {
    const names = classes(".. _docs: https://example.com\n\n.. |project| replace:: CodeMirror")
    expect(names).toContain("link")
    expect(names).toContain("meta")
  })

  it("exports useful language metadata", () => {
    const state = rstState(".. comment")
    expect(state.languageDataAt("commentTokens", 0)).toEqual([{ line: ".. " }])
  })
})
