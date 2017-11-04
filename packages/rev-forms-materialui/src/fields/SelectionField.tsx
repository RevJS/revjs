
import * as React from 'react';

import MUISelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { IModelFieldComponentProps } from './types';
import * as fields from 'rev-models/lib/fields';

export const SelectionField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    let MUISelect: any = MUISelectField;
    let field = props.field as fields.SelectionField;

    const styles = {
        select: {
            textAlign: 'left'
        }
    };

    return (
        <MUISelect
            name={props.field.name}
            floatingLabelText={props.field.options.label || props.field.name}
            value={props.value}
            onChange={(event: any, key: any, value: any) => props.onChange(value)}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            style={styles.select}
            fullWidth={true}>
        {field.options.selection.map(
            (option, idx) => <MenuItem key={idx} value={option[0]} primaryText={option[1]} />
        )}
        </MUISelect>
    );
};
