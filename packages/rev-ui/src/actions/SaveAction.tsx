
import * as React from 'react';

import { IDetailViewContextProp, IDetailViewContext } from '../views/DetailView';
import { withDetailViewContext } from '../views/withDetailViewContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IModelOperationResult } from 'rev-models';

/**
 * A `<SaveAction />` component is designed to be included inside a
 * `<DetailView />`. By default it renders a button that, when clicked,
 * either creates or updates the current record, depending on whether it has
 * a primaryKey value or not.
 */
export interface ISaveActionProps {

    /** Action label (default = "Submit") */
    label?: string;

    /** This method is called when the operation is successful */
    onSuccess?: (result: IModelOperationResult<any, any>) => void;

    /**
     * This method is called if an error occurs, including if the DetailView's
     * model fails validation
     */
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
