const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Build script to transpile client.ts to client.js using Bun
 * Supports both minified and non-minified builds via BUILD_MINIFY environment variable
 * Usage:
 *   BUILD_MINIFY=true node build-client.js  // For minified build
 *   BUILD_MINIFY=false node build-client.js // For non-minified build (default)
 */
const clientTsPath = path.join(__dirname, 'client.tsx');
const staticDir = path.join(__dirname, '..', 'static');
const clientJsPath = path.join(staticDir, 'client.js');

// Ensure static directory exists
if (!fs.existsSync(staticDir)) {
  console.log(`Creating static directory at ${staticDir}`);
  exit(1)
  fs.mkdirSync(staticDir, { recursive: true });
}

// Use Bun CLI to transpile TypeScript to JavaScript
function buildClient() {
  return new Promise((resolve, reject) => {
    // Determine if we should minify based on environment variable
    const shouldMinify = process.env.BUILD_MINIFY === 'true';

    const args = [
      'build',
      clientTsPath,
      '--outfile',
      clientJsPath,
      '--target',
      'browser',
      '--format',
      'esm' // or 'cjs' for CommonJS
    ];

    if (shouldMinify) {
      args.push('--minify');
      console.log('Building with minification enabled');
    } else {
      args.push('--no-minify');
      console.log('Building without minification');
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
        console.log('Client JavaScript file built successfully with Bun CLI!');
        resolve();
      } else {
        console.error(`Bun build process exited with code ${code}`);
        reject(new Error(`Build failed with exit code ${code}`));
      }
    });
  });
}

// Run the build function
buildClient()
  .then(() => console.log('Build completed successfully'))
  .catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
