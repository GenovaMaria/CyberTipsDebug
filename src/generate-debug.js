// src/generate-debug.js – DEBUG BUILD (no day-of-year logic)

const fs = require('fs');
const path = require('path');

// Paths
const ROOT_DIR = path.join(__dirname, '..');

const TEMPLATE_PATH = path.join(__dirname, 'template.html');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const TIPS_JSON_SRC = path.join(DATA_DIR, 'tips.json');
const DATA_IMAGES_DIR = path.join(DATA_DIR, 'images');

const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PUBLIC_IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const TIPS_JSON_DEST = path.join(PUBLIC_DIR, 'tips.json');
const OUTPUT_HTML_PATH = path.join(PUBLIC_DIR, 'index.html');

// Helper: ensure dir exists
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function generateDebugPage() {
    ensureDir(PUBLIC_DIR);
    ensureDir(PUBLIC_IMAGES_DIR);

    // 1) Build HTML from template (placeholders are mostly cosmetic now)
    let todayDate = new Date().toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let html;
    try {
        html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    } catch (err) {
        console.error('Kan template.html niet lezen:', err);
        process.exit(1);
    }

    // Minimal placeholder content; JS will override once tips.json is loaded
    html = html
        .replace('{DATE_STRING}', todayDate)
        .replace(/{DAY_OF_YEAR}/g, '1')
        .replace('{TIP_TEXT}', 'Tips worden geladen...')
        .replace(
            '{TIP_IMAGE_TAG}',
            '<img id="tip-image" style="display:none;" alt="Cyber security tip">'
        );

    try {
        fs.writeFileSync(OUTPUT_HTML_PATH, html);
        console.log('DEBUG: HTML geschreven naar', OUTPUT_HTML_PATH);
    } catch (err) {
        console.error('Kan index.html niet schrijven:', err);
    }

    // 2) Copy tips.json from data/ to public/
    try {
        ensureDir(path.dirname(TIPS_JSON_DEST));
        fs.copyFileSync(TIPS_JSON_SRC, TIPS_JSON_DEST);
        console.log('DEBUG: tips.json gekopieerd naar', TIPS_JSON_DEST);
    } catch (err) {
        console.error('Kon tips.json niet kopiëren:', err);
    }

    // 3) Copy ALL images from data/images/ to public/images/
    try {
        if (fs.existsSync(DATA_IMAGES_DIR)) {
            const files = fs.readdirSync(DATA_IMAGES_DIR);
            for (const file of files) {
                const src = path.join(DATA_IMAGES_DIR, file);
                const dest = path.join(PUBLIC_IMAGES_DIR, file);

                if (fs.statSync(src).isFile()) {
                    fs.copyFileSync(src, dest);
                    console.log('DEBUG: image gekopieerd:', file);
                }
            }
        } else {
            console.warn('Let op: data/images bestaat niet:', DATA_IMAGES_DIR);
        }
    } catch (err) {
        console.error('Fout bij het kopiëren van images:', err);
    }
}

generateDebugPage();
