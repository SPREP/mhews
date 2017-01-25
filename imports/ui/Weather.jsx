import React from 'react';
import {Card, CardHeader, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { createContainer } from 'meteor/react-meteor-data';
import SwipeableViews from 'react-swipeable-views';

import {WeatherForecasts} from '../api/client/weather.js';
import {Preferences} from '../api/client/preferences.js';
import {WeatherForecastObserver} from '../api/client/weatherForecastObserver.js';
import {Town} from '../api/towninfo.js';

import {weatherIcons} from '../api/weatherIcons.js';
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
    const moon = new Moon(forecast.date);
    const title = dateToString(forecast.date, this.props.t);
    const subtitle = this.props.t("district."+forecast.district);
    const sunrise = moment(forecast.sunrise).format("HH:mm");
    const sunset = moment(forecast.sunset).format("HH:mm");

    return (
      <div>
        <div style={{"padding": "16px", "paddingTop": "0px", "paddingBottom": "0px"}}>
          <div style={{display: "inline-block", "verticalAlign": "top"}}>
            <div style={{"paddingBottom": "8px", display: "inline-block", "verticalAlign": "middle", "width": "60%"}}>
              <div style={{"fontSize": "14pt"}}>{title}</div>
              <div style={{"fontSize": "10pt"}}>{subtitle}</div>
            </div>
            <div style={{"display": "inline-block", "verticalAlign": "middle", "width": "40%"}}>
              <img src={forecast.icon}
                style={{width: "64px", height: "64px"}}
              />
            </div>
            <div>
              <SmallCard icon="images/weather/dawn.png" text={sunrise} />
              <SmallCard icon="images/weather/sunset.png" text={sunset} />
              <SmallCard icon={moon.getIcon()} text={moon.getName()} />
              <DailyTideTableContainer date={forecast.date}/>
            </div>
          </div>
        </div>
        <CardText style={{"padding": "16px", "paddingTop": "8px", "paddingBottom": "8px"}}>
          {forecast.text}
        </CardText>
      </div>
    )
  }
}

Nowcast.propTypes = {
  t: React.PropTypes.func,
  forecast: React.PropTypes.object
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
    console.log("WeatherSituation.render()");

    const cardTitle = (<CardTitle title="Situation" subtitle={this.props.situation} />);
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
  situation: React.PropTypes.string
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

    // The Weather card expands/shrinks when the CardText is tapped.
    return (
      <Card>
        <CardHeader
          title="Weather Forecast"
          showExpandableButton={true}
          subtitle={"Issued at "+this.dateTimeToString(issuedAt)}
        />
        <WeatherSituation expandable={true} situation={situation} />
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
        <CardActions style={{"paddingTop": "0px"}}>
          {
            forecasts.map((forecast) => (
              <SmallCard
                key={dateToString(forecast.date, this.props.t)}
                style={{"padding": "5px 5px", "border": "none", "background": "none"}}
                icon={forecast.icon}
                text={this.getDayOfDate(forecast.date)}
                onTouchTap={()=>{this.changeDisplayDate(forecast.date)}}
              />
            ))
          }
        </CardActions>
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

  getDayOfDate(dateTime){
    const day = this.props.t("weekdays."+WeekDays[dateTime.getDay()]);
    return day;
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
    const weatherIcon = getWeatherIcon(districtForecast.weatherSymbol);
    const location = getLocationForDistrict(district);
    const sunlightTimes = SunCalc.getTimes(date, location.lat, location.lng);

    return {
      date: date,
      district: district,
      text: forecastText,
      sunrise: sunlightTimes.sunrise,
      sunset: sunlightTimes.sunset,
      weatherSymbol: districtForecast.weatherSymbol,
      icon: weatherIcon,
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

function getWeatherIcon(weatherSymbol){
  return "images/weather/"+weatherIcons.dayTime[weatherSymbol];
}


WeatherPage.propTypes = {
  forecast: React.PropTypes.object,
  district: React.PropTypes.string,
  t: React.PropTypes.func,
  connected: React.PropTypes.bool
}

const WeatherPageContainer = createContainer(()=>{
  const language = Preferences.load("language");

  return {
    district: Preferences.load("district"),
    forecast: WeatherForecasts.getLatestForecast(language),
    connected: Meteor.status().connected
  }
}, WeatherPage);

export default translate(['common'])(WeatherPageContainer);
