import { Button, Container, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
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

  return (
    <Container>
      <form onSubmit={form.onSubmit(() => {})}>
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
