const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to http://127.0.0.1:8000 ...");
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' });

  // 1. Click Interactive Simulator
  console.log("Opening Interactive Simulator...");
  await page.click('button:has-text("Interactive Simulator")');
  
  // Wait 1.2s to capture active typing in WhatsApp
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'tests/screenshots_enterprise/12_simulator_active_typing.png' });

  // Wait 3.5s to capture sent message, gate check, and consensus deliberation
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'tests/screenshots_enterprise/13_simulator_consensus_and_a2a.png' });

  // Wait 4s to capture executive signoff & SHA-256 Merkle commit
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tests/screenshots_enterprise/14_simulator_final_settled.png' });

  console.log("Simulator screenshots saved!");
  await browser.close();
  process.exit(0);
})();
