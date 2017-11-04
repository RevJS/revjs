
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';

export interface IModelFormProps {
    model: string;
}

export interface IModelFormState {
    formValues: {
        [fieldName: string]: any
    };
}

export interface IModelFormContext {
    modelForm: ModelForm;
}

export class ModelForm extends React.Component<IModelFormProps> {

    static contextTypes = {
        modelManager: PropTypes.object
    };

    constructor(props: IModelFormProps, context: IModelProviderContext) {
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

    registerField(fieldName: string) {
        console.log('registered field', fieldName);
    }

    static childContextTypes = {
        modelForm: PropTypes.object
    };

    getChildContext(): IModelFormContext {
        return {
            modelForm: this
        };
    }
}
