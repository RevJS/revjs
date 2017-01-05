// TODO: Do something more clevererer than this...

export let VALIDATION_MESSAGES = {
    required: (label: string) => `${label} is a required field`,
    string_empty: (label: string) => `${label} is a required field`,
    not_a_string: (label: string) => `${label} should be a string`,
    not_a_number: (label: string) => `${label} should be a number`,
    not_an_integer: (label: string) => `${label} should be an integer`,
    not_a_boolean: (label: string) => `${label} should be either true or false`,
    not_a_date: (label: string) => `${label} should be a date`,
    not_a_time: (label: string) => `${label} should be a time`,
    not_a_datetime: (label: string) => `${label} should be a date and time`,
    min_string_length: (label: string, val: number) => `${label} should have at least ${val} characters`,
    max_string_length: (label: string, val: number) => `${label} should have at most ${val} characters`,
    min_value: (label: string, val: any) => `${label} should be at least ${val}`,
    max_value: (label: string, val: any) => `${label} should be at most ${val}`,
    no_regex_match: (label: string) => `${label} is not in the correct format`,
    no_selection_match: (label: string) => `Invalid selection for ${label}`,
    list_empty: (label: string) => `${label} is a required field`,
    selection_not_an_array: (label: string) => `${label} should be a list of selections`,
    extra_field: (name: string) => `Field '${name}' does not exist in model metadata`,
};
