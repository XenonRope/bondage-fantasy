import { Button, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ITEM_DESCRIPTION_MAX_LENGTH,
  ITEM_DESCRIPTION_MIN_LENGTH,
  ITEM_NAME_MAX_LENGTH,
  ITEM_NAME_MIN_LENGTH,
  ItemSaveRequest,
  ItemSlot,
} from "bondage-fantasy-common";
import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { itemApi } from "../api/item-api";
import { errorService } from "../services/error-service";
import { useAppStore } from "../store";
import { Validators } from "../utils/validators";

interface ItemForm {
  name: string;
  description: string;
  slots: ItemSlot[];
}

export function ItemEditorPage() {
  const uniqueId = useId();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<ItemForm>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
      slots: [],
    },
    validate: {
      name: Validators.inRange(ITEM_NAME_MIN_LENGTH, ITEM_NAME_MAX_LENGTH),
      description: Validators.inRange(
        ITEM_DESCRIPTION_MIN_LENGTH,
        ITEM_DESCRIPTION_MAX_LENGTH,
      ),
    },
  });
  const saveItem = useMutation({
    mutationFn: async (request: ItemSaveRequest) => {
      const sessionData = await itemApi.save(request);
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
        slots: item.data.slots,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.data]);

  function prepareItemSaveRequest(): ItemSaveRequest {
    return {
      itemId: itemId == null ? undefined : parseInt(itemId),
      name: form.getValues().name,
      description: form.getValues().description,
      slots: form.getValues().slots,
    };
  }

  function submitForm(): void {
    form.onSubmit(() => {
      if (!saveItem.isPending) {
        saveItem.mutate(prepareItemSaveRequest());
      }
    })();
  }

  if (itemId && !item.data) {
    return <></>;
  }

  return (
    <div>
      <TextInput
        {...form.getInputProps("name")}
        key={form.key("name")}
        label={t("common.name")}
        className="max-w-xs"
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

      <div className="mt-4">
        {itemId && <Button onClick={submitForm}>{t("item.modifyItem")}</Button>}
        {!itemId && (
          <Button onClick={submitForm}>{t("item.createItem")}</Button>
        )}
      </div>
    </div>
  );
}
