import i18n from 'i18next';
import {Warning} from './warning.js';
import {sprintf} from 'sprintf-js';
import {getDistanceFromLatLonInKm} from '../geoutils.js';
import Warnings from '../warnings.js';

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

    return sprintf(t("earthquake_description.header"), t(this.type), t("level."+this.level), this.mw, this.region);
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

  // If the epicenter is enough close and the date_time difference is within 1 min,
  // consider it as the same event.
  // The epicenter and date_time may be corrected when a successive bulletin is issued,
  // so we cannot do exact comparison.
  isSameEvent(another){
    return isTimeClose(this.date_time, another.date_time) && isLocationClose(this.epicenter, another.epicenter);
  }

  toPushMessage(){
    const message = super.toPushMessage();
    if( this.type == "tsunami" && this.isMoreSignificant("information") && this.in_effect ){
      message.repeat(5).interval(3*60).collapse(this.type).cancelIf(()=>{
        return Warnings.isCancelled(this._id) || Warnings.hasSevererWarning(this._id);
      });
    }
    return message;
  }

  toFcmMessage(){
    const fcmMessage = super.toFcmMessage();
    const mw = this.mw;
    fcmMessage.notification.body = this.region + " (Magnitude "+mw+")";
    fcmMessage.data.epicenter_lat = this.epicenter.lat;
    fcmMessage.data.epicenter_lng = this.epicenter.lng;
    fcmMessage.data.mw = mw;
    fcmMessage.data.depth = this.epicenter.depth;

    // warning.area and warning.direction are not defined for Tsunami warning.
    if( !this.area ){
      fcmMessage.area = "Samoa";
    }
    if( !this.direction ){
      fcmMessage.direction = "Whole Area";
    }
    return fcmMessage;
  }
}

function isTimeClose(time1, time2){
  return Math.abs(moment(time1).diff(moment(time2), 'seconds')) < 60;
}

// Consider it close enough if the distance within 50km.
function isLocationClose(location1, location2){

  return getDistanceFromLatLonInKm(location1, location2) < 50;
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
