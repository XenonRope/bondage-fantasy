import { ResourceLanguage } from "i18next";

export const en: ResourceLanguage = {
  translation: {
    "common.username": "Username",
    "common.password": "Password",
    "common.name": "Name",
    "common.pronouns": "Pronouns",
    "common.genitals": "Genitals",
    "common.or": "or",
    "common.fieldCannotBeEmpty": "Field cannot be empty",
    "common.login": "Login",
    "common.createNewAccount": "Create new account",
    "pronouns.SHE_HER": "She/Her",
    "pronouns.HE_HIM": "He/Him",
    "genitals.VAGINA": "Vagina",
    "genitals.PENIS": "Penis",
    "genitals.FUTA": "Futa",
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
    "loginForm.invalidUsernameOrPassword": "Invalid username or password",
    "loginForm.usernameCannotBeEmpty": "Username cannot be empty",
    "loginForm.passwordCannotBeEmpty": "Password cannot be empty",
    "characterCreation.nameIsTooLong":
      "Name cannot have more than {{maxLength}} characters",
    "characterCreation.createCharacter": "Create character",
    "characterList.createNewCharacter": "Create new character",
  },
};
