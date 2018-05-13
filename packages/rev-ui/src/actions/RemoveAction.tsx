
import * as React from 'react';

import { IDetailViewContextProp, IDetailViewContext } from '../views/DetailView';
import { withDetailViewContext } from '../views/withDetailViewContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IModelOperationResult } from 'rev-models';
import { IStandardComponentProps, getStandardProps } from '../utils/props';

/**
 * A `<RemoveAction />` component is designed to be included inside a
 * `<DetailView />`. By defailt it renders a button which causes the current
 * record to be deleted.
 */
export interface IRemoveActionProps extends IStandardComponentProps {

    /** Action label (default = "Delete") */
    label?: string;

    /** This method is called when the operation is successful */
    onSuccess?: (result: IModelOperationResult<any, any>) => void;

    /** This method is called if an error occurs */
    onError?: (error: Error) => void;

    /**
     * If you provide a function to this prop, it will be called to determine
     * whether the action should be disabled. (actions are always disabled
     * while the DetaiView is Loading or Saving)
     */
    disabled?: (context: IDetailViewContext) => boolean;

    /**
     * If you provide a React component to this property, it will be used
     * instead of the component configured in [[UI_COMPONENTS]]. It will
     * be passed [[IActionComponentProps]]
     */
    component?: React.ComponentType<any>;
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
            || ctx.manager.isNew(ctx.model!);

        if (!disabled && this.props.disabled) {
            disabled = this.props.disabled(this.props.detailViewContext);
        }

        const cProps: IActionComponentProps = {
            label: this.props.label || 'Delete',
            disabled,
            doAction: () => this.doAction(),
            children: this.props.children
        };
        const sProps = getStandardProps(this.props);

        const Component = this.props.component || UI_COMPONENTS.actions.RemoveAction;
        return <Component {...cProps} {...sProps} />;
    }
}

/**
 * See [[IRemoveActionProps]]
 * @private
 */
export const RemoveAction = withDetailViewContext(RemoveActionC);
