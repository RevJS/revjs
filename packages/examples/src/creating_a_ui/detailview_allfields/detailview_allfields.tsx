import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ModelManager } from 'rev-models';
import { ModelApiBackend } from 'rev-api-client';
import { ModelProvider, DetailView, Field, SaveAction } from 'rev-ui';
import * as models from '../models';

import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';

import { registerComponents } from 'rev-ui-materialui';
registerComponents();

export const modelManager = new ModelManager();
modelManager.registerBackend('default', new ModelApiBackend('http://localhost:3000/graphql'));
modelManager.register(models.User);
modelManager.register(models.Comment);
modelManager.register(models.ModelWithAllFields);

const currentUrl = new URL(window.location.href);
const modelId = currentUrl.searchParams.get('id');
console.log('Model ID', modelId);

ReactDOM.render((
        <ModelProvider modelManager={modelManager} >
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit">
                        RevJS - DetailView All Fields Demo
                    </Typography>
                </Toolbar>
            </AppBar>
            <Card style={{ maxWidth: 800, padding: 20, margin: '30px auto' }}>

                <Typography variant="display1" style={{marginBottom: 20}}>All Fields</Typography>

                <DetailView model="ModelWithAllFields" primaryKeyValue={modelId}>
                    <Field name="textField" />
                    <Field name="emailField" />
                    <Field name="urlField" />
                    <Field name="passwordField" />
                    <Field name="multilineTextField" />

                    <SaveAction
                        label="Save Record"
                        style={{marginTop: 20}}
                        onError={(err) => {
                            console.log('Save Error', err);
                            alert('Save Error: ' + JSON.stringify(err, null, 2));
                        }}
                        onSuccess={() => alert('Record Saved')}
                    />
                </DetailView>

            </Card>
        </ModelProvider>
    ),
    document.getElementById('app')
);
