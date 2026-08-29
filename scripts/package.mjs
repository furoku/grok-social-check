import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.resolve(root, '..');
const distDir = path.join(extRoot, 'dist');

const manifest = JSON.parse(fs.readFileSync(path.join(extRoot, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(extRoot, 'package.json'), 'utf8'));
if (manifest.version !== pkg.version) {
  console.error('[package] manifest and package versions do not match');
  process.exit(1);
}

const version = manifest.version;
const zipName = `grok-social-check-v${version}.zip`;
const zipPath = path.join(distDir, zipName);

const include = [
  'manifest.json',
  'background.js',
  'content.js',
  'styles.css',
  'options.html',
  'options.js',
  'popup.html',
  'popup.js',
  'README.md',
  'LICENSE',
  'PRIVACY.md',
  'SECURITY.md',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'lib/api-errors.js',
  'lib/api-request.js',
  'lib/post-extract.js',
  'lib/post-extract-threads.js',
  'lib/prompt.js',
  'lib/settings.js'
];

for (const rel of include) {
  const full = path.join(extRoot, rel);
  if (!fs.existsSync(full)) {
    console.error(`[package] missing: ${rel}`);
    process.exit(1);
  }
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

const py = `
import os, zipfile
ext_root = ${JSON.stringify(extRoot)}
zip_path = ${JSON.stringify(zipPath)}
files = ${JSON.stringify(include)}
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for rel in files:
        zf.write(os.path.join(ext_root, rel), rel)
print('ok', zip_path, os.path.getsize(zip_path))
`;

const result = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(1);
}
console.log('[package]', result.stdout.trim());
console.log(`[package] version ${version}`);
