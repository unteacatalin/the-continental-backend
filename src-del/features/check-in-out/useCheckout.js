import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { createUpdateBooking } from '../../services/apiBookings';

export function useCheckout() {
  const queryClient = useQueryClient();

  const { mutate: checkout, isLoading: isCheckingOut } = useMutation({
    mutationFn: (bookingId) =>
      createUpdateBooking(
        {
          status: 'checked-out',
        },
        bookingId
      ),
    onSuccess: (data) => {
      toast.success(`Booking #${data.id} successfully checked out`);
      queryClient.invalidateQueries({
        active: true,
      });
    },
    onError: () => toast.error('There was an error while checking out'),
  });

  return { checkout, isCheckingOut };
}
