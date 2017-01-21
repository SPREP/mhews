import { check } from 'meteor/check';
import {isClientIpAllowed} from './serverutils.js';

const collectionName = "weatherForecast";

export const MongoWeatherForecasts = new Mongo.Collection(collectionName);

export const WeatherForecasts = MongoWeatherForecasts;

// Allow this temporarily, so that AdminDashboard can update the weather symbol.
MongoWeatherForecasts.allow({
  update: (_userId, _doc)=>{
    return true;
  }
})

export function publishWeatherForecast(forecast){
  console.log("Enter publishWeatherForecast.");

  check(this.connection, Match.Where(isClientIpAllowed));
//  check(forecast.bulletinId, Number);
  check(forecast.issued_at, Date);
  check(forecast.lang, Match.OneOf("en", "ws"));
  check(forecast.situation, String);
  check(forecast.forecasts, [{
    district: String,
    date: Date,
    forecast: String
  }]);

  // Don't set in_effect to true here. It is set true after the weather icons have been specified.
  forecast.in_effect = false;

  return WeatherForecasts.insert(forecast);
}
