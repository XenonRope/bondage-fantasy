import {
  Alert,
  Button,
  Checkbox,
  Tabs,
  Textarea,
  TextInput,
} from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import { useForceUpdate } from "@mantine/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  arePositionsEqual,
  doesConnectionKeyContainFieldKey,
  EventObject,
  EXPRESSION_SOURCE_MAX_LENGTH,
  Field,
  FieldConnection,
  FieldConnectionKey,
  FieldKey,
  getFieldConnectionKey,
  getFieldKey,
  getPositionFromFieldKey,
  getPositionsFromConnectionKey,
  ObjectType,
  Position,
  SceneDefinition,
  Zone,
  ZONE_DESCRIPTION_MAX_LENGTH,
  ZONE_DESCRIPTION_MIN_LENGTH,
  ZONE_EVENT_MAX_COUNT,
  ZONE_EVENT_NAME_MAX_LENGTH,
  ZONE_EVENT_NAME_MIN_LENGTH,
  ZONE_FIELD_DESCRIPTION_MAX_LENGTH,
  ZONE_FIELD_DESCRIPTION_MIN_LENGTH,
  ZONE_FIELD_NAME_MAX_LENGTH,
  ZONE_FIELD_NAME_MIN_LENGTH,
  ZONE_NAME_MAX_LENGTH,
  ZONE_NAME_MIN_LENGTH,
  ZoneObject,
  ZoneSaveRequest,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import { ReactNode, useEffect, useId, useState } from "react";
import { Translation, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { zoneApi } from "../api/zone-api";
import { ExpressionEditor } from "../components/expression-editor";
import { SceneDefinitionEditor } from "../components/scene-definition-editor";
import { TextTemplateEditor } from "../components/text-template-editor";
import { ZoneMap } from "../components/zone-map";
import { ZoneObjectList } from "../components/zone-object-list";
import { errorService } from "../services/error-service";
import { notificationService } from "../services/notification-service";
import { useAppStore } from "../store";
import { Validators } from "../utils/validators";

interface ZoneFormField {
  name: string;
  description: string;
  canLeave: boolean;
  objects: ZoneObject[];
}

interface ZoneForm {
  name: string;
  description: string;
  draft: boolean;
  entrance?: FieldKey;
  fields: Record<FieldKey, ZoneFormField>;
  connections: Record<FieldConnectionKey, true>;
}

function EventForm(props: {
  initialEvent: EventObject;
  onConfirm?: (event: EventObject) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const forceUpdate = useForceUpdate();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: props.initialEvent.name,
      showConditionally: props.initialEvent.condition != null,
      condition: props.initialEvent.condition,
    },
    validate: {
      name: Validators.inRange(
        ZONE_EVENT_NAME_MIN_LENGTH,
        ZONE_EVENT_NAME_MAX_LENGTH,
      ),
      condition: (value, values) =>
        values.showConditionally ? Validators.expression()(value) : null,
    },
  });
  const [scene, setScene] = useState<SceneDefinition>(
    props.initialEvent.scene ?? {
      steps: [],
    },
  );
  form.watch("showConditionally", forceUpdate);

  function onConfirm(): void {
    const event: EventObject = {
      type: ObjectType.EVENT,
      position: props.initialEvent.position,
      eventId: props.initialEvent.eventId,
      name: form.getValues().name,
      condition: form.getValues().showConditionally
        ? form.getValues().condition
        : undefined,
      scene: scene.steps.length > 0 ? scene : undefined,
    };

    props.onConfirm?.(event);
  }

  return (
    <div>
      <TextInput
        {...form.getInputProps("name")}
        key={form.key("name")}
        label={t("common.name")}
        maxLength={ZONE_EVENT_NAME_MAX_LENGTH}
        className="max-w-xs"
      />
      <Checkbox
        {...form.getInputProps("showConditionally", {
          type: "checkbox",
        })}
        key={form.key("showConditionally")}
        label={t("zoneCreation.showConditionally")}
        className="mt-4"
      />
      {form.getValues().showConditionally && (
        <ExpressionEditor
          {...form.getInputProps("condition")}
          key={form.key("condition")}
          label={t("common.condition")}
          maxLength={EXPRESSION_SOURCE_MAX_LENGTH}
          className="mt-2 max-w-lg"
        />
      )}
      <div className="mt-4">
        <SceneDefinitionEditor scene={scene} onChange={setScene} />
      </div>
      <div className="mt-4">
        <Button onClick={() => form.onSubmit(onConfirm)()}>
          {t("zoneCreation.saveEvent")}
        </Button>
        <Button onClick={() => props.onCancel?.()} className="ml-4">
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
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
  const saveZone = useMutation({
    mutationFn: async (request: ZoneSaveRequest) => {
      const sessionData = await zoneApi.save(request);
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
  const [nextEventId, setNextEventId] = useState(1);
  const [eventToEdit, setEventToEdit] = useState<EventObject>();
  const [activeTab, setActiveTab] = useState<string | null>("basic");
  useEffect(() => {
    if (zone.data) {
      form.setValues({
        name: zone.data.name,
        description: zone.data.description,
        draft: zone.data.draft,
        entrance: getFieldKey(zone.data.entrance),
        fields: mapFieldsToFormFields(zone.data.fields, zone.data),
        connections: mapConnectionsToFormConnections(zone.data.connections),
      });
      setNextEventId(
        Math.max(
          ...zone.data.objects
            .filter((object) => object.type === ObjectType.EVENT)
            .map((event) => event.eventId),
          0,
        ) + 1,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone.data]);

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

  function prepareZoneSaveRequest(): ZoneSaveRequest {
    return {
      zoneId: zoneId == null ? undefined : parseInt(zoneId),
      name: form.getValues().name,
      description: form.getValues().description,
      draft: form.getValues().draft,
      entrance: getPositionFromFieldKey(form.getValues().entrance!),
      fields: getFieldsAsArray(),
      connections: getConnectionsAsArray(),
      objects: prepareObjects(),
    };
  }

  function prepareObjects(): ZoneObject[] {
    const objects: ZoneObject[] = [];
    for (const field of Object.values(form.getValues().fields)) {
      objects.push(...field.objects);
    }
    return objects;
  }

  function mapFieldsToFormFields(
    fields: Field[],
    zone: Zone,
  ): Record<FieldKey, ZoneFormField> {
    const result: Record<FieldKey, ZoneFormField> = {};
    for (const field of fields) {
      result[getFieldKey(field)] = {
        name: field.name,
        description: field.description,
        canLeave: field.canLeave,
        objects: zone.objects.filter(
          (object) =>
            object.type !== ObjectType.CHARACTER &&
            arePositionsEqual(object.position, field.position),
        ),
      };
    }
    return result;
  }

  function mapObjectsToZoneVisionObjects(
    objects: ZoneObject[],
  ): ZoneVisionObject[] {
    return objects
      .map((object) => mapObjectToZoneVisionObject(object))
      .filter((object) => object != null);
  }

  function mapObjectToZoneVisionObject(
    object: ZoneObject,
  ): ZoneVisionObject | undefined {
    if (object.type === ObjectType.EVENT) {
      return {
        type: ObjectType.EVENT,
        position: object.position,
        eventId: object.eventId,
        name: object.name,
        canInteract: object.scene != null && object.scene.steps.length > 0,
      };
    }
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

  function submitForm(): void {
    form.onSubmit(() => {
      if (!saveZone.isPending) {
        saveZone.mutate(prepareZoneSaveRequest());
      }
    })();
  }

  function openEventAddForm(): void {
    if (!selectedField) {
      return;
    }

    const eventCount = Object.values(form.getValues().fields)
      .flatMap((field) => field.objects)
      .filter((object) => object.type === ObjectType.EVENT).length;
    if (eventCount >= ZONE_EVENT_MAX_COUNT) {
      notificationService.error(
        t("zoneCreation.eventCountLimitReached.title"),
        t("zoneCreation.eventCountLimitReached.message", {
          eventMaxCount: ZONE_EVENT_MAX_COUNT,
        }),
      );
      return;
    }

    setEventToEdit({
      type: ObjectType.EVENT,
      position: getPositionFromFieldKey(selectedField),
      eventId: nextEventId,
      name: "",
    });
    setNextEventId((value) => value + 1);
    setActiveTab("event");
  }

  function saveEvent(event: EventObject): void {
    form.setFieldValue(
      `fields.${getFieldKey(event.position)}.objects`,
      (objects) => {
        const objectsCopy = [...objects];
        const index = objectsCopy.findIndex(
          (object) =>
            object.type === ObjectType.EVENT &&
            object.eventId === event.eventId,
        );

        if (index === -1) {
          objectsCopy.push(event);
        } else {
          objectsCopy[index] = event;
        }
        return objectsCopy;
      },
    );

    changeTab("map");
  }

  function changeTab(tab: string | null): void {
    setEventToEdit(undefined);
    setActiveTab(tab);
  }

  function getObjectActions(
    visionObject: ZoneVisionObject,
  ): { label: ReactNode; onClick: () => void }[] {
    if (visionObject.type === ObjectType.EVENT) {
      return [
        {
          label: <Translation>{(t) => t("common.edit")}</Translation>,
          onClick: () => {
            setEventToEdit(
              form
                .getValues()
                .fields[getFieldKey(visionObject.position)].objects.filter(
                  (object) => object.type === ObjectType.EVENT,
                )
                .find((object) => object.eventId === visionObject.eventId),
            );
            setActiveTab("event");
          },
        },
        {
          label: <Translation>{(t) => t("common.remove")}</Translation>,
          onClick: () => {
            form.setFieldValue(
              `fields.${getFieldKey(visionObject.position)}.objects`,
              (objects) =>
                objects.filter(
                  (object) =>
                    object.type !== ObjectType.EVENT ||
                    object.eventId !== visionObject.eventId,
                ),
            );
          },
        },
      ];
    }

    return [];
  }

  if (zoneId && !zone.data) {
    return <></>;
  }

  return (
    <Tabs
      variant="pills"
      radius="xs"
      className="flex flex-col h-full"
      value={activeTab}
      onChange={changeTab}
    >
      <Tabs.List className="border-b border-app-shell">
        <Tabs.Tab value="basic">{t("zoneCreation.tabs.basic")}</Tabs.Tab>
        <Tabs.Tab value="map">{t("zoneCreation.tabs.map")}</Tabs.Tab>
        {eventToEdit && (
          <Tabs.Tab value="event">{t("zoneCreation.tabs.event")}</Tabs.Tab>
        )}
      </Tabs.List>

      <Tabs.Panel value="basic" className="p-md">
        {form.errors.entrance && (
          <Alert variant="error" className="mb-4">
            {form.errors.entrance}
          </Alert>
        )}
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
          className="mt-2 max-w-lg"
        />
        <Checkbox
          {...form.getInputProps("draft", {
            type: "checkbox",
          })}
          key={form.key("draft")}
          label={t("common.draft")}
          className="mt-4"
        />
        <div className="mt-4">
          {zoneId && (
            <Button onClick={submitForm}>{t("zoneCreation.modifyZone")}</Button>
          )}
          {!zoneId && (
            <Button onClick={submitForm}>{t("zoneCreation.createZone")}</Button>
          )}
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="map" className="flex flex-grow">
        <div className="flex flex-col h-full w-1/2 border-r border-app-shell p-md">
          <div className="min-h-[256px] max-w-fit overflow-auto">
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
        </div>
        <div className="w-1/2">
          {selectedField && (
            <div className="flex flex-col">
              <div className="p-md">
                <div>
                  <TextInput
                    {...form.getInputProps(`fields.${selectedField}.name`)}
                    key={form.key(`fields.${selectedField}.name`)}
                    label={t("common.name")}
                    className="max-w-xs"
                  />
                  <TextTemplateEditor
                    {...form.getInputProps(
                      `fields.${selectedField}.description`,
                    )}
                    key={form.key(`fields.${selectedField}.description`)}
                    label={t("common.description")}
                    maxLength={ZONE_FIELD_DESCRIPTION_MAX_LENGTH}
                    className="mt-2"
                    classNames={{ input: "min-h-14 max-h-52 overflow-auto" }}
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
              </div>
              <div className="p-md border-t border-app-shell">
                {form.getValues().fields[selectedField].objects.length > 0 && (
                  <div className="mb-4">
                    <ZoneObjectList
                      objects={mapObjectsToZoneVisionObjects(
                        form.getValues().fields[selectedField].objects,
                      )}
                      actions={getObjectActions}
                    />
                  </div>
                )}
                <div>
                  <Button onClick={openEventAddForm}>
                    {t("zoneCreation.addEvent")}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {selectedConnection && (
            <div>
              <Button variant="danger" onClick={removeSelectedConnection}>
                {t("zoneCreation.removeConnection")}
              </Button>
            </div>
          )}
        </div>
      </Tabs.Panel>
      {eventToEdit && (
        <Tabs.Panel value="event" className="p-md">
          <EventForm
            initialEvent={eventToEdit}
            onConfirm={saveEvent}
            onCancel={() => changeTab("map")}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  );
}
