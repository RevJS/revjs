import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ModelManager } from 'rev-models';
import { ModelApiBackend } from 'rev-api-client';
import { ModelProvider, DetailView, Field, SaveAction } from 'rev-ui';
import * as models from '../models';

import CssBaseline from 'material-ui/CssBaseline';
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

const currentUrl = new URL(window.location.href);
const postId = currentUrl.searchParams.get('id');
console.log('Post ID', postId);

ReactDOM.render((
        <ModelProvider modelManager={modelManager} >
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit">
                        RevJS - DetailView Demo
                    </Typography>
                </Toolbar>
            </AppBar>
            <Card style={{ maxWidth: 800, padding: 20, margin: '30px auto' }}>

                <Typography variant="display1" style={{marginBottom: 20}}>Post</Typography>

                <DetailView model="Post" primaryKeyValue={postId}>
                    <Field name="title" />
                    <Field name="status" />
                    <Field name="description" colspan={12} />
                    <Field name="body" colspan={12} />
                    <Field name="post_date" />
                    <Field name="user" />

                    <SaveAction
                        label="Save Post"
                        style={{marginTop: 20}}
                        onError={(err) => {
                            console.log('Save Error', err);
                            alert('Save Error: ' + JSON.stringify(err, null, 2));
                        }}
                        onSuccess={() => alert('Post Saved')}
                    />
                </DetailView>

            </Card>
        </ModelProvider>
    ),
    document.getElementById('app')
);
