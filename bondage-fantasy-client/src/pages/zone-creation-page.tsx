import { ZoneMap } from "../components/zone-map";
import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  Field,
  FieldConnection,
  FieldConnectionKey,
  FieldKey,
  getFieldKey,
  getPositionFromFieldKey,
  Position,
  ZONE_DESCRIPTION_MAX_LENGTH,
  ZONE_DESCRIPTION_MIN_LENGTH,
  ZONE_NAME_MAX_LENGTH,
  ZONE_NAME_MIN_LENGTH,
} from "bondage-fantasy-common";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

interface ZoneForm {
  name: string;
  description: string;
  entrance?: Position;
  fields: {
    [key: FieldKey]: {
      name: string;
      description: string;
      canLeave: boolean;
    };
  };
  connections: { [key: FieldConnectionKey]: FieldConnection };
}

export function ZoneCreationPage() {
  const { t } = useTranslation();
  const form = useForm<ZoneForm>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
      entrance: undefined,
      fields: {},
      connections: {},
    },
    validate: {
      name: validateName,
      description: validateDescription,
    },
  });
  const [selectedField, setSelectedField] = useState<FieldKey>();

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

  function onFieldClick(position: Position): void {
    const fieldKey = getFieldKey(position);
    const field = form.getValues().fields[fieldKey];
    if (field) {
      setSelectedField(fieldKey);
      return;
    }

    const newField = {
      name: "",
      description: "",
      canLeave: false,
    };
    form.setFieldValue(`fields.${fieldKey}`, newField);
    setSelectedField(() => fieldKey);
  }

  function removeSelectedField(): void {
    if (!selectedField) {
      return;
    }

    form.setFieldValue(`fields`, (fields) => {
      const fieldsCopy = { ...fields };
      delete fieldsCopy[selectedField];
      return fieldsCopy;
    });
    setSelectedField(() => undefined);
  }

  function getFieldsAsArray(): Field[] {
    return Object.entries(form.getValues().fields).map(([fieldKey, field]) => ({
      position: getPositionFromFieldKey(fieldKey),
      name: field.name,
      description: field.description,
      canLeave: field.canLeave,
    }));
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
          <ZoneMap
            fields={getFieldsAsArray()}
            selectedField={getPositionFromFieldKey(selectedField)}
            onFieldClick={onFieldClick}
          />
        </div>
        <div>
          <Button type="submit" className="mt-4">
            {t("zoneCreation.createZone")}
          </Button>
        </div>
      </form>
      <div className="w-1/2 p-md">
        {selectedField && (
          <>
            <div className="max-w-xs">
              <TextInput
                {...form.getInputProps(`fields.${selectedField}.name`)}
                key={form.key(`fields.${selectedField}.name`)}
                label={t("common.name")}
              />
              <TextInput
                {...form.getInputProps(`fields.${selectedField}.description`)}
                key={form.key(`fields.${selectedField}.description`)}
                label={t("common.description")}
                className="mt-2"
              />
            </div>
            <div className="mt-4">
              <Button variant="danger" onClick={removeSelectedField}>
                <Trans i18nKey="zoneCreation.removeField" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
