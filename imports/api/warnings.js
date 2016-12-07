import { Mongo } from 'meteor/mongo';

export const Warnings = new Mongo.Collection("warnings");

Warnings.findWarningsInEffect = (type) => {
  let selector = {in_effect: true};
  if(type){
    selector.type = type;
  }
  return Warnings.find(selector, {sort: [["issued_time", "desc"]]}).fetch();
};

Warnings.findLatestWarningInEffect = (type) => {
  let selector = {in_effect: true};
  if(type){
    selector.type = type;
  }
  return Warnings.findOne(selector, {sort: [["issued_time", "desc"]]});
};

Warnings.getHazardTypes = () => {
  let hazardTypes = [];

  const config = Meteor.settings.public.notificationConfig;
  for(let key in config){
    hazardTypes.push(key);
  }

  return hazardTypes;
}

if( Meteor.isServer ){

  Meteor.publish('warnings', function weatherForecastPublication() {
    return Warnings.find();
  });
}
