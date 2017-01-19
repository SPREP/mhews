import React from 'react';
import {Card, CardHeader, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { createContainer } from 'meteor/react-meteor-data';
import SwipeableViews from 'react-swipeable-views';

import {WeatherForecasts} from '../api/weather.js';
import {Preferences} from '../api/client/preferences.js';

import FileCache from '../api/client/filecache.js';
import {weatherIcons} from '../api/weatherIcons.js';
import SunCalc from 'suncalc';
import {Moon} from '../api/moonutils.js';
import {DailyTideTableContainer} from './TideTable.jsx';
import {SmallCard} from './SmallCard.jsx';

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const surfaceChartUrl = "http://www.samet.gov.ws/images/surface_chart/latest_compact.png";

const satelliteImageUrl = "http://www.samet.gov.ws/satellite/satellite_image_compact.png";

let surfaceChartHandler;

let satelliteImageHandler;

let forecastCursor;

Meteor.startup(()=>{
  surfaceChartHandler = FileCache.add(surfaceChartUrl);
  satelliteImageHandler = FileCache.add(satelliteImageUrl);
  startObservingWeatherForecast();
});

// Trigger downloading the surface chart when the weather forecast is updated.
// This assumes that the surface chart is updated before the forecast is published.
// (Assumption on the SMD's workflow)
function refreshSurfaceChart(forecast){
  console.log("refreshSurfaceChart() for "+forecast._id);
  if( surfaceChartHandler ){
    surfaceChartHandler.refresh();
  }
}

function startObservingWeatherForecast(){
  console.log("startObservingWeatherForecast()");

  forecastCursor = WeatherForecasts.find({lang: "en", in_effect: true});
  forecastCursor.observe({
    added: (forecast)=>{refreshSurfaceChart(forecast)}
  });
}

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

class WeatherSituation extends React.Component {

  constructor(props){
    super(props);
    this.state = {displayCardMediaTitle : true};
  }

  toggleDisplayCardMediaTitle(){
    this.setState({displayCardMediaTitle: !this.state.displayCardMediaTitle});
  }

  render(){
    const cardTitle = (<CardTitle title="Situation" subtitle={this.props.situation} />);
    let key = 0;

    return (
      <SwipeableViews>
        {
          [surfaceChartHandler, satelliteImageHandler].map((imageHandler)=>{
            key++;

            return (
              <CardMedia
                key={key}
                overlay={this.state.displayCardMediaTitle ? cardTitle : undefined}
                expandable={true}
                onTouchTap={()=>{this.toggleDisplayCardMediaTitle()}}>
                <img src={imageHandler.getSource()} />
              </CardMedia>)
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

const Apia = {
  lat: -13.815605,
  lng: -171.780512
};

function getLocationForDistrict(_district){
  // Just return Apia for now.
  // TODO Set a representing location of each district, and return the location.
  return Apia;
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

const WeatherPageContainer = createContainer(({t})=>{
  const language = Preferences.load("language");

  return {
    t,
    district: Preferences.load("district"),
    forecast: WeatherForecasts.getLatestForecast(language),
    connected: Meteor.status().connected
  }
}, WeatherPage);

export default WeatherPageContainer;
