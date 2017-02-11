import { check } from 'meteor/check';
import {WarningCollection} from '../warnings.js';
import {Earthquake} from '../model/earthquake.js';
import {Cyclone} from '../model/cyclone.js';
import {HeavyRain} from '../model/heavyRain.js';
import {Warning} from '../model/warning.js';

class WarningCollectionClient extends WarningCollection {

  constructor(name, args){
    super(name, args ? _.extend(args, {transform: transform}) : {transform: transform});
    this.cancelWarning = this.cancelWarning.bind(this);
  }

  cancelWarning(type, bulletinId){
    check(type, String);
    check(bulletinId, Number);

    // Remote call from a client
    Meteor.call("cancelWarning", type, bulletinId, (err, res)=>{
      if( err ){
        console.log("cancelWarning remote call failed.");
        console.log(JSON.stringify(err));
      }
      if( res ){
        console.log(JSON.stringify(res));
      }
    });

  }
}

// This transform function is run by the Meteor Collection when it returns a data entry
// and wraps the data by one of the warning entity classes.
function transform(warning){
  switch(warning.type.toLowerCase()){
    case "tsunami": return new Earthquake(warning);
    case "earthquake": return new Earthquake(warning);
    case "cyclone": return new Cyclone(warning);
    case "heavyrain": return new HeavyRain(warning);
    default: return new Warning(warning);
  }
}

export const Warnings = new WarningCollectionClient("warnings");
