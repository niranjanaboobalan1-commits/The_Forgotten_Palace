const fs = require('fs');
const path = require('path');

const imgPath = path.resolve('public/textures/grand_palace_panorama.jpg');
const buf = fs.readFileSync(imgPath);
const b64 = buf.toString('base64');
const content = 'export const PALACE_PANORAMA_DATA_URI = "data:image/jpeg;base64,' + b64 + '";\n';

if (!fs.existsSync('src')) fs.mkdirSync('src', { recursive: true });
fs.writeFileSync('src/palacePanoramaData.js', content, 'utf8');
fs.writeFileSync('dream-hanger/src/palacePanoramaData.js', content, 'utf8');
fs.writeFileSync('palacePanoramaData.js', content, 'utf8');
console.log('Successfully generated palacePanoramaData.js, bytes:', fs.statSync('palacePanoramaData.js').size);
