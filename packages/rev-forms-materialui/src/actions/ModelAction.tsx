
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

    constructor(props: IModelActionProps, context: IModelActionContext) {
        if (!context.modelForm) {
            throw new Error('ModelAction Error: must be nested inside a ModelForm');
        }
        if (!context.modelManager) {
            throw new Error('ModelAction Error: must be nested inside a ModelProvider.');
        }
        super(props);
    }

    onAction() {
        console.log('onAction', this);
        let ctx: IModelActionContext = this.context;
        let modelMeta = ctx.modelManager.getModelMeta(ctx.modelForm.props.model);
        let model = new modelMeta.ctor();
        Object.assign(model, this.props.values);
        ctx.modelManager.exec(model, this.props.method, this.props.args, this.props.options)
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
