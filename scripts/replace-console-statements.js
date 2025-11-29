#!/usr/bin/env node

/**
 * Script to replace console statements with logger calls
 * Usage: node scripts/replace-console-statements.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript files with console statements
const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('console.error') || content.includes('console.warn') || content.includes('console.log')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
};

const replaceConsoleInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if logger is already imported
  const hasLoggerImport = content.includes("from '@/lib/logger'") || content.includes('from "@/lib/logger"');
  
  // Add logger import if not present and file has console statements
  if (!hasLoggerImport && (content.includes('console.error') || content.includes('console.warn') || content.includes('console.log'))) {
    // Find the last import statement
    const importRegex = /^import\s+.*$/gm;
    const imports = content.match(importRegex) || [];
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
      content = content.slice(0, insertIndex) + "import { logger } from '@/lib/logger';\n" + content.slice(insertIndex);
      modified = true;
    }
  }
  
  // Replace console.error with logger.error (preserving the message and data)
  const errorRegex = /console\.error\(([^)]+)\)/g;
  content = content.replace(errorRegex, (match, args) => {
    modified = true;
    // Try to preserve the original arguments
    return `logger.error(${args})`;
  });
  
  // Replace console.warn with logger.warn
  const warnRegex = /console\.warn\(([^)]+)\)/g;
  content = content.replace(warnRegex, (match, args) => {
    modified = true;
    return `logger.warn(${args})`;
  });
  
  // Replace console.log with logger.info (for info-level logging)
  // Be careful with this - console.log might be debug info
  const logRegex = /console\.log\(([^)]+)\)/g;
  content = content.replace(logRegex, (match, args) => {
    modified = true;
    // Check if it's a debug message (contains 'debug' or '[DEBUG]')
    if (args.includes('debug') || args.includes('[DEBUG]') || args.includes('DEBUG')) {
      return `logger.debug(${args})`;
    }
    return `logger.info(${args})`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
};

// Main execution
const appApiDir = path.join(process.cwd(), 'app/api');
const appDashboardDir = path.join(process.cwd(), 'app/(dashboard)');
const componentsDir = path.join(process.cwd(), 'components');

console.log('Finding files with console statements...');
const apiFiles = findFiles(appApiDir);
const dashboardFiles = findFiles(appDashboardDir);
const componentFiles = findFiles(componentsDir);
const allFiles = [...apiFiles, ...dashboardFiles, ...componentFiles];

console.log(`Found ${allFiles.length} files with console statements`);

let updatedCount = 0;
allFiles.forEach(file => {
  if (replaceConsoleInFile(file)) {
    updatedCount++;
  }
});

console.log(`\nUpdated ${updatedCount} files`);
console.log('Note: Please review the changes and adjust log levels (debug/info/warn/error) as needed.');

