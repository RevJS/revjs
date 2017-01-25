
import * as React from 'react';

import MUICheckbox from 'material-ui/Checkbox';

import { IRevFieldTypeProps } from './types';

export default function BooleanField(props: IRevFieldTypeProps) {

    const onCheck = (event: any, isInputChecked: boolean) => {
        props.input.onChange(isInputChecked);
    };

    let checked = props.input.value ? true : false;

    return (
        <div style={{width: 250, paddingTop: 15, paddingBottom: 15}}>
            <MUICheckbox
                name={props.field.name}
                label={props.field.label}
                checked={checked}
                onCheck={onCheck}
                onFocus={props.input.onFocus}
                onBlur={props.input.onBlur}
            />
        </div>
    );
}
