import {Meteor} from 'meteor/meteor';

export function updateForecast(bulletin, usedLanguage, callback){

  Meteor.call("updateWeatherForecast", bulletin, usedLanguage, callback);
}
