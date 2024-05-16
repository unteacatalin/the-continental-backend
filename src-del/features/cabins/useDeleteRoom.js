import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRoom as deleteRoomApi } from '../../services/apiRooms';
import { toast } from 'react-hot-toast';

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate: deleteRoom } = useMutation({
    mutationFn: (id) => deleteRoomApi(id),
    onSuccess: () => {
      toast.success('Room successfully deleted');
      queryClient.invalidateQueries({
        queryKey: ['rooms'],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteRoom };
}
