import {
  HiOutlineBanknotes,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
} from 'react-icons/hi2';

import Stat from './Stat';
import { formatCurrency } from '../../utils/helpers';

function Stats({ bookings, confirmedStays, numDays, roomCount }) {
  // 1.
  const numBookings = bookings.length;

  // 2.
  const sales = bookings
    .filter((booking) => booking.isPaid)
    .reduce((acc, cur) => acc + Number(cur.totalPrice), 0);

  // 3.
  const numCheckins = confirmedStays.length;

  // 4.
  // const occupation = num checked-in nights / all available nights
  const occupation =
    Math.round(
      (Number(confirmedStays.reduce((acc, cur) => acc + cur.numNights, 0)) /
        (numDays * roomCount)) *
        10000
    ) / 100;

  return (
    <>
      <Stat
        icon={<HiOutlineBriefcase />}
        title='Bookings'
        value={numBookings}
        color='blue'
      />
      <Stat
        icon={<HiOutlineBanknotes />}
        title='Sales'
        value={formatCurrency(sales)}
        color='green'
      />
      <Stat
        icon={<HiOutlineCalendarDays />}
        title='Check-ins'
        value={numCheckins}
        color='indigo'
      />
      <Stat
        icon={<HiOutlineChartBar />}
        title='Occupancy rate'
        value={occupation + '%'}
        color='yellow'
      />
    </>
  );
}

export default Stats;
