
import * as React from 'react';

import { IDetailViewContextProp, IDetailViewContext } from '../views/DetailView';
import { withDetailViewContext } from '../views/withDetailViewContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IModelOperationResult, ValidationError } from 'rev-models';
import { IStandardComponentProps, getStandardProps } from '../utils/props';

/**
 * A `<SaveAction />` component is designed to be included inside a
 * `<DetailView />`. By default it renders a button that, when clicked, triggers validation, then
 * either creates or updates the current record, depending on whether it has
 * a primaryKey value or not.
 */
export interface ISaveActionProps extends IStandardComponentProps {

    /** Action label (default = "Submit") */
    label?: string;

    /** Set to true to make this the default action for the DetailView */
    defaultAction?: boolean;

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
    component?: React.ComponentType<any>;
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
            const valid = await ctx.validate();
            if (!valid.valid) {
                throw new ValidationError(valid);
            }
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
            defaultAction: this.props.defaultAction ? true : false,
            doAction: () => this.doAction(),
            children: this.props.children
        };
        const sProps = getStandardProps(this.props);

        const Component = this.props.component || UI_COMPONENTS.actions.SaveAction;
        return <Component {...cProps} {...sProps} />;
    }
}

/**
 * See [[ISaveActionProps]]
 * @private
 */
export const SaveAction = withDetailViewContext(SaveActionC);
