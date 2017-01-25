
import * as React from 'react';
import { Field } from 'redux-form';
import TextField from './TextField';
import { IRevFormMeta } from '../forms/RevForm';
import { registry } from 'rev-models/registry';

export interface IRevFieldProps {
    name: string;
}

export default class RevField extends React.Component<IRevFieldProps, void> {

    static contextTypes = {
        revFormMeta: React.PropTypes.object
    };

    constructor(props: IRevFieldProps, context: any) {
        let revFormMeta: IRevFormMeta = context.revFormMeta;
        if (!revFormMeta) {
            throw new Error('RevField Error: must be nested inside a RevForm.');
        }
        let modelMeta = registry.getMeta(revFormMeta.model);
        if (!(props.name in modelMeta.fieldsByName)) {
            throw new Error(`RevField Error: Model '${revFormMeta.model}' does not have a field called '${props.name}'.`);
        }
        super(props);
    }

    render() {
        console.log('props', this.props);
        console.log('ctx', this.context);
        return (
            <Field name="testField" component={TextField} />
        );
    }

}
