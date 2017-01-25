import {CycloneBulletins} from './bulletin.js';

export class Cyclone {
  constructor(phenomena){
    for(let key in phenomena){
      this[key] = phenomena[key];
    }
  }

  getHeaderTitle(){

    return "Category " + this.category + " " + this.level;
  }

  getSubTitle(){
    return moment(this.issued_at).format("YYYY-MM-DD HH:mm");
  }

  getDescription(){
    const bulletin = this.getBulletin();
    if( !bulletin ){
      return "";
    }
    const tc_info = bulletin.tc_info;

    let description = "Tropical Cyclone "+tc_info.name+" was located "+tc_info.center.lat+","+tc_info.center.lng;
    tc_info.neighbour_towns.forEach((town)=>{
      description += " or about "+town.distance_km+"km ("+town.distance_miles+"miles) "
      description += town.direction+" of "+town.name;
    });
    description += ".";

    description += tc_info.situation_en + " " +tc_info.people_impact_en;

    return description;
  }

  getBulletin(){
    if( !this.bulletin ){
      const bulletinId = this.bulletinId;
      this.bulletin = CycloneBulletins.findOne({id: bulletinId});
    }
    return this.bulletin;
  }

}
