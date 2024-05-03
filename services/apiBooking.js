const supabase = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');

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
  