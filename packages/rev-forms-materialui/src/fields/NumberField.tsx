
import * as React from 'react';

import { FormControl, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

import { IModelFieldComponentProps } from './types';

export const NumberField: React.StatelessComponent<IModelFieldComponentProps> = (props) => {

    let errorText = '';
    props.errors.forEach((err) => {
        errorText += err.message + '. ';
    });

    return (
        <FormControl fullWidth>
            <InputLabel htmlFor={props.field.name + '--id'}>
                {props.field.options.label || props.field.name}
            </InputLabel>
            <Input
                id={props.field.name + '--helper'}
                type="text"
                value={props.value}
                onChange={(event) => props.onChange(event.target.value)}
                disabled={props.disabled}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />
            {errorText &&
                <FormHelperText id={props.field.name + '--helper-text'}>
                    {errorText}
                </FormHelperText>}

        </FormControl>
    );
};
