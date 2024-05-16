import { useQuery } from '@tanstack/react-query';
// import { useQueryClient } from '@tanstack/react-query';

import { getRooms } from '../../services/apiRooms';

export function useRooms() {
  // const queryClient = useQueryClient();
  // const queryCache = queryClient.getQueryCache();
  // const user = queryCache.find({ queryKey: ['user'] })?.state?.data ?? {};
  // console.log({ user });

  const {
    isLoading,
    data: rooms,
    error,
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });

  return { isLoading, rooms, error };
}
