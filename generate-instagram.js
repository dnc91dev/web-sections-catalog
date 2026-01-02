// generate-instagram.js
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const SECTIONS_DIR = path.join(__dirname, 'sections');
const OUTPUT_DIR = path.join(__dirname, 'output', 'instagram-ready');
const TEMPLATE_FONT = 'bold 60px Arial';
const FONT_COLOR = '#000000';
const BG_COLOR = '#FFFFFF';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.readdirSync(SECTIONS_DIR).forEach(sectionFolder => {
  const sectionPath = path.join(SECTIONS_DIR, sectionFolder);
  if (!fs.statSync(sectionPath).isDirectory()) return;

  const mockupPath = fs.readdirSync(sectionPath).find(file => 
    file.match(/mockup\.(png|jpg|jpeg)/i)
  );

  const descPath = path.join(sectionPath, 'description.md');
  if (!mockupPath || !fs.existsSync(descPath)) {
    console.log(`⚠️  Saltando ${sectionFolder}: falta mockup o description.md`);
    return;
  }

  const fullMockupPath = path.join(sectionPath, mockupPath);
  const descContent = fs.readFileSync(descPath, 'utf8');

  // Extraer título y ubicación típica del markdown
  const titleMatch = descContent.match(/^# (.+)/m);
  const locationMatch = descContent.match(/## Ubicación típica\n(.+)/m);
  const title = titleMatch ? titleMatch[1].replace(/\(.*\)/, '').trim() : sectionFolder;
  const location = locationMatch ? locationMatch[1].trim() : 'En el sitio web';

  generateInstagramImage(fullMockupPath, title, location, sectionFolder);
});

async function generateInstagramImage(mockupPath, title, location, folderName) {
  const img = await loadImage(mockupPath);
  const canvas = createCanvas(1080, 1080);
  const ctx = canvas.getContext('2d');

  // Fondo blanco
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, 1080, 1080);

  // Imagen del mockup centrada (mantiene proporción)
  const scale = Math.min(1080 / img.width, 800 / img.height);
  const width = img.width * scale;
  const height = img.height * scale;
  const x = (1080 - width) / 2;
  const y = (1080 - height) / 2 - 50; // un poco arriba para dejar espacio al texto

  ctx.drawImage(img, x, y, width, height);

  // Texto superpuesto abajo
  ctx.fillStyle = FONT_COLOR;
  ctx.font = 'bold 70px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, 540, 950);

  ctx.font = '40px Arial';
  ctx.fillStyle = '#555555';
  ctx.fillText(location, 540, 1010);

  // Guardar imagen
  const outputSectionDir = path.join(OUTPUT_DIR, folderName);
  if (!fs.existsSync(outputSectionDir)) fs.mkdirSync(outputSectionDir, { recursive: true });

  const outPath = path.join(outputSectionDir, 'instagram-post.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);

  // Guardar caption sugerida
  const caption = `🔹 ${title}\n\nUbicación típica: ${location}\n\n¡Nueva sección agregada al muestrario open source! ¿La usarías en tu web?\n\n👉 Contribuye más secciones en GitHub (link en bio)\n\n#DiseñoWeb #WebDesign #MuestrarioWeb #OpenSource`;
  fs.writeFileSync(path.join(outputSectionDir, 'caption.txt'), caption);

  console.log(`✅ Generado: ${folderName}`);
}

console.log('🎉 ¡Todas las imágenes para Instagram listas en /output/instagram-ready/!');
