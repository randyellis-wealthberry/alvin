#!/usr/bin/env node
/**
 * Generate PWA icons for ALVIN
 * Purple background (#2e026d) with white "A"
 */

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const PURPLE = "#2e026d";
const WHITE = "#ffffff";

async function generateIcon(size, filename) {
  // Calculate font size relative to icon size
  const fontSize = Math.round(size * 0.6);
  const yOffset = Math.round(size * 0.38);

  // Create SVG with purple background and white "A"
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${PURPLE}"/>
      <text
        x="50%"
        y="${yOffset + fontSize * 0.8}"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${WHITE}"
      >A</text>
    </svg>
  `;

  const outputPath = path.join(process.cwd(), "public", filename);

  await sharp(Buffer.from(svg)).png().toFile(outputPath);

  console.log(`Created: ${outputPath} (${size}x${size})`);
}

async function main() {
  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), "public");
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }

  // Generate all required icons
  await generateIcon(192, "icon-192x192.png");
  await generateIcon(512, "icon-512x512.png");
  await generateIcon(180, "apple-touch-icon.png");

  console.log("\nAll PWA icons generated successfully!");
}

main().catch(console.error);
