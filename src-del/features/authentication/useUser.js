import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getCurrentUser } from '../../services/apiAuth';
import { useLogout } from '../../features/authentication/useLogout';

export function useUser() {
  const queryClient = useQueryClient();
  const { logout } = useLogout();

  // const queryCache = new QueryCache();
  // const existingUserData = queryCache.find({ queryKey: ['user'] });

  const queryCache = queryClient.getQueryCache();
  const existingUserData =
    queryCache.find({ queryKey: ['user'] })?.state?.data ?? {};

  const { isLoading, data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => getCurrentUser(existingUserData, logout),
  });

  return { user, isLoading, isAuthenticated: user?.role === 'authenticated' };
}
