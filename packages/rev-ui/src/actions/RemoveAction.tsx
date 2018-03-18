
import * as React from 'react';

import { IDetailViewContextProp, IDetailViewContext } from '../views/DetailView';
import { withDetailViewContext } from '../views/withDetailViewContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IModelOperationResult } from 'rev-models';

export interface IRemoveActionProps {
    label?: string;
    onSuccess?: (result: IModelOperationResult<any, any>) => void;
    onError?: (error: Error) => void;

    disabled?: (context: IDetailViewContext) => boolean;

    component?: React.ComponentType;
}

class RemoveActionC extends React.Component<IRemoveActionProps & IDetailViewContextProp> {

    constructor(props: IRemoveActionProps & IDetailViewContextProp) {
        super(props);
        if (!this.props.detailViewContext) {
            throw new Error('RemoveAction Error: must be nested inside a DetailView');
        }
    }

    async doAction() {

        const success = (res: IModelOperationResult<any, any>) => {
            this.props.detailViewContext.setLoadState('NONE');
            if (this.props.onSuccess) {
                this.props.onSuccess(res);
            }
        };

        const failure = (err: any) => {
            this.props.detailViewContext.setLoadState('NONE');
            if (this.props.onError) {
                this.props.onError(err);
            }
        };

        const ctx = this.props.detailViewContext;
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
        const ctx = this.props.detailViewContext;
        let disabled = ctx.loadState != 'NONE'
            || ctx.manager.isNew(ctx.model);

        if (!disabled && this.props.disabled) {
            disabled = this.props.disabled(this.props.detailViewContext);
        }

        const cProps: IActionComponentProps = {
            label: this.props.label || 'Delete',
            disabled,
            doAction: () => this.doAction(),
            children: this.props.children
        };

        const Component = this.props.component || UI_COMPONENTS.actions.RemoveAction;
        return <Component {...cProps} />;
    }
}

export const RemoveAction = withDetailViewContext(RemoveActionC);
