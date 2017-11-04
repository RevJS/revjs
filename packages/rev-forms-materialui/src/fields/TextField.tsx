
import * as React from 'react';

import MUITextField from 'material-ui/TextField';

import { IModelFieldComponentProps } from './types';
import * as fields from 'rev-models/lib/fields';

export const TextField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    let type = 'text';

    if (props.field instanceof fields.PasswordField) {
        type = 'password';
    }

    let errorText = '';
    props.errors.forEach((err) => {
        errorText += err.message + '. ';
    });

    const styles = {
        errorStyle: {
            textAlign: 'left'
        }
    };

    return (
        <MUITextField
            name={props.field.name}
            floatingLabelText={props.field.options.label || props.field.name}
            type={type}
            value={props.value}
            errorText={errorText}
            errorStyle={styles.errorStyle}
            onChange={(event, value) => props.onChange(value)}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            fullWidth={true}
        />
    );
};
