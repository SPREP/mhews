import {CycloneBulletins} from '../bulletin.js';
import {Warning} from './warning.js';
import i18n from 'i18next';

export class Cyclone extends Warning {
  constructor(phenomena){
    super(phenomena);
  }

  check(){
    super.check();
  }

  doGetHeaderTitle(t){
    return t("Cyclone")+" "+t("category") + " "+ this.category + " " + t("level."+this.level.toLowerCase());
  }

  getSubTitle(_t){
    return moment(this.issued_at).format("YYYY-MM-DD HH:mm");
  }

  getDescription(t){
    const bulletin = this.getBulletin();
    if( !bulletin ){
      return "";
    }
    const tc_info = bulletin.tc_info;

    let description;
    const lang = i18n.language;

    if( lang == "ws"){
      description = "Sa iai le Afa o "+tc_info.name+" i "+tc_info.center.lat+","+tc_info.center.lng;
      tc_info.neighbour_towns.forEach((town)=>{
        description += " po'o le "+town.distance_km+" kilomita ("+town.distance_miles+"miles) "
        description += t("directions."+town.direction)+" o "+town.name;
      });
    }
    else{
      description = "Tropical Cyclone "+tc_info.name+" was located at "+tc_info.center.lat+","+tc_info.center.lng;
      tc_info.neighbour_towns.forEach((town)=>{
        description += " or about "+town.distance_km+"km ("+town.distance_miles+"miles) "
        description += t("directions."+town.direction)+" of "+town.name;
      });
    }

    description += ".";
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
