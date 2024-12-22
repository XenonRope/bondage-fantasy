import { zoneApi } from "../api/zone-api";
import { ZoneMap } from "../components/zone-map";
import { ZoneObjectList } from "../components/zone-object-list";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { Validators } from "../utils/validators";
import { Alert, Button, Checkbox, Textarea, TextInput } from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  arePositionsEqual,
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
  ZoneEditRequest,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import { useEffect, useId, useState } from "react";
import { Translation, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

interface ZoneFormField {
  name: string;
  description: string;
  canLeave: boolean;
  objects: ZoneVisionObject[];
}

interface ZoneForm {
  name: string;
  description: string;
  draft: boolean;
  entrance?: FieldKey;
  fields: Record<FieldKey, ZoneFormField>;
  connections: Record<FieldConnectionKey, true>;
}

export function ZoneEditorPage() {
  const uniqueId = useId();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<ZoneForm>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
      draft: true,
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
  const editZone = useMutation({
    mutationFn: async (request: ZoneEditRequest) => {
      const sessionData = await zoneApi.edit(request);
      useAppStore.getState().updateSessionData(sessionData);
    },
    onSuccess: () => navigate("/zones"),
    onError: (error) => errorService.handleUnexpectedError(error),
  });
  const { zoneId } = useParams();
  const zone = useQuery({
    queryKey: ["zone", zoneId, uniqueId],
    queryFn: async () =>
      zoneId ? await zoneApi.getById(parseInt(zoneId)) : null,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const objects = useQuery({
    queryKey: ["zoneObjects", zoneId, uniqueId],
    queryFn: async () =>
      zoneId ? await zoneApi.getObjectsByZoneId(parseInt(zoneId)) : null,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  useEffect(() => {
    if (zone.data && objects.data) {
      form.setValues({
        name: zone.data.name,
        description: zone.data.description,
        draft: zone.data.draft,
        entrance: getFieldKey(zone.data.entrance),
        fields: mapFieldsToFormFields(zone.data.fields, objects.data),
        connections: mapConnectionsToFormConnections(zone.data.connections),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone.data, objects.data]);

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
      entrance: Validators.notEmpty(
        <Translation>
          {(t) => t("zoneCreation.yourZoneHasNoEntrance")}
        </Translation>,
      )(values.entrance),
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
    if (fieldKey === selectedField) {
      setSelectedField(undefined);
      return;
    }

    const field = form.getValues().fields[fieldKey];
    if (!field) {
      const newField = {
        name: "",
        description: "",
        canLeave: false,
        objects: [],
      };
      form.setFieldValue(`fields.${fieldKey}`, newField);
    }

    setSelectedField(fieldKey);
    setSelectedConnection(undefined);
  }

  function onConnectionClick(positions: [Position, Position]): void {
    const connectionKey = getFieldConnectionKey(positions);
    if (connectionKey === selectedConnection) {
      setSelectedConnection(undefined);
      return;
    }
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
      draft: form.getValues().draft,
      entrance: getPositionFromFieldKey(form.getValues().entrance!),
      fields: getFieldsAsArray(),
      connections: getConnectionsAsArray(),
      objects: [],
    };
  }

  function prepareZoneEditRequest(): ZoneEditRequest {
    return {
      zoneId: parseInt(zoneId!),
      name: form.getValues().name,
      description: form.getValues().description,
      draft: form.getValues().draft,
      entrance: getPositionFromFieldKey(form.getValues().entrance!),
      fields: getFieldsAsArray(),
      connections: getConnectionsAsArray(),
      objects: [],
    };
  }

  function mapFieldsToFormFields(
    fields: Field[],
    objects: ZoneVisionObject[],
  ): Record<FieldKey, ZoneFormField> {
    const result: Record<FieldKey, ZoneFormField> = {};
    for (const field of fields) {
      result[getFieldKey(field)] = {
        name: field.name,
        description: field.description,
        canLeave: field.canLeave,
        objects: objects.filter((object) =>
          arePositionsEqual(object.position, field.position),
        ),
      };
    }
    return result;
  }

  function mapConnectionsToFormConnections(
    connections: FieldConnection[],
  ): Record<FieldConnectionKey, true> {
    const result: Record<FieldConnectionKey, true> = {};
    for (const connection of connections) {
      result[getFieldConnectionKey(connection)] = true;
    }
    return result;
  }

  if (zoneId && (!zone.data || objects.data == null)) {
    return <></>;
  }

  return (
    <div className="flex h-full">
      <form
        onSubmit={form.onSubmit(() => {
          if (zoneId) {
            if (!editZone.isPending) {
              editZone.mutate(prepareZoneEditRequest());
            }
          } else {
            if (!createZone.isPending) {
              createZone.mutate(prepareZoneCreateRequest());
            }
          }
        })}
        className="flex flex-col h-full w-1/2 border-r border-app-shell p-md"
      >
        {form.errors.entrance && (
          <Alert variant="error" className="mb-4">
            {form.errors.entrance}
          </Alert>
        )}
        <div>
          <TextInput
            {...form.getInputProps("name")}
            key={form.key("name")}
            label={t("common.name")}
            className="max-w-xs"
          />
          <Textarea
            {...form.getInputProps("description")}
            key={form.key("description")}
            label={t("common.description")}
            autosize
            minRows={2}
            maxRows={10}
            className="mt-2"
          />
          <Checkbox
            {...form.getInputProps("draft", {
              type: "checkbox",
            })}
            key={form.key("draft")}
            label={t("common.draft")}
            className="mt-4"
          />
        </div>

        <div className="min-h-[256px] max-w-fit overflow-auto mt-8">
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
        <div className="mt-8">
          {zoneId && (
            <Button type="submit">{t("zoneCreation.modifyZone")}</Button>
          )}
          {!zoneId && (
            <Button type="submit">{t("zoneCreation.createZone")}</Button>
          )}
        </div>
      </form>
      <div className="w-1/2 p-md">
        {selectedField && (
          <>
            <div>
              <TextInput
                {...form.getInputProps(`fields.${selectedField}.name`)}
                key={form.key(`fields.${selectedField}.name`)}
                label={t("common.name")}
                className="max-w-xs"
              />
              <Textarea
                {...form.getInputProps(`fields.${selectedField}.description`)}
                key={form.key(`fields.${selectedField}.description`)}
                label={t("common.description")}
                autosize
                minRows={2}
                maxRows={10}
                maxLength={ZONE_FIELD_DESCRIPTION_MAX_LENGTH}
                className="mt-2"
              />
              <Checkbox
                {...form.getInputProps(`fields.${selectedField}.canLeave`, {
                  type: "checkbox",
                })}
                key={form.key(`fields.${selectedField}.canLeave`)}
                onChange={(event) =>
                  form.setFieldValue(
                    `fields.${selectedField}.canLeave`,
                    event.currentTarget.checked,
                  )
                }
                label={t("zoneCreation.allowToLeaveZoneOnThisField")}
                className="mt-4"
              />
            </div>
            <div className="mt-4">
              <ZoneObjectList
                objects={form.getValues().fields[selectedField].objects}
              />
            </div>
            <div className="mt-4">
              <Button onClick={setSelectedFieldAsEntrance}>
                {t("zoneCreation.setAsEntrance")}
              </Button>
              <Button
                variant="danger"
                className="ml-4"
                onClick={removeSelectedField}
              >
                {t("zoneCreation.removeField")}
              </Button>
            </div>
          </>
        )}
        {selectedConnection && (
          <div>
            <Button variant="danger" onClick={removeSelectedConnection}>
              {t("zoneCreation.removeConnection")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
