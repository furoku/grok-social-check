/**
 * PC 上の Google Chrome に拡張をロードし、オプション画面と X 上の content script を確認する。
 *
 * 前提: npm install 済み、Playwright が Google Chrome を起動できること。
 * Windows/macOS/Linux のデスクトップ Chrome を channel: 'chrome' で使用。
 *
 * 環境変数:
 *   GROK_CHECK_SKIP_CHROME=1  … ブラウザ smoke をスキップ（CI 用）
 *   GROK_CHECK_HEADLESS=1     … headless（拡張は headless 非対応のため通常は未設定）
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXT_DIR = path.resolve(__dirname, '..');

async function main() {
  if (process.env.GROK_CHECK_SKIP_CHROME === '1') {
    console.log('[chrome-smoke] skipped (GROK_CHECK_SKIP_CHROME=1)');
    process.exit(0);
  }

  let context;
  try {
    context = await chromium.launchPersistentContext('', {
      channel: 'chrome',
      headless: false,
      args: [
        `--disable-extensions-except=${EXT_DIR}`,
        `--load-extension=${EXT_DIR}`
      ]
    });
  } catch (err) {
    console.error(
      '[chrome-smoke] Google Chrome が見つからないか起動できません。PC に Chrome をインストールし、`npx playwright install chrome` を試してください。'
    );
    console.error(String(err?.message || err));
    process.exit(2);
  }

  try {
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker', { timeout: 15000 });
    }
    const extensionId = serviceWorker.url().split('/')[2];
    if (!extensionId) throw new Error('extension id not resolved');

    const optionsPage = await context.newPage();
    await optionsPage.goto(`chrome-extension://${extensionId}/options.html`, {
      waitUntil: 'domcontentloaded'
    });
    const title = await optionsPage.title();
    if (!title.includes('Grok Social Check')) {
      throw new Error(`unexpected options title: ${title}`);
    }
    console.log('[chrome-smoke] OK: options page loaded');

    const xPage = await context.newPage();
    await xPage.goto('https://x.com/elonmusk', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await xPage.waitForFunction(
      () => globalThis.__GROK_SOCIAL_CHECK_LOADED__ === true,
      { timeout: 45000 }
    );
    console.log('[chrome-smoke] OK: content script marker on x.com');

    const hasButton = await xPage.locator('.grok-check-btn').first().isVisible({ timeout: 30000 }).catch(() => false);
    if (!hasButton) {
      console.warn('[chrome-smoke] WARN: .grok-check-btn not visible (DOM変更 or ログイン壁の可能性)');
    } else {
      console.log('[chrome-smoke] OK: check button visible on X');
    }

    console.log('[chrome-smoke] passed');
    process.exit(0);
  } catch (err) {
    console.error('[chrome-smoke] FAIL:', err?.message || err);
    process.exit(1);
  } finally {
    await context.close();
  }
}

main();