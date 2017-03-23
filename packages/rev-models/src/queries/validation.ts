import { OPERATORS } from './operators';

export function validateQuery(operator: string, value: any) {

    if (!(operator in OPERATORS)) {
        throw new Error(`validateQuery(): unrecognised operator '${operator}'`);
    }

    switch (OPERATORS[operator]) {
        case 'value':
            validateQueryValue(operator, value);
            break;
        case 'value_list':
            validateQueryValueList(operator, value);
            break;
        default:
    }
}

export function validateQueryValue(operator: string, value: any) {
    if (typeof value == 'string' || typeof value == 'boolean') {
        return;
    }
    if (typeof value == 'number' && !isNaN(value)) {
        return;
    }
    if (typeof value == 'object' && (
            value === null || value instanceof Date)) {
        return;
    }
    throw new Error(`validateQuery(): invalid query value '${value}'`);
}

export function validateQueryValueList(operator: string, values: any) {
    if (!values || !(values instanceof Array) || values.length == 0) {
        throw new Error(`validateQuery(): value for operator '${operator}' must be an array of values`);
    }
    for (let value of values) {
        validateQueryValue(operator, value);
    }
}


// null | string | number | boolean | Date