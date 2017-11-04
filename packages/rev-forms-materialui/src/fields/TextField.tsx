
import * as React from 'react';

import MUITextField from 'material-ui/TextField';

import { IModelFieldComponentProps } from './types';
import * as fields from 'rev-models/lib/fields';

export const TextField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    let type = 'text';

    if (props.field instanceof fields.PasswordField) {
        type = 'password';
    }

    return (
        <MUITextField
            name={props.field.name}
            floatingLabelText={props.field.options.label || props.field.name}
            type={type}
            value={props.value}
            onChange={props.onChange}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            fullWidth={true}
        />
    );
};
