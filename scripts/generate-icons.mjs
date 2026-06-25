import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="512" height="512" fill="none">
  <rect width="512" height="512" rx="106" fill="#4f6ef7"/>
  <circle cx="256" cy="224" r="128" stroke="white" stroke-width="20" stroke-opacity="0.3"/>
  <path d="M256 96 A128 128 0 0 1 384 224" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <circle cx="256" cy="224" r="22" fill="white"/>
  <line x1="256" y1="224" x2="256" y2="112" stroke="white" stroke-width="16" stroke-linecap="round"/>
</svg>
`);

const sizes = [192, 512];
for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join("public", "icons", `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}
