const { parseISO, differenceInDays } = require('date-fns');
const crypto = require('crypto');

// Supabase needs an ISO date string. However, that string will be different on every render because the MS or SEC have changed, which isn't good. So we use this trick to remove any time
exports.getToday = function (options = {}) {
  const today = new Date();

  // This is necessary to compare with created_at from Supabase, because it it not at 0.0.0.0, so we need to set the date to be END of the day when we compare it with earlier dates
  if (options?.end)
    // Set to the last second of the day
    today.setUTCHours(23, 59, 59, 999);
  else if (options?.checkin)
    today.setUTCHours(15, 0, 0, 0);
  else if (options?.checkout)
    today.setUTCHours(12, 0, 0, 0);
  else today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
};

// We want to make this function work for both Date objects and strings (which come from Supabase)
exports.subtractDates = (dateStr1, dateStr2) =>
  differenceInDays(parseISO(String(dateStr1)), parseISO(String(dateStr2)));

exports.stringify = (e) => {
  if (e) {
    e = e.current ?? e;
    return String(e.tagName).toLowerCase() + '#' + e.id + '.' + e.className;
  }
  return null;
};

exports.getHash = ( content ) => {				
  var hash = crypto.createHash('md5');
  //passing the data to be hashed
  data = hash.update(content, 'utf-8');
  //Creating the hash in the required format
  gen_hash= data.digest('hex');
  return gen_hash;
}