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

// Resolve absolute paths
const entryPoint = resolve(process.cwd(), 'api/index.ts');
const outfile = resolve(process.cwd(), 'api/index.js');

// Check if entry point exists
if (!existsSync(entryPoint)) {
  console.error(`Error: Entry point not found: ${entryPoint}`);
  console.error(`Current working directory: ${process.cwd()}`);
  process.exit(1);
}

build({
  entryPoints: [entryPoint],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: outfile,
  external: external.filter(pkg => !pkg.startsWith('.') && !pkg.startsWith('/')),
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

