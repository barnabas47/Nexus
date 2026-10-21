const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to http://127.0.0.1:8000 ...");
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' });

  // 1. Click Judge Demo Tour
  console.log("Starting Live Guided Tour...");
  await page.click('button:has-text("Judge Demo Tour")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests/screenshots_enterprise/08_tour_step1_omnichannel.png' });

  // 2. Click Next Step -> Step 2 (On-Call Roster)
  console.log("Advancing to Step 2 (Roster)...");
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests/screenshots_enterprise/09_tour_step2_roster.png' });

  // 3. Click Next Step -> Step 3 (Consensus)
  console.log("Advancing to Step 3 (Consensus)...");
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests/screenshots_enterprise/10_tour_step3_consensus.png' });

  // 4. Click Next Step -> Step 4 (A2A Alku)
  console.log("Advancing to Step 4 (A2A)...");
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests/screenshots_enterprise/11_tour_step4_a2a.png' });

  console.log("All tour screenshots successfully captured!");
  await browser.close();
  process.exit(0);
})();
