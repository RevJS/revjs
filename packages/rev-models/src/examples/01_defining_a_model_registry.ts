
import { ModelRegistry, InMemoryBackend } from '../index';

// EXAMPLE:
// import { ModelRegistry, InMemoryBackend } from 'rev-models'

export const models = new ModelRegistry();
models.setBackend('default', new InMemoryBackend());
