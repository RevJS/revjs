// TODO: Do something more clevererer than this...
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION_MESSAGES = {
    required: function (label) { return label + " is a required field"; },
    string_empty: function (label) { return label + " is a required field"; },
    not_a_string: function (label) { return label + " should be a string"; },
    not_a_number: function (label) { return label + " should be a number"; },
    not_an_integer: function (label) { return label + " should be an integer"; },
    not_a_boolean: function (label) { return label + " should be either true or false"; },
    not_a_date: function (label) { return label + " should be a date"; },
    not_a_time: function (label) { return label + " should be a time"; },
    not_a_datetime: function (label) { return label + " should be a date and time"; },
    min_string_length: function (label, val) { return label + " should have at least " + val + " characters"; },
    max_string_length: function (label, val) { return label + " should have at most " + val + " characters"; },
    min_value: function (label, val) { return label + " should be at least " + val; },
    max_value: function (label, val) { return label + " should be at most " + val; },
    no_regex_match: function (label) { return label + " is not in the correct format"; },
    no_selection_match: function (label) { return "Invalid selection for " + label; },
    list_empty: function (label) { return label + " is a required field"; },
    selection_not_an_array: function (label) { return label + " should be a list of selections"; },
    extra_field: function (name) { return "Field '" + name + "' does not exist in model metadata"; },
};
