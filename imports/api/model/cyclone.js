import {CycloneBulletins} from '../bulletin.js';
import {Warning} from './warning.js';
import i18n from 'i18next';
import {sprintf} from 'sprintf-js';

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
    const lang = i18n.language;

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
}
