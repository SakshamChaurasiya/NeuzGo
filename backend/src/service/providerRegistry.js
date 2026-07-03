const registry = new Map();

function registerProvider(name, providerInstance) {
  registry.set(name, providerInstance);
  console.log(`[ProviderRegistry] Registered provider: ${name}`);
}

function getProvider(name) {
  return registry.get(name);
}

function getAllProviders() {
  return Array.from(registry.values());
}

module.exports = {
  registerProvider,
  getProvider,
  getAllProviders,
};
