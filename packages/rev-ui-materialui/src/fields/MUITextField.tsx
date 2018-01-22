
import * as React from 'react';

import Grid from 'material-ui/Grid';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

import { isSet } from 'rev-models/lib/utils';
import { PasswordField } from 'rev-models/lib/fields';
import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { getGridWidthProps } from './utils';

export const MUITextField: React.StatelessComponent<IFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    const labelShrunk = isSet(props.value);

    let type = 'text';
    if (props.field instanceof PasswordField) {
        type = 'password';
    }

    let errorText = '';
    props.errors.forEach((err) => {
        errorText += err.message + '. ';
    });

    return (
        <Grid item {...gridWidthProps}>
            <FormControl fullWidth>
                <InputLabel htmlFor={fieldId} shrink={labelShrunk}>
                    {props.label}
                </InputLabel>
                <Input
                    id={fieldId}
                    type={type}
                    value={props.value}
                    onChange={(event) => props.onChange(event.target.value)}
                    disabled={props.disabled}
                />
                {errorText &&
                    <FormHelperText>
                        {errorText}
                    </FormHelperText>}
            </FormControl>
        </Grid>
    );
};
