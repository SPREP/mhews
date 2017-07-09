import { check } from 'meteor/check';
import Warnings from '../warnings.js';
import WarningFactory from '../model/warningFactory.js';
import Config from '/imports/config.js';

/* global Ground */
class WarningCollectionClient extends Ground.Collection {

  constructor(collectionName, options){
    super(collectionName, options);
//    _.extend(this, collection);

    // GroundDB does not support the transform option. Need to implement by myself.
    this.transform = options.transform;

    const mongoCursor = Warnings.find();
    this.observeSource(mongoCursor);
    this.keep(mongoCursor);

    this.cancelWarning = this.cancelWarning.bind(this);

    // this.findWarningsInEffect = Warnings.findWarningsInEffect.bind(this);
    // this.findLatestWarningInEffect = Warnings.findLatestWarningInEffect.bind(this);
    // this.findSameWarningInEffect = Warnings.findSameWarningInEffect.bind(this);
    // this.findByBulletinId = Warnings.findByBulletinId.bind(this);
    // this.getHazardTypes = Warnings.getHazardTypes.bind(this);
    // this.isCancelled = Warnings.isCancelled.bind(this);
    // this.hasSevererWarning = Warnings.hasSevererWarning.bind(this);

  }

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
    return this.find(selector, {sort: [["issued_at", "desc"]]});
  }

  findLatestWarningInEffect(type){
    check(type, Match.Maybe(String));

    let selector = {in_effect: true};
    if(type){
      selector.type = type;
    }
    return this.findOne(selector, {sort: [["issued_at", "desc"]]});
  }

  findSameWarningInEffect(warning){
    let foundWarning = undefined;

    this.find({in_effect: true, type: warning.type}).forEach((another)=>{
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
    return this.findOne(selector);
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
    const warning = this.findOne({_id: id});
    return !(warning && warning.in_effect);
  }

  // True if there is a severer warning of the same kind as the one specified by id.
  hasSevererWarning(id){
    const warning = this.findOne({_id: id, in_effect: true});
    if( !warning ){
      return false;
    }
    let result = false;
    this.find({in_effect: true, type: warning.type}).forEach((anotherWarning)=>{
      if( anotherWarning.isMoreSignificant(warning)){
        result = true;
      }
    });

    return result;
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

  find(selector, options){
    const newOptions = _.extend(options, {transform: this.transform});
    return super.find(selector, newOptions);
  }

  findOne(selector, options){
    const newOptions = _.extend(options, {transform: this.transform});
    return super.findOne(selector, newOptions);
  }
}

// This transform function is run by the Meteor Collection when it returns a data entry
// and wraps the data by one of the warning entity classes.
function transform(warning){
  return WarningFactory.create(warning);
}

const WarningCollection = new WarningCollectionClient("groundWarnings", {transform: transform});

export default WarningCollection;
