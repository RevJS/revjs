
import * as React from 'react';
import * as PropTypes from 'prop-types';

import RaisedButton from 'material-ui/RaisedButton';
import { IExecArgs, IExecOptions } from 'rev-models/lib/operations/exec';
import { ModelManager } from 'rev-models';
import { ModelForm } from '../forms/ModelForm';

export interface IModelActionProps {
    label: string;
    method: string;
    values?: any;
    args?: IExecArgs;
    options?: IExecOptions;
}

export interface IModelActionContext {
    modelForm: ModelForm;
    modelManager: ModelManager;
}

export class ModelAction extends React.Component<IModelActionProps> {

    static contextTypes = {
        modelForm: PropTypes.object,
        modelManager: PropTypes.object
    };

    modelForm: ModelForm;
    modelManager: ModelManager;

    constructor(props: IModelActionProps, context: IModelActionContext) {
        super(props);
        this.modelForm = context.modelForm;
        if (!this.modelForm) {
            throw new Error('ModelAction Error: must be nested inside a ModelForm');
        }
        this.modelManager = context.modelManager;
        if (!this.modelManager) {
            throw new Error('ModelAction Error: must be nested inside a ModelProvider.');
        }
    }

    onAction() {
        console.log('onAction', this);
        let modelMeta = this.modelManager.getModelMeta(this.modelForm.props.model);
        let model = this.modelManager.hydrate(modelMeta.ctor, this.modelForm.state.formValues);
        console.log(model);
        this.modelManager.exec(model, this.props.method, this.props.args, this.props.options)
        .then((res) => {
            console.log('exec result', res);
        })
        .catch((err) => {
            console.log('exec failure', err);
        });
    }

    render() {
        return (
            <RaisedButton label={this.props.label}
                onClick={this.onAction.bind(this)}
                primary={true} style={{ margin: 12 }} />
        );
    }
}
