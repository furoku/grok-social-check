import {
  DEFAULT_MODEL,
  clearApiKey,
  loadSettings,
  saveSettings
} from './lib/settings.js';

const tokenInput = document.getElementById('xaiToken');
const modelSelect = document.getElementById('model');
const status = document.getElementById('status');
const saveButton = document.getElementById('save');
const clearButton = document.getElementById('clearKey');

function setStatus(message, isError = false) {
  status.textContent = message;
  status.dataset.tone = isError ? 'error' : 'success';
}

async function load() {
  try {
    const data = await loadSettings();
    tokenInput.value = data.xaiToken || '';
    modelSelect.value = data.model || DEFAULT_MODEL;
  } catch (error) {
    setStatus(`設定を読み込めませんでした: ${String(error?.message || error)}`, true);
  }
}

saveButton.addEventListener('click', async () => {
  saveButton.disabled = true;
  try {
    await saveSettings({
      xaiToken: tokenInput.value,
      model: modelSelect.value
    });
    setStatus('この端末に保存しました。同期領域の旧キーは削除済みです。');
  } catch (error) {
    setStatus(`保存できませんでした: ${String(error?.message || error)}`, true);
  } finally {
    saveButton.disabled = false;
  }
});

clearButton.addEventListener('click', async () => {
  clearButton.disabled = true;
  try {
    await clearApiKey();
    tokenInput.value = '';
    setStatus('APIキーをこの端末と旧同期領域から削除しました。');
  } catch (error) {
    setStatus(`削除できませんでした: ${String(error?.message || error)}`, true);
  } finally {
    clearButton.disabled = false;
  }
});

load();
