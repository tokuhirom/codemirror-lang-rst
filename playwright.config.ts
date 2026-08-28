import { defineConfig, devices } from "@playwright/test"

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseUrl ?? "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "npm run build:demo && npm run preview:demo",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
      },
})
