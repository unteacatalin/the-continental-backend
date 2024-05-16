import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { createUpdateBooking } from '../../services/apiBookings';
import { toast } from 'react-hot-toast';

export function useCheckin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: checkin, isLoading: isCheckingin } = useMutation({
    mutationFn: ({ bookingId, breakfast }) =>
      createUpdateBooking(
        {
          status: 'checked-in',
          isPaid: true,
          ...breakfast,
        },
        bookingId
      ),
    onSuccess: (data) => {
      toast.success(`Booking #${data.id} successfully checked in`);
      queryClient.invalidateQueries({ active: true });
      navigate('/');
    },
    OnError: () => toast.error('There was an error while cheching in'),
  });

  return { checkin, isCheckingin };
}
