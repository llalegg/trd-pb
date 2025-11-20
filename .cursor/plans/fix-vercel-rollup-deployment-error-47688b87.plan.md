<!-- 47688b87-4ed9-4285-b3ab-db72cc1d561c 991c693a-a936-4772-a167-c4f82a23e7cf -->
# Fix Vercel Deployment Error: Missing @rollup/rollup-linux-x64-gnu

## Current State

- `@rollup/rollup-linux-x64-gnu` is in `optionalDependencies` but not being installed on Vercel
- Node version is set to `22.x` in `package.json`
- Build command doesn't use `npm ci` with optional dependencies flag
- Vite is at `^5.4.20` (not latest)

## Implementation Steps

### Step 1: Add explicit optional dependency

- Run `npm install @rollup/rollup-linux-x64-gnu --save-optional` to ensure it's properly added to package-lock.json
- This will update `package-lock.json` with the dependency entry

### Step 2: Update Node version in package.json

- Change `engines.node` from `"22.x"` to `"18.x"` in `package.json`
- **Note**: This is a significant change - verify compatibility with current codebase

### Step 3: Update build command

- Modify `package.json` build script to use `npm ci --include=optional` before the existing build steps
- Change from: `"build": "vite build && esbuild ..."`
- Change to: `"build": "npm ci --include=optional && vite build && esbuild ..."`
- Alternatively, update `vercel.json` buildCommand to include the npm ci step

### Step 4: Update Vite to latest version

- Run `npm install vite@latest -D` to update Vite to the latest version
- This will update both `package.json` and `package-lock.json`

### Step 5: Verify and commit

- Test locally: `rm -rf node_modules package-lock.json && npm install && npm run build`
- Commit updated `package.json` and `package-lock.json`

## Files to Modify

- `package.json` - Update engines.node, build script, vite version
- `package-lock.json` - Will be updated by npm install commands
- `vercel.json` - Potentially update buildCommand (if not modifying package.json script)

## Priority Order

1. Steps 1-3 (explicit dependency, Node version, build command) - Critical
2. Step 4 (Vite update) - Recommended but less critical
3. Step 5 (Testing and commit) - Final verification

### To-dos

- [ ] Run npm install @rollup/rollup-linux-x64-gnu --save-optional to ensure it appears in package-lock.json
- [ ] Change engines.node from '22.x' to '18.x' in package.json
- [ ] Update build script in package.json to include npm ci --include=optional before existing build steps
- [ ] Run npm install vite@latest -D to update Vite to latest version
- [ ] Test locally: rm -rf node_modules package-lock.json && npm install && npm run build
- [ ] Commit updated package.json and package-lock.json