import { expect, test } from "@playwright/test"

test("loads an interactive reStructuredText editor without browser errors", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("./")

  await expect(page).toHaveTitle("codemirror-lang-rst demo")
  await expect(page.getByRole("heading", { name: "reStructuredText playground" })).toBeVisible()
  const editor = page.locator(".cm-editor")
  await expect(editor).toBeVisible()
  await expect(editor.locator(".cm-content")).toContainText("reStructuredText in CodeMirror 6")
  await expect(editor.locator(".cm-content span").first()).toBeVisible()
  expect(errors).toEqual([])
})

test("accepts edits and highlights newly entered markup", async ({ page }) => {
  await page.goto("./")

  const content = page.locator(".cm-content")
  await content.click()
  await page.keyboard.press("ControlOrMeta+End")
  await page.keyboard.insertText("\n\n**Playwright works**")

  await expect(content).toContainText("Playwright works")
  const lastLine = content.locator(".cm-line").last()
  await expect(lastLine).toHaveText("**Playwright works**")
  await expect(lastLine.locator("span")).toHaveCount(1)
})
