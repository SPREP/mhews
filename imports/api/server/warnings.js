import { check } from 'meteor/check';
import {isClientIpAllowed} from './serverutils.js';
import {WarningCollection} from '../warnings.js';

class WarningCollectionServer extends WarningCollection {

  constructor(...args){
    super(...args);
    this.cancelWarning = this.cancelWarning.bind(this);
    this.publishWarning = this.publishWarning.bind(this);
  }

  // This method is called from the server.
  publishWarning(warning){
    console.log("Enter publishWarning");

    check(this.connection, Match.Where(isClientIpAllowed));
    check(warning.bulletinId, Number);
    check(warning.type, Match.Where(checkWarningType));
    check(warning.level, Match.OneOf(...Warnings.listLevels()));
    check(warning.in_effect, Match.OneOf(true, false));
    check(warning.issued_at, Date);
    check(warning.description_en, String);
    check(warning.description_ws, String);

    if( warning.type == "tsunami"){
      check(warning.epicenter, {lat: Number, lng: Number});
      check(warning.mw, Number);
      check(warning.depth, Number);
    }
    else if( warning.type == "heavyRain"){
      check(warning.area, String);
      check(warning.direction, String);
    }

    if( warning.in_effect ){
      return this.insert(warning);
    }
    else {
      // FIXME: This cancellation does not work because IBL gives different bulletinNumber
      // from the warning bulletin to be cancelled.
      return this.cancelWarning(warning);
    }
  }

  // This method can be called by a client or a server.
  cancelWarning(type, bulletinId){
    check(type, String);
    check(bulletinId, Number);

    let selector = {type: type, bulletinId: bulletinId, in_effect: true};
    super.update(selector, {"$set": {in_effect: false}});
  }

  insert(warning){
    check(warning.bulletinId, Number);
    check(warning.type, String);
    check(warning.issued_at, Date);

//    let selector = {type: warning.type, bulletinId: warning.bulletinId, in_effect: true};
//    super.upsert(selector, warning);
    super.insert(warning);
  }

}

function checkWarningType(type){
  const hazardTypes = Warnings.getHazardTypes();
  for(let i= 0; i< hazardTypes.length; i++ ){
    if( hazardTypes[i] == type ) return true;
  }
  return false;
}

export const Warnings = new WarningCollectionServer("warnings");
