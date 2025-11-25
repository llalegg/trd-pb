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

// Build both API endpoints (only if they exist)
// These are optional - we use Express routes in server/routes.ts instead
const apiFiles = [
  { entry: 'api/index.ts', output: 'api/index.js' },
  { entry: 'api/populate.ts', output: 'api/populate.js' },
].filter(({ entry }) => {
  const entryPath = resolve(process.cwd(), entry);
  return existsSync(entryPath);
});

if (apiFiles.length === 0) {
  console.log('ℹ️  No API files found (using Express routes instead)');
  process.exit(0);
}

Promise.all(
  apiFiles.map(({ entry, output }) => buildApiFile(entry, output))
).then(() => {
  console.log('✅ All API endpoints bundled successfully');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

