import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const WeatherForecasts = new Mongo.Collection("weatherForecast");

WeatherForecasts.getLatestForecast = (lng)=>{
  let forecasts = WeatherForecasts.find({lang: lng}, {sort: {'issued_at': -1}}).fetch();
//  let forecasts = WeatherForecasts.find({}).fetch();
  let data = null;
  if( !forecasts ){
    log.error("No matching data.");
  }
  else{
    data = forecasts[0];
  }
  return data ? addUtilityMethods(data) : null;
}

if( Meteor.isServer ){

  // The 2nd argument must use "function", not the arrow notations.
  // See this guide https://guide.meteor.com/data-loading.html
  Meteor.publish('weatherForecast', function weatherForecastPublication() {
    const forecasts = WeatherForecasts.find();

    // Returns the Cursor, not each document.
    return forecasts;
  });
}

function isSameDate(date1, date2){
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (d1.getFullYear() == d2.getFullYear()) &&
  (d1.getMonth() == d2.getMonth()) &&
  (d1.getDate() == d2.getDate());
}

function addUtilityMethods(forecast){
  forecast.getDistrictForecast = (district, date) => {
    let result = null;
    forecast.forecasts.forEach((districtForecast, index, array) => {
      if(districtForecast.district == district && isSameDate(districtForecast.date, date)){
        result = districtForecast;
      }
    });

    return result;
  }

  forecast.listForecastDates = () => {
    const dates = [];

    // Add the dates from the districtForecast, but remove duplicates.
    forecast.forecasts.forEach((districtForecast, index, array) => {
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
