const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const outDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(outDir, '06_redesigned_header.png'), fullPage: false });
  console.log('Saved 06_redesigned_header.png');

  // Click scenario
  await page.click('button:has-text("Judge Demo Scenario")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '07_redesigned_full.png'), fullPage: true });
  console.log('Saved 07_redesigned_full.png');

  await browser.close();
  console.log('DONE!');
})();
