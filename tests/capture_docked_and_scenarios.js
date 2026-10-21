const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const outDir = path.resolve(__dirname, 'screenshots_enterprise');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Navigating to http://127.0.0.1:8000 ...');
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Take screenshot of ultra-clean header
  await page.screenshot({ path: path.join(outDir, '18_ultra_clean_header.png'), fullPage: false });
  console.log('Saved 18_ultra_clean_header.png');

  // 2. Open Interactive Simulator
  await page.click('button:has-text("Interactive Simulator")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '19_stage_with_scenarios.png'), fullPage: false });
  console.log('Saved 19_stage_with_scenarios.png');

  // 3. Click "Dock to Dashboard"
  await page.click('button:has-text("Dock to Dashboard")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '20_docked_phone_live_dashboard.png'), fullPage: false });
  console.log('Saved 20_docked_phone_live_dashboard.png');

  await browser.close();
  console.log('DONE!');
})();
