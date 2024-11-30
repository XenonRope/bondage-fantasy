import { sessionApi } from "../api/session-api";
import { errorService } from "../services/error-service";
import { isErrorResponseWithCode } from "../utils/error";
import { Anchor, Button, Paper, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { ErrorCode, LoginRequest } from "bondage-fantasy-common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function LoginForm() {
  const { t } = useTranslation();
  const naviage = useNavigate();
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
  const login = useMutation({
    mutationFn: (request: LoginRequest) => sessionApi.login(request),
    onError: handleLoginError,
  });

  function handleLoginError(error: unknown, { username }: LoginRequest) {
    if (
      isErrorResponseWithCode(error, ErrorCode.E_INVALID_USERNAME_OF_PASSWORD)
    ) {
      form.setErrors({
        username: <></>,
        password: t("loginForm.invalidUsernameOrPassword", { username }),
      });
      return;
    }
    errorService.handleUnexpectedError(error);
  }

  function validateUsername(value: string) {
    if (value.length === 0) {
      return t("loginForm.usernameCannotBeEmpty");
    }
  }

  function validatePassword(value: string) {
    if (value.length === 0) {
      return t("loginForm.passwordCannotBeEmpty");
    }
  }

  return (
    <Paper className="max-w-xs">
      <form
        onSubmit={form.onSubmit(
          (values) => !login.isPending && login.mutate(values),
        )}
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
        <div className="flex items-baseline gap-1 mt-4">
          <Button type="submit">{t("loginForm.login")}</Button>
          <span>{t("common.or")}</span>
          <Anchor onClick={() => naviage("/account/create")}>
            {t("loginForm.createNewAccount")}
          </Anchor>
        </div>
      </form>
    </Paper>
  );
}
