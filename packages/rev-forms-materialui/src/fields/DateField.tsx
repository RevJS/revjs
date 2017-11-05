
import * as React from 'react';

import MUIDatePicker from 'material-ui/DatePicker';

import { IModelFieldComponentProps } from './types';

export const DateField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    let value = props.value || null;

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
        <MUIDatePicker
            name={props.field.name}
            floatingLabelText={props.field.options.label || props.field.name}
            value={value}
            errorText={errorText}
            errorStyle={styles.errorStyle}
            disabled={props.disabled}
            onChange={(event, newValue) => props.onChange(newValue)}
            onFocus={props.onFocus}
            onDismiss={props.onBlur}
            autoOk={true}
            fullWidth={true}
        />
    );
};
