import { getToday } from '../utils/helpers';
import supabase from './supabase';
import { PAGE_SIZE } from '../utils/constants';

export async function getBookingsRowCount({ filter }) {
  let queryCount = supabase.from('bookings').select('id', {
    count: 'exact',
    head: true,
  });

  if (filter) {
    queryCount = queryCount[filter.method || 'eq'](filter.field, filter.value);
  }

  const { error, count: countRows } = await queryCount;

  if (error) {
    console.error(error);
    throw new Error('Bookings count could not be loaded');
  }

  return { countRows };
}

export async function getBookings({ filter, sortBy, page }) {
  let query = supabase
    .from('bookings')
    .select('*, rooms(name, id), guests(fullName, email, nationalID, id)', {
      count: 'exact',
    });

  // FILTER
  if (filter) {
    query = query[filter.method || 'eq'](filter.field, filter.value);
  }

  // SORT
  if (sortBy && sortBy.field) {
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === 'asc',
    });
  }

  // PAGINATION
  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = page * PAGE_SIZE - 1;

    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error('Bookings could not be loaded');
  }

  return { data, count };
}

export async function getBooking(id) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, rooms(*), guests(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    throw new Error('Booking not found');
  }

  return data;
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
// date: ISOString
export async function getBookingsAfterDate(date) {
  const { data, error } = await supabase
    .from('bookings')
    .select('created_at, totalPrice, extrasPrice, isPaid')
    .gte('created_at', date)
    .lte('created_at', getToday({ end: true }));

  if (error) {
    console.error(error);
    throw new Error('Bookings could not get loaded');
  }

  return data;
}

// Returns all STAYS that are were created after the given date
export async function getStaysAfterDate(date) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, guests(fullName)')
    .gte('startDate', date)
    .lte('startDate', getToday());

  if (error) {
    console.error(error);
    throw new Error('Bookings could not get loaded');
  }

  return data;
}

// Activity means that there is a check in or a check out today
export async function getStaysTodayActivity() {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, numNights, status, guests(fullName, nationality, countryFlag)')
    .or(
      `and(status.eq.unconfirmed,startDate.eq.${getToday()}),and(status.eq.checked-in,endDate.eq.${getToday()})`
    )
    .order('created_at');

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))

  if (error) {
    console.error(error);
    throw new Error('Bookings could not get loaded');
  }
  return data;
}

// Available rooms between start date and end date
export async function getBookedRoomsInInterval(startDate, endDate, bookingId) {
  let query = supabase.from('bookings').select('roomId');
  if (bookingId) {
    query = query.or(
      `and(startDate.lte.${startDate},endDate.gte.${startDate},id.neq.${bookingId}),and(startDate.lte.${endDate},endDate.gte.${endDate},id.neq.${bookingId})`
    );
  } else {
    query = query.or(
      `and(startDate.lte.${startDate},endDate.gte.${startDate}),and(startDate.lte.${endDate},endDate.gte.${endDate})`
    );
  }
  const { data, error } = await query;

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.statDate >= startDate && stay.startDate <= startDate) ||
  // (stay.endDate >= endDate && stay.endDate <= endDate)

  if (error) {
    console.error(error);
    throw new Error('Bookings could not get loaded');
  }

  return data;
}

export async function createUpdateBooking(obj, id) {
  // 1. Create/update guest
  let query = supabase.from('bookings');

  console.log({ obj });

  const {
    created_at,
    startDate,
    endDate,
    numNights,
    numGuests,
    roomPrice,
    extrasPrice,
    totalPrice,
    status,
    hasBreakfast,
    isPaid,
    observations,
    roomId,
    guestId,
    // rooms: { id: roomId },
    // guests: { id: guestId },
  } = obj;
  const newBooking = {
    created_at: new Date(created_at).toISOString(),
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    numNights,
    numGuests,
    roomPrice,
    extrasPrice,
    totalPrice,
    status,
    hasBreakfast,
    isPaid,
    observations,
    roomId,
    guestId,
  };

  if (!id) {
    // A) CREATE
    query = query.insert([newBooking]);
  } else {
    // B) EDIT
    query = query.update(newBooking).eq('id', id);
  }

  const { data, error } = await query.select().single();

  if (error) {
    console.error(error);
    throw new Error('Booking could not be updated');
  }
  return data;
}

export async function deleteBooking(id) {
  // REMEMBER RLS POLICIES
  const { data, error } = await supabase.from('bookings').delete().eq('id', id);

  if (error) {
    console.error(error);
    throw new Error('Booking could not be deleted');
  }
  return data;
}
