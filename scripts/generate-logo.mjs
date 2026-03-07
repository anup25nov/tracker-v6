#!/usr/bin/env node
import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const logoPath = join(root, "public", "app_logo.png");
const androidDrawable = join(root, "android", "app", "src", "main", "res", "drawable-nodpi", "app_logo.png");

if (existsSync(join(root, "android"))) {
  mkdirSync(join(root, "android", "app", "src", "main", "res", "drawable-nodpi"), { recursive: true });
  await sharp(logoPath).resize(512, 512).png().toFile(androidDrawable);
  console.log("Updated Android launcher icon from public/app_logo.png");
}
