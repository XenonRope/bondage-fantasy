import { ResourceLanguage } from "i18next";

export const en: ResourceLanguage = {
  translation: {
    "common.username": "Username",
    "common.password": "Password",
    "common.or": "or",
    "error.unexpecterError": "Unexpected error",
    "error.errorMessage": 'Error code: {{code}}. Message: "{{message}}".',
    "error.somethingWentWrong": "Something went wrong...",
    "accountRegistration.createAccount": "Create account",
    "accountRegistration.usernameTooShort":
      "Username must have at least {{minLength}} characters",
    "accountRegistration.usernameTooLong":
      "Username cannot have more than {{maxLength}} characters",
    "accountRegistration.usernameInvalidFormat":
      "Username must start with letter and can only contain letters A-Z and digits",
    "accountRegistration.usernameWasAlreadyTaken":
      'Username "{{username}}" was already taken',
    "accountRegistration.passwordTooShort":
      "Password must have at least {{minLength}} characters",
    "accountRegistration.passwordTooLong":
      "Password cannot have more than {{maxLength}} characters",
    "loginForm.login": "Login",
    "loginForm.createNewAccount": "Create new account",
    "loginForm.invalidUsernameOrPassword": "Invalid username or password",
    "loginForm.usernameCannotBeEmpty": "Username cannot be empty",
    "loginForm.passwordCannotBeEmpty": "Password cannot be empty",
  },
};
