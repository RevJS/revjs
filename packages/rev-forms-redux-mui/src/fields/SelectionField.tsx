
import * as React from 'react';

import MUISelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { IRevFieldTypeProps } from './types';
import * as fields from 'rev-models/lib/fields';

export default function SelectionField(props: IRevFieldTypeProps) {

    let MUISelect: any = MUISelectField;
    let field = props.field as fields.SelectionField;

    const styles = {
        select: {
            textAlign: 'left'
        }
    };

    let onChange = (e: any, key: any, val: any) => {
        props.input.onChange(val);
    };

    return (
        <MUISelect
            name={props.field.name}
            floatingLabelText={props.field.label}
            value={props.input.value}
            onChange={onChange}
            onFocus={props.input.onFocus}
            onBlur={props.input.onBlur}
            style={styles.select}
            fullWidth={true}>
        {field.selection.map(
            (option, idx) => <MenuItem key={idx} value={option[0]} primaryText={option[1]} />
        )}
        </MUISelect>
    );
}
