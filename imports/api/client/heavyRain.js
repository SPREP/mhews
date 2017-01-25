import {Preferences} from './preferences.js';

export class HeavyRain {
  constructor(phenomena){
    for(let key in phenomena){
      this[key] = phenomena[key];
    }
  }

  getHeaderTitle(_t){
    return "Heavy Rain"+" "+this.level;
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
