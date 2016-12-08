// TODO: Do something more clevererer than this...

export let VALIDATION_MESSAGES = {
    required: (label: string) => `${label} is a required field`,
    is_string: (label: string) => `The value for ${label} should be a string`,
    string_empty: (label: string) => `${label} is a required field`
};
