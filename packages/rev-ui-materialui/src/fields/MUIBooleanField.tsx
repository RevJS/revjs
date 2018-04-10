
import * as React from 'react';

import Grid from 'material-ui/Grid';
import { FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';

import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { getGridWidthProps } from './utils';

export const MUIBooleanField: React.StatelessComponent<IFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let errorText = '';
    props.errors.forEach((err) => {
        errorText += err.message + '. ';
    });

    const value = props.value ? true : false;

    return (
        <Grid item {...gridWidthProps} style={props.style}>

            <FormControl fullWidth>
                <FormControlLabel
                    control={
                        <Checkbox
                            id={fieldId}
                            checked={value}
                            onChange={(event) => props.onChange(event.target.checked)}
                            color="primary"
                        />
                    }
                    disabled={props.disabled}
                    label={props.label}
                />
                {errorText &&
                    <FormHelperText error style={{ marginTop: 0 }}>
                        {errorText}
                    </FormHelperText>}
            </FormControl>

        </Grid>
    );
};
