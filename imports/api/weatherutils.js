import {Town} from '../api/towninfo.js';

import SunCalc from 'suncalc';

export function getForecastsForDisplay(dates, bulletin, district){
  return dates.map((date) =>{
    const districtForecast = bulletin.getDistrictForecast(district, date);
    let forecastText;
    if( districtForecast ){
      forecastText = districtForecast.forecast;
    }
    else{
      forecastText = "No forecast is available for district = "+district+" on "+date.toDateString();
    }
    const location = getLocationForDistrict(district);
    const sunlightTimes = SunCalc.getTimes(date, location.lat, location.lng);
    let weatherSymbols;
    if( districtForecast.weatherSymbols ){
      weatherSymbols = districtForecast.weatherSymbols;
    }
    else{
      weatherSymbols = [districtForecast.weatherSymbol];
    }

    return {
      date: date,
      district: district,
      text: forecastText,
      sunrise: sunlightTimes.sunrise,
      sunset: sunlightTimes.sunset,
      weatherSymbols: weatherSymbols
    }

  });
}

function getLocationForDistrict(_district){
  // Just return Apia for now.
  // TODO Set a representing location of each district, and return the location.
  return Town.Apia;
}
