import { useQuery } from '@tanstack/react-query';

import { getBookedRoomsInInterval } from '../../services/apiBookings';
import { useCreateUpdateBooking } from '../../context/CreateUpdateBookingContext';

export function useBookedRoomsInInterval() {
  const { startDate, endDate, bookingId } = useCreateUpdateBooking();
  const {
    isLoading,
    data: bookedRooms,
    error,
  } = useQuery({
    queryKey: [
      'bookedRoomsInInterval',
      new Date(startDate).toISOString(),
      new Date(endDate).toISOString(),
      bookingId,
    ],
    queryFn: () =>
      getBookedRoomsInInterval(
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString(),
        bookingId
      ),
  });

  return { isLoading, bookedRooms, error };
}
