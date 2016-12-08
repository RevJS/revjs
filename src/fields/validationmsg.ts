// TODO: Do something more clevererer than this...

export let VALIDATION_MESSAGES = {
    required: (label: string) => `${label} is a required field`,
    not_a_string: (label: string) => `The value for ${label} should be a string`,
    string_empty: (label: string) => `${label} is a required field`,
    not_a_number: (label: string) => `The value for ${label} should be a number`,
    not_an_integer: (label: string) => `The value for ${label} should be an integer`,
};
