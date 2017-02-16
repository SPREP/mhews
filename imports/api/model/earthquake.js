import i18n from 'i18next';
import {Warning} from './warning.js';
import {sprintf} from 'sprintf-js';

export class Earthquake extends Warning {
  constructor(phenomena){
    super(phenomena);
    this.date_time = normalizeDateTime(this.date_time);
  }

  check(){
    super.check();

    check(this.epicenter, {lat: Number, lng: Number});
    check(this.mw, Number);
    check(this.depth, Number);
    check(this.date_time, Date);

  }

  doGetHeaderTitle(t){
    const quake = this;

    if( i18n.language == "ws"){
      return t("level."+quake.level)+" mo "+t(quake.type)+" (Magnitude "+quake.mw+","+quake.region+") ";
    }
    else{
      return t(quake.type)+" "+t("level."+quake.level)+" (Magnitude "+quake.mw+","+quake.region+") ";
    }
  }

  getSubTitle(){
    return moment(this.date_time).format("YYYY-MM-DD HH:mm");
  }

  getDescription(t){
    const quake = this;
    const distanceKm = Math.round(quake.distance_km);
    const distanceMiles = Math.round(quake.distance_miles);
    const direction = quake["direction_"+i18n.language];

    let description = sprintf(t("earthquake_description.location"), quake.mw, quake.region, quake.depth);
    description += ", ";
    description += sprintf(t("earthquake_description.town"), distanceKm, distanceMiles, direction, "Apia");
    description += ". ";
    description += quake["description_"+i18n.language];

    return description;
  }

  isSameEvent(another){
    return this.date_time == another.date_time && this.region == another.region;
  }
}

function normalizeDateTime(dateTime){
  if( !dateTime ){
    return undefined;
  }
  if( moment.isDate(dateTime)){
    return dateTime;
  }
  return moment(dateTime).toDate();
}
