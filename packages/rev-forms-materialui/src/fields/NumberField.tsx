
import * as React from 'react';

import MUITextField from 'material-ui/TextField';

import { IModelFieldComponentProps } from './types';

export const NumberField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

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
            type="text"
            value={props.value}
            errorText={errorText}
            errorStyle={styles.errorStyle}
            disabled={props.disabled}
            onChange={(event, value) => props.onChange(value)}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            fullWidth={true}
        />
    );
};
