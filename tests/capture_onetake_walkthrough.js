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

  // 1. Initial State with One-Take button and spring layout
  await page.screenshot({ path: path.join(outDir, '21_onetake_ready_state.png'), fullPage: false });
  console.log('Saved 21_onetake_ready_state.png');

  // 2. Click One-Take Walkthrough
  await page.click('button:has-text("One-Take Walkthrough")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '22_onetake_cinema_hud_active.png'), fullPage: false });
  console.log('Saved 22_onetake_cinema_hud_active.png');

  // 3. Jump to Step 3 (Blind Consensus & Veto)
  await page.click('button:has-text("03. Multi-Agent")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '23_onetake_veto_deliberation.png'), fullPage: false });
  console.log('Saved 23_onetake_veto_deliberation.png');

  // 4. Jump to Step 4 (A2A Broker)
  await page.click('button:has-text("04. Autonomous")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '24_onetake_a2a_negotiation.png'), fullPage: false });
  console.log('Saved 24_onetake_a2a_negotiation.png');

  await browser.close();
  console.log('DONE!');
})();
