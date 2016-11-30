import { Mongo } from 'meteor/mongo';

export const Warnings = new Mongo.Collection("warnings");

Warnings.findWarningsInEffect = () => {
    return Warnings.find({in_effect: true}, {sort: [["issued_time", "desc"]]}).fetch();
};

Warnings.findLatestWarningInEffect = () => {
    return Warnings.findOne({in_effect: true}, {sort: [["issued_time", "desc"]]});
};

export const HazardType = {
  cyclone: 'Cyclone',
  heavyRain: 'HeavyRain',
  tsunami: 'Tsunami'
}

if( Meteor.isServer ){

  Meteor.publish('warnings', function weatherForecastPublication() {
    return Warnings.find();
  });
}
