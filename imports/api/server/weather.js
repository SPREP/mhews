import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {isClientIpAllowed} from './serverutils.js';
import {WeatherForecasts} from '../weathers.js';

class WeatherServer {

  constructor(collection){
    _.extend(this, collection);
  }

  start(){
    // The 2nd argument must use "function", not the arrow notations.
    // See this guide https://guide.meteor.com/data-loading.html
    Meteor.publish('weatherForecast', ()=>{
      // Publish the recent 3 forecasts regardless if it is in effect,
      // so that the admin dashboard can receive the forecasts that hasn't been in effect yet.
      // Returns the Cursor, not each document.
      return this.find({}, {
        sort: {issued_at: -1},
        limit: 3
      });
    });

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

    return this.insert(forecast);
  }

}

export default new WeatherServer(WeatherForecasts);
