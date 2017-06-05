
import * as React from 'react';

import RaisedButton from 'material-ui/RaisedButton';

export interface IModelActionProps {
    method: string;
    label: string;
}

export class ModelAction extends React.Component<IModelActionProps, void> {

    static contextTypes = {
        modelFormMeta: React.PropTypes.object
    };

    constructor(props: IModelActionProps, context: any) {
        super(props);
        let modelFormMeta = context.modelFormMeta;
        if (!modelFormMeta) {
            throw new Error('ModelAction Error: must be nested inside a ModelForm.');
        }
    }

    render() {
        return (
            <RaisedButton label={this.props.label} primary={true} style={{ margin: 12 }} />
        );
    }

}
