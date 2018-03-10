import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ModelManager } from 'rev-models';
import { ModelApiBackend } from 'rev-api-client';
import { ModelProvider, ListView } from 'rev-ui';
import * as models from '../models';

import Reboot from 'material-ui/Reboot';
import Card from 'material-ui/Card';
import { registerComponents } from 'rev-ui-materialui';
registerComponents();

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new ModelApiBackend('http://localhost:3000/graphql'));
modelManager.register(models.User);
modelManager.register(models.Post);
modelManager.register(models.Comment);

ReactDOM.render((
        <ModelProvider modelManager={modelManager} >
            <div style={{ maxWidth: 800 }}>
                <Reboot />
                <Card>

                    <ListView
                        title="Current Posts"
                        model="Post"
                        fields={[
                            'title',
                            'body',
                            'user'
                        ]}
                        onRecordPress={(record) => {
                            alert('Selected a record:\n' + JSON.stringify(record, null, 2));
                        }}
                    />

                </Card>
            </div>
        </ModelProvider>
    ),
    document.getElementById('app')
);
