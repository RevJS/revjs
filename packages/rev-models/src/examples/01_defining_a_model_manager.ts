import { ModelManager, InMemoryBackend } from '../index';

// Create an empty ModelManager
const models = new ModelManager();

// Add a backend for model data storage
models.registerBackend('default', new InMemoryBackend());

// Export it for use by other parts of your application
export { models };