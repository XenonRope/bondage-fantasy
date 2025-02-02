import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { itemApi } from "../api/item-api";
import { ITEM_SEARCH_QUERY_MIN_LENGTH } from "bondage-fantasy-common";
import { useId } from "react";

export const useItemsQuery = (
  filter: {
    query: string;
    page: number;
    pageSize: number;
    includeItemsIds?: number[];
  },
  params?: { keepPreviousData?: boolean },
) => {
  const uniqueId = useId();
  return useQuery({
    queryKey: ["items", filter, uniqueId],
    queryFn: () =>
      itemApi.search({
        query: filter.query,
        offset: (filter.page - 1) * filter.pageSize,
        limit: filter.pageSize,
        includeItemsIds: filter.includeItemsIds,
      }),
    enabled: () => filter.query.length >= ITEM_SEARCH_QUERY_MIN_LENGTH,
    placeholderData: params?.keepPreviousData ? keepPreviousData : undefined,
  });
};
