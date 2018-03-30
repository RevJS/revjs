
import * as React from 'react';

import Grid from 'material-ui/Grid';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { getGridWidthProps } from '../fields/utils';

// Text Search Field - does a basic 'contains' search
export const MUITextSearchField: React.StatelessComponent<ISearchFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let type = 'text';

    let value = '';
    if (props.criteria && typeof props.criteria['_like'] == 'string') {
        // We assume the current criteria starts and ends with a '%'
        value = props.criteria['_like'].substr(1, props.criteria['_like'].length - 2);
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
                <Input
                    id={fieldId}
                    type={type}
                    value={value}
                    onChange={(event) => {
                        props.onCriteriaChange({ _like: '%' + event.target.value + '%'});
                    }}
                />
            </FormControl>

        </Grid>
    );
};
