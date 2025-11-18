import { build } from 'esbuild';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read package.json to get external dependencies
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.optionalDependencies || {}),
];

build({
  entryPoints: ['src/api/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'api/index.js',
  external: external.filter(pkg => !pkg.startsWith('.') && !pkg.startsWith('/')),
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
}).catch(() => process.exit(1));

