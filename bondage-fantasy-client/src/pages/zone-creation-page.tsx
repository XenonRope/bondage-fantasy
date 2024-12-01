import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  ZONE_DESCRIPTION_MAX_LENGTH,
  ZONE_DESCRIPTION_MIN_LENGTH,
  ZONE_NAME_MAX_LENGTH,
  ZONE_NAME_MIN_LENGTH,
} from "bondage-fantasy-common";
import { useTranslation } from "react-i18next";

export function ZoneCreationPage() {
  const { t } = useTranslation();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: validateName,
      description: validateDescription,
    },
  });

  function validateName(value: string) {
    if (value.length < ZONE_NAME_MIN_LENGTH) {
      return t("common.fieldTooShort", { minLength: ZONE_NAME_MIN_LENGTH });
    }
    if (value.length > ZONE_NAME_MAX_LENGTH) {
      return t("common.fieldTooLong", {
        maxLength: ZONE_NAME_MAX_LENGTH,
      });
    }
  }

  function validateDescription(value: string) {
    if (value.length < ZONE_DESCRIPTION_MIN_LENGTH) {
      return t("common.fieldCannotBeEmpty");
    }
    if (value.length > ZONE_DESCRIPTION_MAX_LENGTH) {
      return t("common.fieldTooLong", {
        maxLength: ZONE_DESCRIPTION_MAX_LENGTH,
      });
    }
  }

  return (
    <form onSubmit={form.onSubmit(() => {})} className="max-w-xs">
      <TextInput
        {...form.getInputProps("name")}
        key={form.key("name")}
        label={t("common.name")}
      />
      <TextInput
        {...form.getInputProps("description")}
        key={form.key("description")}
        label={t("common.description")}
        className="mt-2"
      />
      <Button type="submit" className="mt-4">
        {t("zoneCreation.createZone")}
      </Button>
    </form>
  );
}
