import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.js",
  timeout: 15_000,
  use: {
    baseURL: "http://127.0.0.1:4317",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "python -m http.server 4317 --bind 127.0.0.1 --directory ..",
    url: "http://127.0.0.1:4317",
    reuseExistingServer: false,
    timeout: 15_000
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
