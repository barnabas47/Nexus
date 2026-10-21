const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to http://127.0.0.1:8000 ...");
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' });

  // Click AI Engine (BYOK) button in header
  console.log("Opening BYOK Modal...");
  await page.click('button:has-text("AI Engine")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'tests/screenshots_enterprise/06_byok_modal_open.png' });

  // Select Anthropic Claude provider
  console.log("Selecting Anthropic provider...");
  await page.click('button:has-text("Anthropic Claude")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/screenshots_enterprise/07_anthropic_selected.png' });

  console.log("BYOK screenshots saved!");
  await browser.close();
  process.exit(0);
})();
