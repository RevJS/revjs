
import * as React from 'react';

import { IModelContextProp, IModelContext } from '../views/DetailView';
import { withModelContext } from '../views/withModelContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IModelOperationResult } from 'rev-models';

export interface IRemoveActionProps {
    label?: string;
    onSuccess?: (result: IModelOperationResult<any, any>) => void;
    onError?: (error: Error) => void;

    disabled?: (context: IModelContext) => boolean;

    component?: React.ComponentType;
}

class RemoveActionC extends React.Component<IRemoveActionProps & IModelContextProp> {

    constructor(props: IRemoveActionProps & IModelContextProp) {
        super(props);
        if (!this.props.modelContext) {
            throw new Error('RemoveAction Error: must be nested inside a DetailView');
        }
    }

    async doAction() {

        const success = (res: IModelOperationResult<any, any>) => {
            this.props.modelContext.setLoadState('NONE');
            if (this.props.onSuccess) {
                this.props.onSuccess(res);
            }
        };

        const failure = (err: any) => {
            this.props.modelContext.setLoadState('NONE');
            if (this.props.onError) {
                this.props.onError(err);
            }
        };

        const ctx = this.props.modelContext;
        ctx.setLoadState('SAVING');

        try {
            const result = await ctx.remove();
            success(result);
        }
        catch (e) {
            failure(e);
        }
    }

    render() {
        let disabled = this.props.modelContext.loadState != 'NONE';

        if (!disabled && this.props.disabled) {
            disabled = this.props.disabled(this.props.modelContext);
        }

        const cProps: IActionComponentProps = {
            label: this.props.label,
            disabled,
            doAction: () => this.doAction(),
            children: this.props.children
        };

        const Component = this.props.component || UI_COMPONENTS.actions.RemoveAction;
        return <Component {...cProps} />;
    }
}

export const RemoveAction = withModelContext(RemoveActionC);
