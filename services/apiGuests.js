const supabase = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');

exports.getGuests = async function (req) {
  console.log({query: req.query});
  const features = new APIFeatures(supabase.from('guests').select('*', { count: 'exact' }), req.query)
    .limitFields()
    .filter()
    .sort()
    .paginate();
  // EXECUTE QUERY
  const { data: guests, error } = await features.query;

  return { guests, error }
}

exports.getGuestsRowCount = async function (req) {
  console.log({query: req.query});  
  let features = new APIFeatures(supabase.from('guests').select('id', {
    count: 'exact',
    head: true,
  }), req.query)
    .filter();

  const { error, count: countRows } = await features.query;

  return { countRows, error };
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

  return {error};
}
