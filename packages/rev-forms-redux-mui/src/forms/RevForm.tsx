
import * as React from 'react';

import { reduxForm } from 'redux-form';  /* tslint:disable-line */

import { ModelRegistry } from 'rev-models';
// import * as forms from 'rev-forms';

// TODO: Provide this via a provider...
const registry = new ModelRegistry();

export interface IRevFormProps {
    model: string;
    form: string;
}

export interface IRevFormMeta {
    model: string;
}

export class ModelFormComponent extends React.Component<IRevFormProps, void> {

    static childContextTypes = {
        revFormMeta: React.PropTypes.object
    };

    constructor(props: IRevFormProps) {
        if (!props.model || !registry.isRegistered(props.model)) {
            throw new Error(`RevForm Error: Model '${props.model}' is not registered.`);
        }
        super(props);
    }

    getChildContext() {
        return {
            revFormMeta: {
                model: this.props.model
            } as IRevFormMeta
        };
    }

    handleSubmit(event: any) {
        console.log('submit', event);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                {this.props.children}
            </form>
        );
    }

}

export const RevForm = reduxForm({} as any)(ModelFormComponent) as any;

/*
// import RaisedButton from 'material-ui/RaisedButton';
<Field name="testField" component={TextField} />

<RaisedButton label="Log In" primary={true} style={{marginTop: 15}} />
*/
