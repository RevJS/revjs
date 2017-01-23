
import * as React from 'react';

import { Field } from 'redux-form';

import TextField from '../fields/TextField';

// import * as models from 'rev-models';
// import * as forms from 'rev-forms';
// import RaisedButton from 'material-ui/RaisedButton';

export interface IRevFormProps {
    model: string;
    form: string;
}

export default class RevForm extends React.Component<IRevFormProps, void> {

    render() {
        return (
            <form action="/">
                <Field name="testField" component={TextField} />

                { /* <RaisedButton label="Log In" primary={true} style={{marginTop: 15}} /> */ }
            </form>
        );
    }

}
