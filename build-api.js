import { build } from 'esbuild';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Read package.json to get external dependencies
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.optionalDependencies || {}),
  // Explicitly exclude build-time only packages from runtime bundle
  'rollup',
  '@rollup/rollup-linux-x64-gnu',
  '@rollup/rollup-darwin-x64',
  '@rollup/rollup-darwin-arm64',
  '@rollup/rollup-win32-x64-msvc',
  'vite',
  '@vitejs/plugin-react',
];

function buildApiFile(entryFile, outputFile) {
  const entryPoint = resolve(process.cwd(), entryFile);
  const outfile = resolve(process.cwd(), outputFile);

  // Check if entry point exists
  if (!existsSync(entryPoint)) {
    console.log(`⚠️  Entry point not found: ${entryPoint}, skipping...`);
    return Promise.resolve();
  }

  return build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: outfile,
    external: external.filter(pkg => !pkg.startsWith('.') && !pkg.startsWith('/')),
    banner: {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
    },
    absWorkingDir: process.cwd(),
    logLevel: 'info',
  }).catch((error) => {
    console.error(`Build failed for ${entryFile}:`, error);
    console.error('Entry point:', entryPoint);
    console.error('Outfile:', outfile);
    process.exit(1);
  });
}

// Build API endpoint
Promise.all([
  buildApiFile('api/index.ts', 'api/index.js'),
]).then(() => {
  console.log('✅ All API endpoints bundled successfully');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

