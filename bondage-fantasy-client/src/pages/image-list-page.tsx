import {
  faArrowUpFromBracket,
  faEllipsisVertical,
  faGear,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  FileButton,
  Menu,
  Modal,
  Pagination,
  SimpleGrid,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  IMAGE_MAX_SIZE,
  IMAGE_NAME_MAX_LENGTH,
  IMAGE_NAME_MIN_LENGTH,
  IMAGE_SEARCH_QUERY_MAX_LENGTH,
  IMAGE_SEARCH_QUERY_MIN_LENGTH,
  ImageSaveRequest,
  ImageSearchResponseRow,
} from "bondage-fantasy-common";
import { useEffect, useState } from "react";
import { Translation, useTranslation } from "react-i18next";
import { imageApi } from "../api/image-api";
import { CardWithImage } from "../components/card-with-image";
import { ImageWithPlaceholder } from "../components/image-with-placeholder";
import { errorService } from "../services/error-service";
import { notificationService } from "../services/notification-service";
import { useAppStore } from "../store";
import {
  DEFAULT_TOOLTIP_DELAY,
  DEFAULT_TOOLTIP_TRANSITION_DURATION,
  formatBytes,
} from "../utils/utils";
import { Validators } from "../utils/validators";

const PAGE_SIZE = 24;

interface UploadImageForm {
  name: string;
  file: File | undefined;
}

function UploadImageModal(props: {
  opened: boolean;
  image: { id?: number; name: string };
  onClose: () => void;
  onUpload: () => void;
}) {
  const { t } = useTranslation();
  const form = useForm<UploadImageForm>({
    mode: "uncontrolled",
    initialValues: {
      name: props.image.name,
      file: undefined,
    },
    validate: {
      name: Validators.inRange(IMAGE_NAME_MIN_LENGTH, IMAGE_NAME_MAX_LENGTH),
      file: Validators.notEmpty(),
    },
  });
  const saveImage = useMutation({
    mutationFn: async (params: { request: ImageSaveRequest; file: File }) => {
      await imageApi.save(params.request, params.file);
      props.onUpload();
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });
  useEffect(() => {
    if (props.opened) {
      form.setValues({
        name: props.image.name,
        file: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.opened, props.image.name]);

  function submitForm(): void {
    form.onSubmit(() => {
      if (!saveImage.isPending) {
        saveImage.mutate({
          request: {
            imageId: props.image.id,
            name: form.getValues().name,
          },
          file: form.getValues().file!,
        });
      }
    })();
  }

  function validateImage(image: File): boolean {
    if (image.size > IMAGE_MAX_SIZE) {
      notificationService.error(null, t("common.fileTooLarge"));
      return false;
    }
    return true;
  }

  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title={t("common.uploadImage")}
    >
      <TextInput
        {...form.getInputProps("name")}
        key={form.key("name")}
        label={t("common.name")}
        className="mt-2 max-w-xs"
        maxLength={IMAGE_NAME_MAX_LENGTH}
      />
      <div className="mt-4">
        <div className="flex gap-2">
          <FileButton
            {...form.getInputProps("file")}
            onChange={(file) => {
              if (file && validateImage(file)) {
                form.setFieldValue("file", file);
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
          {form.getValues().file && (
            <Button
              onClick={() => form.setFieldValue("file", undefined)}
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
              t("common.fileMaxSize", {
                maxSize: formatBytes(IMAGE_MAX_SIZE),
              })
            }
          </Translation>
        </div>
        <div className="mt-1 h-32 w-32">
          <ImageWithPlaceholder image={form.getValues().file} />
        </div>
      </div>
      <div className="mt-4">
        <Button onClick={submitForm} disabled={!form.getValues().file}>
          {t("common.uploadImage")}
        </Button>
      </div>
    </Modal>
  );
}

export function ImageListPage() {
  const { t } = useTranslation();
  const characterId = useAppStore((state) => state.character?.id);
  const [filter, setFilter] = useState({
    query: "",
    page: 1,
  });
  const [modalData, setModalData] = useState<{
    opened: boolean;
    image?: ImageSearchResponseRow;
  }>({
    opened: false,
  });

  const searchResult = useQuery({
    queryKey: ["images", filter, characterId],
    queryFn: () =>
      imageApi.search({
        query: filter.query,
        offset: (filter.page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    enabled: () => filter.query.length >= IMAGE_SEARCH_QUERY_MIN_LENGTH,
    placeholderData: keepPreviousData,
  });
  const deleteImage = useMutation({
    mutationFn: async (id: number) => {
      await imageApi.delete(id);
      if (searchResult.data?.images.length === 1) {
        setFilter((filter) => ({
          ...filter,
          page: Math.max(filter.page - 1, 1),
        }));
      } else {
        searchResult.refetch();
      }
    },
    onError: (error) => errorService.handleUnexpectedError(error),
  });

  return (
    <div>
      <div>
        <div className="flex items-end">
          <TextInput
            label={t("common.search")}
            className="w-80"
            maxLength={IMAGE_SEARCH_QUERY_MAX_LENGTH}
            onChange={(event) =>
              setFilter({ query: event.currentTarget.value, page: 1 })
            }
          />
          <Button
            className="shrink-0 ml-4"
            onClick={() => setModalData({ opened: true })}
          >
            {t("common.uploadImage")}
          </Button>
        </div>
      </div>
      <div className="mt-8">
        <SimpleGrid cols={3}>
          {searchResult.data?.images.map((image) => (
            <CardWithImage key={image.id} image={image.imageKey}>
              <div className="flex justify-between items-start min-w-0">
                <div className="truncate font-medium">{image.name}</div>
                <div className="flex items-center gap-2">
                  <Tooltip
                    label={t("common.edit")}
                    openDelay={DEFAULT_TOOLTIP_DELAY}
                    transitionProps={{
                      duration: DEFAULT_TOOLTIP_TRANSITION_DURATION,
                    }}
                  >
                    <ActionIcon
                      variant="transparent"
                      size="sm"
                      onClick={() => setModalData({ opened: true, image })}
                    >
                      <FontAwesomeIcon icon={faGear} />
                    </ActionIcon>
                  </Tooltip>
                  <Menu position="bottom-end" withArrow>
                    <Menu.Target>
                      <ActionIcon variant="transparent" size="sm">
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        onClick={() =>
                          !deleteImage.isPending && deleteImage.mutate(image.id)
                        }
                      >
                        {t("common.remove")}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
              </div>
            </CardWithImage>
          ))}
        </SimpleGrid>
      </div>
      <div className="flex flex-col items-center mt-8">
        {searchResult.data && (
          <Pagination
            value={filter.page}
            onChange={(page) => setFilter((filter) => ({ ...filter, page }))}
            total={Math.ceil(searchResult.data.total / PAGE_SIZE)}
          />
        )}
      </div>

      <UploadImageModal
        opened={modalData.opened}
        image={{ id: modalData.image?.id, name: modalData.image?.name ?? "" }}
        onClose={() => setModalData({ opened: false })}
        onUpload={() => {
          setModalData({ opened: false });
          searchResult.refetch();
        }}
      />
    </div>
  );
}
