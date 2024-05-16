import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteBooking as deleteBookingApi } from '../../services/apiBookings';
import { toast } from 'react-hot-toast';
import { useParams, useSearchParams } from 'react-router-dom';

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  // const [searchParams] = useSearchParams();
  const { bookingId } = useParams();

  // FILTER
  // const filterValue = searchParams.get('status');
  // const filter =
  //   !filterValue || filterValue === 'all'
  //     ? null
  //     : { field: 'status', value: filterValue, method: 'eq' };

  // SORT
  // const sortByRaw = searchParams.get('sortBy') || 'startDate-desc';
  // const [field, direction] = sortByRaw.split('-');
  // const sortBy = { field, direction };

  // PAGINATION
  // const page = !searchParams.get('page') ? 1 : Number(searchParams.get('page'));

  // let queryKeys = [];
  // if (filter && sortBy && page) queryKeys = ['bookings'];
  // if (bookingId)
  //   queryKeys = [
  //     'booking',
  //     bookingId,
  //     // 'bookings',
  //     // { field: 'status', value: undefined, method: 'eq' },
  //     // undefined,
  //     // undefined,
  //   ];

  const { isLoading: isDeletingBooking, mutate: deleteBooking } = useMutation({
    mutationFn: (id) => deleteBookingApi(id),
    onSuccess: () => {
      toast.success('Booking successfully deleted');
      if (bookingId) {
        queryClient.invalidateQueries({
          queryKey: ['booking', bookingId],
          refetchType: 'none',
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['bookings'],
      });
      queryClient.invalidateQueries({
        queryKey: ['bookingsCount'],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeletingBooking, deleteBooking };
}
