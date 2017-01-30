import React from 'react';
import {Card, CardHeader, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { createContainer } from 'meteor/react-meteor-data';
import SwipeableViews from 'react-swipeable-views';

import {WeatherForecasts} from '../api/client/weather.js';
import {Preferences} from '../api/client/preferences.js';
import {WeatherForecastObserver} from '../api/client/weatherForecastObserver.js';
import {Town} from '../api/towninfo.js';

import {weatherIcons, selectPredominantWeatherSymbol} from '../api/weatherIcons.js';
import SunCalc from 'suncalc';
import {Moon} from '../api/moonutils.js';
import DailyTideTableContainer from './TideTable.jsx';
import {SmallCard} from './SmallCard.jsx';

/* i18n */
import { translate } from 'react-i18next';

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

class Nowcast extends React.Component {

  render(){
    const forecast = this.props.forecast;
    const title = dateToString(forecast.date, this.props.t);
    const subtitle = this.props.t("districts."+forecast.district);
    const weatherIcon = getWeatherIcon(this.getWeatherSymbolForNow(forecast.weatherSymbols), moment());
    const weatherSymbols = forecast.weatherSymbols.length > 1 ? forecast.weatherSymbols : [];
    const listInterval = 24 / forecast.weatherSymbols.length;

    return (
      <div style={{padding: "16px"}}>
        <div style={{paddingBottom: "0px"}}>
          <div style={{display: "inline-block", "verticalAlign": "top", maxWidth: "100%"}}>
            <div style={{paddingBottom: "8px", display: "inline-block", "verticalAlign": "middle"}}>
              <div style={{"fontSize": "14pt"}}>{title}</div>
              <div style={{"fontSize": "10pt"}}>{subtitle}</div>
            </div>
            {/*
            <div style={{"display": "inline-block", "verticalAlign": "middle", "width": "40%"}}>
              <img src={weatherIcon}
                style={{width: "64px", height: "64px"}}
              />
            </div>
            */}
            <div>
              {
                weatherSymbols.map((symbol, index)=>{
                  const startHour = index * listInterval;
                  const endHour = (index+1) * listInterval;
                  const referenceHour = (startHour + endHour) / 2;
                  const text = this.formatForecastPeriod(startHour, endHour);
                  return (
                    <NowcastBadge
                      key={index}
                      icon={getWeatherIcon(symbol, moment().hour(referenceHour))}
                      text={text}/>
                  )
                })
              }
            </div>
          </div>
        </div>
        <CardText style={{padding: "0px", paddingTop: "8px", paddingBottom: "16px"}}>
          {forecast.text}
        </CardText>
        <AdditionalInfo t={this.props.t} forecast={forecast} />
      </div>
    )
  }

  formatForecastPeriod(startHour, endHour){
    return startHour + "-" + endHour;
  }

  getWeatherSymbolForNow(weatherSymbols){
    const hoursPerDay = 24;
    const currentHour = moment().hour();
    const interval = hoursPerDay / weatherSymbols.length;
    const index = Math.floor(currentHour / interval);
    return weatherSymbols[index];
  }
}

Nowcast.propTypes = {
  t: React.PropTypes.func,
  forecast: React.PropTypes.object
}

class AdditionalInfo extends React.Component {

  render(){
    const t = this.props.t;
    const forecast = this.props.forecast;
    const moon = new Moon(forecast.date);
    const sunrise = moment(forecast.sunrise).format("HH:mm");
    const sunset = moment(forecast.sunset).format("HH:mm");

    return (
      <div>
        <SmallCard icon="images/weather/dawn.png" text={sunrise} />
        <SmallCard icon="images/weather/sunset.png" text={sunset} />
        <SmallCard icon={moon.getIcon()} text={t("moon_phase."+moon.getName())} />
        <DailyTideTableContainer date={forecast.date}/>
      </div>

    )
  }
}

AdditionalInfo.propTypes = {
  t: React.PropTypes.func,
  forecast: React.PropTypes.object
}

class NowcastBadge extends React.Component {

  render(){
    return (
      <div style={{"paddingRight": "16px", display: "inline-block", "verticalAlign": "top"}}
        onTouchTap={this.props.onTouchTap}>
        <img src={this.props.icon} style={{width: "48px", height: "48px"}}/>
        <div style={{"fontSize": "10pt", width: "48px", "textAlign": "center"}}>
          {this.props.text}
        </div>
      </div>

    )
  }
}

NowcastBadge.propTypes = {
  icon: React.PropTypes.string,
  text: React.PropTypes.string,
  onTouchTap: React.PropTypes.func
}

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

const WeatherSituationImageContainer = createContainer(({cardTitle, imageHandler})=>{
  return {
    cardTitle,
    image: imageHandler.getSource()
  }

}, WeatherSituationImage);

class WeatherSituation extends React.Component {

  render(){
    const t = this.props.t;
    console.log("WeatherSituation.render()");

    const cardTitle = (<CardTitle title={t("Situation")} subtitle={this.props.situation} />);
    let key = 0;
    console.log("getHandlers().length = "+WeatherForecastObserver.getHandlers().length);

    return (
      <SwipeableViews>
        {
          WeatherForecastObserver.getHandlers().map((imageHandler)=>{
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
        key={dateToString(forecast.date, this.props.t)}
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
            forecasts.map((forecast) => {
              return (
                <Nowcast
                  key={dateToString(forecast.date, this.props.t)}
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

  getShortDateStr(date){
    const t = this.props.t;

    return t("month."+Months[date.getMonth()]) + "-" + date.getDate();
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

function getDayOfDate(dateTime, t){
  const day = t("weekdays."+WeekDays[dateTime.getDay()]);
  return day;
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

// Convert a date object into string depending on the set language.
function dateToString(date, t){
  const day = t("weekdays."+WeekDays[date.getDay()]);
  const month = t("month."+Months[date.getMonth()]);
  return month+" "+date.getDate()+" ("+day+")";
}

function getLocationForDistrict(_district){
  // Just return Apia for now.
  // TODO Set a representing location of each district, and return the location.
  return Town.Apia;
}

// The referenceTime must be a moment object
function getWeatherIcon(weatherSymbol, referenceTime){
  const hour = referenceTime.hour();
  const dayTime = hour > 6 && hour < 18;

  const weatherIcon = dayTime ? weatherIcons.dayTime[weatherSymbol] : weatherIcons.nightTime[weatherSymbol];
  return "images/weather/"+weatherIcon;
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
