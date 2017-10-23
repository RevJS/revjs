
import * as React from 'react';
import * as PropTypes from 'prop-types';

import { IModelProviderContext } from '../provider/ModelProvider';
import { reduxForm, ConfigProps, DecoratedComponentClass, InjectedFormProps } from 'redux-form';
export { ConfigProps, DecoratedComponentClass };

export interface IModelFormCustomProps {
    model: string;
    form: string;  // picked up by redux-form and used as form name in state
}

export interface IModelFormMeta {
    model: string;
    form: string;
}

export interface IModelFormContext {
    modelForm: IModelFormMeta;
}

export type IModelFormInjectedProps = InjectedFormProps<any, IModelFormCustomProps>;

export class ModelFormC extends React.Component<IModelFormCustomProps & IModelFormInjectedProps> {

    static contextTypes = {
        modelManager: PropTypes.object
    };

    constructor(props: IModelFormCustomProps & IModelFormInjectedProps, context: IModelProviderContext) {
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
        modelForm: PropTypes.object
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

export const ModelForm = reduxForm<any, IModelFormCustomProps>({})(ModelFormC);
