export function toTitleCase(str)
{
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
}

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDayOfDate(dateTime, t){
  const day = t("weekdays."+WeekDays[dateTime.getDay()]);
  return day;
}

// Convert a date object into string depending on the set language.
export function dateToString(date, t){
  const day = t("weekdays."+WeekDays[date.getDay()]);
  const month = t("month."+Months[date.getMonth()]);
  return month+" "+date.getDate()+" ("+day+")";
}
