// TODO: Do something more clevererer than this...

export let VALIDATION_MESSAGES = {
    required: (label: string) => `${label} is a required field`,
    string_empty: (label: string) => `${label} is a required field`,
    not_a_string: (label: string) => `${label} should be a string`,
    not_a_number: (label: string) => `${label} should be a number`,
    not_an_integer: (label: string) => `${label} should be an integer`,
    not_a_boolean: (label: string) => `${label} should be either true or false`,
    min_string_length: (label: string, val: number) => `${label} should have at least ${val} characters`,
    max_string_length: (label: string, val: number) => `${label} should have at most ${val} characters`,
    min_value: (label: string, val: any) => `${label} should be at least ${val}`,
    max_value: (label: string, val: any) => `${label} should be at most ${val}`,
};
