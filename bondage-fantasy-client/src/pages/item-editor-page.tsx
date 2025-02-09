import {
  faArrowUpFromBracket,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  FileButton,
  MultiSelect,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ITEM_DESCRIPTION_MAX_LENGTH,
  ITEM_DESCRIPTION_MIN_LENGTH,
  ITEM_IMAGE_MAX_SIZE,
  ITEM_NAME_MAX_LENGTH,
  ITEM_NAME_MIN_LENGTH,
  ItemSaveRequest,
  ItemSlot,
  ItemType,
} from "bondage-fantasy-common";
import { useEffect, useId } from "react";
import { Translation, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { itemApi } from "../api/item-api";
import { ImageWithPlaceholder } from "../components/image-with-placeholder";
import { errorService } from "../services/error-service";
import { notificationService } from "../services/notification-service";
import { useAppStore } from "../store";
import { formatBytes } from "../utils/utils";
import { Validators } from "../utils/validators";

interface ItemForm {
  name: string;
  description: string;
  type: ItemType;
  image?: File | string;
  slots: ItemSlot[];
}

export function ItemEditorPage() {
  const uniqueId = useId();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<ItemForm>({
    mode: "uncontrolled",
    initialValues: {
      type: ItemType.STORABLE,
      name: "",
      description: "",
      slots: [],
      image: undefined,
    },
    validate: {
      name: Validators.inRange(ITEM_NAME_MIN_LENGTH, ITEM_NAME_MAX_LENGTH),
      description: Validators.inRange(
        ITEM_DESCRIPTION_MIN_LENGTH,
        ITEM_DESCRIPTION_MAX_LENGTH,
      ),
      slots: (value, values) => {
        if (values.type === ItemType.WEARABLE && value.length === 0) {
          return (
            <Translation>{(t) => t("common.fieldCannotBeEmpty")}</Translation>
          );
        }
        return null;
      },
    },
  });
  const saveItem = useMutation({
    mutationFn: async (params: { json: ItemSaveRequest; image?: File }) => {
      const sessionData = await itemApi.save(params.json, params.image);
      useAppStore.getState().updateSessionData(sessionData);
    },
    onSuccess: () => navigate("/items"),
    onError: (error) => errorService.handleUnexpectedError(error),
  });
  const { itemId } = useParams();
  const item = useQuery({
    queryKey: ["item", itemId, uniqueId],
    queryFn: async () =>
      itemId ? await itemApi.getById(parseInt(itemId)) : null,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  useEffect(() => {
    if (item.data) {
      form.setValues({
        name: item.data.name,
        description: item.data.description,
        type: item.data.type,
        image: item.data.imageKey,
        ...(item.data.type === ItemType.WEARABLE
          ? { slots: item.data.slots }
          : {}),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.data]);

  function prepareItemSaveRequest(): ItemSaveRequest {
    const itemIdAsNumber = itemId == null ? undefined : parseInt(itemId);
    const name = form.getValues().name;
    const description = form.getValues().description;
    const type = form.getValues().type;
    const image = form.getValues().image;
    const imageKey = typeof image === "string" ? image : undefined;

    return type === ItemType.WEARABLE
      ? {
          itemId: itemIdAsNumber,
          name,
          description,
          type,
          imageKey,
          slots: form.getValues().slots,
        }
      : {
          itemId: itemIdAsNumber,
          name,
          description,
          type,
          imageKey,
        };
  }

  function submitForm(): void {
    form.onSubmit(() => {
      if (!saveItem.isPending) {
        const image = form.getValues().image;
        saveItem.mutate({
          json: prepareItemSaveRequest(),
          image: image instanceof File ? image : undefined,
        });
      }
    })();
  }

  function validateImage(image: File): boolean {
    if (image.size > ITEM_IMAGE_MAX_SIZE) {
      notificationService.error(null, t("common.fileTooLarge"));
      return false;
    }
    return true;
  }

  if (itemId && !item.data) {
    return <></>;
  }

  return (
    <div>
      <Select
        {...form.getInputProps("type")}
        key={`${form.key("type")}-${i18n.language}`}
        label={t("item.type")}
        data={Object.values(ItemType).map((type) => ({
          value: type,
          label: t(`item.types.${type}`),
        }))}
        className="max-w-xs"
        allowDeselect={false}
        disabled={itemId != null}
      />
      <TextInput
        {...form.getInputProps("name")}
        key={form.key("name")}
        label={t("common.name")}
        className="mt-2 max-w-xs"
        maxLength={ITEM_NAME_MAX_LENGTH}
      />
      <Textarea
        {...form.getInputProps("description")}
        key={form.key("description")}
        label={t("common.description")}
        autosize
        minRows={2}
        maxRows={10}
        className="mt-2 max-w-lg"
        maxLength={ITEM_DESCRIPTION_MAX_LENGTH}
      />
      {form.getValues().type === ItemType.WEARABLE && (
        <MultiSelect
          {...form.getInputProps("slots")}
          key={`${form.key("slots")}-${i18n.language}`}
          label={t("item.occupiedBodyParts")}
          data={Object.values(ItemSlot).map((slot) => ({
            value: slot,
            label: t(`item.slots.${slot}`),
          }))}
          className="mt-2 max-w-lg"
        />
      )}
      <div className="mt-4">
        <div className="flex gap-2">
          <FileButton
            {...form.getInputProps("image")}
            onChange={(file) => {
              if (file && validateImage(file)) {
                form.setFieldValue("image", file);
              }
            }}
            accept="image/jpeg,image/png"
          >
            {(props) => (
              <Button
                {...props}
                variant="light"
                leftSection={<FontAwesomeIcon icon={faArrowUpFromBracket} />}
              >
                {t("common.uploadImage")}
              </Button>
            )}
          </FileButton>
          {form.getValues().image && (
            <Button
              onClick={() => form.setFieldValue("image", undefined)}
              variant="light"
              color="red"
              leftSection={<FontAwesomeIcon icon={faXmark} />}
            >
              {t("common.removeImage")}
            </Button>
          )}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          <Translation>
            {(t) =>
              t("common.recommendedImageData", {
                width: 128,
                height: 128,
                maxSize: formatBytes(ITEM_IMAGE_MAX_SIZE),
              })
            }
          </Translation>
        </div>
        <div className="mt-1 h-32 w-32">
          <ImageWithPlaceholder image={form.getValues().image} />
        </div>
      </div>

      <div className="mt-4">
        {itemId && <Button onClick={submitForm}>{t("item.modifyItem")}</Button>}
        {!itemId && (
          <Button onClick={submitForm}>{t("item.createItem")}</Button>
        )}
      </div>
    </div>
  );
}
