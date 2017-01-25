
import * as React from 'react';

import MUIDatePicker from 'material-ui/DatePicker';

import { IRevFieldTypeProps } from './types';

export default function DateField(props: IRevFieldTypeProps) {

    const onChange = (event: null, date: any) => {
        props.input.onChange(date);
    };

    let value = props.input.value || null;

    return (
        <MUIDatePicker
            name={props.field.name}
            floatingLabelText={props.field.label}
            value={value}
            onChange={onChange}
            onFocus={props.input.onFocus}
            onDismiss={props.input.onBlur}
            autoOk={true}
            fullWidth={true}
        />
    );
}
