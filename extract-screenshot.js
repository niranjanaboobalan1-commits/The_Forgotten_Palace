import fs from 'fs';

const logPath = 'C:/Users/DELL/.gemini/antigravity/brain/ace5f3af-3c15-48da-adcd-37e65ee73e1a/.system_generated/tasks/task-1121.log';
const outPath = 'C:/Users/DELL/.gemini/antigravity/brain/ace5f3af-3c15-48da-adcd-37e65ee73e1a/iwer_screenshot_1.jpg';

const text = fs.readFileSync(logPath, 'utf8');
const lines = text.split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('"mimeType":"image/jpeg"')) {
    try {
      const obj = JSON.parse(lines[i]);
      const imgContent = obj.result?.content?.find((c) => c.type === 'image' && c.data);
      if (imgContent) {
        fs.writeFileSync(outPath, Buffer.from(imgContent.data, 'base64'));
        console.log('Saved screenshot successfully! Size:', fs.statSync(outPath).size);
        break;
      }
    } catch (e) {
      // continue
    }
  }
}
