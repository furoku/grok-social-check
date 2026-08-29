import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildChatRequest } from '../../lib/api-request.js';
import {
  DEFAULT_MODEL,
  clearApiKey,
  loadSettings,
  normalizeCooldown,
  normalizeModel,
  saveSettings
} from '../../lib/settings.js';

function createArea(initial = {}) {
  const data = { ...initial };
  const accessLevels = [];
  return {
    data,
    accessLevels,
    async get(keys) {
      const names = Array.isArray(keys) ? keys : Object.keys(keys || {});
      return Object.fromEntries(
        names.filter((key) => Object.hasOwn(data, key)).map((key) => [key, data[key]])
      );
    },
    async set(values) {
      Object.assign(data, values);
    },
    async remove(keys) {
      for (const key of Array.isArray(keys) ? keys : [keys]) delete data[key];
    },
    async setAccessLevel(value) {
      accessLevels.push(value);
    }
  };
}

function createStorage({ local = {}, sync = {} } = {}) {
  return {
    local: createArea(local),
    sync: createArea(sync)
  };
}

test('legacy and unsupported models migrate to a supported explicit model', () => {
  assert.equal(normalizeModel('grok-4-1-fast-non-reasoning'), DEFAULT_MODEL);
  assert.equal(normalizeModel('grok-3-mini'), DEFAULT_MODEL);
  assert.equal(normalizeModel('unknown-model'), DEFAULT_MODEL);
  assert.equal(normalizeModel('grok-4.3'), 'grok-4.3');
});

test('cooldown is finite and bounded', () => {
  assert.equal(normalizeCooldown(undefined), 8);
  assert.equal(normalizeCooldown(1), 3);
  assert.equal(normalizeCooldown(120), 60);
  assert.equal(normalizeCooldown(9.6), 10);
});

test('loadSettings migrates the API key out of sync storage', async () => {
  const storage = createStorage({
    sync: {
      xaiToken: '  secret-token  ',
      model: 'grok-4-1-fast-non-reasoning',
      cooldownSec: 12
    }
  });

  const settings = await loadSettings(storage);

  assert.deepEqual(settings, {
    xaiToken: 'secret-token',
    model: DEFAULT_MODEL,
    cooldownSec: 12
  });
  assert.equal(storage.local.data.xaiToken, 'secret-token');
  assert.equal(storage.sync.data.xaiToken, undefined);
  assert.equal(storage.sync.data.model, undefined);
  assert.equal(storage.local.data.secureStorageMigrationV1, true);
  assert.deepEqual(storage.local.accessLevels, [
    { accessLevel: 'TRUSTED_CONTEXTS' }
  ]);
});

test('saveSettings writes only local storage and clears legacy sync values', async () => {
  const storage = createStorage({
    sync: { xaiToken: 'old', model: 'old', cooldownSec: 4 }
  });

  const saved = await saveSettings(
    { xaiToken: ' new ', model: 'grok-4.3', cooldownSec: 7 },
    storage
  );

  assert.deepEqual(saved, {
    xaiToken: 'new',
    model: 'grok-4.3',
    cooldownSec: 7
  });
  assert.equal(storage.local.data.xaiToken, 'new');
  assert.deepEqual(storage.sync.data, {});
});

test('clearApiKey removes both current and legacy copies', async () => {
  const storage = createStorage({
    local: { xaiToken: 'local' },
    sync: { xaiToken: 'sync' }
  });

  await clearApiKey(storage);

  assert.equal(storage.local.data.xaiToken, undefined);
  assert.equal(storage.sync.data.xaiToken, undefined);
});

test('chat request pins the current non-reasoning model', () => {
  const request = buildChatRequest({ prompt: 'test' });
  assert.equal(request.model, DEFAULT_MODEL);
  assert.equal(request.reasoning_effort, undefined);
});

test('grok-4.3 compatibility explicitly disables reasoning', () => {
  const request = buildChatRequest({ model: 'grok-4.3', prompt: 'test' });
  assert.equal(request.model, 'grok-4.3');
  assert.equal(request.reasoning_effort, 'none');
});
