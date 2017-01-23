
import * as React from 'react';

import { Field, reduxForm } from 'redux-form';
export { Form } from 'redux-form';

import TextField from '../fields/TextField';

// import * as models from 'rev-models';
// import * as forms from 'rev-forms';
// import RaisedButton from 'material-ui/RaisedButton';

interface IRevFormProps {
    model: string;
    form: string;
}

class RevForm extends React.Component<IRevFormProps, void> {

    render() {
        return (
            <form action="/">
                <Field name="testField" component={TextField} />

                { /* <RaisedButton label="Log In" primary={true} style={{marginTop: 15}} /> */ }
            </form>
        );
    }

}

export function getRevForm(model: string, form: string) {

    console.log(`${model}_${form}`);
    return reduxForm({
        form: `${model}_${form}`
    })(RevForm) as any;

}
