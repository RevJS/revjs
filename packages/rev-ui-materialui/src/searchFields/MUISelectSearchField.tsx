
import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { getGridWidthProps } from '../fields/utils';
import { ISelectFieldOptions } from 'rev-models/lib/fields';
import { IObject } from 'rev-models/lib/utils/types';

// TODO: Allow searching for multiple values
export const MUISelectSearchField: React.StatelessComponent<ISearchFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    const opts: ISelectFieldOptions = props.field.options;

    let value = '';
    const criteria: IObject = props.criteria;
    if (criteria && typeof criteria['_eq'] == 'string') {
        value = criteria['_eq'];
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
