import {Preferences} from './preferences.js';
import {toTitleCase} from '../strutils.js';

import i18n from 'i18next';

export class HeavyRain {
  constructor(phenomena){
    for(let key in phenomena){
      this[key] = phenomena[key];
    }
  }

  getHeaderTitle(t){
    if( i18n.language == "ws"){
      return toTitleCase(t("level."+this.level))+" o "+t("heavy_rain");
    }
    else{
      return t("Heavy_rain")+" "+t("level."+this.level);
    }
  }

  getSubTitle(){
    return moment(this.issued_at).format("YYYY-MM-DD HH:mm");
  }

  getDescription(){
    if( Preferences.load("language") == "en"){
      return this.description_en;
    }
    else{
      return this.description_ws;
    }
  }
}
