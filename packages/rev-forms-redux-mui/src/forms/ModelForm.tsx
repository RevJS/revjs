
import * as React from 'react';

import { IModelProviderContext } from '../provider/ModelProvider';
import { reduxForm } from 'redux-form';

export interface IModelFormProps {
    model: string;
    form: string;  // picked up by redux-form and used as form name in state
}

export interface IModelFormMeta {
    form: string;
    model: string;
}

export interface IModelFormContext {
    modelForm: IModelFormMeta;
}

export class ModelFormC extends React.Component<IModelFormProps, void> {

    static contextTypes = {
        modelManager: React.PropTypes.object
    };

    constructor(props: IModelFormProps, context: IModelProviderContext) {
        if (!props.form) {
            throw new Error('ModelForm Error: the "form" prop must be specified');
        }
        if (!context.modelManager) {
            throw new Error('ModelForm Error: must be nested inside a ModelProvider.');
        }
        if (!props.model || !context.modelManager.isRegistered(props.model)) {
            throw new Error(`ModelForm Error: Model '${props.model}' is not registered.`);
        }
        super(props);
    }

    render() {
        return (
            <form>
                {this.props.children}
            </form>
        );
    }

    static childContextTypes = {
        modelForm: React.PropTypes.object
    };

    getChildContext(): IModelFormContext {
        return {
            modelForm: {
                model: this.props.model,
                form: this.props.form
            }
        };
    }
}

export const ModelForm = reduxForm({})(ModelFormC as any);

/*
// import RaisedButton from 'material-ui/RaisedButton';
import { ModelRegistry } from 'rev-models';
<Field name="testField" component={TextField} />

<RaisedButton label="Log In" primary={true} style={{marginTop: 15}} />
*/
