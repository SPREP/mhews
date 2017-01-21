import FileCache from './filecache.js';
import {WeatherForecasts} from './weather.js';

const surfaceChartUrl = "http://www.samet.gov.ws/images/surface_chart/latest_compact.png";

const satelliteImageUrl = "http://www.samet.gov.ws/satellite/satellite_image_compact.png";

class WeatherForecastObserverClass {

  constructor(){
    this.surfaceChartHandler = null;
    this.satelliteImageHandler = null;
    this.forecastCursor = null;
    this.weatherForecastHandler = null;
  }

  start(){
    console.log("startObservingWeatherForecast()");

    if( !this.surfaceChartHandler ){
      this.surfaceChartHandler = FileCache.add(surfaceChartUrl);
    }
    if( !this.satelliteImageHandler ){
      this.satelliteImageHandler = FileCache.add(satelliteImageUrl);
    }

    this.forecastCursor = WeatherForecasts.find({lang: "en", in_effect: true});
    this.weatherForecastHandler = this.forecastCursor.observe({
      added: (forecast)=>{this.refreshSurfaceChart(forecast)}
    });

  }

  stop(){
    console.log("stopObservingWeatherForecast()");

    if( this.weatherForecastHandler ){
      this.weatherForecastHandler.stop();
      this.weatherForecastHandler = null;
    }
  }

  // Trigger downloading the surface chart when the weather forecast is updated.
  // This assumes that the surface chart is updated before the forecast is published.
  // (Assumption on the SMD's workflow)
  refreshSurfaceChart(forecast){
    console.log("refreshSurfaceChart() for "+forecast._id);
    if( this.surfaceChartHandler ){
      this.surfaceChartHandler.refresh();
    }
  }

  getHandlers(){
    return [this.surfaceChartHandler, this.satelliteImageHandler];
  }
}

export const WeatherForecastObserver = new WeatherForecastObserverClass();
