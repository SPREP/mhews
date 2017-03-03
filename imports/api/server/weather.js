import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {WeatherForecasts} from '../weathers.js';

class WeatherServer {

  constructor(collection){
    _.extend(this, collection);
    // this reference to the collection is needed for calling the "allow" method.
    this.collection = collection;
    this.publish = this.publish.bind(this);
    this.updateForecast = this.updateForecast.bind(this);
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
  }

  publish(forecast){
    console.log("Enter publishWeatherForecast.");

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

  updateForecast(bulletin, usedLanguage){
    Meteor.settings.public.languages.forEach((lang)=>{
      if( lang == usedLanguage ){
        this.doUpdateForecast(bulletin);
      }
      else{
        const bulletinForLang = findBulletinForLang(bulletin, lang);
        if( bulletinForLang ){
          copyWeatherSymbols(bulletin, bulletinForLang);
          this.doUpdateForecast(bulletinForLang);
        }
        else{
          console.warn("There is no Samoan bulletin for "+bulletin.issued_at+" "+bulletin.name);
        }

      }
    })
  }

  doUpdateForecast(bulletin){
    this.update(
      {_id: bulletin._id},
      {"$set": {forecasts: bulletin.forecasts, in_effect: true}}
    );
  }
}

function copyWeatherSymbols(bulletin, bulletinSamoan){
  const forecastsSamoan = bulletinSamoan.forecasts;
  bulletin.forecasts.forEach((forecast)=>{
    const forecastSamoan = findInArray(forecastsSamoan, (element)=>{
      return (element.district == forecast.district) &&
      (moment(element.date).isSame(forecast.date));
    });
    if( forecastSamoan ){
      forecastSamoan.weatherSymbols = forecast.weatherSymbols;
    }
    else{
      console.warn("There is no forecast for "+forecast.district+" "+forecast.date);
    }
  });

}

function findInArray(array, condition){
  for(let i= 0; i< array.length; i++){
    const element = array[i];
    if( condition(element) ) return element;
  }

  return null;
}

function findBulletinForLang(bulletin, lang){

  return WeatherForecasts.findOne(
    {
      name: bulletin.name,
      issued_at: bulletin.issued_at,
      lang: lang
    }
  );
}


export default new WeatherServer(WeatherForecasts);
