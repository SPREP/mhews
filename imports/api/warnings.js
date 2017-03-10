import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import WarningFactory from './model/warningFactory.js';
import Config from '/imports/config.js';

export class WarningCollection extends Mongo.Collection {

  findWarningsInEffect(type, area, direction, joinExercise){
    check(type, Match.Maybe(String));
    check(area, Match.Maybe(String));
    check(direction, Match.Maybe(String));

    let selector = {in_effect: true};
    if(type){
      selector.type = type;
    }
    if(area){
      selector.area = area;
    }
    if(direction){
      selector.direction = direction;
    }
    if(!joinExercise){
      selector.is_exercise = {"$ne": true};
    }
    // Return the Cursor instead of the result.
    return super.find(selector, {sort: [["issued_at", "desc"]]});
  }

  findLatestWarningInEffect(type){
    check(type, Match.Maybe(String));

    let selector = {in_effect: true};
    if(type){
      selector.type = type;
    }
    return super.findOne(selector, {sort: [["issued_at", "desc"]]});
  }

  findSameWarningInEffect(warning){
    let foundWarning = undefined;

    super.find({in_effect: true, type: warning.type}).forEach((another)=>{
      if( another.isSameEvent(warning)){
        foundWarning = another;
      }
    })

    return foundWarning;
  }

  findByBulletinId(type, bulletinId){
    check(type, String);
    check(bulletinId, Number);

    let selector = {type: type, bulletinId: bulletinId};
    return super.findOne(selector);
  }

  getHazardTypes(){
    let hazardTypes = [];

    const config = Config.notificationConfig;
    for(let key in config){
      hazardTypes.push(key);
    }

    return hazardTypes;
  }

  isCancelled(id){
    const warning = super.findOne({_id: id});
    return !(warning && warning.in_effect);
  }

  // True if there is a severer warning of the same kind as the one specified by id.
  hasSevererWarning(id){
    const warning = super.findOne({_id: id, in_effect: true});
    if( !warning ){
      return false;
    }
    let result = false;
    super.find({in_effect: true, type: warning.type}).forEach((anotherWarning)=>{
      if( anotherWarning.isMoreSignificant(warning)){
        result = true;
      }
    });

    return result;
  }


}

// This transform function is run by the Meteor Collection when it returns a data entry
// and wraps the data by one of the warning entity classes.
function transform(warning){
  return WarningFactory.create(warning);
}

export default new WarningCollection("warnings", {transform: transform});
