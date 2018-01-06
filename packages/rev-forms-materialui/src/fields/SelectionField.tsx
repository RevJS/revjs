
import * as React from 'react';

import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';

import { IModelFieldComponentProps } from './types';
import * as fields from 'rev-models/lib/fields';

export const SelectionField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    let field = props.field as fields.SelectionField;

    return (
        <FormControl fullWidth>
            <InputLabel htmlFor={props.field.name + '--id'}>
                {props.field.options.label || props.field.name}
            </InputLabel>
            <Select
                value={props.value}
                onChange={(event) => props.onChange(event.target.value)}
                input={<Input name={props.field.name} id={props.field.name + '--id'} />}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                disabled={props.disabled}
            >
            {field.options.selection.map(
                (option, idx) => <MenuItem key={idx} value={option[0]}>{option[1]}</MenuItem>
            )}
            </Select>
        </FormControl>
    );
};
