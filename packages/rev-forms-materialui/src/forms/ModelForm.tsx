
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { IFieldError, IModelError, ModelValidationResult } from 'rev-models/lib/validation/validationresult';
import { ModelManager, IModelMeta } from 'rev-models';

export interface IModelFormProps {
    model: string;
}

export interface IModelFormState {
    fieldValues: {
        [fieldName: string]: any
    };
    valid: boolean;
    fieldErrors: {
        [fieldName: string]: IFieldError[]
    };
    modelErrors: IModelError[];
}

export interface IModelFormContext {
    modelForm: ModelForm;
}

export class ModelForm extends React.Component<IModelFormProps, IModelFormState> {

    static contextTypes = {
        modelManager: PropTypes.object
    };

    modelManager: ModelManager;
    modelMeta: IModelMeta<any>;

    constructor(props: IModelFormProps, context: IModelProviderContext) {
        super(props);
        this.modelManager = context.modelManager;
        if (!this.modelManager) {
            throw new Error('ModelForm Error: must be nested inside a ModelProvider.');
        }
        if (!props.model || !this.modelManager.isRegistered(props.model)) {
            throw new Error(`ModelForm Error: Model '${props.model}' is not registered.`);
        }
        this.modelMeta = this.modelManager.getModelMeta(this.props.model);
        this.state = {
            valid: false,
            fieldValues: {},
            fieldErrors: {},
            modelErrors: []
        };
    }

    render() {
        return (
            <form>
                {this.props.children}
            </form>
        );
    }

    updateFieldValue(fieldName: string, value: string) {
        const newValues = { ...this.state.fieldValues, [fieldName]: value};
        const newErrors = { ...this.state.fieldErrors };
        delete newErrors[fieldName];
        this.setState({
            fieldValues: newValues,
            fieldErrors: newErrors
        });
    }

    updateValidationState(validationResult: ModelValidationResult) {
        this.setState({
            valid: validationResult.valid,
            fieldErrors: validationResult.fieldErrors,
            modelErrors: validationResult.modelErrors
        });
    }

    async validate() {
        const model = this.modelManager.hydrate(this.modelMeta.ctor, this.state.fieldValues);
        return this.modelManager.validate(model);
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
