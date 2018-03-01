
import { ModelManager, InMemoryBackend } from 'rev-models';

// Create a ModelManager with an InMemoryBackend
export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
