const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to http://127.0.0.1:8000 ...");
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' });

  if (!fs.existsSync('tests/screenshots_enterprise')) {
    fs.mkdirSync('tests/screenshots_enterprise', { recursive: true });
  }

  // 1. Initial Timeline
  await page.screenshot({ path: 'tests/screenshots_enterprise/01_enterprise_header.png' });

  // 2. Click Roster
  console.log("Clicking On-Call Roster...");
  await page.click('button:has-text("On-Call Roster")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'tests/screenshots_enterprise/02_on_call_roster_table.png' });

  // 3. Click Broadcast Alert
  console.log("Clicking Broadcast P1 Alert...");
  await page.click('button:has-text("Broadcast P1 Alert")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests/screenshots_enterprise/03_broadcast_dispatched.png' });

  // 4. Click Enterprise Playbooks
  console.log("Clicking Enterprise Playbooks...");
  await page.click('button:has-text("Enterprise Playbooks")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'tests/screenshots_enterprise/04_playbooks_view.png' });

  // 5. Run DC Cooling Playbook
  console.log("Running Playbook...");
  await page.locator('button:has-text("Run Playbook")').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots_enterprise/05_playbook_executed.png' });

  console.log("Screenshots saved in tests/screenshots_enterprise/");
  await browser.close();
  process.exit(0);
})();
