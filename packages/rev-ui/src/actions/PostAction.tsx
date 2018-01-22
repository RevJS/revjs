
import * as React from 'react';

import { IModelContextProp } from '../views/DetailView';
import { withModelContext } from '../views/withModelContext';
import { UI_COMPONENTS } from '../config';

export interface IPostActionProps {
    label: string;
    url: string;
    httpMethod?: 'post' | 'put';
    onSuccess?: (result: Response) => void;
    onFailure?: (error: Error) => void;

    component?: React.ComponentType;
}

export interface IActionComponentProps {
    label: string;
    disabled: boolean;
    doAction(): void;
}

class PostActionC extends React.Component<IPostActionProps & IModelContextProp> {

    constructor(props: IPostActionProps & IModelContextProp) {
        super(props);
        if (!this.props.modelContext) {
            throw new Error('PostAction Error: must be nested inside a DetailView');
        }
    }

    async doAction() {

        const validationResult = await this.context.modelContext.validate();

        if (validationResult.valid) {
            if (!this.props.url) {
                throw new Error('ModelAction Error: you must specify the url property when type is "post"');
            }
            // this.context.modelForm.disable(true);
            return fetch(this.props.url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(this.context.modelContext.model)
            })
            .then((res) => {
                if (res.status < 200 || res.status > 299) {
                    const error: any = new Error('PostAction received status ' + res.status);
                    error.response = res;
                    throw error;
                }
                if (this.props.onSuccess) {
                    // this.context.modelForm.disable(false);
                    this.props.onSuccess(res);
                }
            })
            .catch((err) => {
                if (this.props.onFailure) {
                    // this.context.modelForm.disable(false);
                    this.props.onFailure(err);
                }
            });
        }
    }

    render() {
        const cProps: IActionComponentProps = {
            label: this.props.label,
            disabled: this.props.modelContext.loadState != 'NONE',
            doAction: () => this.doAction()
        };

        const Component = this.props.component || UI_COMPONENTS.actions.PostAction;
        return <Component {...cProps} />;
    }
}

export const PostAction = withModelContext(PostActionC);
