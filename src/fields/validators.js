
export function requiredValidator(field, value) {
    if (field.required && !value) {
        return false;
    }
    return true;
}

export function minLengthValidator(field, value) {
    if (field.minLength && value && value.length) {
        if (value.length < field.minLength) {
            return false;
        }
    }
    return true;
}

export function maxLengthValidator(field, value) {
    if (field.maxLength && value && value.length) {
        if (value.length > field.maxLength) {
            return false;
        }
    }
    return true;
}

export function minValueValidator(field, value) {
    if (field.minValue !== null) {
        if (value < field.minValue) {
            return false;
        }
    }
    return true;
}

export function maxValueValidator(field, value) {
    if (field.maxValue !== null) {
        if (value > field.maxValue) {
            return false;
        }
    }
    return true;
}
