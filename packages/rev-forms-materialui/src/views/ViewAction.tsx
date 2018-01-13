
import * as React from 'react';
import * as PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import { IExecArgs, IExecOptions } from 'rev-models/lib/models/types';
import { ModelManager } from 'rev-models';
import { FormView } from './FormView';

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
    modelForm: FormView;
    modelManager: ModelManager;
}

export class ViewAction extends React.Component<IFormActionProps> {

    context: IFormActionContext;
    static contextTypes = {
        modelForm: PropTypes.object,
        modelManager: PropTypes.object
    };

    constructor(props: IFormActionProps, context: IFormActionContext) {
        super(props, context);
        if (!this.context.modelForm) {
            throw new Error('ModelAction Error: must be nested inside a ModelForm');
        }
        if (!this.context.modelManager) {
            throw new Error('ModelAction Error: must be nested inside a ModelProvider.');
        }
    }

    async onAction() {
        const actionType = this.props.type || defaultActionType;
        console.log('onAction', this);
        console.log('type', actionType);

        const validationResult = await this.context.modelForm.validate();
        this.context.modelForm.updateValidationState(validationResult);

        if (validationResult.valid) {
            if (actionType == 'post') {
                if (!this.props.url) {
                    throw new Error('ModelAction Error: you must specify the url property when type is "post"');
                }
                this.context.modelForm.disable(true);
                return fetch(this.props.url, {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(this.context.modelForm.state.fieldValues)
                })
                .then((res) => {
                    if (res.status < 200 || res.status > 299) {
                        throw new Error('Got status ' + res.status);
                    }
                    if (this.props.onSuccess) {
                        this.context.modelForm.disable(false);
                        this.props.onSuccess(res);
                    }
                })
                .catch((err) => {
                    if (this.props.onFailure) {
                        this.context.modelForm.disable(false);
                        this.props.onFailure(err);
                    }
                });
            }
            else {
                let modelMeta = this.context.modelManager.getModelMeta(this.context.modelForm.props.model);
                let model = this.context.modelManager.hydrate(modelMeta.ctor, this.context.modelForm.state.fieldValues);
                console.log(model);
                this.context.modelForm.disable(true);
                return this.context.modelManager.exec(model, this.props.method, this.props.args, this.props.options)
                .then((res) => {
                    this.context.modelForm.disable(false);
                    console.log('exec result', res);
                })
                .catch((err) => {
                    this.context.modelForm.disable(false);
                    console.log('exec failure', err);
                });
            }
        }
    }

    render() {
        let type = this.props.default ? 'submit' : 'button';
        return (
            <Button raised color="primary"
                type={type}
                onClick={this.onAction.bind(this)}
                style={{ margin: 12 }}>
                {this.props.label}
            </Button>
        );
    }
}
