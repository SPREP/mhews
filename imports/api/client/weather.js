/*

Weather forecast is pushed from the server through the Mongo Collection.
Forecasts are stored locally into the GroundDB for offline use.

*/
import {WeatherForecasts} from '../weathers.js';

/* global Ground */
class WeatherForecastsCollection extends Ground.Collection {

  constructor(collectionName){
    super(collectionName);
    this.collectionName = collectionName;

    this.forecastCursor = null;
    this.weatherForecastHandler = null;

  }

  start(){
    console.log("WeatherForecastsCollection.start");

    // To receive the data from the weatherForecast collection
    this.subscriptionHandler = Meteor.subscribe("weatherForecast", ()=>{
      console.log("Meteor.subscribe weather callback.");

      // Make GroundDB observe the Mongo db and copy the data to the local storage.
      const mongoCursor = WeatherForecasts.find();
      this.observeSource(mongoCursor);

      // Remove all documents not in current subscription
      console.log("Calling ground.keep()");
      this.keep(mongoCursor);
    });

  }

  stop(){
    if( this.forecastUpdateHandler ){
      this.forecastUpdateHandler.stop();
      this.forecastUpdateHandler = null;
    }

    this.subscriptionHandler.stop();
    // TODO What's the right unsubscribe operation for the GroundDB??
  }

  // Call the callback function when the weather forecast is updated.
  onForecastUpdate(callback){

    const cursor = WeatherForecasts.find({lang: "en", in_effect: true});
    this.forecastUpdatehandler = cursor.observe({
      added: callback
    });
  }

  getLatestForecast(lng){
    let forecasts = WeatherForecasts.find(
      {lang: lng, in_effect: true},
      {sort: {'issued_at': -1}}
    ).fetch();

    let data = null;
    if( !forecasts ){
      console.error("No matching data.");
    }
    else{
      data = forecasts[0];
    }
    return data ? new ForecastWrapper(data) : null;
  }
}

function isSameDate(date1, date2){
  // moment.isSame with "day" in the second argument will check year+month+day
  return moment(date1).isSame(moment(date2), "day");
}

class ForecastWrapper {
  constructor(forecast){
    _.extend(this, forecast);
  }

  getDistrictForecast(district, date){
    let result = null;
    this.forecasts.forEach((districtForecast) => {
      if(districtForecast.district == district && isSameDate(districtForecast.date, date)){
        result = districtForecast;
      }
    });

    return result;
  }

  listForecastDates(){
    const dates = [];

    // Add the dates from the districtForecast, but remove duplicates.
    this.forecasts.forEach((districtForecast) => {
      const date = districtForecast.date;
      if( !dates.find(function(element){
        return element.getTime() == date.getTime();
      })){
        dates.push(date);
      }
    });

    return dates;
  }

}

export default new WeatherForecastsCollection("groundWeatherForecast");
