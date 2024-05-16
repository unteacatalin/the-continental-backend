import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGuest as deleteGuestApi } from '../../services/apiGuests';
import { toast } from 'react-hot-toast';

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate: deleteGuest } = useMutation({
    mutationFn: (id) => deleteGuestApi(id),
    onSuccess: () => {
      toast.success('Guest successfully deleted');
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { isDeleting, deleteGuest };
}
