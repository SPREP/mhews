import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check'

class WarningCollection extends Mongo.Collection {

  findWarningsInEffect(type){
    check(type, Match.Maybe(String));

    let selector = {in_effect: true};
    if(type){
      selector.type = type;
    }
    return super.find(selector, {sort: [["issued_at", "desc"]]}).fetch();
  };

  findLatestWarningInEffect(type){
    check(type, Match.Maybe(String));

    let selector = {in_effect: true};
    if(type){
      selector.type = type;
    }
    return super.findOne(selector, {sort: [["issued_at", "desc"]]});
  };

  findByBulletinId(type, bulletinId){
    check(type, String);
    check(bulletinId, Number);

    let selector = {type: type, bulletinId: bulletinId};
    return super.findOne(selector);
  }

  cancelWarning(warning){
    check(warning, Object);
    check(warning.bulletinId, Number);

    warning.in_effect = false;

    let selector = {type: warning.type, bulletinId: warning.bulletinId};
    super.update(selector, warning);
  }

  insert(warning){
    check(warning.bulletinId, Number);
    check(warning.type, String);
    check(warning.issued_at, String);

    // We use upsert here instead of insert, to make sure there is only one warning for each bulletinId.
    super.upsert({bulletinId: warning.bulletinId}, warning);
  }

  getHazardTypes(){
    let hazardTypes = [];

    const config = Meteor.settings.public.notificationConfig;
    for(let key in config){
      hazardTypes.push(key);
    }

    return hazardTypes;
  }
}

if( Meteor.isServer ){

  Meteor.publish('warnings', function weatherForecastPublication() {
    return Warnings.find();
  });
}

export const Warnings = new WarningCollection("warnings");
