
import * as React from 'react';
import * as PropTypes from 'prop-types';

import RaisedButton from 'material-ui/RaisedButton';
import { IExecArgs, IExecOptions } from 'rev-models/lib/operations/exec';
import { ModelManager } from 'rev-models';
import { ModelForm } from '../forms/ModelForm';

export type FormActionType = 'post' | 'method';
const defaultActionType: FormActionType = 'method';

export interface IFormActionProps {
    label: string;
    type?: FormActionType;
    method?: string;
    args?: IExecArgs;
    url?: string;
    options?: IExecOptions;
    default?: boolean;
    onSuccess?: (result: Response) => void;
    onFailure?: (error: Error) => void;
}

export interface IFormActionContext {
    modelForm: ModelForm;
    modelManager: ModelManager;
}

export class FormAction extends React.Component<IFormActionProps> {

    static contextTypes = {
        modelForm: PropTypes.object,
        modelManager: PropTypes.object
    };

    modelForm: ModelForm;
    modelManager: ModelManager;

    constructor(props: IFormActionProps, context: IFormActionContext) {
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

    async onAction() {
        const actionType = this.props.type || defaultActionType;
        console.log('onAction', this);
        console.log('type', actionType);

        const validationResult = await this.modelForm.validate();
        this.modelForm.updateValidationState(validationResult);

        if (validationResult.valid) {
            if (actionType == 'post') {
                if (!this.props.url) {
                    throw new Error('ModelAction Error: you must specify the url property when type is "post"')
                }
                this.modelForm.disable(true);
                return fetch(this.props.url, {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(this.modelForm.state.fieldValues)
                })
                .then((res) => {
                    if (res.status < 200 || res.status > 299) {
                        throw new Error('Got status ' + res.status);
                    }
                    if (this.props.onSuccess) {
                        this.modelForm.disable(false);
                        this.props.onSuccess(res);
                    }
                })
                .catch((err) => {
                    if (this.props.onFailure) {
                        this.modelForm.disable(false);
                        this.props.onFailure(err);
                    }
                });
            }
            else {
                let modelMeta = this.modelManager.getModelMeta(this.modelForm.props.model);
                let model = this.modelManager.hydrate(modelMeta.ctor, this.modelForm.state.fieldValues);
                console.log(model);
                this.modelForm.disable(true);
                return this.modelManager.exec(model, this.props.method, this.props.args, this.props.options)
                .then((res) => {
                    this.modelForm.disable(false);
                    console.log('exec result', res);
                })
                .catch((err) => {
                    this.modelForm.disable(false);
                    console.log('exec failure', err);
                });
            }
        }
    }

    render() {
        let type = this.props.default ? 'submit' : 'button';
        return (
            <RaisedButton
                type={type}
                label={this.props.label}
                onClick={this.onAction.bind(this)}
                primary={true} style={{ margin: 12 }} />
        );
    }
}
