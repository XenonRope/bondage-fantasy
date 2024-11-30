import { ResourceLanguage } from "i18next";

export const pl: ResourceLanguage = {
  translation: {
    "common.username": "Nazwa użytkownika",
    "common.password": "Hasło",
    "error.unexpecterError": "Niespodziewany błąd",
    "error.errorMessage": 'Kod błędu: {{code}}. Wiadomość: "{{message}}".',
    "error.somethingWentWrong": "Coś poszło nie tak...",
    "accountRegistration.createAccount": "Stwórz konto",
    "accountRegistration.usernameTooShort":
      "Nazwa użytkownika musi mieć co najmniej {{minLength}} znaków",
    "accountRegistration.usernameTooLong":
      "Nazwa użytkownika nie może być dłuższa niż {{maxLength}} znaków",
    "accountRegistration.usernameInvalidFormat":
      "Nazwa użytkownika musi zaczynać się literą oraz może zawierać wyłącznie litery A-Z oraz cyfry",
    "accountRegistration.usernameWasAlreadyTaken":
      'Nazwa użytkownika "{{username}}" została już zajęta',
    "accountRegistration.passwordTooShort":
      "Hasło musi mieć co najmniej {{minLength}} znaków",
    "accountRegistration.passwordTooLong":
      "Hasło nie może być dłuższe niż {{maxLength}} znaków",
  },
};
