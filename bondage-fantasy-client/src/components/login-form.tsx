import {
  Anchor,
  Box,
  Button,
  Paper,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
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
  });

  return (
    <Paper className="max-w-xs">
      <form onSubmit={form.onSubmit(() => {})}>
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
