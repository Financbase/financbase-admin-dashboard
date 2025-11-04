#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_DIR = path.join(__dirname, '../docs');
const REPORT_DIR = path.join(__dirname, '../reports');
const REPORT_FILE = path.join(REPORT_DIR, 'docs-link-check-report.txt');

// Track results
const brokenLinks = [];
const validLinks = [];
const missingFiles = new Set();
const checkedFiles = new Set();

// Markdown link regex: [text](link)
const LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Check if a path is an external URL
 */
function isExternalUrl(link) {
  return /^(https?|mailto|tel|ftp):/i.test(link);
}

/**
 * Check if a link is an anchor (fragment only)
 */
function isAnchor(link) {
  return link.startsWith('#');
}

/**
 * Extract file path from markdown link
 * Handles: ./file.md, ../file.md, /file.md, file.md, file.md#anchor
 */
function extractFilePath(link) {
  // Remove anchor if present
  const withoutAnchor = link.split('#')[0];
  
  // Remove query params if present
  const withoutQuery = withoutAnchor.split('?')[0];
  
  return withoutQuery;
}

/**
 * Resolve file path relative to source file
 */
function resolveFilePath(sourceFile, link) {
  const sourceDir = path.dirname(sourceFile);
  const linkPath = extractFilePath(link);
  const projectRoot = path.join(__dirname, '..');
  
  // Handle absolute paths from docs root
  if (linkPath.startsWith('/')) {
    return path.join(DOCS_DIR, linkPath.slice(1));
  }
  
    // Handle relative paths
    if (linkPath.startsWith('./') || linkPath.startsWith('../')) {
      const resolved = path.resolve(sourceDir, linkPath);
      // path.resolve handles ../ correctly, so if resolved goes to project root, it's valid
      // Just return the resolved path - it should be correct
      return resolved;
    }
  
  // Handle relative paths without ./ prefix
  if (!path.isAbsolute(linkPath)) {
    const resolved = path.resolve(sourceDir, linkPath);
    // If resolved path goes outside docs, check project root
    if (!resolved.startsWith(DOCS_DIR)) {
      // Try resolving from project root
      const fromRoot = path.resolve(projectRoot, linkPath);
      if (fs.existsSync(fromRoot) || fs.existsSync(fromRoot + '.md')) {
        return fromRoot;
      }
      // Try resolving from docs directory
      const fromDocs = path.resolve(DOCS_DIR, linkPath);
      if (fs.existsSync(fromDocs) || fs.existsSync(fromDocs + '.md')) {
        return fromDocs;
      }
    }
    return resolved;
  }
  
  return linkPath;
}

/**
 * Check if file exists (with or without .md extension)
 */
function fileExists(filePath) {
  // Try exact path
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      return true;
    }
    // If it's a directory, check for README.md
    if (stat.isDirectory()) {
      const readmePath = path.join(filePath, 'README.md');
      if (fs.existsSync(readmePath)) {
        return true;
      }
    }
  }
  
  // Try with .md extension
  if (!filePath.endsWith('.md')) {
    const withMd = filePath + '.md';
    if (fs.existsSync(withMd) && fs.statSync(withMd).isFile()) {
      return true;
    }
  }
  
  // Try as directory with README.md (even if path doesn't exist as directory)
  const dirPath = filePath.endsWith('/') ? filePath.slice(0, -1) : filePath;
  const readmePath = path.join(dirPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    return true;
  }
  
  // Check if parent directory exists and has README.md
  const parentDir = path.dirname(filePath);
  const parentReadme = path.join(parentDir, 'README.md');
  if (fs.existsSync(parentReadme)) {
    // Check if the link is pointing to a directory (no extension)
    const basename = path.basename(filePath);
    if (!basename.includes('.')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get all markdown files recursively
 */
function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Check if link points to a code file (should be ignored or handled differently)
 */
function isCodeFile(filePath) {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rb', '.php'];
  return codeExtensions.some(ext => filePath.endsWith(ext));
}

/**
 * Check links in a markdown file
 */
function checkLinksInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  const projectRoot = path.join(__dirname, '..');
  
  let match;
  const linkRegex = new RegExp(LINK_REGEX);
  
  while ((match = linkRegex.exec(content)) !== null) {
    const [fullMatch, linkText, linkUrl] = match;
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    // Skip external URLs
    if (isExternalUrl(linkUrl)) {
      continue;
    }
    
    // Skip anchor-only links
    if (isAnchor(linkUrl)) {
      continue;
    }
    
    // Resolve the file path
    const resolvedPath = resolveFilePath(filePath, linkUrl);
    
    // Check if it's a code file reference
    if (isCodeFile(resolvedPath)) {
      // Code files are valid references, just verify they exist
      let codeFilePath = resolvedPath;
      
      if (!fs.existsSync(resolvedPath)) {
        // Try resolving from project root if path doesn't exist
        const linkPath = extractFilePath(linkUrl);
        
        // If path starts with ../, try resolving from project root
        if (linkPath.startsWith('../')) {
          // Remove all ../ from path
          const cleanPath = linkPath.replace(/^(\.\.\/)+/g, '');
          // Try resolving from project root
          const fromRoot = path.join(projectRoot, cleanPath);
          if (fs.existsSync(fromRoot)) {
            codeFilePath = fromRoot;
          }
        }
      }
      
      if (fs.existsSync(codeFilePath)) {
        validLinks.push({
          source: relativePath,
          line: lineNumber,
          link: linkUrl,
          target: path.relative(projectRoot, codeFilePath),
          text: linkText
        });
      } else {
        // Code file doesn't exist - this is a broken reference
        const targetPath = path.relative(projectRoot, resolvedPath);
        brokenLinks.push({
          source: relativePath,
          line: lineNumber,
          link: linkUrl,
          target: targetPath,
          text: linkText,
          resolvedPath: resolvedPath
        });
        missingFiles.add(resolvedPath);
      }
      continue;
    }
    
    // Check if file exists (markdown or directory)
    let markdownPath = resolvedPath;
    
    if (!fileExists(resolvedPath)) {
      // Try resolving from docs directory if path doesn't start with docs
      const linkPath = extractFilePath(linkUrl);
      
      // If link uses ../adr/ or similar, it might be trying to go up from docs
      // but the file is actually in docs/adr/
      if (linkPath.startsWith('../')) {
        // Remove ../ and try from docs directory
        const cleanPath = linkPath.replace(/^(\.\.\/)+/g, '');
        const fromDocs = path.join(DOCS_DIR, cleanPath);
        if (fileExists(fromDocs)) {
          markdownPath = fromDocs;
        }
      }
      
      // Also try from project root for files referenced with ../
      if (!fileExists(markdownPath)) {
        const projectRootPath = path.join(projectRoot, path.basename(resolvedPath));
        if (fileExists(projectRootPath)) {
          markdownPath = projectRootPath;
        }
      }
    }
    
    if (fileExists(markdownPath)) {
      validLinks.push({
        source: relativePath,
        line: lineNumber,
        link: linkUrl,
        target: path.relative(projectRoot, markdownPath),
        text: linkText
      });
    } else {
      const targetPath = path.relative(projectRoot, resolvedPath);
      brokenLinks.push({
        source: relativePath,
        line: lineNumber,
        link: linkUrl,
        target: targetPath,
        text: linkText,
        resolvedPath: resolvedPath
      });
      
      // Track missing files
      missingFiles.add(resolvedPath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting documentation link checker...\n');
  console.log(`📁 Scanning: ${DOCS_DIR}\n`);
  
  // Ensure report directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
  
  // Get all markdown files
  const markdownFiles = getAllMarkdownFiles(DOCS_DIR);
  console.log(`📄 Found ${markdownFiles.length} markdown files\n`);
  
  // Check links in each file
  markdownFiles.forEach(file => {
    try {
      checkLinksInFile(file);
      checkedFiles.add(file);
    } catch (error) {
      console.error(`❌ Error checking ${file}:`, error.message);
    }
  });
  
  // Generate report
  let report = 'Documentation Link Check Report\n';
  report += '='.repeat(50) + '\n\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Files checked: ${checkedFiles.size}\n`;
  report += `Valid links: ${validLinks.length}\n`;
  report += `Broken links: ${brokenLinks.length}\n`;
  report += `Missing files: ${missingFiles.size}\n\n`;
  
  if (brokenLinks.length > 0) {
    report += 'BROKEN LINKS\n';
    report += '-'.repeat(50) + '\n\n';
    
    // Group by source file
    const groupedBySource = {};
    brokenLinks.forEach(link => {
      if (!groupedBySource[link.source]) {
        groupedBySource[link.source] = [];
      }
      groupedBySource[link.source].push(link);
    });
    
    Object.keys(groupedBySource).sort().forEach(source => {
      report += `\n${source}:\n`;
      groupedBySource[source].forEach(link => {
        report += `  Line ${link.line}: [${link.text}](${link.link})\n`;
        report += `    → ${link.target}\n`;
      });
    });
    
    report += '\n\nMISSING FILES\n';
    report += '-'.repeat(50) + '\n\n';
    Array.from(missingFiles).sort().forEach(missingFile => {
      const relPath = path.relative(path.join(__dirname, '..'), missingFile);
      report += `- ${relPath}\n`;
    });
  }
  
  // Write report to file
  fs.writeFileSync(REPORT_FILE, report);
  
  // Console output
  console.log('📊 Results:');
  console.log(`  ✅ Valid links: ${validLinks.length}`);
  console.log(`  ❌ Broken links: ${brokenLinks.length}`);
  console.log(`  📝 Missing files: ${missingFiles.size}`);
  console.log(`\n📄 Report saved to: ${REPORT_FILE}\n`);
  
  if (brokenLinks.length > 0) {
    console.log('❌ Broken Links:\n');
    
    // Group by source file for better readability
    const groupedBySource = {};
    brokenLinks.forEach(link => {
      if (!groupedBySource[link.source]) {
        groupedBySource[link.source] = [];
      }
      groupedBySource[link.source].push(link);
    });
    
    Object.keys(groupedBySource).sort().forEach(source => {
      console.log(`\n  ${source}:`);
      groupedBySource[source].forEach(link => {
        console.log(`    Line ${link.line}: [${link.text}](${link.link})`);
        console.log(`      → ${link.target}`);
      });
    });
    
    console.log('\n📝 Missing Files:\n');
    Array.from(missingFiles).sort().forEach(missingFile => {
      const relPath = path.relative(path.join(__dirname, '..'), missingFile);
      console.log(`  - ${relPath}`);
    });
    
    console.log('\n');
    process.exit(1);
  } else {
    console.log('🎉 All links are valid!\n');
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, checkLinksInFile, resolveFilePath, fileExists };

