import {CycloneBulletins} from '../bulletin.js';
import {Warning} from './warning.js';
import {sprintf} from 'sprintf-js';
import {Preferences} from '/imports/api/client/preferences.js';

export class Cyclone extends Warning {
  constructor(phenomena){
    super(phenomena);
  }

  check(){
    super.check();
  }

  doGetHeaderTitle(t){
    return sprintf(t("cyclone_description.header"), this.category, t("level."+this.level.toLowerCase()));
  }

  getDescription(t){
    const bulletin = this.getBulletin();
    if( !bulletin ){
      return "";
    }
    const tc_info = bulletin.tc_info;

    let description = "";
    const lang = Preferences.load("language");

    // Predefined text to describe the TC's name, location and the distance from neighbour towns.
    description += sprintf(t("cyclone_description.location"), tc_info.name, tc_info.center.lat, tc_info.center.lng);
    tc_info.neighbour_towns.forEach((town)=>{
      description += ", " + t("or") + " ";
      description += sprintf(t("cyclone_description.town"), town.distance_km, town.distance_miles, town.direction, town.name);
    });

    description += ". ";
    if( tc_info["situation_"+lang] ){
      description += tc_info["situation_"+lang] + " ";
    }
    if( tc_info["people_impact_"+lang] ){
      description += tc_info["people_impact_"+lang];
    }

    return description;
  }

  getBulletin(){
    if( !this.bulletin ){
      const bulletinId = this.bulletinId;
      this.bulletin = CycloneBulletins.findOne({id: bulletinId});
    }
    return this.bulletin;
  }

  isSameEvent(another){
    return this.area == another.area && this.direction == another.direction;
  }

  toFcmMessage(){
    const fcmMessage = super.toFcmMessage();
    fcmMessage.notification.body = this.area + (this.direction ? " " + this.direction : "");
    fcmMessage.data.name = this.name; // Name of the TC
    fcmMessage.data.category = this.category;
    return fcmMessage;
  }
}
