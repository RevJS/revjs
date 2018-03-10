import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ModelManager, InMemoryBackend } from 'rev-models';
import { ModelProvider } from 'rev-ui';
import * as models from '../models';

import { registerComponents } from 'rev-ui-materialui';
registerComponents();

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new InMemoryBackend());
modelManager.register(models.User);
modelManager.register(models.Post);
modelManager.register(models.Comment);

console.log('TEST');

ReactDOM.render((
        <ModelProvider modelManager={modelManager} >
            <div>test</div>
        </ModelProvider>
    ),
    document.getElementById('app')
);
