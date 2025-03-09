import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { IMAGE_SEARCH_QUERY_MIN_LENGTH } from "bondage-fantasy-common";
import { imageApi } from "../api/image-api";
import { useAppStore } from "../store";

export const useImagesQuery = (
  filter: {
    query: string;
    page: number;
    pageSize: number;
    includeImagesIds?: number[];
  },
  params?: { keepPreviousData?: boolean },
) => {
  const characterId = useAppStore((state) => state.character?.id);
  return useQuery({
    queryKey: ["images", filter, characterId],
    queryFn: () =>
      imageApi.search({
        query: filter.query,
        offset: (filter.page - 1) * filter.pageSize,
        limit: filter.pageSize,
        includeImagesIds: filter.includeImagesIds,
      }),
    enabled: () => filter.query.length >= IMAGE_SEARCH_QUERY_MIN_LENGTH,
    placeholderData: params?.keepPreviousData ? keepPreviousData : undefined,
  });
};
