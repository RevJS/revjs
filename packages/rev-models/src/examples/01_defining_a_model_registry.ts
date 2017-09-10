import { ModelRegistry, InMemoryBackend } from 'rev-models';

// Create an empty ModelRegistry
const models = new ModelRegistry();

// Add a backend for model data storage
models.registerBackend('default', new InMemoryBackend());

// Export it for use by other parts of your application
export { models };