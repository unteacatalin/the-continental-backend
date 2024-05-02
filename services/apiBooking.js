const supabase = require('../utils/supabase');
const { supabaseUrl } = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');

const {PAGE_SIZE} = require('../utils/constants')

exports.getBookingRowCount = async function (req) {
    console.log({query: req.query});
    let features = new APIFeatures(supabase.from('bookings').select('id', {
        count: 'ecact',
        head: true
    }), req.query)
        .limitFields()
        .filter();
    
    const { count, error } = await features.query;

    return { count, error };
}

exports.getBookings = async function (req) {
    console.log({ query: req.query });
    let features = new APIFeatures(supabase.from('bookings').select('*', { count: 'exact' }), req.query, PAGE_SIZE)
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