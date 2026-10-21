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

  // Click FinOps tab
  console.log('Clicking FinOps tab...');
  await page.click('button:has-text("FinOps & Token Attribution")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '10_finops_tab.png'), fullPage: true });
  console.log('Saved 10_finops_tab.png');

  // Click Audit Ledger tab
  console.log('Clicking Audit Ledger tab...');
  await page.click('button:has-text("Tamper-Proof Audit Ledger")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '11_audit_ledger_tab.png'), fullPage: true });
  console.log('Saved 11_audit_ledger_tab.png');

  // Test Executive Signoff
  console.log('Clicking Executive Sign-off button...');
  await page.click('button:has-text("Executive Sign-Off")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '12_signoff_approved.png'), fullPage: true });
  console.log('Saved 12_signoff_approved.png');

  await browser.close();
  console.log('ALL ENTERPRISE SCREENSHOTS CAPTURED!');
})();
