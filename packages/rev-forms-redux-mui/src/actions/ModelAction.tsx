
import * as React from 'react';
import * as PropTypes from 'prop-types';

import RaisedButton from 'material-ui/RaisedButton';
import { IModelFormMeta } from '../forms/ModelForm';
import { IExecArgs, IExecOptions } from 'rev-models/lib/operations/exec';
import { connectWithContext } from '../utils/redux-utils';
import { getFormValues } from 'redux-form';
import { ModelManager } from 'rev-models';

export interface IModelActionProps {
    label: string;
    method: string;
    values?: any;
    args?: IExecArgs;
    options?: IExecOptions;
}

export interface IModelActionContext {
    modelForm: IModelFormMeta;
    modelManager: ModelManager;
}

export class ModelActionC extends React.Component<IModelActionProps> {

    static contextTypes = {
        modelForm: PropTypes.object,
        modelManager: PropTypes.object
    };

    constructor(props: IModelActionProps, context: IModelActionContext) {
        if (!context.modelForm) {
            throw new Error('ModelAction Error: must be nested inside a ModelForm');
        }
        if (!context.modelManager) {
            throw new Error('ModelAction Error: must be nested inside a ModelProvider.');
        }
        super(props);
    }

    onAction() {
        console.log('onAction', this);
        let ctx: IModelActionContext = this.context;
        let modelMeta = ctx.modelManager.getModelMeta(ctx.modelForm.model);
        let model = new modelMeta.ctor();
        Object.assign(model, this.props.values);
        ctx.modelManager.exec(model, this.props.method, this.props.args, this.props.options)
        .then((res) => {
            console.log('exec result', res);
        })
        .catch((err) => {
            console.log('exec failure', err);
        });
    }

    render() {
        return (
            <RaisedButton label={this.props.label}
                onClick={this.onAction.bind(this)}
                primary={true} style={{ margin: 12 }} />
        );
    }

}

function mapStateToProps(state: any, ownProps: IModelActionProps, context: any): IModelActionProps {
    let values = getFormValues(context.modelForm.form)(state);
    return {
        ...ownProps,
        ...context,
        values
    };
}

export const ModelAction = connectWithContext(mapStateToProps, null, { modelForm: PropTypes.object })(ModelActionC);
