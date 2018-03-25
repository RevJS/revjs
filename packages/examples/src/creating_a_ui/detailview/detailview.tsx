import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ModelManager } from 'rev-models';
import { ModelApiBackend } from 'rev-api-client';
import { ModelProvider, DetailView, Field, SaveAction } from 'rev-ui';
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
                        RevJS - DetailView Demo
                    </Typography>
                </Toolbar>
            </AppBar>
            <Card style={{ maxWidth: 800, padding: 20, margin: '30px auto' }}>

                <Typography variant="display1" style={{marginBottom: 20}}>Create Post</Typography>

                <DetailView model="Post">
                    <Field name="title" colspan={12} />
                    <Field name="description" colspan={12} />
                    <Field name="body" colspan={12} />
                    <Field name="post_date" />
                    <Field name="user" />

                    <SaveAction
                        label="Create Post"
                        style={{marginTop: 20}}
                        onError={(err) => alert('Save Error: ' + JSON.stringify(err, null, 2))}
                    />
                </DetailView>

            </Card>
        </ModelProvider>
    ),
    document.getElementById('app')
);
