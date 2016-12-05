import { Mongo } from 'meteor/mongo';

export const Warnings = new Mongo.Collection("warnings");

Warnings.findWarningsInEffect = () => {
    return Warnings.find({in_effect: true}, {sort: [["issued_time", "desc"]]}).fetch();
};

Warnings.findLatestWarningInEffect = () => {
    return Warnings.findOne({in_effect: true}, {sort: [["issued_time", "desc"]]});
};

Warnings.getHazardTypes = () => {
  let hazardTypes = [];

  const config = Meteor.settings.notificationConfig;
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
