const DEFAULTS = {
  xaiToken: '',
  model: 'grok-4-1-fast-non-reasoning'
};

async function load() {
  const data = await chrome.storage.sync.get(DEFAULTS);
  document.getElementById('xaiToken').value = data.xaiToken || '';
  document.getElementById('model').value = data.model || DEFAULTS.model;
}

document.getElementById('save').addEventListener('click', async () => {
  const xaiToken = document.getElementById('xaiToken').value.trim();
  const model = document.getElementById('model').value;
  await chrome.storage.sync.set({ xaiToken, model });
  document.getElementById('status').textContent = '保存しました。';
});

load();