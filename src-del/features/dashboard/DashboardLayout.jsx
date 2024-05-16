import styled from 'styled-components';

import { useRecentBookings } from './useRecentBookings';
import Spinner from '../../ui/Spinner';
import { useRecentStays } from './useRecentStays';
import Stats from './Stats';
import { useRooms } from '../cabins/useRooms';
import SalesChart from './SalesChart';
import { format } from 'date-fns';
import DurationChart from './DurationChart';
import TodayActivity from '../check-in-out/TodayActivity';

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto 34rem auto;
  gap: 2.4rem;
`;

function DashboardLayout() {
  const { isLoading: isLoadingBookings, bookings } = useRecentBookings();
  const {
    isLoading: isLoadingStays,
    confirmedStays,
    numDays,
  } = useRecentStays();
  const { rooms, isLoading: isLoadingRooms } = useRooms();

  if (isLoadingBookings || isLoadingStays || isLoadingRooms) return <Spinner />;

  const sales = bookings
    .filter((booking) => booking.isPaid)
    .map((booking) => {
      return {
        label: booking.created_at,
        totalSales: booking.totalPrice,
        extrasSales: booking.extrasPrice,
      };
    });

  return (
    <StyledDashboardLayout>
      <Stats
        bookings={bookings}
        confirmedStays={confirmedStays}
        numDays={numDays}
        roomCount={rooms.length}
      />
      <TodayActivity />
      <DurationChart confirmedStays={confirmedStays} />
      <SalesChart sales={sales} numDays={numDays} />
    </StyledDashboardLayout>
  );
}

export default DashboardLayout;
