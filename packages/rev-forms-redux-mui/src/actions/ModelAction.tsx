
import * as React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import { IModelFormContext, IModelFormMeta } from '../forms/ModelForm';
import { IExecArgs, IExecOptions } from 'rev-models/lib/operations/exec';

export interface IModelActionProps {
    label: string;
    method: string;
    args?: IExecArgs;
    options?: IExecOptions;
}

export class ModelAction extends React.Component<IModelActionProps, void> {

    _modelForm: IModelFormMeta;

    static contextTypes = {
        modelForm: React.PropTypes.object
    };

    constructor(props: IModelActionProps, context: IModelFormContext) {
        super(props);
        this._modelForm = context.modelForm;
        if (!this._modelForm) {
            throw new Error('ModelAction Error: must be nested inside a ModelForm.');
        }
    }

    onAction() {
        this._modelForm.execAction(this.props.method, this.props.args, this.props.options);
    }

    render() {
        return (
            <RaisedButton label={this.props.label}
                onClick={this.onAction.bind(this)}
                primary={true} style={{ margin: 12 }} />
        );
    }

}
