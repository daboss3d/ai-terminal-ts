const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Build script to transpile all TypeScript files in client/ directory to JavaScript in static/ directory using Bun
 * Supports both minified and non-minified builds via BUILD_MINIFY environment variable
 * Usage:
 *   BUILD_MINIFY=true node build-client.js  // For minified build
 *   BUILD_MINIFY=false node build-client.js // For non-minified build (default)
 */
const clientDir = path.join(__dirname, 'client');
const staticDir = path.join(__dirname, '..', 'static');

// Ensure static directory exists
if (!fs.existsSync(staticDir)) {
  console.log(`Creating static directory at ${staticDir}`);
  fs.mkdirSync(staticDir, { recursive: true });
}

// Get all TypeScript files in the client directory
function getTsFiles(dir) {
  const files = fs.readdirSync(dir);
  let tsFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively get files from subdirectories
      tsFiles = tsFiles.concat(getTsFiles(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Only include .ts and .tsx files
      tsFiles.push(filePath);
    }
  }

  return tsFiles;
}

// Use Bun CLI to transpile TypeScript to JavaScript
function buildFile(tsPath) {
  return new Promise((resolve, reject) => {
    // Determine the output file path
    const fileName = path.basename(tsPath, path.extname(tsPath));
    const jsPath = path.join(staticDir, `${fileName}.js`);

    // Determine if we should minify based on environment variable
    const shouldMinify = process.env.BUILD_MINIFY === 'true';

    const args = [
      'build',
      tsPath,
      '--outfile',
      jsPath,
      '--target',
      'browser',
      '--format',
      'esm' // or 'cjs' for CommonJS
    ];


    const fileNameOnly = path.basename(tsPath);

    if (shouldMinify) {

      args.push('--minify');
      // get only the file name for logging
      console.log(`Building <${fileNameOnly}> with minification enabled`);
    } else {
      args.push('--no-minify');
      console.log(`Building <${fileNameOnly}> without minification`);
    }

    const bunProcess = spawn('bun', args);

    bunProcess.stdout.on('data', (data) => {
      console.log(`Bun stdout: ${data}`);
    });

    bunProcess.stderr.on('data', (data) => {
      console.error(`Bun stderr: ${data}`);
    });

    bunProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`JavaScript file ${fileNameOnly} built successfully with Bun CLI!`);
        resolve();
      } else {
        console.error(`Bun build process exited with code ${code}`);
        reject(new Error(`Build failed with exit code ${code}`));
      }
    });
  });
}

// Build all TypeScript files in the client directory
async function buildAll() {

  console.log(`Starting build TypeScript files in ${clientDir}`);

  if (!fs.existsSync(clientDir)) {
    console.log(`Client directory does not exist: ${clientDir}`);
    return;
  }

  const tsFiles = getTsFiles(clientDir);

  if (tsFiles.length === 0) {
    console.log(`No TypeScript files found in -> ${clientDir} directory`);
    return;
  }

  console.log(`Found ${tsFiles.length} TypeScript files to build ------------------`);

  for (const tsFile of tsFiles) {
    try {
      await buildFile(tsFile);
    } catch (error) {
      console.error(`Failed to build ${tsFile}:`, error);
      throw error;
    }
  }
}

// Run the build function
buildAll()
  .then(() => console.log('Build completed successfully'))
  .catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
