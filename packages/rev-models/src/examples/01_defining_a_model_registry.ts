
import '../polyfills';

import { ModelRegistry, InMemoryBackend } from 'rev-models';

export const models = new ModelRegistry();
models.registerBackend('default', new InMemoryBackend());
