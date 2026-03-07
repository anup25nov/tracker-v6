#!/usr/bin/env node
import sharp from "sharp";
import { readFileSync, copyFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "logo.svg");
const pngPath = join(root, "public", "logo512x512.png");
const androidDrawable = join(root, "android", "app", "src", "main", "res", "drawable-nodpi", "app_logo.png");

const svg = readFileSync(svgPath);
await sharp(svg).resize(512, 512).png().toFile(pngPath);
console.log("Generated public/logo512x512.png from logo.svg");

if (existsSync(join(root, "android"))) {
  mkdirSync(join(root, "android", "app", "src", "main", "res", "drawable-nodpi"), { recursive: true });
  copyFileSync(pngPath, androidDrawable);
  console.log("Updated Android launcher icon");
}
