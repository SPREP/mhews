import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'

import {Warnings} from '../imports/api/warnings.js';
import {WeatherForecasts} from '../imports/api/weather.js';

Meteor.startup(() => {

  Meteor.methods({
    publishWeatherForecast: publishWeatherForecast,
    publishWarning: publishWarning
  })
});

function checkWarningType(type){
  const hazardTypes = Warnings.getHazardTypes();
  for(let i= 0; i< hazardTypes.length; i++ ){
    if( hazardTypes[i] == type ) return true;
  }
  return false;
}

function publishWarning(warning){

  check(warning.type, Match.Where(checkWarningType));
  check(warning.in_effect, Match.OneOf(true, false));
  check(warning.issued_at, Date);
  check(warning.level, String);
  check(warning.description, String);

  if( warning.type == "tsunami"){
    check(warning.epicenter, {lat: Number, lng: Number});
    check(warning.mw, Number);
    check(warning.depth, Number);
  }

  return Warnings.insert(warning);
}

function publishWeatherForecast(forecast){
  console.log("Enter publishWeatherForecast.");

  check(forecast.issued_at, Date);
  check(forecast.lang, Match.OneOf("en", "ws"));
  check(forecast.situation, String);
  check(forecast.forecasts, [{
    district: String,
    date: Date,
    forecast: String
  }]);

  return WeatherForecasts.insert(forecast);
}
