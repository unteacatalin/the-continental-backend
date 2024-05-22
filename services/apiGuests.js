const supabase = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');
const { PAGE_SIZE } = require('../utils/constants');

exports.getGuests = async function (req) {
  console.log({query: req.query});
  const features = new APIFeatures(supabase.from('guests').select('*', { count: 'exact' }), req.query, PAGE_SIZE)
    .limitFields()
    .filter()
    .sort()
    .paginate();
  // EXECUTE QUERY
  const { data: guests, count, error } = await features.query;

  const maxPage = Math.round(count / PAGE_SIZE * 1);
  const fromPageCheck = count === 0 ? 0 : features.from > count ? (maxPage - 1) * PAGE_SIZE < count ? (maxPage - 1) * PAGE_SIZE : count : features.from;
  const toPageCheck = count === 0 ? 0 : features.to > count ? count : features.to;

  return { guests, count, pageSize: PAGE_SIZE, from: fromPageCheck, to: toPageCheck, error }
}

exports.getGuestsRowCount = async function (req) {
  console.log({query: req.query});  
  let features = new APIFeatures(supabase.from('guests').select('id', {
    count: 'exact',
    head: true,
  }), req.query)
    .limitFields()
    .filter();

  const { count, error } = await features.query;

  return { count, pageSize: PAGE_SIZE, error };
}

exports.createEditGuest = async function ({newGuest, id}) {
  // 1. Create/edit guest
  let query = supabase.from('guests');

  if (!id) {
    // A) CREATE
    query = query.insert([newGuest]);
  } else {
    // B) EDIT
    query = query
      .update(newGuest)
      .eq('id', id);
  }

  let error = '';
  const { data: guest, error: createEditGuestError } = await query.select();

  if (createEditGuestError) {
    console.error(createEditGuestError);
    error = 'Guest could not be created/edited';
  }

  return {data: {guest: Array.isArray(guest) ? guest[0] : guest}, error};
}

exports.deleteGuest = async function (id) {
  let error = '';
  const { error: deleteGuestError } = await supabase.from('guests').delete().eq('id', id);

  if (deleteGuestError) {
    console.error(deleteGuestError);
    error = 'Guest data could not be deleted';
  }

  return { error };
}

exports.deleteAllGuests = async function () {
  const { error } = await supabase.from('guests').delete().gt('id', 0);
  if (error) console.log(error.message);
  return { error }
}

exports.initGuests = async function (inGuests) {
  let error = '';

  const { data: guests, error: errorInitGuests } = await supabase
    .from('guests')
    .insert(inGuests)
    .select();

  if (errorInitGuests) {
    console.error(errorInitGuests);
    error = 'Guests could not be uploaded';
  }

  return {data: guests, error};
}