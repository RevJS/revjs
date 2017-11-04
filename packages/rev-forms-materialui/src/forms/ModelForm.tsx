
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

export class ModelForm extends React.Component<IModelFormProps, IModelFormState> {

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
        this.state = { formValues: {} };
    }

    render() {
        return (
            <form>
                {this.props.children}
            </form>
        );
    }

    updateFieldValue(fieldName: string, value: string) {
        console.log('updating', fieldName, 'value:', value);
        this.setState({
            formValues: { ...this.state.formValues, [fieldName]: value}
        });
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
