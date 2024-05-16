import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEditRoom } from '../../services/apiRooms';
import { toast } from 'react-hot-toast';

export function useEditRoom() {
  const queryClient = useQueryClient();

  const { mutate: editRoom, isLoading: isEditing } = useMutation({
    mutationFn: ({ newRoom, id }) => createEditRoom(newRoom, id),
    onSuccess: () => {
      toast.success('Room successfully edited');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { editRoom, isEditing };
}
