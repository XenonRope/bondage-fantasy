import { accountService } from "../services/account-service";
import { errorService } from "../services/error-service";
import { isErrorResponseWithCode } from "../utils/error";
import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import {
  AccountRegisterRequest,
  ErrorCode,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "bondage-fantasy-common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function AccountRegistrationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: validateUsername,
      password: validatePassword,
    },
  });
  const registerAccount = useMutation({
    mutationFn: (request: AccountRegisterRequest) =>
      accountService.register(request),
    onSuccess: () => navigate("/new-character"),
    onError: handleRegisterAccountError,
  });

  function validateUsername(value: string) {
    if (value.length < USERNAME_MIN_LENGTH) {
      return t("accountRegistration.usernameTooShort", {
        minLength: USERNAME_MIN_LENGTH,
      });
    }
    if (value.length > USERNAME_MAX_LENGTH) {
      return t("accountRegistration.usernameTooLong", {
        maxLength: USERNAME_MAX_LENGTH,
      });
    }
    if (!USERNAME_PATTERN.test(value)) {
      return t("accountRegistration.usernameInvalidFormat");
    }
  }

  function validatePassword(value: string) {
    if (value.length < PASSWORD_MIN_LENGTH) {
      return t("accountRegistration.passwordTooShort", {
        minLength: PASSWORD_MIN_LENGTH,
      });
    }
    if (value.length > PASSWORD_MAX_LENGTH) {
      return t("accountRegistration.passwordTooLong", {
        maxLength: PASSWORD_MAX_LENGTH,
      });
    }
  }

  function handleRegisterAccountError(
    error: unknown,
    { username }: AccountRegisterRequest,
  ) {
    if (isErrorResponseWithCode(error, ErrorCode.E_USERNAME_ALREADY_TAKEN)) {
      form.setFieldError(
        "username",
        t("accountRegistration.usernameWasAlreadyTaken", { username }),
      );
      return;
    }
    errorService.handleUnexpectedError(error);
  }

  return (
    <form
      onSubmit={form.onSubmit(
        (values) =>
          !registerAccount.isPending && registerAccount.mutate(values),
      )}
      className="max-w-xs"
    >
      <TextInput
        {...form.getInputProps("username")}
        key={form.key("username")}
        label={t("common.username")}
      />
      <PasswordInput
        {...form.getInputProps("password")}
        key={form.key("password")}
        label={t("common.password")}
        className="mt-2"
      />
      <Button type="submit" className="mt-4">
        {t("accountRegistration.createAccount")}
      </Button>
    </form>
  );
}
