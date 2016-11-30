import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

/*
    schema:
    {
      issued_at: Date & Time string,
      lang: [en|ws],
      situation: text,
      forecasts: [
        {
          district: text,
          date: text,
          forecast: text
      }
    ]
  }

*/

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

  Meteor.publish('weatherForecast', function weatherForecastPublication() {
    const forecasts = WeatherForecasts.find();
    console.log("forecasts = "+forecasts.fetch());
    if( forecasts ){
      console.log("forecasts count = "+forecasts.fetch().length);
    }
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

    return forecast.forecasts.map((districtForecast, index, array) => {
      return districtForecast.date;
    })
  }

  return forecast;
}
