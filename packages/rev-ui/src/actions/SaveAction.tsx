
import * as React from 'react';

import { IDetailViewContextProp, IDetailViewContext } from '../views/DetailView';
import { withDetailViewContext } from '../views/withDetailViewContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IModelOperationResult } from 'rev-models';

export interface ISaveActionProps {
    label?: string;
    onSuccess?: (result: IModelOperationResult<any, any>) => void;
    onError?: (error: Error) => void;

    disabled?: (context: IDetailViewContext) => boolean;

    component?: React.ComponentType;
}

class SaveActionC extends React.Component<ISaveActionProps & IDetailViewContextProp> {

    constructor(props: ISaveActionProps & IDetailViewContextProp) {
        super(props);
        if (!this.props.detailViewContext) {
            throw new Error('SaveAction Error: must be nested inside a DetailView');
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
            const result = await ctx.save();
            success(result);
        }
        catch (e) {
            failure(e);
        }
    }

    render() {
        let disabled = this.props.detailViewContext.loadState != 'NONE';

        if (!disabled && this.props.disabled) {
            disabled = this.props.disabled(this.props.detailViewContext);
        }

        const cProps: IActionComponentProps = {
            label: this.props.label || 'Save',
            disabled,
            doAction: () => this.doAction(),
            children: this.props.children
        };

        const Component = this.props.component || UI_COMPONENTS.actions.SaveAction;
        return <Component {...cProps} />;
    }
}

export const SaveAction = withDetailViewContext(SaveActionC);
