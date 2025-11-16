// src/generate.js – debug build for GitHub Pages
// - Reads src/template.html
// - Copies data/tips.json -> public/data/tips.json
// - Copies data/images/* -> public/data/images/*
// - Writes public/index.html

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// Template
const TEMPLATE_PATH = path.join(__dirname, 'template.html');

// Data
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TIPS_JSON_SRC = path.join(DATA_DIR, 'tips.json');
const DATA_IMAGES_DIR = path.join(DATA_DIR, 'images');

// Public (what gets deployed by GitHub Pages)
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PUBLIC_DATA_DIR = path.join(PUBLIC_DIR, 'data');
const PUBLIC_IMAGES_DIR = path.join(PUBLIC_DATA_DIR, 'images');
const OUTPUT_HTML_PATH = path.join(PUBLIC_DIR, 'index.html');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFileIfExists(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`WARN: Source file does not exist: ${src}`);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

function copyImages(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`WARN: images directory not found: ${srcDir}`);
    return;
  }

  ensureDir(destDir);

  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    const stat = fs.statSync(srcPath);

    if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied image: ${entry}`);
    }
  }
}

function buildHtml() {
  let template;
  try {
    template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  } catch (err) {
    console.error('ERROR: Could not read template.html:', err);
    process.exit(1);
  }

  const today = new Date();
  const dateString = today.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // The JS on the page will override the text once tips.json is loaded,
  // so these values are just nice defaults.
  let html = template
    .replace('{DATE_STRING}', dateString)
    .replace(/{DAY_OF_YEAR}/g, '1')
    .replace('{TIP_TEXT}', 'Tips worden geladen...')
    .replace(
      '{TIP_IMAGE_TAG}',
      '<img id="tip-image" style="display:none;" alt="Cyber security tip">'
    );

  ensureDir(PUBLIC_DIR);
  fs.writeFileSync(OUTPUT_HTML_PATH, html);
  console.log(`Wrote HTML to ${OUTPUT_HTML_PATH}`);
}

function main() {
  buildHtml();

  // Copy tips.json into the folder that will be deployed
  copyFileIfExists(TIPS_JSON_SRC, path.join(PUBLIC_DATA_DIR, 'tips.json'));

  // Copy ALL images for debugging
  copyImages(DATA_IMAGES_DIR, PUBLIC_IMAGES_DIR);

  console.log('generate.js finished successfully.');
}

main();