const { formatDistance, parseISO } = require('date-fns');
// const { differenceInDays } = require('date-fns/esm');

// We want to make this function work for both Date objects and strings (which come from Supabase)
// exports.subtractDates = (dateStr1, dateStr2) =>
//   differenceInDays(parseISO(String(dateStr1)), parseISO(String(dateStr2)));

exports.formatDistanceFromNow = (dateStr) =>
  formatDistance(parseISO(dateStr), new Date(), {
    addSuffix: true,
  })
    .replace('about ', '')
    .replace('in', 'In');

// Supabase needs an ISO date string. However, that string will be different on every render because the MS or SEC have changed, which isn't good. So we use this trick to remove any time
exports.getToday = function (options = {}) {
  const today = new Date();

  // This is necessary to compare with created_at from Supabase, because it it not at 0.0.0.0, so we need to set the date to be END of the day when we compare it with earlier dates
  if (options?.end)
    // Set to the last second of the day
    today.setUTCHours(23, 59, 59, 999);
  else today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
};

exports.formatCurrency = (value) =>
  new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(
    value
  );

exports.compareRef = (o1, o2) => {
  if (o1 && o2) {
    o1 = o1.current ?? o1;
    o2 = o2.current ?? o2;
    return stringify(o1) === stringify(o2);
  }
  return o1 === o2;
};

exports.stringify = (e) => {
  if (e) {
    e = e.current ?? e;
    return String(e.tagName).toLowerCase() + '#' + e.id + '.' + e.className;
  }
  return null;
};
