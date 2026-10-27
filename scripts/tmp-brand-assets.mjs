import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC =
  "C:/Users/ronny/AppData/Roaming/Code/agentSessionData/e1af52c9-5f91-4d69-aa17-0c59c1b82d68/attachments/48dfee5d-2665-40f5-9033-80fc834eca35/Custodio Seguro con Cubo Bitcoin.png";
const OUT = "public/brand";

await mkdir(OUT, { recursive: true });

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const px = new Uint8Array(data);
const alphaAt = (x, y) => px[(y * width + x) * channels + 3];

const isBackground = (x, y) => {
  const i = (y * width + x) * channels;
  return px[i] >= 246 && px[i + 1] >= 246 && px[i + 2] >= 246;
};

const visited = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) stack.push([x, 0], [x, height - 1]);
for (let y = 0; y < height; y++) stack.push([0, y], [width - 1, y]);

while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const idx = y * width + x;
  if (visited[idx] || !isBackground(x, y)) continue;
  visited[idx] = 1;
  px[idx * channels + 3] = 0;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

let minX = width,
  minY = height,
  maxX = -1,
  maxY = -1;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (alphaAt(x, y) === 0) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}

const lockup = {
  left: minX,
  top: minY,
  width: maxX - minX + 1,
  height: maxY - minY + 1,
};

const empty = [];
for (let x = minX; x <= maxX; x++) {
  let any = 0;
  for (let y = minY; y <= maxY; y++) any += alphaAt(x, y) > 0 ? 1 : 0;
  empty.push(any === 0);
}

let runStart = -1;
let bestStart = -1;
let bestLen = 0;
for (let i = 0; i <= empty.length; i++) {
  if (i < empty.length && empty[i]) {
    if (runStart === -1) runStart = i;
  } else if (runStart !== -1) {
    const len = i - runStart;
    if (len > bestLen && runStart > 0) {
      bestLen = len;
      bestStart = runStart;
    }
    runStart = -1;
  }
}

const markRight = bestStart > 0 ? minX + bestStart : minX + Math.round(lockup.width * 0.4);
const markWidth = markRight - minX;

const raw = await sharp(Buffer.from(px), { raw: { width, height, channels } })
  .png()
  .toBuffer();

await sharp(raw)
  .extract(lockup)
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/custodio-seguro-logo.png`);

const square = Math.max(markWidth, lockup.height) + 8;
const left = Math.max(0, minX - Math.round((square - markWidth) / 2));
const top = Math.max(0, minY - Math.round((square - lockup.height) / 2));
await sharp(raw)
  .extract({ left, top, width: square, height: square })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/custodio-seguro-mark.png`);

const meta = await sharp(`${OUT}/custodio-seguro-mark.png`).metadata();
console.log(
  JSON.stringify(
    { lockup, gap: { bestStart, bestLen }, markWidth, mark: { w: meta.width, h: meta.height } },
    null,
    2
  )
);
