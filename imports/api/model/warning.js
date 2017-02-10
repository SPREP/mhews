import i18n from 'i18next';
import {toTitleCase} from '../strutils.js';

export class Warning {
  constructor(phenomena){
    _.extend(this, phenomena);
  }

  getHeaderTitle(t){
    if( i18n.language == "ws"){
      return toTitleCase(t("level."+this.level) +" o "+t(this.type));
    }
    else{
      return toTitleCase(t(this.type)+" "+t("level."+this.level));
    }
  }

  getSubTitle(){
    return moment(this.issued_at).format("YYYY-MM-DD HH:mm");
  }

  getDescription(){
    if( i18n.language == "ws"){
      return this.description_ws;
    }
    else{
      return this.description_en;
    }
  }
}
