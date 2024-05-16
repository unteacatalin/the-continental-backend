import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createUpdateBooking } from '../../services/apiBookings';
import { toast } from 'react-hot-toast';

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  const { mutate: updateBooking, isLoading: isUpdating } = useMutation({
    mutationFn: ({ newBooking, id }) => createUpdateBooking(newBooking, id),
    onSuccess: () => {
      toast.success('Booking successfully edited');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { updateBooking, isUpdating };
}
