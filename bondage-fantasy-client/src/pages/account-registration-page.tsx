import { accountApi } from "../api/account-api";
import { errorService } from "../services/error-service";
import { isErrorResponseWithCode } from "../utils/error";
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
  AccountRegisterRequest,
  ErrorCode,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
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
        if (!USERNAME_PATTERN.test(value)) {
          return `Username must start with letter and can only contain letters A-Z and digits`;
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
    mutationFn: (request: AccountRegisterRequest) =>
      accountApi.register(request),
    onError: (error, { username }) => {
      if (isErrorResponseWithCode(error, ErrorCode.E_USERNAME_ALREADY_TAKEN)) {
        form.setFieldError(
          "username",
          `Username "${username}" was already taken`,
        );
        return;
      }
      errorService.handleUnexpectedError(error);
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
