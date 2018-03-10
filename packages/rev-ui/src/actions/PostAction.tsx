
import * as React from 'react';

import { ValidationError } from 'rev-models';
import { IModelContextProp, IModelContext } from '../views/DetailView';
import { withModelContext } from '../views/withModelContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';

export interface IPostActionProps {
    label?: string;
    url: string;
    httpMethod?: 'post' | 'put';
    onResponse?: (response: Response) => void;
    onError?: (error: Error) => void;

    disabled?: (context: IModelContext) => boolean;

    component?: React.ComponentType;
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

        const success = (res: any) => {
            this.props.modelContext.setLoadState('NONE');
            if (this.props.onResponse) {
                this.props.onResponse(res);
            }
        };
        const failure = (err: any) => {
            this.props.modelContext.setLoadState('NONE');
            if (this.props.onError) {
                this.props.onError(err);
            }
        };

        if (!validationResult.valid) {
            const err = new ValidationError(validationResult);
            failure(err);
        }
        else {
            let res: Response;
            try {
                res = await fetch(this.props.url, {
                    method: this.props.httpMethod || 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(this.props.modelContext.model)
                });
            }
            catch (e) {
                failure(e);
                return;
            }
            success(res);
        }
    }

    render() {
        let disabled = this.props.modelContext.loadState != 'NONE';

        if (!disabled && this.props.disabled) {
            disabled = this.props.disabled(this.props.modelContext);
        }

        const cProps: IActionComponentProps = {
            label: this.props.label || 'Submit',
            disabled,
            doAction: () => this.doAction(),
            children: this.props.children
        };

        const Component = this.props.component || UI_COMPONENTS.actions.PostAction;
        return <Component {...cProps} />;
    }
}

export const PostAction = withModelContext(PostActionC);
