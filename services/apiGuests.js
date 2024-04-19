const supabase = require('../utils/supabase');
const APIFeatures = require('../utils/apiFeatures');

const { PAGE_SIZE } = require('../utils/constants');

exports.getGuestsRowCount = async function ({ filter }) {
  let queryCount = supabase.from('guests').select('id', {
    count: 'exact',
    head: true,
  });

  // FILTER
  if (filter) {
    if (filter.nationalID) {
      queryCount = queryCount.ilike('nationalID', `%${filter.nationalID}%`);
    }
    if (filter.email) {
      queryCount = queryCount.ilike('email', `%${filter.email}%`);
    }
  }

  let error = '';
  const { error: getGuestsRowCountError, count: countRows } = await queryCount;

  if (getGuestsRowCountError) {
    console.error(getGuestsRowCountError);
    error = 'Guests count could not be loaded';
  }

  return { countRows, error };
}

exports.getGuests = async function (req) {
// exports.getGuests = async function ({ filter, sortBy, page }) {
  // let query = supabase.from('guests').select('*', { count: 'exact' });

  // // FILTER
  // if (filter) {
  //   if (filter.nationalID) {
  //     query = query.ilike('nationalID', `%${filter.nationalID}%`);
  //   }
  //   if (filter.email) {
  //     query = query.ilike('email', `%${filter.email}%`);
  //   }
  // }

  // // SORT
  // if (sortBy && sortBy.field) {
  //   query = query.order(sortBy.field, {
  //     ascending: sortBy.direction === 'asc',
  //   });
  // }

  // // PAGINATION
  // if (page) {
  //   const from = (page - 1) * PAGE_SIZE;
  //   const to = page * PAGE_SIZE - 1;

  //   query = query.range(from, to);
  // }

  // let error = '';
  // const { data, error: getGuestsError, count } = await query;

  // if (getGuestsError) {
  //   console.error(getGuestsError);
  //   error = 'Guests could not be loaded';
  // }

  // return { data, count, error };
  const features = new APIFeatures(supabase.from('guests').select('*', { count: 'exact' }), req.query)
    .limitFields()
    .filter()
    .sort()
    .paginate();
  // EXECUTE QUERY
  const { data: guests, error } = await features.query;

  return { guests, error }
}

exports.createEditGuest = async function (newGuest, countryFlag, nationality, id) {
  // 1. Create/edit guest
  let query = supabase.from('guests');

  if (!id) {
    // A) CREATE
    query = query.insert([{ ...newGuest, countryFlag, nationality }]);
  } else {
    // B) EDIT
    query = query
      .update({ ...newGuest, countryFlag, nationality })
      .eq('id', id);
  }

  let error = '';
  const { data: guest, error: createEditGuestError } = await query.select();

  if (createEditGuestError) {
    console.error(createEditGuestError);
    error = 'Guest could not be created/edited';
  }

  return {guest, error};
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
