/* global Ground */
import { Mongo } from 'meteor/mongo';

const collectionName = "weatherForecast";

const MongoWeatherForecasts = new Mongo.Collection(collectionName);

let GroundWeatherForecasts;

if( Meteor.isClient ){
  GroundWeatherForecasts = new Ground.Collection("groundWeatherForecast");
  const mongoCursor = MongoWeatherForecasts.find();
  GroundWeatherForecasts.observeSource(mongoCursor);

  Meteor.startup(()=>{

    // To receive the data from the weatherForecast collection
    Meteor.subscribe(collectionName, ()=>{
      // Remove all documents not in current subscription
      console.log("Calling ground.keep()");
      GroundWeatherForecasts.keep(mongoCursor);
    });
  });
}

export const WeatherForecasts = Meteor.isClient ? GroundWeatherForecasts : MongoWeatherForecasts;

WeatherForecasts.getLatestForecast = (lng)=>{
  let forecasts = WeatherForecasts.find({lang: lng}, {sort: {'issued_at': -1}}).fetch();
  let data = null;
  if( !forecasts ){
    console.error("No matching data.");
  }
  else{
    data = forecasts[0];
  }
  return data ? addUtilityMethods(data) : null;
}

function isSameDate(date1, date2){
  // moment.isSame with "day" in the second argument will check year+month+day
  return moment(date1).isSame(moment(date2), "day");
}

function addUtilityMethods(forecast){
  forecast.getDistrictForecast = (district, date) => {
    let result = null;
    forecast.forecasts.forEach((districtForecast) => {
      if(districtForecast.district == district && isSameDate(districtForecast.date, date)){
        result = districtForecast;
      }
    });

    return result;
  }

  forecast.listForecastDates = () => {
    const dates = [];

    // Add the dates from the districtForecast, but remove duplicates.
    forecast.forecasts.forEach((districtForecast) => {
      const date = districtForecast.date;
      if( !dates.find(function(element){
        return element.getTime() == date.getTime();
      })){
        dates.push(date);
      }
    });

    return dates;
  }

  return forecast;
}
