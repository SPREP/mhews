import React from 'react';
import {Card, CardHeader, CardActions, CardMedia, CardTitle} from 'material-ui/Card';
import { createContainer } from 'meteor/react-meteor-data';
import SwipeableViews from 'react-swipeable-views';

import WeatherForecasts from '../api/client/weather.js';
import {Preferences} from '../api/client/preferences.js';
import FileCache from '../api/client/filecache.js';
import {Town} from '../api/towninfo.js';

import {getWeatherIcon, selectPredominantWeatherSymbol} from '../api/weatherIcons.js';
import SunCalc from 'suncalc';
import {SmallCard} from './SmallCard.jsx';
import {Nowcast} from './Nowcast.jsx';

/* i18n */
import { translate } from 'react-i18next';

import {getDayOfDate} from '../api/strutils.js';

class WeatherSituationImage extends React.Component {

  constructor(props){
    super(props);
    this.state = {displayCardMediaTitle : true};
  }

  toggleDisplayCardMediaTitle(){
    this.setState({displayCardMediaTitle: !this.state.displayCardMediaTitle});
  }

  render(){
    console.log("WeatherSituationImage.render()");
    return (
      <CardMedia
        overlay={this.state.displayCardMediaTitle ? this.props.cardTitle : undefined}
        expandable={true}
        onTouchTap={()=>{this.toggleDisplayCardMediaTitle()}}>
        {
          this.props.image ? <img src={this.props.image} /> : <p>"Loading ..."</p>
        }
      </CardMedia>
    );
  }
}

WeatherSituationImage.propTypes = {
  cardTitle: React.PropTypes.node,
  image: React.PropTypes.string
}

const WeatherSituationImageContainer = createContainer(({imageHandler})=>{
  return {
    image: imageHandler.getSource()
  }

}, WeatherSituationImage);

class WeatherSituation extends React.Component {

  constructor(props){
    super(props);
    this.imageUrls = [
      Meteor.settings.public.cacheFiles.surfaceChart,
      Meteor.settings.public.cacheFiles.satelliteImage
    ]
  }

  getImageHandlers(){
    const handlers = [];
    this.imageUrls.forEach((url)=>{
      const handler = FileCache.get(url);
      if( handler ){
        handlers.push(handler);
      }
      else{
        console.error("No handler for image "+url);
      }
    })
    return handlers;
  }

  render(){
    const t = this.props.t;
    console.log("WeatherSituation.render()");

    const cardTitle = (<CardTitle title={t("Situation")} subtitle={this.props.situation} />);
    let key = 0;

    return (
      <SwipeableViews>
        {
          this.getImageHandlers().map((imageHandler)=>{
            key++;
            console.log("getHandlers().map(): key = "+key);
            return (
              <WeatherSituationImageContainer
                key={key}
                cardTitle={cardTitle}
                imageHandler={imageHandler}
              />);
          })
        }
      </SwipeableViews>
    );
  }

}

WeatherSituation.propTypes = {
  t: React.PropTypes.func,
  situation: React.PropTypes.string
}

class ExtendedForecast extends React.Component {
  render(){
    const forecast = this.props.forecast;
    const icon = getWeatherIcon(selectPredominantWeatherSymbol(forecast.weatherSymbols), moment().hour(12));

    return (
      <SmallCard
        key={forecast.date.toString()}
        style={{"padding": "5px 5px", "border": "none", "background": "none"}}
        icon={icon}
        text={getDayOfDate(forecast.date, this.props.t)}
        onTouchTap={()=>{this.props.onSelected(forecast.date)}}
      />
    )
  }

}

ExtendedForecast.propTypes = {
  t: React.PropTypes.func,
  forecast: React.PropTypes.object,
  onSelected: React.PropTypes.func
}

/**
* This page should show the latest weather forecast.
* The latest forecast should be retrieved from the SmartMet product.
*/
export class WeatherPage extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      displayDate: null
    };
  }

  shouldComponentUpdate(nextProps, nextState){
    if( this.props.district != nextProps.district ){
      return true;
    }
    if( this.props.forecast != nextProps.forecast ){
      return true;
    }
    if( this.props.connected != nextProps.connected ){
      return true;
    }
    if( this.state.displayDate != nextState.displayDate ){
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
    const displayDate = this.getDisplayDate(dates);
    const displayDateIndex = displayDate ? dates.indexOf(displayDate) : 0;
    const district = this.props.district;
    const forecasts = getForecastsForDisplay(dates, bulletin, district);
    const t = this.props.t;

    // The Weather card expands/shrinks when the CardText is tapped.
    return (
      <Card>
        <SwipeableViews index={displayDateIndex}>
          {
            forecasts.map((forecast, index) => {
              return (
                <Nowcast
                  key={index}
                  forecast={forecast}
                  t={this.props.t}
                />
              )
            })
          }
        </SwipeableViews>
        <CardActions style={{"paddingTop": "0px", "paddingLeft": "16px"}}>
          {
            forecasts.map((forecast)=>{
              return (
                <ExtendedForecast
                  forecast={forecast}
                  t={this.props.t}
                  onSelected={(date)=>{this.changeDisplayDate(date)}}
                />
              )
            })
          }
        </CardActions>

        <CardHeader
          title={t("Weather")+" "+t("situation")}
          showExpandableButton={true}
          subtitle={t("Issued_at")+" "+this.dateTimeToString(issuedAt)}
        />
        <WeatherSituation t={t} expandable={true} situation={situation} />

      </Card>
    );
  }

  changeDisplayDate(date){
    if( this.state.displayDate != date ){
      this.setState({displayDate: date});
    }
  }

  renderNoForecast(){
    const t = this.props.t;

    return (
      <p>{t('no_weather_forecast_error')}</p>
    )
  }

  getDisplayDate(dates){
    return this.state.displayDate ? this.state.displayDate : dates[0];
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

function getForecastsForDisplay(dates, bulletin, district){
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
  if( loaded ){
    // First time to use the app after the installation.
    // Set the default values.
    if( !language ){
      language = "en";
    }
    if( !district ){
      district = "upolu-north-northwest";
    }
  }

  return {
    loaded,
    district,
    forecast: language ? WeatherForecasts.getLatestForecast(language) : undefined,
    connected: Meteor.status().connected
  }
}, WeatherPage);

export default translate(['common'])(WeatherPageContainer);
