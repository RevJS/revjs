
import * as React from 'react';
import * as PropTypes from 'prop-types';

import RaisedButton from 'material-ui/RaisedButton';
import { IExecArgs, IExecOptions } from 'rev-models/lib/operations/exec';
import { ModelManager } from 'rev-models';
import { ModelForm } from '../forms/ModelForm';

export type ModelActionType = 'post' | 'method'
const defaultActionType: ModelActionType = 'method';

export interface IModelActionProps {
    label: string;
    type?: ModelActionType,
    method?: string;
    args?: IExecArgs;
    url?: string;
    options?: IExecOptions;
    onSuccess?: (result: Response) => void;
    onFailure?: (error: Error) => void;
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
        const actionType = this.props.type || defaultActionType;
        console.log('onAction', this);
        console.log('type', actionType);

        if (actionType == 'post') {
            if (!this.props.url) {
                throw new Error('ModelAction Error: you must specify the url property when type is "post"')
            }
            fetch(this.props.url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(this.modelForm.state.formValues)
            })
            .then((res) => {
                if (res.status < 200 || res.status > 299) {
                    throw new Error('Got status ' + res.status);
                }
                if (this.props.onSuccess) {
                    this.props.onSuccess(res);
                }
            })
            .catch((err) => {
                if (this.props.onFailure) {
                    this.props.onFailure(err);
                }
            });
        }
        else {
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
    }

    render() {
        return (
            <RaisedButton label={this.props.label}
                onClick={this.onAction.bind(this)}
                primary={true} style={{ margin: 12 }} />
        );
    }
}
