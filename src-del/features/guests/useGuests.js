import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { getGuests, getGuests as getGuestsApi } from '../../services/apiGuests';
import { PAGE_SIZE } from '../../utils/constants';

export function useGuests() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // FILTER
  const filterEmail = searchParams.get('email');
  const filterNationalID = searchParams.get('nationalid');
  let filter = {};
  if (filterEmail) {
    filter = { ...filter, email: filterEmail };
  }
  if (filterNationalID) {
    filter = { ...filter, nationalID: filterNationalID };
  }

  // SORT
  const sortByRaw = searchParams.get('sortBy') || 'fullName-asc';
  const [field, direction] = sortByRaw.split('-');
  const sortBy = { field, direction };

  // PAGINATION
  const page = !searchParams.get('page') ? 1 : Number(searchParams.get('page'));

  // QUERY
  const {
    data: { data: guests, count } = {},
    isLoading,
    error,
  } = useQuery({
    queryFn: () => getGuestsApi({ filter, sortBy, page }),
    queryKey: ['guests', filter, sortBy, page],
  });

  // PRE-FETCHING
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryKey: ['guests', filter, sortBy, page + 1],
      queryFn: () =>
        getGuests({
          filter,
          sortBy,
          page: page + 1,
        }),
    });
  }

  if (page > 1) {
    queryClient.prefetchQuery({
      queryKey: ['guests', filter, sortBy, page - 1],
      queryFn: () =>
        getGuests({
          filter,
          sortBy,
          page: page - 1,
        }),
    });
  }

  return { isLoading, guests, error, count };
}
