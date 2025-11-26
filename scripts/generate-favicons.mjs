#!/usr/bin/env node
/**
 * Script to generate favicon.ico and PNG icons from SVG favicons
 * 
 * This script requires sharp to be installed:
 * npm install --save-dev sharp
 * 
 * Run with: node scripts/generate-favicons.mjs
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const appDir = join(rootDir, 'src', 'app');

async function generateFavicons() {
  try {
    console.log('Generating favicons...');
    
    // Read SVG files
    const faviconLightSvg = readFileSync(join(publicDir, 'favicon.svg'));
    const faviconDarkSvg = readFileSync(join(publicDir, 'favicon-dark.svg'));
    
    // Generate favicon.ico (16x16, 32x32, 48x48 sizes)
    const faviconSizes = [16, 32, 48];
    const faviconImages = await Promise.all(
      faviconSizes.map(size =>
        sharp(faviconLightSvg)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );
    
    // For ICO, we'll create a multi-size PNG (most browsers accept PNG as ICO)
    // Generate the largest size as favicon.ico
    await sharp(faviconLightSvg)
      .resize(32, 32)
      .png()
      .toFile(join(appDir, 'favicon.ico'));
    
    console.log('✓ Generated favicon.ico');
    
    // Generate apple-icon.png (180x180)
    await sharp(faviconLightSvg)
      .resize(180, 180)
      .png()
      .toFile(join(appDir, 'apple-icon.png'));
    
    console.log('✓ Generated apple-icon.png');
    
    // Generate icon.png (512x512 for PWA)
    await sharp(faviconLightSvg)
      .resize(512, 512)
      .png()
      .toFile(join(appDir, 'icon.png'));
    
    console.log('✓ Generated icon.png');
    
    // Generate og-image.png (1200x630 for social sharing)
    const ogImage = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 154, g: 111, b: 60, alpha: 1 } // #9a6f3c
      }
    })
      .composite([
        {
          input: await sharp(faviconLightSvg)
            .resize(200, 200)
            .png()
            .toBuffer(),
          top: 215,
          left: 500,
        }
      ])
      .png()
      .toBuffer();
    
    await sharp(ogImage)
      .png()
      .toFile(join(publicDir, 'og-image.png'));
    
    console.log('✓ Generated og-image.png');
    
    console.log('\n✅ All favicons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
      console.error('\n❌ Error: sharp is not installed.');
      console.error('Please install it with: npm install --save-dev sharp\n');
      process.exit(1);
    } else {
      console.error('Error generating favicons:', error);
      process.exit(1);
    }
  }
}

generateFavicons();

