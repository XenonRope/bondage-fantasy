import { zoneApi } from "../api/zone-api";
import { ZoneMap } from "../components/zone-map";
import { ZoneObjectList } from "../components/zone-object-list";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { Validators } from "../utils/validators";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Paper,
  Select,
  Tabs,
  Textarea,
  TextInput,
} from "@mantine/core";
import { FormErrors, useForm, UseFormReturnType } from "@mantine/form";
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
  Npc,
  NPC_NAME_MAX_LENGTH,
  NPC_NAME_MIN_LENGTH,
  NpcObject,
  ObjectType,
  Position,
  Zone,
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
  ZoneObject,
  ZoneVisionObject,
} from "bondage-fantasy-common";
import { ReactNode, useEffect, useId, useState } from "react";
import { Translation, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

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
  npcList: Npc[];
}

function NpcEditForm(props: {
  form: UseFormReturnType<ZoneForm, (values: ZoneForm) => ZoneForm>;
  index: number;
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const [npcName, setNpcName] = useState(
    props.form.getValues().npcList[props.index].name,
  );
  props.form.watch(`npcList.${props.index}.name`, ({ value }) => {
    setNpcName(value as string);
  });

  return (
    <Paper withBorder radius="md" className="mb-4 p-md">
      <div className="flex justify-between items-center">
        <div className="font-medium">{npcName}</div>
        <ActionIcon
          variant="transparent"
          data-variant-color="danger"
          onClick={() => props.onRemove?.()}
        >
          <FontAwesomeIcon icon={faTrash} />
        </ActionIcon>
      </div>
      <div className="mt-4">
        <TextInput
          {...props.form.getInputProps(`npcList.${props.index}.name`)}
          key={props.form.key(`npcList.${props.index}.name`)}
          label={t("common.characterNameShort")}
          className="max-w-xs"
          maxLength={NPC_NAME_MAX_LENGTH}
        />
      </div>
    </Paper>
  );
}

function NpcPlaceForm(props: {
  initialNpcObject?: NpcObject;
  position: Position;
  zoneForm: ZoneForm;
  onConfirm?: (npcObject: NpcObject) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const alreadyUsedNpcIds = prepareAlreadyUsedNpcIds();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      npcId: props.initialNpcObject?.npcId?.toString(),
    },
    validate: {
      npcId: (value) =>
        Validators.notEmpty()(value) ||
        Validators.notInList(
          alreadyUsedNpcIds,
          <Translation>
            {(t) => t("zoneCreation.npcCannotBePlacedTwiceOnTheSameField")}
          </Translation>,
        )(value),
    },
  });

  function prepareAlreadyUsedNpcIds(): string[] {
    return props.zoneForm.fields[getFieldKey(props.position)].objects
      .filter((object) => object.type === ObjectType.NPC)
      .map((object) => object.npcId)
      .filter((npcId) => npcId !== props.initialNpcObject?.npcId)
      .map((npcId) => npcId.toString());
  }

  function onConfirm(): void {
    const npcId = form.getValues().npcId;
    if (npcId == null) {
      return;
    }

    const npcObject: NpcObject = {
      type: ObjectType.NPC,
      position: props.position,
      npcId: parseInt(npcId),
    };

    props.onConfirm?.(npcObject);
  }

  return (
    <div>
      <Select
        {...form.getInputProps("npcId")}
        key={form.key("npcId")}
        label={t("zoneCreation.selectNpc")}
        data={props.zoneForm.npcList.map((npc) => ({
          value: npc.id.toString(),
          label: npc.name,
        }))}
        allowDeselect={false}
        withCheckIcon={false}
        searchable
        comboboxProps={{ offset: 0, shadow: "xs" }}
        className="max-w-xs"
      />
      <div className="mt-4">
        <Button onClick={() => form.onSubmit(onConfirm)()}>
          {t("zoneCreation.placeNpc")}
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
      npcList: [],
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
  const [nextNpcId, setNextNpcId] = useState(1);
  const [placeNpcData, setPlaceNpcData] = useState<{
    npcObject?: NpcObject;
    position: Position;
  }>();
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
        npcList: zone.data.npcList,
      });
      setNextNpcId(Math.max(...zone.data.npcList.map((npc) => npc.id), 0) + 1);
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
    for (const [npcIndex, npc] of values.npcList.entries()) {
      errors[`npcList.${npcIndex}.name`] = Validators.inRange(
        NPC_NAME_MIN_LENGTH,
        NPC_NAME_MAX_LENGTH,
      )(npc.name);
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
      npcList: form.getValues().npcList,
      objects: prepareObjects(),
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
      npcList: form.getValues().npcList,
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
    if (object.type === ObjectType.NPC) {
      return {
        type: ObjectType.NPC,
        position: object.position,
        npcId: object.npcId,
        name:
          form.getValues().npcList.find((npc) => npc.id === object.npcId)
            ?.name ?? "",
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
      if (zoneId) {
        if (!editZone.isPending) {
          editZone.mutate(prepareZoneEditRequest());
        }
      } else {
        if (!createZone.isPending) {
          createZone.mutate(prepareZoneCreateRequest());
        }
      }
    })();
  }

  function addNpc(): void {
    form.setFieldValue("npcList", (npcList) => [
      ...npcList,
      { id: nextNpcId, name: "" },
    ]);
    setNextNpcId((id) => id + 1);
  }

  function removeNpc(index: number): void {
    form.setFieldValue("npcList", (npcList) => {
      const npcListCopy = [...npcList];
      npcListCopy.splice(index, 1);
      return npcListCopy;
    });
  }

  function openPlaceNpcTab(): void {
    if (!selectedField) {
      return;
    }
    setPlaceNpcData({
      npcObject: undefined,
      position: getPositionFromFieldKey(selectedField),
    });
    setActiveTab("placeNpc");
  }

  function addNpcObject(npcObject: NpcObject): void {
    if (!placeNpcData) {
      return;
    }

    form.setFieldValue(
      `fields.${getFieldKey(npcObject.position)}.objects`,
      (objects) => {
        const objectsCopy = [...objects];
        const index = placeNpcData.npcObject
          ? objectsCopy.findIndex((object) => object === placeNpcData.npcObject)
          : -1;
        if (index === -1) {
          objectsCopy.push(npcObject);
        } else {
          objectsCopy[index] = npcObject;
        }
        return objectsCopy;
      },
    );

    changeTab("map");
  }

  function changeTab(tab: string | null): void {
    setPlaceNpcData(undefined);
    setActiveTab(tab);
  }

  function getObjectActions(
    object: ZoneVisionObject,
  ): { label: ReactNode; onClick: () => void }[] {
    if (object.type === ObjectType.NPC) {
      return [
        {
          label: <Translation>{(t) => t("common.edit")}</Translation>,
          onClick: () => {
            setPlaceNpcData({
              npcObject: form
                .getValues()
                .fields[getFieldKey(object.position)].objects.filter(
                  (fieldObject) => fieldObject.type === ObjectType.NPC,
                )
                .find((fieldObject) => fieldObject.npcId === object.npcId),
              position: object.position,
            });
            setActiveTab("placeNpc");
          },
        },
        {
          label: <Translation>{(t) => t("common.remove")}</Translation>,
          onClick: () => {
            form.setFieldValue(
              `fields.${getFieldKey(object.position)}.objects`,
              (objects) =>
                objects.filter(
                  (fieldObject) =>
                    fieldObject.type !== ObjectType.NPC ||
                    fieldObject.npcId !== object.npcId,
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
        <Tabs.Tab value="npc">{t("zoneCreation.tabs.npc")}</Tabs.Tab>
        {placeNpcData && (
          <Tabs.Tab value="placeNpc">
            {t("zoneCreation.tabs.placeNpc")}
          </Tabs.Tab>
        )}
      </Tabs.List>

      <Tabs.Panel value="basic" className="p-md w-1/2">
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
                  <Textarea
                    {...form.getInputProps(
                      `fields.${selectedField}.description`,
                    )}
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
                  <Button onClick={openPlaceNpcTab}>
                    {t("zoneCreation.placeNpc")}
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
      <Tabs.Panel value="npc" className="p-md">
        {form.getValues().npcList.map((npc, index) => (
          <NpcEditForm
            key={npc.id}
            form={form}
            index={index}
            onRemove={() => removeNpc(index)}
          />
        ))}
        <div>
          <Button onClick={addNpc}>{t("zoneCreation.addNpc")}</Button>
        </div>
      </Tabs.Panel>
      {placeNpcData && (
        <Tabs.Panel value="placeNpc" className="p-md">
          <NpcPlaceForm
            initialNpcObject={placeNpcData.npcObject}
            position={placeNpcData.position}
            zoneForm={form.getValues()}
            onConfirm={addNpcObject}
            onCancel={() => changeTab("map")}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  );
}
