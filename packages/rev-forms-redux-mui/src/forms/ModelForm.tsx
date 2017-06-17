
import * as React from 'react';

import { ModelRegistry } from 'rev-models';
import { IModelProviderContext } from '../provider/ModelProvider';
import { reduxForm } from 'redux-form';
import { IExecOptions } from 'rev-models/lib/operations/exec';

export interface IModelFormProps {
    model: string;
    form: string;
}

export interface IModelFormMeta {
    model: string;
    execAction: (method: string, args: any[], options?: IExecOptions) => void;
}

export interface IModelFormContext {
    modelForm: IModelFormMeta;
}

export class ModelFormC extends React.Component<IModelFormProps, void> {

    _registry: ModelRegistry;
    _model: string;

    static contextTypes = {
        modelRegistry: React.PropTypes.object
    };

    constructor(props: IModelFormProps, context: IModelProviderContext) {
        if (!context.modelRegistry) {
            throw new Error('ModelForm Error: must be nested inside a ModelProvider.');
        }
        if (!props.model || !context.modelRegistry.isRegistered(props.model)) {
            throw new Error(`ModelForm Error: Model '${props.model}' is not registered.`);
        }
        super(props);
        this._registry = context.modelRegistry;
        this._model = props.model;
    }

    render() {
        return (
            <form>
                {this.props.children}
            </form>
        );
    }

    execAction(method: string, args: any[], options?: IExecOptions) {
        // pass action name and model data to registry for execution
        console.log('onModelAction', event);
        console.log('this', this);
        const modelCls = this._registry.getModelMeta(this._model).ctor;
        const model = new modelCls();
        this._registry.exec(model, method, args, options);
    }

    static childContextTypes = {
        modelForm: React.PropTypes.object
    };

    getChildContext(): IModelFormContext {
        return {
            modelForm: {
                model: this.props.model,
                execAction: this.execAction.bind(this)
            }
        };
    }
}

export const ModelForm = reduxForm({} as any)(ModelFormC) as any;

/*
// import RaisedButton from 'material-ui/RaisedButton';
import { ModelRegistry } from 'rev-models';
<Field name="testField" component={TextField} />

<RaisedButton label="Log In" primary={true} style={{marginTop: 15}} />
*/
