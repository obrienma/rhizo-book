const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Load providers page (no filters)
  await page.goto('http://localhost:3000/providers', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=View Availability', { timeout: 15000 });
  const title = await page.textContent('h1');
  console.log('PAGE TITLE:', title);

  const allCards = await page.locator('text=View Availability').count();
  console.log('PROVIDER CARDS (no filter):', allCards);

  await page.screenshot({ path: '/tmp/providers-all.png' });
  console.log('Screenshot: /tmp/providers-all.png');

  // 2. Specialty filter
  await page.fill('input[placeholder*="specialty"]', 'Cardiology');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/providers?*specialty*', { timeout: 8000 });
  await page.waitForSelector('text=View Availability', { timeout: 10000 });

  const cardioCards = await page.locator('text=View Availability').count();
  console.log('AFTER specialty=Cardiology, URL:', page.url());
  console.log('CARDIOLOGY CARDS:', cardioCards);
  await page.screenshot({ path: '/tmp/providers-cardiology.png' });

  // 3. Active filter pill visible?
  const pillText = await page.locator('span:has-text("Cardiology")').count();
  console.log('ACTIVE FILTER PILL COUNT (should be >=1):', pillText);

  // 4. Clear all
  await page.click('text=Clear all');
  await page.waitForURL('**/providers', { timeout: 5000 });
  await page.waitForSelector('text=View Availability', { timeout: 10000 });
  const afterClear = await page.locator('text=View Availability').count();
  console.log('AFTER CLEAR ALL, CARDS:', afterClear);

  // 5. City filter
  await page.fill('input[placeholder*="City"]', 'Toronto');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/providers?*city*', { timeout: 8000 });
  await page.waitForSelector('text=View Availability', { timeout: 10000 });
  const torontoCards = await page.locator('text=View Availability').count();
  console.log('AFTER city=Toronto, CARDS:', torontoCards);
  await page.screenshot({ path: '/tmp/providers-toronto.png' });

  // 6. Empty state — garbage filter
  await page.fill('input[placeholder*="specialty"]', 'xyzabc');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  const emptyMsg = await page.locator('text=No providers found').isVisible().catch(() => false);
  console.log('EMPTY STATE VISIBLE:', emptyMsg);
  await page.screenshot({ path: '/tmp/providers-empty.png' });

  // 7. Autocomplete dropdown
  await page.goto('http://localhost:3000/providers', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder*="specialty"]', { timeout: 10000 });
  await page.click('input[placeholder*="specialty"]');
  await page.type('input[placeholder*="specialty"]', 'Neuro', { delay: 60 });
  await page.waitForTimeout(400);
  const dropdownItems = await page.locator('ul li').count();
  console.log('AUTOCOMPLETE DROPDOWN ITEMS for "Neuro":', dropdownItems);
  await page.screenshot({ path: '/tmp/providers-autocomplete.png' });

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
