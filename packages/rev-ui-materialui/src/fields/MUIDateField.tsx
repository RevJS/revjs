
import * as React from 'react';

import Grid from 'material-ui/Grid';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { getGridWidthProps } from './utils';

export const MUIDateField: React.StatelessComponent<IFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let error = props.errors.length > 0;
    let errorText = '';
    props.errors.forEach((err) => {
        errorText += err.message + '. ';
    });

    return (
        <Grid item {...gridWidthProps} style={props.style}>

            <FormControl fullWidth>
                <InputLabel
                    htmlFor={fieldId}
                    error={error}
                    shrink={true}
                >
                    {props.label}
                </InputLabel>
                <Input
                    id={fieldId}
                    type="date"
                    value={props.value || ''}
                    onChange={(event) => props.onChange(event.target.value)}
                    error={error}
                    disabled={props.disabled}
                />
                {errorText &&
                    <FormHelperText error>
                        {errorText}
                    </FormHelperText>}
            </FormControl>

        </Grid>
    );
};
