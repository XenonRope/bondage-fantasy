import { ZoneMap } from "../components/zone-map";
import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  findFieldByPosition,
  ZONE_DESCRIPTION_MAX_LENGTH,
  ZONE_DESCRIPTION_MIN_LENGTH,
  ZONE_NAME_MAX_LENGTH,
  ZONE_NAME_MIN_LENGTH,
  ZoneField,
  ZoneFieldPosition,
} from "bondage-fantasy-common";
import { useState } from "react";
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
  const [fields, setFields] = useState<ZoneField[]>([]);
  const [selectedField, setSelectedField] = useState<ZoneField | undefined>();

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

  function onFieldClick(position: ZoneFieldPosition) {
    const field = findFieldByPosition(fields, position);
    if (field) {
      setSelectedField(field);
      return;
    }

    const newField: ZoneField = {
      position,
      name: "",
      description: "",
      canLeave: false,
    };
    setFields((fields) => [...fields, newField]);
    setSelectedField(() => newField);
  }

  return (
    <div className="flex h-full">
      <form
        onSubmit={form.onSubmit(() => {})}
        className="flex flex-col h-full w-1/2 border-r border-app-shell p-md"
      >
        <div className="max-w-xs">
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
        </div>

        <div className="min-h-[256px] max-w-fit overflow-auto mt-4">
          <ZoneMap fields={fields} onFieldClick={onFieldClick} />
        </div>
        <div>
          <Button type="submit" className="mt-4">
            {t("zoneCreation.createZone")}
          </Button>
        </div>
      </form>
      <div className="w-1/2 p-md">
        {selectedField && (
          <div className="max-w-xs">
            <TextInput label={t("common.name")} />
            <TextInput label={t("common.description")} className="mt-2" />
          </div>
        )}
      </div>
    </div>
  );
}
