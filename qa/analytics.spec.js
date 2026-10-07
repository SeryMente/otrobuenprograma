import { test, expect } from "@playwright/test";

test("analytics is opt-in and emits only after consent", async ({ page }) => {
  const received = [];
  await page.route("**/mock-analytics", async (route) => {
    const request = route.request();
    received.push(JSON.parse(request.postData() || "{}"));
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ accepted: 1 })
    });
  });

  await page.addInitScript(() => { window.__OGP_AUTO_CONSENT = true; });
  await page.goto("/qa/analytics-harness.html");
  await expect(page.locator("#status")).toHaveText("ready");

  const result = await page.evaluate(() => ({
    consent: window.OGPAnalytics.getConsent(),
    visitor: localStorage.getItem("ogp.analytics.visitor_id.v1"),
    session: localStorage.getItem("ogp.analytics.session_id.v1"),
    events: window.__events.map((e) => e.type)
  }));

  expect(result.consent.analytics).toBe(true);
  expect(result.visitor).toBeTruthy();
  expect(result.session).toBeTruthy();
  expect(result.events).toContain("consent_change");

  await page.getByRole("button", { name: "CTA test" }).click();

  await expect.poll(() => received.length).toBeGreaterThan(0);

  const flatEvents = received.flatMap((body) => body.events || []);
  expect(flatEvents.some((e) => e.event_name === "page_view")).toBeTruthy();
  expect(flatEvents.some((e) => e.event_name === "cta_click")).toBeTruthy();

  for (const body of received) {
    for (const e of body.events || []) {
      expect(e).not.toHaveProperty("ip");
      expect(e).not.toHaveProperty("mac");
      expect(e).not.toHaveProperty("fingerprint");
      expect(e.consent_analytics).toBe(true);
    }
  }
});

test("rejection produces no persistent visitor/session identity", async ({ page }) => {
  await page.addInitScript(() => { window.__OGP_AUTO_CONSENT = false; });
  await page.goto("/qa/analytics-harness.html");

  const result = await page.evaluate(() => {
    window.OGPAnalytics.setConsent({ analytics: false, marketing: false });
    return {
      consent: window.OGPAnalytics.getConsent(),
    visitor: localStorage.getItem("ogp.analytics.visitor_id.v1"),
      session: localStorage.getItem("ogp.analytics.session_id.v1")
    };
  });

  expect(result.consent?.analytics).toBe(false);
  expect(result.visitor).toBeNull();
  expect(result.session).toBeNull();
});
