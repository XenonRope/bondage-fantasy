import { zoneApi } from "../api/zone-api";
import { ZoneMap } from "../components/zone-map";
import { errorService } from "../services/error-service";
import { Validators } from "../utils/validators";
import { Alert, Button, Checkbox, TextInput } from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
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
  ZONE_FIELD_DESCRIPTION_MAX_LENGTH,
  ZONE_FIELD_DESCRIPTION_MIN_LENGTH,
  ZONE_FIELD_NAME_MAX_LENGTH,
  ZONE_FIELD_NAME_MIN_LENGTH,
  ZONE_NAME_MAX_LENGTH,
  ZONE_NAME_MIN_LENGTH,
  ZoneCreateRequest,
} from "bondage-fantasy-common";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();
  const form = useForm<ZoneForm>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
      entrance: undefined,
      fields: {},
      connections: {},
    },
    validate: validateForm,
  });
  const [selectedField, setSelectedField] = useState<FieldKey>();
  const [selectedConnection, setSelectedConnection] =
    useState<FieldConnectionKey>();
  const createZone = useMutation({
    mutationFn: (request: ZoneCreateRequest) => zoneApi.create(request),
    onSuccess: () => navigate("/zones"),
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  function validateForm(values: ZoneForm): FormErrors {
    const errors: FormErrors = {
      name: Validators.inRange(
        ZONE_NAME_MIN_LENGTH,
        ZONE_NAME_MAX_LENGTH,
      )(values.name),
      description: Validators.inRange(
        ZONE_DESCRIPTION_MIN_LENGTH,
        ZONE_DESCRIPTION_MAX_LENGTH,
      )(values.description),
      entrance: Validators.notEmpty(t("zoneCreation.yourZoneHasNoEntrance"))(
        values.entrance,
      ),
    };
    for (const [fieldKey, field] of Object.entries(values.fields)) {
      errors[`fields.${fieldKey}.name`] = Validators.inRange(
        ZONE_FIELD_NAME_MIN_LENGTH,
        ZONE_FIELD_NAME_MAX_LENGTH,
      )(field.name);
      errors[`fields.${fieldKey}.description`] = Validators.inRange(
        ZONE_FIELD_DESCRIPTION_MIN_LENGTH,
        ZONE_FIELD_DESCRIPTION_MAX_LENGTH,
      )(field.description);
    }

    return errors;
  }

  function onFieldClick(position: Position): void {
    const fieldKey = getFieldKey(position);
    const field = form.getValues().fields[fieldKey];
    if (!field) {
      const newField = {
        name: "",
        description: "",
        canLeave: false,
      };
      form.setFieldValue(`fields.${fieldKey}`, newField);
    }

    setSelectedField(fieldKey);
    setSelectedConnection(undefined);
  }

  function onConnectionClick(positions: [Position, Position]): void {
    const connectionKey = getFieldConnectionKey(positions);
    const connection = form.getValues().connections[connectionKey];
    if (!connection) {
      form.setFieldValue(`connections.${connectionKey}`, true);
    }

    setSelectedField(undefined);
    setSelectedConnection(connectionKey);
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
          if (selectedConnection === connectionKey) {
            setSelectedConnection(() => undefined);
          }
        }
      }
      return connectionsCopy;
    });
    if (selectedField === form.getValues().entrance) {
      form.setFieldValue("entrance", undefined);
    }
    setSelectedField(() => undefined);
  }

  function removeSelectedConnection(): void {
    if (!selectedConnection) {
      return;
    }

    form.setFieldValue("connections", (connections) => {
      const connectionsCopy = { ...connections };
      delete connectionsCopy[selectedConnection];
      return connectionsCopy;
    });
    setSelectedConnection(() => undefined);
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

  function prepareZoneCreateRequest(): ZoneCreateRequest {
    return {
      name: form.getValues().name,
      description: form.getValues().description,
      entrance: getPositionFromFieldKey(form.getValues().entrance!),
      fields: getFieldsAsArray(),
      connections: getConnectionsAsArray(),
    };
  }

  return (
    <div className="flex h-full">
      <form
        onSubmit={form.onSubmit(
          () =>
            !createZone.isPending &&
            createZone.mutate(prepareZoneCreateRequest()),
        )}
        className="flex flex-col h-full w-1/2 border-r border-app-shell p-md"
      >
        {form.errors.entrance && (
          <Alert variant="error" className="mb-4">
            {form.errors.entrance}
          </Alert>
        )}
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
            selectedField={selectedField}
            selectedConnection={selectedConnection}
            editMode={true}
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
        {selectedConnection && (
          <div>
            <Button variant="danger" onClick={removeSelectedConnection}>
              <Trans i18nKey="zoneCreation.removeConnection" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
