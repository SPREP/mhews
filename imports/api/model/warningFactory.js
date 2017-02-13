import {Earthquake} from './earthquake.js';
import {Cyclone} from './cyclone.js';
import {HeavyRain} from './heavyRain.js';
import {Warning} from './warning.js';

class WarningFactory {

  create(warning){
    switch(warning.type.toLowerCase()){
      case "tsunami": return new Earthquake(warning);
      case "earthquake": return new Earthquake(warning);
      case "cyclone": return new Cyclone(warning);
      case "heavyrain": return new HeavyRain(warning);
      default: return new Warning(warning);
    }
  }
}

export default new WarningFactory();
