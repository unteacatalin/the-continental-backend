import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { createEditRoom } from '../../services/apiRooms';

export function useCreateRoom() {
  const queryClient = useQueryClient();

  const { mutate: createRoom, isLoading: isCreating } = useMutation({
    mutationFn: (newRoom) => createEditRoom(newRoom),
    onSuccess: () => {
      toast.success('New room successfully created');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { createRoom, isCreating };
}
