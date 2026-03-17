/**
 * Renderiza slides HTML (1080x1440) em JPEG.
 * Uso: node scripts/render-slides-to-jpg.js <pasta_slides> <pasta_images>
 * Ex: node scripts/render-slides-to-jpg.js squads/insta-mvp/output/2026-03-17-001609/slides squads/insta-mvp/output/2026-03-17-001609/images
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const slidesDir = process.argv[2] || path.join(__dirname, '../squads/insta-mvp/output/2026-03-17-001609/slides');
const imagesDir = process.argv[3] || path.join(__dirname, '../squads/insta-mvp/output/2026-03-17-001609/images');

async function main() {
  if (!fs.existsSync(slidesDir)) {
    console.error('Pasta de slides não encontrada:', slidesDir);
    process.exit(1);
  }
  fs.mkdirSync(imagesDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1440 });

  const slides = fs.readdirSync(slidesDir).filter(f => f.startsWith('slide-') && f.endsWith('.html')).sort();
  for (const file of slides) {
    const num = file.replace('slide-', '').replace('.html', '');
    const outName = num.padStart(2, '0') + '.jpg';
    const htmlPath = pathToFileURL(path.resolve(slidesDir, file)).href;
    await page.goto(htmlPath, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(imagesDir, outName), type: 'jpeg', quality: 90 });
    console.log('Gerado:', outName);
  }

  await browser.close();
  console.log('Concluído. Imagens em', imagesDir);
}

main().catch(err => { console.error(err); process.exit(1); });
