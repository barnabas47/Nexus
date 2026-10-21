const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const outDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Navigating to http://127.0.0.1:3000 ...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Initial State
  await page.screenshot({ path: path.join(outDir, '01_initial_dashboard.png'), fullPage: true });
  console.log('Saved 01_initial_dashboard.png');

  // 2. Click "Judge Demo Mode"
  console.log('Clicking Judge Demo Mode button...');
  await page.click('button:has-text("Judge Demo Mode")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '02_judge_demo_mode.png'), fullPage: true });
  console.log('Saved 02_judge_demo_mode.png');

  // 3. Switch to Agent Topology Tab
  console.log('Clicking Agent Topology tab...');
  await page.click('button:has-text("Agent Topology & State")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, '03_agent_topology.png'), fullPage: true });
  console.log('Saved 03_agent_topology.png');

  // 4. Click "Prompt Injection Test"
  console.log('Clicking Prompt Injection Test (Red-team trigger)...');
  await page.click('button:has-text("Prompt Injection Test")');
  await page.waitForTimeout(1500);

  // 5. Switch to Silence / Rejection Log Tab to verify code gate blocked it
  console.log('Clicking Silence / Rejection Log tab...');
  await page.click('button:has-text("Silence / Rejection Log")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, '04_rejection_log.png'), fullPage: true });
  console.log('Saved 04_rejection_log.png');

  // 6. Test Interactive Chat Input on Timeline
  console.log('Switching back to timeline and typing a message...');
  await page.click('button:has-text("Unified Conversation Timeline")');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder*="Send cross-channel message"]', 'Can you provide the enterprise quote details?');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '05_chat_interaction.png'), fullPage: true });
  console.log('Saved 05_chat_interaction.png');

  await browser.close();
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
})();
