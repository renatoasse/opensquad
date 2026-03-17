const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const runDir = __dirname;
const slidesDir = path.join(runDir, 'slides');
const imagesDir = path.join(runDir, 'images');

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1440 });

  for (let i = 1; i <= 8; i++) {
    const num = String(i).padStart(2, '0');
    const htmlPath = path.join(slidesDir, `slide-${num}.html`);
    const outPath = path.join(imagesDir, `${num}.jpg`);
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 90 });
    console.log('Saved', outPath);
  }

  await browser.close();
  console.log('Done.');
})();
