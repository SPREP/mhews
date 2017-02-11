import { check } from 'meteor/check';
import {isClientIpAllowed} from './serverutils.js';

const collectionName = "weatherForecast";

class WeatherForecastCollection extends Mongo.Collection {

  constructor(){
    super(collectionName);
  }

  publish(forecast){
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

}

export const WeatherForecasts = new WeatherForecastCollection();
