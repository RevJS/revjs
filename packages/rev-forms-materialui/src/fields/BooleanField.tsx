
import * as React from 'react';

import MUICheckbox from 'material-ui/Checkbox';
import { IModelFieldComponentProps } from './types';

export const BooleanField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    const onCheck = (event: any, isInputChecked: boolean) => {
        props.onChange(isInputChecked);
    };

    let checked = props.value ? true : false;

    const styles = {
        checkbox: {
            marginTop: 16,
            marginBottom: 5,
            textAlign: 'left'
        },
        label: {
        }
    };

    return (
        <MUICheckbox
            name={props.field.name}
            label={props.field.options.label || props.field.name}
            checked={checked}
            onCheck={onCheck}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            style={styles.checkbox}
            labelStyle={styles.label}
        />
    );
};
