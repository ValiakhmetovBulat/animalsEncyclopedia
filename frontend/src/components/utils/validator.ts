import validator from "validator";

export const UsernameLength = { min: 3, max: 64};
export const PasswordLength = { min: 8, max: 64 };

const usernameRegex = /^[a-zA-Z0-9._-]+$/

export const PasswordSpecSymbols = "-#!$@£%^&*()_+|~={}[]:\";'<>?,./`\\"

export const isUsernameValid = (username: string) => {
    return !validator.isEmpty(username.trim()) &&
        validator.isLength(username, UsernameLength) &&
        validator.matches(username, usernameRegex)
}

export const isEmailValid = (email: string) => {
    return validator.isEmail(email)
}

export const isPasswordValid = (password: string) => {
    return !validator.isEmpty(password.trim()) &&
        validator.isLength(password, PasswordLength) &&
        validator.isStrongPassword(password, {
            minLength: PasswordLength.min,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
}