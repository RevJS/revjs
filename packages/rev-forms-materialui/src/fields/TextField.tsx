
import * as React from 'react';

import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

import { IModelFieldComponentProps } from './types';
import * as fields from 'rev-models/lib/fields';

export const TextField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    let type = 'text';

    if (props.field instanceof fields.PasswordField) {
        type = 'password';
    }

    // let errorText = '';
    // props.errors.forEach((err) => {
    //     errorText += err.message + '. ';
    // });

    return (
        <FormControl fullWidth>
            <InputLabel htmlFor={props.field.name + '--id'}>
                {props.field.options.label || props.field.name}
            </InputLabel>
            <Input
                id={props.field.name + '--helper'}
                type={type}
                value={props.value}
                onChange={(event) => props.onChange(event.target.value)}
                disabled={props.disabled}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />
            {/* <FormHelperText
                id={props.field.name + '--helper-text'}
            >
                {errorText}
            </FormHelperText> */}
        </FormControl>
    );
};
