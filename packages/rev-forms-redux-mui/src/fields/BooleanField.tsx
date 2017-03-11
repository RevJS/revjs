
import * as React from 'react';

import MUICheckbox from 'material-ui/Checkbox';

import { IRevFieldTypeProps } from './types';

export default function BooleanField(props: IRevFieldTypeProps) {

    const onCheck = (event: any, isInputChecked: boolean) => {
        props.input.onChange(isInputChecked);
    };

    let checked = props.input.value ? true : false;

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
            onFocus={props.input.onFocus}
            onBlur={props.input.onBlur}
            style={styles.checkbox}
            labelStyle={styles.label}
        />
    );
}
