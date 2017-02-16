// Here we import api/weathers.js instead of api/client/weather.js,
// because the latter is wrapped by the GroundDB and the admin dashboard needs the unwrapped one.
import {WeatherForecasts} from '../../weathers.js';

export function updateForecast(bulletin, usedLanguage){

  Meteor.settings.public.languages.forEach((lang)=>{
    if( lang == usedLanguage ){
      doUpdateForecast(bulletin);
    }
    else{
      const bulletinForLang = findBulletinForLang(bulletin, lang);
      if( bulletinForLang ){
        copyWeatherSymbols(bulletin, bulletinForLang);
        doUpdateForecast(bulletinForLang);
      }
      else{
        console.warn("There is no Samoan bulletin for "+bulletin.issued_at+" "+bulletin.name);
      }

    }
  })

}

export function doUpdateForecast(bulletin){
  WeatherForecasts.update(
    {_id: bulletin._id},
    {"$set": {forecasts: bulletin.forecasts, in_effect: true}}
  );
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
