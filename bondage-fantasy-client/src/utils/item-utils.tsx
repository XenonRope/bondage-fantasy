import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ITEM_SEARCH_QUERY_MIN_LENGTH, ItemType } from "bondage-fantasy-common";
import { itemApi } from "../api/item-api";

export const useItemsQuery = (
  filter: {
    query: string;
    page: number;
    pageSize: number;
    includeItemsIds?: number[];
    types?: ItemType[];
  },
  params?: { keepPreviousData?: boolean },
) => {
  return useQuery({
    queryKey: ["items", filter],
    queryFn: () =>
      itemApi.search({
        query: filter.query,
        offset: (filter.page - 1) * filter.pageSize,
        limit: filter.pageSize,
        includeItemsIds: filter.includeItemsIds,
        types: filter.types,
      }),
    enabled: () => filter.query.length >= ITEM_SEARCH_QUERY_MIN_LENGTH,
    placeholderData: params?.keepPreviousData ? keepPreviousData : undefined,
  });
};
