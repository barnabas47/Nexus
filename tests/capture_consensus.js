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

  // Click Multi-Agent Blind Consensus tab
  console.log('Clicking Consensus tab...');
  await page.click('button:has-text("Multi-Agent Blind Consensus")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '08_blind_consensus_tab.png'), fullPage: true });
  console.log('Saved 08_blind_consensus_tab.png');

  // Click A2A Protocol tab
  console.log('Clicking A2A Protocol tab...');
  await page.click('button:has-text("A2A Protocol & Circuit Breaker")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '09_a2a_protocol_tab.png'), fullPage: true });
  console.log('Saved 09_a2a_protocol_tab.png');

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED!');
})();
