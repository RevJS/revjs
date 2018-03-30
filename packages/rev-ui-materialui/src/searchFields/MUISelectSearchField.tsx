
import * as React from 'react';

import Grid from 'material-ui/Grid';
import { FormControl } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';

import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { getGridWidthProps } from '../fields/utils';
import { ISelectFieldOptions } from 'rev-models/lib/fields';

// TODO: Allow searching for multiple values
export const MUISelectSearchField: React.StatelessComponent<ISearchFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    const opts: ISelectFieldOptions = props.field.options;

    let value = '';
    if (props.criteria && typeof props.criteria['_eq'] == 'string') {
        value = props.criteria['_eq'];
    }

    return (
        <Grid item {...gridWidthProps} style={props.style}>

            <FormControl fullWidth>
                <InputLabel
                    htmlFor={fieldId}
                    shrink={true}
                >
                    {props.label}
                </InputLabel>
                <Select
                    value={value}
                    onChange={(event) => {
                        const val = event.target.value;
                        if (val) {
                            props.onCriteriaChange({ _eq: event.target.value });
                        }
                        else {
                            props.onCriteriaChange(null);
                        }
                    }}
                    inputProps={{
                        id: fieldId
                    }}
                >
                    <MenuItem value=""></MenuItem>
                    {opts.selection.map(([code, text], index) => (
                        <MenuItem key={index} value={code}>{text}</MenuItem>
                    ))}
                </Select>
            </FormControl>

        </Grid>
    );
};
