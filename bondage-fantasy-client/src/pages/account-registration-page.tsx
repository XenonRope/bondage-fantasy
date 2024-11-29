import { accountApi } from "../api/account-api";
import { notificationService } from "../services/notification-service";
import { isErrorWithCode } from "../utils/error";
import {
  Button,
  Container,
  PasswordInput,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import {
  ErrorCode,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "bondage-fantasy-common";

export default function AccountRegistrationPage() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) => {
        if (value.length < USERNAME_MIN_LENGTH) {
          return `Username must have at least ${USERNAME_MIN_LENGTH} characters`;
        }
        if (value.length > USERNAME_MAX_LENGTH) {
          return `Username cannot have more than ${USERNAME_MAX_LENGTH} characters`;
        }
      },
      password: (value) => {
        if (value.length < PASSWORD_MIN_LENGTH) {
          return `Password must have at least ${PASSWORD_MIN_LENGTH} characters`;
        }
        if (value.length > PASSWORD_MAX_LENGTH) {
          return `Password cannot have more than ${PASSWORD_MAX_LENGTH} characters`;
        }
      },
    },
  });

  const registerMutation = useMutation({
    mutationFn: (params: { username: string; password: string }) =>
      accountApi.register(params),
    onError: (error, { username }) => {
      if (isErrorWithCode(error, ErrorCode.E_USERNAME_ALREADY_TAKEN)) {
        form.setFieldError(
          "username",
          `Username "${username}" was already taken`,
        );
      } else {
        notificationService.unexpectedError("Account was not created");
      }
    },
  });

  return (
    <Container size="xs">
      <form
        onSubmit={form.onSubmit(
          (values) =>
            !registerMutation.isPending && registerMutation.mutate(values),
        )}
      >
        <Title order={2} mt={16} mb={24}>
          Create account
        </Title>
        <TextInput
          {...form.getInputProps("username")}
          key={form.key("username")}
          label="Username"
        />
        <PasswordInput
          {...form.getInputProps("password")}
          key={form.key("password")}
          mt="md"
          label="Password"
        />
        <Button type="submit" mt="md">
          Submit
        </Button>
      </form>
    </Container>
  );
}
