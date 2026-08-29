import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.resolve(root, '..');

function fail(msg) {
  console.error(`[smoke] FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`[smoke] OK: ${msg}`);
}

const manifestPath = path.join(extRoot, 'manifest.json');
const packagePath = path.join(extRoot, 'package.json');
if (!fs.existsSync(manifestPath)) fail('manifest.json missing');
if (!fs.existsSync(packagePath)) fail('package.json missing');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (manifest.manifest_version !== 3) fail('manifest_version must be 3');
if (manifest.version !== pkg.version) fail('manifest and package versions must match');
ok(`version surfaces match: ${manifest.version}`);

const patterns = (manifest.content_scripts?.[0]?.matches || []).join(' ');
if (!patterns.includes('x.com') || !patterns.includes('threads')) {
  fail('content_scripts must match x.com and threads');
}
ok('manifest hosts include X and Threads');

const files = [
  'background.js',
  'content.js',
  'options.html',
  'options.js',
  'popup.html',
  'popup.js',
  'styles.css',
  'LICENSE',
  'PRIVACY.md',
  'SECURITY.md',
  'lib/api-errors.js',
  'lib/api-request.js',
  'lib/post-extract.js',
  'lib/post-extract-threads.js',
  'lib/prompt.js',
  'lib/settings.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

for (const rel of files) {
  const p = path.join(extRoot, rel);
  if (!fs.existsSync(p)) fail(`missing file: ${rel}`);
}
ok('required extension files exist');

const jsFiles = [
  'background.js',
  'content.js',
  'options.js',
  'popup.js',
  'lib/api-errors.js',
  'lib/api-request.js',
  'lib/post-extract.js',
  'lib/post-extract-threads.js',
  'lib/prompt.js',
  'lib/settings.js'
];
for (const rel of jsFiles) {
  const check = spawnSync('node', ['--check', path.join(extRoot, rel)], { encoding: 'utf8' });
  if (check.status !== 0) fail(`syntax error in ${rel}: ${check.stderr}`);
}
ok('JS syntax check passed');

for (const rel of ['background.js', 'options.js']) {
  const source = fs.readFileSync(path.join(extRoot, rel), 'utf8');
  if (source.includes('chrome.storage.sync')) {
    fail(`${rel} must not access sync storage directly`);
  }
}
ok('API key access is isolated behind secure settings module');

const trackedDist = spawnSync('git', ['ls-files', 'dist'], {
  cwd: extRoot,
  encoding: 'utf8'
});
if (trackedDist.status !== 0) fail('git ls-files dist failed');
if (trackedDist.stdout.trim()) fail('generated dist files must not be tracked');
ok('generated dist files are not tracked');

console.log('[smoke] all static checks passed');
