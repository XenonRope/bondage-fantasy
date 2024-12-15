import { npcApi } from "../api/npc-api";
import { errorService } from "../services/error-service";
import { Validators } from "../utils/validators";
import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import {
  NPC_NAME_MAX_LENGTH,
  NPC_NAME_MIN_LENGTH,
  NpcCreateRequest,
} from "bondage-fantasy-common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export function NpcCreationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
    },
    validate: {
      name: Validators.inRange(NPC_NAME_MIN_LENGTH, NPC_NAME_MAX_LENGTH),
    },
  });
  const createNpc = useMutation({
    mutationFn: (request: NpcCreateRequest) => npcApi.create(request),
    onSuccess: () => navigate("/npc"),
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (!createNpc.isPending) {
          createNpc.mutate(values as NpcCreateRequest);
        }
      })}
      className="max-w-xs"
    >
      <TextInput
        {...form.getInputProps("name")}
        key={form.key("name")}
        label={t("common.characterNameShort")}
      />
      <Button type="submit" className="mt-4">
        {t("npcCreation.createNpc")}
      </Button>
    </form>
  );
}
