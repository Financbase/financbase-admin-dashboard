#!/usr/bin/env node

/**
 * Script to add copyright headers to source files
 * 
 * Usage:
 *   node scripts/add-copyright-headers.js [options]
 * 
 * Options:
 *   --check        Only check for missing headers, don't add them
 *   --dry-run      Show what would be done without making changes
 *   --extensions   Comma-separated list of extensions (default: ts,tsx,js,jsx)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COPYRIGHT_HEADER = `/**
 * Copyright (c) ${new Date().getFullYear()} Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */`;

const COPYRIGHT_HEADER_TSX = COPYRIGHT_HEADER;
const COPYRIGHT_HEADER_TS = COPYRIGHT_HEADER;
const COPYRIGHT_HEADER_JS = COPYRIGHT_HEADER.replace(/\/\*\*/g, '/**').replace(/\*\//g, '*/');
const COPYRIGHT_HEADER_JSX = COPYRIGHT_HEADER_JS;

const EXTENSIONS = {
  ts: COPYRIGHT_HEADER_TS,
  tsx: COPYRIGHT_HEADER_TSX,
  js: COPYRIGHT_HEADER_JS,
  jsx: COPYRIGHT_HEADER_JSX,
};

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.git/,
  /drizzle\/migrations/,
  /\.test\./,
  /\.spec\./,
];

const IGNORE_FILES = [
  'next-env.d.ts',
  'vitest.config.ts',
  'jest.config.js',
  'jest.setup.js',
];

function shouldIgnore(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check ignore patterns
  if (IGNORE_PATTERNS.some(pattern => pattern.test(relativePath))) {
    return true;
  }
  
  // Check ignore files
  if (IGNORE_FILES.includes(path.basename(filePath))) {
    return true;
  }
  
  return false;
}

function hasCopyrightHeader(content) {
  return content.includes('Copyright') && 
         content.includes('Financbase') && 
         content.includes('All Rights Reserved');
}

function addCopyrightHeader(filePath, extension, checkOnly = false, dryRun = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has copyright header
  if (hasCopyrightHeader(content)) {
    return { status: 'skipped', reason: 'already has copyright header' };
  }
  
  // Skip if file is empty or only whitespace
  if (!content.trim()) {
    return { status: 'skipped', reason: 'empty file' };
  }
  
  if (checkOnly) {
    return { status: 'missing', file: filePath };
  }
  
  const header = EXTENSIONS[extension];
  if (!header) {
    return { status: 'error', reason: `unknown extension: ${extension}` };
  }
  
  // Check if file starts with shebang
  const hasShebang = content.startsWith('#!');
  const shebangLine = hasShebang ? content.split('\n')[0] + '\n\n' : '';
  const contentAfterShebang = hasShebang ? content.split('\n').slice(1).join('\n') : content;
  
  // Check if file already has a comment block at the top
  const hasExistingComment = contentAfterShebang.trim().startsWith('/*') || 
                            contentAfterShebang.trim().startsWith('//');
  
  let newContent;
  if (hasExistingComment) {
    // Insert after existing comment
    const commentEnd = contentAfterShebang.indexOf('*/');
    if (commentEnd !== -1) {
      const commentBlock = contentAfterShebang.substring(0, commentEnd + 2);
      const rest = contentAfterShebang.substring(commentEnd + 2);
      newContent = shebangLine + commentBlock + '\n\n' + header + '\n' + rest;
    } else {
      // If no closing comment found, prepend
      newContent = shebangLine + header + '\n\n' + contentAfterShebang;
    }
  } else {
    // Prepend copyright header
    newContent = shebangLine + header + '\n\n' + contentAfterShebang;
  }
  
  if (!dryRun) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
  
  return { status: 'added', file: filePath, dryRun };
}

function processDirectory(dir, extensions, checkOnly = false, dryRun = false) {
  const results = {
    processed: 0,
    skipped: 0,
    added: 0,
    missing: [],
    errors: [],
  };
  
  function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!shouldIgnore(filePath)) {
          walkDir(filePath);
        }
      } else if (stat.isFile()) {
        if (shouldIgnore(filePath)) {
          continue;
        }
        
        const ext = path.extname(file).slice(1);
        if (extensions.includes(ext)) {
          results.processed++;
          
          const result = addCopyrightHeader(filePath, ext, checkOnly, dryRun);
          
          if (result.status === 'skipped') {
            results.skipped++;
          } else if (result.status === 'added') {
            results.added++;
            if (dryRun) {
              console.log(`[DRY RUN] Would add copyright to: ${filePath}`);
            } else {
              console.log(`Added copyright to: ${filePath}`);
            }
          } else if (result.status === 'missing') {
            results.missing.push(filePath);
          } else if (result.status === 'error') {
            results.errors.push({ file: filePath, reason: result.reason });
          }
        }
      }
    }
  }
  
  // Start from app, components, lib directories
  const startDirs = ['app', 'components', 'lib', 'hooks'];
  
  for (const dir of startDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      walkDir(dirPath);
    }
  }
  
  return results;
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const dryRun = args.includes('--dry-run');
  const extensionsArg = args.find(arg => arg.startsWith('--extensions='));
  const extensions = extensionsArg 
    ? extensionsArg.split('=')[1].split(',')
    : ['ts', 'tsx', 'js', 'jsx'];
  
  console.log('Copyright Header Management');
  console.log('==========================\n');
  console.log(`Mode: ${checkOnly ? 'CHECK ONLY' : dryRun ? 'DRY RUN' : 'ADD HEADERS'}`);
  console.log(`Extensions: ${extensions.join(', ')}\n`);
  
  const results = processDirectory(process.cwd(), extensions, checkOnly, dryRun);
  
  console.log('\nResults:');
  console.log(`  Processed: ${results.processed}`);
  console.log(`  Skipped: ${results.skipped}`);
  
  if (checkOnly) {
    console.log(`  Missing headers: ${results.missing.length}`);
    if (results.missing.length > 0) {
      console.log('\nFiles missing copyright headers:');
      results.missing.forEach(file => console.log(`  - ${file}`));
    }
  } else {
    console.log(`  Added: ${results.added}`);
  }
  
  if (results.errors.length > 0) {
    console.log(`\nErrors: ${results.errors.length}`);
    results.errors.forEach(({ file, reason }) => {
      console.log(`  - ${file}: ${reason}`);
    });
    process.exit(1);
  }
  
  if (checkOnly && results.missing.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addCopyrightHeader, hasCopyrightHeader };

