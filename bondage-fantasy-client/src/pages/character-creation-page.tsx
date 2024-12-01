import { characterApi } from "../api/character-api";
import { errorService } from "../services/error-service";
import { Button, ComboboxData, Select, TextInput } from "@mantine/core";
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
import { useNavigate } from "react-router";

export function CharacterCreationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    onSuccess: () => navigate("/characters"),
    onError: (error) => errorService.handleUnexpectedError(error),
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
    <form
      onSubmit={form.onSubmit(
        (values) =>
          !createCharacter.isPending &&
          createCharacter.mutate(values as CharacterCreateRequest),
      )}
      className="max-w-xs"
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
        className="mt-2"
      />
      <Select
        {...form.getInputProps("genitals")}
        key={form.key("genitals")}
        label={t("common.genitals")}
        data={getGenitalsList()}
        className="mt-2"
      />
      <Button type="submit" className="mt-4">
        {t("characterCreation.createCharacter")}
      </Button>
    </form>
  );
}
