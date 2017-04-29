
import * as React from 'react';

import MUITextField from 'material-ui/TextField';

import { IModelFieldTypeProps } from './types';
import * as fields from 'rev-models/lib/fields';

export default function TextField(props: IModelFieldTypeProps) {

    let type = 'text';
    if (props.field instanceof fields.PasswordField) {
        type = 'password';
    }
    return (
        <MUITextField
            name={props.field.name}
            floatingLabelText={props.field.options.label || props.field.name}
            type={type}
            value={props.input.value}
            onChange={props.input.onChange}
            onFocus={props.input.onFocus}
            onBlur={props.input.onBlur}
            fullWidth={true}
        />
    );
}
