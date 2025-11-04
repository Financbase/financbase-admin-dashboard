#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Converts PNG/JPG images to WebP format for better performance.
 * Creates mobile-optimized versions with smaller dimensions.
 * 
 * Usage: node scripts/optimize-images.js [--input-dir=./public] [--output-dir=./public/optimized]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DEFAULT_INPUT_DIR = './public';
const DEFAULT_OUTPUT_DIR = './public/optimized';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const WEBP_QUALITY = 85;
const MOBILE_MAX_WIDTH = 768;

// Parse command line arguments
const args = process.argv.slice(2);
const inputDir = args.find(arg => arg.startsWith('--input-dir='))?.split('=')[1] || DEFAULT_INPUT_DIR;
const outputDir = args.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] || DEFAULT_OUTPUT_DIR;

/**
 * Check if sharp is available (for WebP conversion)
 */
function checkSharpAvailable() {
  try {
    require.resolve('sharp');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if ImageMagick is available
 */
function checkImageMagickAvailable() {
  try {
    execSync('which convert', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Find all image files recursively
 * Security: Validates paths to prevent directory traversal attacks
 */
function findImageFiles(dir, fileList = [], baseDir = null) {
  // Set base directory on first call for path validation
  if (baseDir === null) {
    baseDir = path.resolve(dir);
  }
  
  const resolvedBaseDir = path.resolve(baseDir);
  const resolvedDir = path.resolve(dir);
  
  // Security: Ensure we're still within the base directory
  if (!resolvedDir.startsWith(resolvedBaseDir + path.sep) && resolvedDir !== resolvedBaseDir) {
    console.warn(`⚠️  Blocked directory traversal attempt: ${dir}`);
    return fileList;
  }

  try {
    const files = fs.readdirSync(resolvedDir);

    files.forEach(file => {
      // Security: Validate filename doesn't contain path traversal sequences
      if (file.includes('..') || file.includes('/') || file.includes('\\')) {
        console.warn(`⚠️  Blocked suspicious filename: ${file}`);
        return;
      }
      
      const filePath = path.join(resolvedDir, file);
      const normalizedPath = path.normalize(filePath);
      
      // Security: Double-check normalized path is still within base directory
      if (!normalizedPath.startsWith(resolvedBaseDir + path.sep) && normalizedPath !== resolvedBaseDir) {
        console.warn(`⚠️  Blocked path traversal: ${filePath}`);
        return;
      }
      
      const stat = fs.statSync(normalizedPath);

      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (!file.startsWith('.') && file !== 'node_modules') {
          findImageFiles(normalizedPath, fileList, baseDir);
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          fileList.push(normalizedPath);
        }
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return fileList;
}

/**
 * Convert image to WebP using sharp
 */
function convertToWebPSharp(inputPath, outputPath, width = null) {
  const sharp = require('sharp');
  let pipeline = sharp(inputPath);

  if (width) {
    pipeline = pipeline.resize(width, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  return pipeline
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);
}

/**
 * Convert image to WebP using ImageMagick (fallback)
 */
function convertToWebPImageMagick(inputPath, outputPath, width = null) {
  let command = `convert "${inputPath}"`;
  
  if (width) {
    command += ` -resize ${width}x`;
  }
  
  command += ` -quality ${WEBP_QUALITY} "${outputPath}"`;
  
  execSync(command, { stdio: 'inherit' });
}

/**
 * Convert image to WebP
 */
async function convertToWebP(inputPath, outputPath, width = null) {
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (checkSharpAvailable()) {
    await convertToWebPSharp(inputPath, outputPath, width);
  } else if (checkImageMagickAvailable()) {
    convertToWebPImageMagick(inputPath, outputPath, width);
  } else {
    console.warn(`⚠️  No image conversion tool available. Install 'sharp' or ImageMagick.`);
    console.warn(`   npm install sharp --save-dev`);
    return false;
  }

  return true;
}

/**
 * Get relative path for output
 */
function getOutputPath(inputPath, baseDir, outputBaseDir, suffix = '') {
  const relativePath = path.relative(baseDir, inputPath);
  const dir = path.dirname(relativePath);
  const name = path.basename(relativePath, path.extname(relativePath));
  const ext = '.webp';

  const outputDir = path.join(outputBaseDir, dir);
  const outputPath = path.join(outputDir, `${name}${suffix}${ext}`);

  return outputPath;
}

/**
 * Main optimization function
 */
async function optimizeImages() {
  console.log('🖼️  Image Optimization Script\n');
  console.log(`Input directory: ${inputDir}`);
  console.log(`Output directory: ${outputDir}\n`);

  // Check if input directory exists
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  // Find all image files
  console.log('📂 Scanning for images...');
  const imageFiles = findImageFiles(inputDir);
  console.log(`Found ${imageFiles.length} image file(s)\n`);

  if (imageFiles.length === 0) {
    console.log('✅ No images to optimize');
    return;
  }

  // Check for conversion tools
  const hasSharp = checkSharpAvailable();
  const hasImageMagick = checkImageMagickAvailable();

  if (!hasSharp && !hasImageMagick) {
    console.error('❌ No image conversion tool available!');
    console.error('   Please install one of:');
    console.error('   - npm install sharp --save-dev (recommended)');
    console.error('   - brew install imagemagick (macOS)');
    process.exit(1);
  }

  console.log(`Using: ${hasSharp ? 'sharp' : 'ImageMagick'}\n`);

  // Convert images
  let converted = 0;
  let errors = 0;

  for (const imagePath of imageFiles) {
    try {
      console.log(`Converting: ${path.relative(inputDir, imagePath)}`);

      // Desktop version (full size)
      const desktopOutput = getOutputPath(imagePath, inputDir, outputDir);
      await convertToWebP(imagePath, desktopOutput);
      console.log(`  ✓ Desktop: ${path.relative(outputDir, desktopOutput)}`);

      // Mobile version (smaller)
      const mobileOutput = getOutputPath(imagePath, inputDir, outputDir, '-mobile');
      await convertToWebP(imagePath, mobileOutput, MOBILE_MAX_WIDTH);
      console.log(`  ✓ Mobile: ${path.relative(outputDir, mobileOutput)}`);

      converted++;
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n✅ Optimization complete!`);
  console.log(`   Converted: ${converted} image(s)`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Update image references to use WebP versions`);
  console.log(`   2. Use ResponsiveImage component for responsive loading`);
  console.log(`   3. Test on different devices to verify optimization`);
}

// Run if called directly
if (require.main === module) {
  optimizeImages().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { optimizeImages, convertToWebP };

