import i18n from 'i18next';
import {Warning} from './warning.js';

export class Earthquake extends Warning {
  constructor(phenomena){
    super(phenomena);
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

  getDescription(){
    const quake = this;
    const distanceKm = Math.round(quake.distance_km);
    const distanceMiles = Math.round(quake.distance_miles);

    if( i18n.language == "en"){
      let description = "An earthquake with magnitude "+quake.mw+" occurred in the "+quake.region;
      description += ", at the depth "+quake.depth+" km";
      description += ", approximately "+distanceKm+" km ("+distanceMiles+" miles) ";
      description += quake.direction_en+ " of Apia. ";

      description += quake.description_en;

      return description;
    }
    else{
      let description = "O le mafuie e tusa lona malosi ma le "+quake.mw+" ile fua mafuie sa afua mai ile motu o "+quake.region;
      description += ", ile loloto e "+quake.depth+" kilomita";
      description += ", ile mamao e "+distanceKm+" kilomita ("+distanceMiles+" maila tautai) ";
      description += quake.direction_ws+ " o Apia. ";

      description += quake.description_ws;

      return description;

    }
  }
}
