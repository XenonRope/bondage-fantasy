import { ZoneMap } from "../components/zone-map";
import { Button, Checkbox, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  doesConnectionKeyContainFieldKey,
  Field,
  FieldConnection,
  FieldConnectionKey,
  FieldKey,
  getFieldConnectionKey,
  getFieldKey,
  getPositionFromFieldKey,
  getPositionsFromConnectionKey,
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
  entrance?: FieldKey;
  fields: {
    [key: FieldKey]: {
      name: string;
      description: string;
      canLeave: boolean;
    };
  };
  connections: { [key: FieldConnectionKey]: true };
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

  function onConnectionClick(positions: [Position, Position]): void {
    const connectionKey = getFieldConnectionKey(positions);
    const connection = form.getValues().connections[connectionKey];
    if (connection) {
      return;
    }

    form.setFieldValue(`connections.${connectionKey}`, true);
  }

  function removeSelectedField(): void {
    if (!selectedField) {
      return;
    }

    form.setFieldValue("fields", (fields) => {
      const fieldsCopy = { ...fields };
      delete fieldsCopy[selectedField];
      return fieldsCopy;
    });
    form.setFieldValue("connections", (connections) => {
      const connectionsCopy = { ...connections };
      for (const connectionKey of Object.keys(connectionsCopy)) {
        if (doesConnectionKeyContainFieldKey(connectionKey, selectedField)) {
          delete connectionsCopy[connectionKey];
        }
      }
      return connectionsCopy;
    });
    if (selectedField === form.getValues().entrance) {
      form.setFieldValue("entrance", undefined);
    }
    setSelectedField(() => undefined);
  }

  function setSelectedFieldAsEntrance(): void {
    form.setFieldValue("entrance", selectedField);
  }

  function getFieldsAsArray(): Field[] {
    return Object.entries(form.getValues().fields).map(([fieldKey, field]) => ({
      position: getPositionFromFieldKey(fieldKey),
      name: field.name,
      description: field.description,
      canLeave: field.canLeave,
    }));
  }

  function getConnectionsAsArray(): FieldConnection[] {
    return Object.entries(form.getValues().connections).map(
      ([connectionKey]) => ({
        positions: getPositionsFromConnectionKey(connectionKey),
      }),
    );
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
            connections={getConnectionsAsArray()}
            entrance={getPositionFromFieldKey(form.getValues().entrance)}
            selectedField={getPositionFromFieldKey(selectedField)}
            onFieldClick={onFieldClick}
            onConnectionClick={onConnectionClick}
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
              <Checkbox
                {...form.getInputProps(`fields.${selectedField}.canLeave`, {
                  type: "checkbox",
                })}
                key={form.key(`fields.${selectedField}.canLeave`)}
                label={t("zoneCreation.allowToLeaveZoneOnThisField")}
                className="mt-4"
              />
            </div>
            <div className="mt-4">
              <Button onClick={setSelectedFieldAsEntrance}>
                <Trans i18nKey="zoneCreation.setAsEntrance" />
              </Button>
              <Button
                variant="danger"
                className="ml-4"
                onClick={removeSelectedField}
              >
                <Trans i18nKey="zoneCreation.removeField" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
