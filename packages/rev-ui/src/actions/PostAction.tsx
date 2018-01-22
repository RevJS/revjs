
import * as React from 'react';

import { IModelContextProp } from '../views/DetailView';
import { withModelContext } from '../views/withModelContext';
import { UI_COMPONENTS } from '../config';

export interface IPostActionProps {
    label?: string;
    url: string;
    httpMethod?: 'post' | 'put';
    onResponse?: (response: Response) => void;
    onError?: (error: Error) => void;

    component?: React.ComponentType;
}

export interface IActionComponentProps {
    label: string;
    disabled: boolean;
    doAction(): Promise<Response>;
}

class PostActionC extends React.Component<IPostActionProps & IModelContextProp> {

    constructor(props: IPostActionProps & IModelContextProp) {
        super(props);
        if (!this.props.modelContext) {
            throw new Error('PostAction Error: must be nested inside a DetailView');
        }
        if (!this.props.url) {
            throw new Error('PostAction Error: you must specify the url property');
        }
    }

    async doAction() {

        this.props.modelContext.setLoadState('SAVING');
        const validationResult = await this.props.modelContext.validate();

        if (!validationResult.valid) {
            this.props.modelContext.setLoadState('NONE');
            let err: any = new Error('ValidationError');
            err.validation = validationResult;
            throw err;
        }
        else {
            try {
                const res = await fetch(this.props.url, {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(this.context.modelContext.model)
                });
                this.props.onResponse(res);
                return res;
            }
            catch (e) {
                this.props.onError(e);
                throw e;
            }
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
