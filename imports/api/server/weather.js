import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {isClientIpAllowed} from './serverutils.js';
import {WeatherForecasts} from '../weathers.js';

class WeatherServer {

  constructor(collection){
    _.extend(this, collection);
    // this reference to the collection is needed for calling the "allow" method.
    this.collection = collection;
    this.publish = this.publish.bind(this);
  }

  start(){
    Meteor.publish('weatherForecast', ()=>{
      // Publish the recent 3 forecasts regardless if it is in effect,
      // so that the admin dashboard can receive the forecasts that hasn't been in effect yet.
      // Returns the Cursor, not each document.
      return this.find({}, {
        sort: {issued_at: -1},
        limit: 3
      });
    });

    // Allow the admin dashboard web client to insert and update into the collection directly.
    // If this is allowed, appropriate protection for anonymous to update the weather forecasts
    // must be implemented.
    if( Meteor.settings.public.withAdminDashboard ){
      // this.allow() does not work for some reason, so use this.collection.allow()
      this.collection.allow({
        update: (_userId, _doc)=>{
          return true;
        }
      });
    }
  }

  publish(forecast){
    console.log("Enter publishWeatherForecast.");

    check(this.connection, Match.Where(isClientIpAllowed));
    //  check(forecast.bulletinId, Number);
    check(forecast.issued_at, Date);
    check(forecast.lang, Match.OneOf(...Meteor.settings.public.languages));
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
