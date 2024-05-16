import { useQuery } from '@tanstack/react-query';

import { getGuests as getGuestsApi } from '../../services/apiGuests';

export function useAllGuests() {
  // SORT
  const sortByRaw = 'fullName-asc';
  const [field, direction] = sortByRaw.split('-');
  const sortBy = { field, direction };

  // QUERY
  const {
    data: { data: guests, count } = {},
    isLoading,
    error,
  } = useQuery({
    queryFn: () => getGuestsApi({ sortBy }),
    queryKey: ['allGuests'],
  });

  return { isLoading, guests, error, count };
}
