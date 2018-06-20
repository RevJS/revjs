import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ModelManager } from 'rev-models';
import { ModelApiBackend } from 'rev-api-client';
import { ModelProvider, SearchView, SearchField, SearchAction, ListView } from 'rev-ui';
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
modelManager.register(models.ModelWithAllFields);
modelManager.register(models.Comment);

interface ISearchableListState {
    where: object;
}

export class SearchableList extends React.Component<any, ISearchableListState> {

    constructor(props: any) {
        super(props);
        this.state = {
            where: {}
        };
    }

    onSearch(newWhere: object) {
        this.setState({
            where: newWhere
        });
    }

    render() {
        return (
            <div style={{ maxWidth: 800, margin: '30px auto' }}>
                <Card style={{ padding: 16, marginBottom: 30 }}>

                    <Typography variant="title" style={{ marginBottom: 12 }}>
                        Search
                    </Typography>

                    <SearchView
                        model="ModelWithAllFields"
                        onSearch={(where) => this.onSearch(where)}
                    >
                        <SearchField name="textField" />
                        <SearchField name="multilineTextField" />
                        <SearchField name="emailField" />
                        <SearchField name="urlField" />
                        <SearchField name="passwordField" />
                        <SearchField name="numberField" />
                        <SearchField name="integerField" />
                        <SearchField name="autoNumberField" />
                        <SearchField name="booleanField" />
                        <SearchField name="selectField" />
                        <SearchField name="multiSelectField" />
                        <SearchField name="dateField" />
                        <SearchField name="timeField" />
                        <SearchField name="dateTimeField" />
                        <SearchField name="relatedModel" />
                        <SearchField name="relatedModelList" />

                        <div style={{ width: '100%', textAlign: 'right', paddingTop: 20 }}>
                            <SearchAction
                                label="Search Records"
                            />
                        </div>
                    </SearchView>

                </Card>
                <Card>

                    <ListView
                        title="Matching Records"
                        model="ModelWithAllFields"
                        fields={[
                            'textField',
                            'emailField',
                            'numberField',
                        ]}
                        where={this.state.where}
                        onItemPress={(record) => {
                            alert('Selected a record:\n' + JSON.stringify(record, null, 2));
                        }}
                    />

                </Card>
            </div>
        );
    }
}

ReactDOM.render((
        <ModelProvider modelManager={modelManager} >
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit">
                        RevJS - Searchable List - All Fieldd Demo
                    </Typography>
                </Toolbar>
            </AppBar>

            <SearchableList />
        </ModelProvider>
    ),
    document.getElementById('app')
);
