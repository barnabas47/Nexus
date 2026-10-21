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

  // 1. Take screenshot of streamlined header
  await page.screenshot({ path: path.join(outDir, '15_streamlined_header.png'), fullPage: false });
  console.log('Saved 15_streamlined_header.png');

  // 2. Click Scenarios & Tests dropdown
  await page.click('button:has-text("Scenarios & Tests")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '16_dropdown_scenarios_menu.png'), fullPage: false });
  console.log('Saved 16_dropdown_scenarios_menu.png');

  // Close menu by clicking outside
  await page.click('body', { position: { x: 200, y: 200 } });
  await page.waitForTimeout(300);

  // 3. Type Hungarian question in chat input
  const inputSelector = 'input[placeholder*="Type cross-channel message"]';
  await page.fill(inputSelector, 'magyarul valaszolj, te most pontosan mit is tudsz?');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);

  // 4. Type math question
  await page.fill(inputSelector, 'how much is 10x 30');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);

  // 5. Screenshot the chat timeline
  await page.screenshot({ path: path.join(outDir, '17_intelligent_chat_timeline.png'), fullPage: false });
  console.log('Saved 17_intelligent_chat_timeline.png');

  await browser.close();
  console.log('DONE!');
})();
