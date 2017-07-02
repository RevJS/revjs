
import * as React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import { IModelFormMeta } from '../forms/ModelForm';
import { IExecArgs, IExecOptions } from 'rev-models/lib/operations/exec';
import { connectWithContext } from '../utils/redux-utils';
import { getFormValues } from 'redux-form';

export interface IModelActionProps {
    modelForm: IModelFormMeta;
    label: string;
    method: string;
    args?: IExecArgs;
    options?: IExecOptions;
}

export class ModelActionC extends React.Component<IModelActionProps, void> {

    onAction() {
        console.log('onAction', this);
        /*
        this._modelForm.execAction(this.props.method, this.props.args, this.props.options);

        // pass action name and model data to registry for execution
        console.log('execAction', method, args, options);
        console.log('this', this);
        const modelCls = this._registry.getModelMeta(this._model).ctor;
        const model = new modelCls();
        this._registry.exec(model, method, args, options);
        */
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
/*    let props = {
        ...ownProps,
        ...context
    };
    console.log('proppy props', props);*/
    let values = getFormValues(context.modelForm.form)(state);
    console.log('values', values);
    return {
        ...ownProps,
        ...context,
        values
    };
}

export const ModelAction = connectWithContext(mapStateToProps, null, { modelForm: React.PropTypes.object })(ModelActionC);
