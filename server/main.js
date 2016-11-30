import { Meteor } from 'meteor/meteor';

import {Warnings, HazardType} from '../imports/api/warnings.js';
import {WeatherForecasts} from '../imports/api/weather.js';

Meteor.startup(() => {
  populateWarnings();
  populateWeatherForecast();
});

function populateWarnings(){
  Warnings.remove({});
  Warnings.insert({
    type: HazardType.cyclone,
    level: "Warning",
    region: "Samoa",
    in_effect: true,
    issued_time: new Date(),
    description: "Category 3 cyclone is approaching."
  });
  Warnings.insert({
    type: HazardType.heavyRain,
    level: "Warning",
    region: "Upolu North",
    in_effect: true,
    issued_time: new Date(),
    description: "Heavy rain is expected."
  });
}

function populateWeatherForecast(){
  WeatherForecasts.remove({});
  const issuedAt = new Date();
  const situation = "A trough of low pressure lies to the South of Samoa. Meanwhile a Northerly wind flow prevails over the group with associated clouds and showers affecting the group at times.";
  const forecast = {
    issued_at: issuedAt,
    lang: "ws",
    situation: situation,
    forecasts: [
      {
        district: "upolu-north-northwest",
        date: addDays(issuedAt, 0),
        forecast: "Fine weather apart from some afternoon showers and few thunderstorms possible over highlands."
      },
      {
        district: "upolu-east-southwest",
        date: addDays(issuedAt, 0),
        forecast: "Partly cloudy with some brief showers and few thunderstorms possible."
      },
      {
        district: "upolu-north-northwest",
        date: addDays(issuedAt, 1),
        forecast: "Partly cloudy with some afternoon showers over highlands."
      },
      {
        district: "upolu-east-southwest",
        date: addDays(issuedAt, 1),
        forecast: "Few showers otherwise fine."
      },
      {
        district: "upolu-north-northwest",
        date: addDays(issuedAt, 2),
        forecast: "Fine apart from some afternoon showers over highlands."
      },
      {
        district: "upolu-east-southwest",
        date: addDays(issuedAt, 2),
        forecast: "Brief showers."
      },
      {
        district: "upolu-north-northwest",
        date: addDays(issuedAt, 3),
        forecast: "Cloudy at times with a few showers."
      },
      {
        district: "upolu-east-southwest",
        date: addDays(issuedAt, 3),
        forecast: "Cloudy at times with a few showers."
      }
  ]};

  WeatherForecasts.insert(forecast);
}

function addDays(date, days){
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
