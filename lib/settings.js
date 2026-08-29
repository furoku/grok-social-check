export const DEFAULT_MODEL = 'grok-4.20-0309-non-reasoning';
export const SUPPORTED_MODELS = Object.freeze([
  DEFAULT_MODEL,
  'grok-4.3'
]);

const MIGRATION_KEY = 'secureStorageMigrationV1';
const LEGACY_MODEL_MAP = Object.freeze({
  'grok-4-1-fast-non-reasoning': DEFAULT_MODEL,
  'grok-4-fast-non-reasoning': DEFAULT_MODEL,
  'grok-3': 'grok-4.3',
  'grok-3-mini': DEFAULT_MODEL
});

export function normalizeModel(value) {
  const raw = String(value || '').trim();
  const migrated = LEGACY_MODEL_MAP[raw] || raw;
  return SUPPORTED_MODELS.includes(migrated) ? migrated : DEFAULT_MODEL;
}

export function normalizeCooldown(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 8;
  return Math.min(60, Math.max(3, Math.round(number)));
}

function requireStorage(storage) {
  if (!storage?.local || !storage?.sync) {
    throw new Error('Chrome storage is unavailable');
  }
  return storage;
}

async function restrictLocalStorage(storage) {
  if (typeof storage.local.setAccessLevel !== 'function') return;
  await storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
}

export async function loadSettings(storage = globalThis.chrome?.storage) {
  const areas = requireStorage(storage);
  await restrictLocalStorage(areas);

  const local = await areas.local.get([
    'xaiToken',
    'model',
    'cooldownSec',
    MIGRATION_KEY
  ]);

  let token = String(local.xaiToken || '').trim();
  let model = local.model;
  let cooldownSec = local.cooldownSec;

  if (local[MIGRATION_KEY] !== true) {
    const legacy = await areas.sync.get(['xaiToken', 'model', 'cooldownSec']);
    if (!token) token = String(legacy.xaiToken || '').trim();
    if (!model) model = legacy.model;
    if (cooldownSec == null) cooldownSec = legacy.cooldownSec;

    await areas.sync.remove(['xaiToken', 'model', 'cooldownSec']);
  }

  const normalized = {
    xaiToken: token,
    model: normalizeModel(model),
    cooldownSec: normalizeCooldown(cooldownSec),
    [MIGRATION_KEY]: true
  };
  await areas.local.set(normalized);

  return {
    xaiToken: normalized.xaiToken,
    model: normalized.model,
    cooldownSec: normalized.cooldownSec
  };
}

export async function saveSettings(
  { xaiToken = '', model = DEFAULT_MODEL, cooldownSec = 8 },
  storage = globalThis.chrome?.storage
) {
  const areas = requireStorage(storage);
  await restrictLocalStorage(areas);

  const normalized = {
    xaiToken: String(xaiToken || '').trim(),
    model: normalizeModel(model),
    cooldownSec: normalizeCooldown(cooldownSec),
    [MIGRATION_KEY]: true
  };

  await areas.local.set(normalized);
  await areas.sync.remove(['xaiToken', 'model', 'cooldownSec']);

  return {
    xaiToken: normalized.xaiToken,
    model: normalized.model,
    cooldownSec: normalized.cooldownSec
  };
}

export async function clearApiKey(storage = globalThis.chrome?.storage) {
  const areas = requireStorage(storage);
  await restrictLocalStorage(areas);
  await areas.local.remove('xaiToken');
  await areas.sync.remove('xaiToken');
}
