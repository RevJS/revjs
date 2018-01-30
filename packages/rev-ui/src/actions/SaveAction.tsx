
import * as React from 'react';

import { IModelContextProp, IModelContext } from '../views/DetailView';
import { withModelContext } from '../views/withModelContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IModelOperationResult } from 'rev-models';

export interface ISaveActionProps {
    label?: string;
    onSuccess?: (result: IModelOperationResult<any, any>) => void;
    onError?: (error: Error) => void;

    disabled?: (context: IModelContext) => boolean;

    component?: React.ComponentType;
}

class SaveActionC extends React.Component<ISaveActionProps & IModelContextProp> {

    constructor(props: ISaveActionProps & IModelContextProp) {
        super(props);
        if (!this.props.modelContext) {
            throw new Error('PostAction Error: must be nested inside a DetailView');
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

        let result: IModelOperationResult<any, any>;

        try {
            if (ctx.manager.isNew(ctx.model)) {
                result = await ctx.manager.create(ctx.model);
            }
            else {
                result = await ctx.manager.update(ctx.model);
            }
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

        const Component = this.props.component || UI_COMPONENTS.actions.SaveAction;
        return <Component {...cProps} />;
    }
}

export const SaveAction = withModelContext(SaveActionC);
