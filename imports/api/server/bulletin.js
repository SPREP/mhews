import { Meteor } from 'meteor/meteor';

import { check } from 'meteor/check';
import Warnings from "./warnings.js";
import {CycloneBulletins} from '../../api/bulletin.js';

class BulletinsServer {

  constructor(bulletinCollection, prevBulletinSelectorFunc){
    _.extend(this, bulletinCollection);

    this.prevBulletinSelectorFunc = prevBulletinSelectorFunc;
    this.publishBulletin = this.publishBulletin.bind(this);
  }

  start(){
    // The 2nd argument must use "function", not the arrow notations.
    // See this guide https://guide.meteor.com/data-loading.html
    Meteor.publish('cycloneBulletins', ()=>{
      // Only publish the forecasts which is in effect.
      // Returns the Cursor, not each document.
      return this.find({'in_effect': true});
    });
  }
  /*
  Server side only

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
    check(bulletin.tc_info, Match.ObjectIncluding({name: String}));
    check(bulletin.in_effect, Boolean);

    const bulletinId = bulletin.id;

    const previousBulletin = this.findPreviousBulletin(bulletin);
    let currentWarnings = [];
    if( previousBulletin ){
      currentWarnings = Warnings.find({"bulletinId": previousBulletin.id, "in_effect": true}).fetch();
    }

    const warnings = this.extractWarnings(bulletin);
    warnings.forEach((warning)=>{
      console.log("warning = "+JSON.stringify(warning));
      warning.bulletinId = bulletinId;
      const currentWarning = removeOneIf(currentWarnings, (w)=>{
        return w.isForSameArea(warning);
      });
      if( currentWarning ){
        console.log("Updating warning = "+JSON.stringify(warning));
        Warnings.update({_id: currentWarning._id}, warning);
      }
      else{
        warning.issued_at = bulletin.issued_at;
        console.log("Inserting warning = "+JSON.stringify(warning));
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
    return this.findOne(this.prevBulletinSelectorFunc(bulletin));
  }

  cancelBulletin(bulletinId){
    const bulletin = this.findOne({id: bulletinId, in_effect: true});
    if( !bulletin ){
      return;
    }
    Warnings.find({in_effect: true, bulletinId: bulletinId}).forEach((warning)=>{
      Warnings.cancelWarning(warning.type, bulletinId);
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

function createBulletinsServer(bulletinCollection){
  return new BulletinsServer(bulletinCollection, function(bulletin){
    return {"$and": [
      {in_effect: true},
      {"$or":[
        {id: bulletin.id},
        {tc_info: {name: bulletin.tc_info.name}}
      ]}
    ]}
  });

}

const instance = createBulletinsServer(CycloneBulletins);
export default instance;
