
import * as React from 'react';

import { ValidationError } from 'rev-models';
import { IDetailViewContextProp, IDetailViewContext } from '../views/DetailView';
import { withDetailViewContext } from '../views/withDetailViewContext';
import { UI_COMPONENTS } from '../config';
import { IActionComponentProps } from './types';
import { IStandardComponentProps, getStandardProps } from '../utils/props';

/**
 * A `<PostAction />` component is designed to be included inside a
 * `<DetailView />`. By default it renders a button that sends the current model
 * details to a web server as JSON.
 *
 * When the button is clicked, RevJS validates the current
 * model data. If validation is successful, the data is sent via an HTTP POST
 * or PUT request to the specified url.
 */
export interface IPostActionProps extends IStandardComponentProps {

    /** Action label (default = "Submit") */
    label?: string;

    /** URL to post the form data to */
    url: string;

    /** HTTP Method to use when sending the data */
    httpMethod?: 'post' | 'put';

    /** This method is called when a response is received from the server */
    onResponse?: (response: Response) => void;

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

class PostActionC extends React.Component<IPostActionProps & IDetailViewContextProp> {

    constructor(props: IPostActionProps & IDetailViewContextProp) {
        super(props);
        if (!this.props.detailViewContext) {
            throw new Error('PostAction Error: must be nested inside a DetailView');
        }
        if (!this.props.url) {
            throw new Error('PostAction Error: you must specify the url property');
        }
    }

    async doAction() {
        this.props.detailViewContext.setLoadState('SAVING');
        const validationResult = await this.props.detailViewContext.validate();

        const success = (res: any) => {
            this.props.detailViewContext.setLoadState('NONE');
            if (this.props.onResponse) {
                this.props.onResponse(res);
            }
        };
        const failure = (err: any) => {
            this.props.detailViewContext.setLoadState('NONE');
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
                    body: JSON.stringify(this.props.detailViewContext.model)
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
        let disabled = this.props.detailViewContext.loadState != 'NONE';

        if (!disabled && this.props.disabled) {
            disabled = this.props.disabled(this.props.detailViewContext);
        }

        const cProps: IActionComponentProps = {
            label: this.props.label || 'Submit',
            disabled,
            doAction: () => this.doAction(),
            children: this.props.children
        };
        const sProps = getStandardProps(this.props);

        const Component = this.props.component || UI_COMPONENTS.actions.PostAction;
        return <Component {...cProps} {...sProps} />;
    }
}

/**
 * See [[IPostActionProps]]
 * @private
 */
export const PostAction = withDetailViewContext(PostActionC);
