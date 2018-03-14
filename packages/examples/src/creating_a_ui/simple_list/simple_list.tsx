import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ModelManager } from 'rev-models';
import { ModelApiBackend } from 'rev-api-client';
import { ModelProvider, ListView } from 'rev-ui';
import * as models from '../models';

import Reboot from 'material-ui/Reboot';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
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
            <Reboot />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit">
                        RevJS - ListView Demo
                    </Typography>
                </Toolbar>
            </AppBar>
            <Card style={{ maxWidth: 800, margin: '30px auto' }}>

                <ListView
                    title="Current Posts"
                    model="Post"
                    fields={[
                        'title',
                        'body',
                        'user'
                    ]}
                    orderBy={['title']}
                    onRecordPress={(record) => {
                        alert('Selected a record:\n' + JSON.stringify(record, null, 2));
                    }}
                />

            </Card>
        </ModelProvider>
    ),
    document.getElementById('app')
);
