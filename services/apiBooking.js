const { isFuture, isPast, isToday } = require('date-fns');

const supabase = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');
const { getToday, subtractDates } = require('../utils/helpers');

const {PAGE_SIZE} = require('../utils/constants');

exports.getBookings = async function (req) {
    console.log({ query: req.query });
    let features = new APIFeatures(supabase.from('bookings').select('*, rooms(name, id), guests(fullName, email, nationalID, id)', { count: 'exact' }), req.query, PAGE_SIZE, '*, rooms(name, id), guests(fullName, email, nationalID, id)')
        .limitFields()
        .filter()
        .sort()
        .paginate();

    const { data: bookings, count, error } = await features.query;

    const maxPage = Math.round(count / PAGE_SIZE * 1);
    const fromPageCheck = count === 0 ? 0 : features.from > count ? (maxPage - 1) * PAGE_SIZE < count ? (maxPage - 1) * PAGE_SIZE : count : features.from;
    const toPageCheck = count === 0 ? 0 : features.to > count ? count : features.to;
  
    return { bookings, count, pageSize: PAGE_SIZE, from: fromPageCheck, to: toPageCheck, error }
}

exports.getBooking = async function (req) {
  const id = req.params.id;

  let features = new APIFeatures(supabase
        .from('bookings')
        .select('*, rooms(*), guests(*)')
        .eq('id', id)
        .single(), req.query, PAGE_SIZE, '*, rooms(*), guests(*)')
        .limitFields()
        .filter()
        .sort()
        .paginate();

  const { data: booking, error: selectError } = await features.query;
  
  let error = '';
  
  if (selectError) {
      console.error(selectError);
      error = 'Booking not found!';
  }
      
  return { booking, error }
}

exports.createEditBooking = async function ({newBooking, id}) {
  // 1. Create/edit guest
  let query = supabase.from('bookings');

  if (!id) {
    // A) CREATE
    query = query.insert([newBooking]);
  } else {
    // B) EDIT
    query = query
      .update(newBooking)
      .eq('id', id);
  }

  let error = '';
  const { data: booking, error: createEditBookingError } = await query.select();

  if (createEditBookingError) {
    console.error(createEditBookingError);
    error = 'Booking could not be created/edited';
  }

  return {data: {booking: Array.isArray(booking) ? booking[0] : booking}, error};
}

exports.deleteBooking = async function (id) {
  let error = '';
  const { error: deleteBookingError } = await supabase.from('bookings').delete().eq('id', id);

  if (deleteBookingError) {
    console.error(deleteBookingError);
    error = 'Booking data could not be deleted';
  }

  return { error };
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
// date: ISOString
exports.getBookingsAfterDate = async function (date) {
  const { data: bookings, error: errorGettingBookings } = await supabase
    .from('bookings')
    .select('created_at, totalPrice, extrasPrice, isPaid')
    .gte('created_at', date)
    .lte('created_at', getToday({ end: true }));

  let error = '';

  if (errorGettingBookings) {
    console.error(errorGettingBookings);
    error = 'Bookings could not get loaded';
  }

  return { bookings, error };
}

// Returns all STAYS that are were created after the given date
exports.getStaysAfterDate = async function (date) {
  const { data: bookings, error: errorGettingBookings } = await supabase
    .from('bookings')
    .select('*, guests(fullName)')
    .gte('startDate', date)
    .lte('startDate', getToday());

  let error = '';

  if (errorGettingBookings) {
    console.error(errorGettingBookings);
    error = 'Bookings could not get loaded';
  }

  return { bookings, error };
}

// Available rooms between start date and end date
exports.getBookedRoomsInInterval = async function (startDate, endDate, bookingId) {
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
  const { data: rooms, error: errorBookedRoomsInInterval } = await query;

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.statDate >= startDate && stay.startDate <= startDate) ||
  // (stay.endDate >= endDate && stay.endDate <= endDate)

  let error = '';

  if (errorBookedRoomsInInterval) {
    console.error(errorBookedRoomsInInterval);
    error = 'Bookings could not get loaded';
  }

  return { rooms, error };
}

// Activity means that there is a check in or a check out today
exports.getStaysTodayActivity = async function () {
  const todayCheckin = getToday({checkin: true});
  const todayCheckout = getToday({checkout: true});

  const { data: stays, error: errorGettingTodayStays } = await supabase
    .from('bookings')
    .select('id, numNights, status, guests(fullName, nationality, countryFlag)')
    .or(
      `and(status.eq.unconfirmed,startDate.eq.${todayCheckin}),and(status.eq.checked-in,endDate.eq.${todayCheckout})`
    )
    .order('created_at');

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))

  let error = '';

  if (errorGettingTodayStays) {
    console.error(errorGettingTodayStays);
    error = "Today's activity could not be filtered";
  }

  console.log({ getStaysTodayActivityAPI: stays, todayCheckin, todayCheckout });

  return { stays, error };
}

exports.deleteBooking = async function (id) {
  let error = '';
  // REMEMBER RLS POLICIES
  const { error: errorDeletingBooking } = await supabase.from('bookings').delete().eq('id', id);

  if (errorDeletingBooking) {
    console.error(errorDeletingBooking);
    error = 'Booking could not be deleted';
  }

  return { error};
}

exports.deleteAllBookings = async function () {
  const { error } = await supabase.from('bookings').delete().gt('id', 0);
  if (error) console.log(error.message);
  return { error }
}

exports.initBookings = async function (inBookings, inRooms) {
  let error = '';

  // Bookings need a guestId and a roomId. We can't tell Supabase IDs for each object, it will calculate them on its own. So it might be different for different people, especially after multiple uploads. Therefore, we need to first get all guestIds and roomIds, and then replace the original IDs in the booking data with the actual ones from the DB
  const { data: guestsIds } = await supabase
    .from('guests')
    .select('id')
    .order('id');
  const allGuestIds = guestsIds.map((room) => room.id);
  const { data: roomsIds } = await supabase
    .from('rooms')
    .select('id')
    .order('id');
  const allRoomIds = roomsIds.map((room) => room.id);

  const finalBookings = inBookings.map((booking) => {
    // Here relying on the order of rooms, as they don't have and ID yet
    const room = inRooms.at(booking.roomId - 1);
    const numNights = subtractDates(booking.endDate, booking.startDate);
    const roomPrice = numNights * (room.regularPrice - room.discount);
    const extrasPrice = booking.hasBreakfast
      ? numNights * 25 * booking.numGuests
      : 0; // hardcoded breakfast price
    const totalPrice = roomPrice + extrasPrice;

    let status;
    if (
      isPast(new Date(booking.endDate)) &&
      !isToday(new Date(booking.endDate))
    )
      status = 'checked-out';
    if (
      isFuture(new Date(booking.startDate)) ||
      isToday(new Date(booking.startDate))
    )
      status = 'unconfirmed';
    if (
      (isFuture(new Date(booking.endDate)) ||
        isToday(new Date(booking.endDate))) &&
      isPast(new Date(booking.startDate)) &&
      !isToday(new Date(booking.startDate))
    )
      status = 'checked-in';

    return {
      ...booking,
      numNights,
      roomPrice,
      extrasPrice,
      totalPrice,
      guestId: allGuestIds.at(booking.guestId - 1),
      roomId: allRoomIds.at(booking.roomId - 1),
      status,
    };
  });

  console.log(finalBookings);

  const { data: bookings, error: errorInitBookings } = await supabase
    .from('bookings')
    .insert(finalBookings)
    .select();

  if (errorInitBookings) {
    console.log(errorInitBookings);
    error = 'Bookings could not be uploaded';
  }

  return {data: bookings, error};
}
