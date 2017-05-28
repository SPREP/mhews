import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import WeatherForecasts from '../api/client/weather.js';
import {Preferences} from '../api/client/preferences.js';

/* i18n */
import { translate } from 'react-i18next';

import {WeatherForecastForMobile} from './WeatherForecastForMobile.jsx';
import {WeatherForecastForPC} from './WeatherForecastForPC.jsx';

import {getForecastsForDisplay} from '../api/weatherutils.js';

/**
* This page should show the latest weather forecast.
* The latest forecast should be retrieved from the SmartMet product.
*/
class WeatherPage extends React.Component {

  shouldComponentUpdate(nextProps, _nextState){
    if( this.props.district != nextProps.district ){
      return true;
    }
    if( this.props.forecast != nextProps.forecast ){
      return true;
    }
    if( this.props.connected != nextProps.connected ){
      return true;
    }

    return false;
  }

  validatePhenomena(){
    return true;
  }

  renderForecast(bulletin){
    const issuedAt = bulletin.issued_at;
    const situation = bulletin.situation;
    const dates = bulletin.listForecastDates();
    const district = this.props.district;
    const forecasts = getForecastsForDisplay(dates, bulletin, district);
    const t = this.props.t;

    if( Meteor.isCordova ){
      return (
        <WeatherForecastForMobile
          t={t}
          dates={dates}
          issuedAt={issuedAt}
          situation={situation}
          forecasts={forecasts}
        />
      )

    }
    else{
      return (
        <WeatherForecastForPC
          t={t}
          dates={dates}
          issuedAt={issuedAt}
          situation={situation}
          forecasts={forecasts}
        />
      )

    }
  }

  renderNoForecast(){
    const t = this.props.t;

    return (
      <p>{t('no_weather_forecast_error')}</p>
    )
  }

  render(){
    console.log("Weather.render()");

    const forecast = this.props.forecast;

    if( forecast ){
      return this.renderForecast(forecast);
    }
    else{
      return this.renderNoForecast();
    }
  }
  dateTimeToString(dateTime){
    return moment(dateTime).format("YYYY-MM-DD HH:mm");
  }

}

WeatherPage.propTypes = {
  loaded: React.PropTypes.bool,
  forecast: React.PropTypes.object,
  district: React.PropTypes.string,
  t: React.PropTypes.func,
  connected: React.PropTypes.bool
}

const WeatherPageContainer = createContainer(()=>{
  let language = Preferences.load("language");
  let district = Preferences.load("district");
  let loaded = Preferences.isLoaded();

  return {
    loaded,
    district,
    forecast: language ? WeatherForecasts.getLatestForecast(language) : undefined,
    connected: Meteor.status().connected
  }
}, WeatherPage);

export default translate(['common'])(WeatherPageContainer);
