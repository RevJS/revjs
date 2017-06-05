
import * as React from 'react';

import { reduxForm } from 'redux-form';

export interface IModelFormProps {
    model: string;
    form: string;
}

export class ModelFormC extends React.Component<IModelFormProps, void> {

    static contextTypes = {
        modelRegistry: React.PropTypes.object
    };

    static childContextTypes = {
        modelFormMeta: React.PropTypes.object
    };

    constructor(props: IModelFormProps, context: any) {
        if (!props.model || !context.modelRegistry.isRegistered(props.model)) {
            throw new Error(`ModelForm Error: Model '${props.model}' is not registered.`);
        }
        super(props);
    }

    getChildContext() {
        return {
            modelFormMeta: {
                model: this.props.model
            }
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

export const ModelForm = reduxForm({} as any)(ModelFormC) as any;

/*
// import RaisedButton from 'material-ui/RaisedButton';
<Field name="testField" component={TextField} />

<RaisedButton label="Log In" primary={true} style={{marginTop: 15}} />
*/
