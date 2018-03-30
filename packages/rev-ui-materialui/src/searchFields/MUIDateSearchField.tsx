
import * as React from 'react';

import Grid from 'material-ui/Grid';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

import { ISearchFieldComponentProps } from 'rev-ui/lib/fields/SearchField';
import { getGridWidthProps } from '../fields/utils';

export const MUIDateSearchField: React.StatelessComponent<ISearchFieldComponentProps> = (props) => {

    const gridWidthProps = getGridWidthProps(props);
    const fieldId = props.field.name;

    let valueFrom = '';
    let valueTo = '';
    if (props.criteria) {
        if (typeof props.criteria['_gte'] == 'string') {
            valueFrom = props.criteria['_gte'];
        }
        if (typeof props.criteria['_lte'] == 'string') {
            valueTo = props.criteria['_lte'];
        }
    }

    function onChange(newValueFrom: string, newValueTo: string) {
        if (newValueFrom || newValueTo) {
            const criteria = {};
            if (newValueFrom) {
                criteria['_gte'] = newValueFrom;
            }
            if (newValueTo) {
                criteria['_lte'] = newValueTo;
            }
            props.onCriteriaChange(criteria);
        }
        else {
            props.onCriteriaChange(null);
        }
    }

    return (
        <Grid item {...gridWidthProps} style={props.style}>
            <div style={{ display: 'flex' }}>
                <FormControl fullWidth>
                    <InputLabel
                        htmlFor={fieldId + '_from'}
                        shrink={true}
                    >
                        {props.label}
                    </InputLabel>
                    <Input
                        id={fieldId + '_from'}
                        type="date"
                        value={valueFrom}
                        onChange={(event) => onChange(event.target.value, valueTo)}
                    />
                </FormControl>
                <FormControl fullWidth style={{ marginLeft: 8 }}>
                    <InputLabel
                        htmlFor={fieldId + '_to'}
                        shrink={true}
                    >
                        to
                    </InputLabel>
                    <Input
                        id={fieldId + '_to'}
                        type="date"
                        value={valueTo}
                        onChange={(event) => onChange(valueFrom, event.target.value)}
                    />
                </FormControl>
            </div>
        </Grid>
    );
};
