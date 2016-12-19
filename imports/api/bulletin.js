import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import {Warnings} from "./warnings.js";

class BulletinCollection extends Mongo.Collection{

  constructor(collectionName, prevBulletinSelectorFunc){
    super(collectionName);
    this.prevBulletinSelectorFunc = prevBulletinSelectorFunc;
  }
  /*
  mhews server receives the published single bulletin document,
  extract the list of warnings,
  and update the warnings collection in the database.

  TODO: Notification to the users should be suppressed until the method completes.
  (i.e. User should be notified only once.)
  */
  publishBulletin(bulletin){
    check(bulletin, Object);
    check(bulletin.id, Number);
    check(bulletin.warnings, [Match.Any]);
    check(bulletin.tc_info, {name: String});

    const bulletinId = bulletin.id;

    const previousBulletin = this.findPreviousBulletin(bulletin);
    let currentWarnings = [];
    if( previousBulletin ){
      currentWarnings = Warnings.find({"bulletinId": previousBulletin.id, "in_effect": true}).fetch();
    }

    const warnings = this.extractWarnings(bulletin);
    warnings.forEach((warning)=>{
      warning.bulletinId = bulletinId;
      const currentWarning = removeOneIf(currentWarnings, (w)=>{
        return Warnings.isForSameArea(w, warning);
      });
      if( currentWarning ){
        Warnings.update({_id: currentWarning._id}, warning);
      }
      else{
        Warnings.insert(warning);
      }
    });

    // Here, the currentWarnings contain the warnings that has been effective but not any longer.
    currentWarnings.forEach((warning)=>{
      Warnings.cancelWarning(warning);
    });

    if( previousBulletin ){
      this.update({_id: previousBulletin._id}, {"$set": {in_effect: false}});
    }
    this.insert(bulletin);

  }

  findPreviousBulletin(bulletin){

    return Warnings.findOne(this.prevBulletinSelectorFunc(bulletin));
  }

  cancelBulletin(bulletinId){
    const bulletin = this.findOne({id: bulletinId, in_effect: true});
    if( !bulletin ){
      return;
    }
    Warnings.find({in_effect: true, bulletinId: bulletinId}).forEach((warning)=>{
      Warnings.cancelWarning(warning);
    })
    this.update({id: bulletinId}, {"$set": {in_effect: false}});
  }

  extractWarnings(bulletin){
    bulletin.warnings.forEach((warning)=>{
      check(warning.type, String);
      check(warning.area, String);
      check(warning.direction, String);
    });
    return bulletin.warnings;
  }
}

// Exporting this function just for unit testing.
// TODO Consider use of the rewire module.
export function removeOneIf(array, condition){
  const index = array.findIndex(condition);
  if( index < 0 ){
    return null;
  }
  const element = array[index];
  array.splice(index, 1);
  return element;
}

export const CycloneBulletins = new BulletinCollection("cycloneBulletins", function(bulletin){
  return {"$and": [
      {in_effect: true},
      {"$or":[
        {id: bulletin.id},
        {tc_info: {name: bulletin.tc_info.name}}
      ]}
    ]}
});
