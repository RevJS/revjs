
import * as React from 'react';

import RaisedButton from 'material-ui/RaisedButton';

export interface IModelActionProps {
    operation: string;
    method: string;
    label: string;
}

export class ModelAction extends React.Component<IModelActionProps, void> {

    static contextTypes = {
        modelFormMeta: React.PropTypes.object
    };

    modelFormMeta: any;

    constructor(props: IModelActionProps, context: any) {
        super(props);
        this.modelFormMeta = context.modelFormMeta;
        if (!this.modelFormMeta) {
            throw new Error('ModelAction Error: must be nested inside a ModelForm.');
        }
    }

    onAction() {
        this.modelFormMeta.onModelAction({
            method: this.props.method
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
