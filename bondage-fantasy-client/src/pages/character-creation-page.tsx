import { characterApi } from "../api/character-api";
import { errorService } from "../services/error-service";
import {
  Button,
  ComboboxData,
  Container,
  Select,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import {
  CHARACTER_NAME_MAX_LENGTH,
  CHARACTER_NAME_MIN_LENGTH,
  CharacterCreateRequest,
  Genitals,
  Pronouns,
} from "bondage-fantasy-common";
import { useTranslation } from "react-i18next";

export function CharacterCreationPage() {
  const { t } = useTranslation();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      pronouns: undefined as Pronouns | undefined,
      genitals: undefined as Genitals | undefined,
    },
    validate: {
      name: validateName,
      pronouns: fieldCannotBeEmpty,
      genitals: fieldCannotBeEmpty,
    },
  });
  const createCharacter = useMutation({
    mutationFn: (request: CharacterCreateRequest) =>
      characterApi.create(request),
    onError: handleCreateCharacterError,
  });

  function validateName(value: string) {
    if (value.length < CHARACTER_NAME_MIN_LENGTH) {
      return t("common.fieldCannotBeEmpty");
    }
    if (value.length > CHARACTER_NAME_MAX_LENGTH) {
      return t("characterCreation.nameIsTooLong", {
        maxLength: CHARACTER_NAME_MAX_LENGTH,
      });
    }
  }

  function fieldCannotBeEmpty(value: unknown) {
    if (!value) {
      return t("common.fieldCannotBeEmpty");
    }
  }

  function handleCreateCharacterError(error: unknown) {
    errorService.handleUnexpectedError(error);
  }

  function getPronounsList(): ComboboxData {
    return Object.values(Pronouns).map((pronouns) => ({
      value: pronouns,
      label: t(`pronouns.${pronouns}`),
    }));
  }

  function getGenitalsList(): ComboboxData {
    return Object.values(Genitals).map((genitals) => ({
      value: genitals,
      label: t(`genitals.${genitals}`),
    }));
  }

  return (
    <Container size="xs">
      <form
        onSubmit={form.onSubmit(
          (values) =>
            !createCharacter.isPending &&
            createCharacter.mutate(values as CharacterCreateRequest),
        )}
      >
        <TextInput
          {...form.getInputProps("name")}
          key={form.key("name")}
          label={t("common.name")}
        />
        <Select
          {...form.getInputProps("pronouns")}
          key={form.key("pronouns")}
          label={t("common.pronouns")}
          data={getPronounsList()}
        />
        <Select
          {...form.getInputProps("genitals")}
          key={form.key("genitals")}
          label={t("common.genitals")}
          data={getGenitalsList()}
        />
        <Button type="submit" className="mt-2">
          {t("characterCreation.createCharacter")}
        </Button>
      </form>
    </Container>
  );
}
