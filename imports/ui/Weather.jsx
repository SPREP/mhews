import React from 'react';
import {Card, CardHeader, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { createContainer } from 'meteor/react-meteor-data';
import SwipeableViews from 'react-swipeable-views';

import {WeatherForecasts} from '../api/weather.js';
import {Preferences} from '../api/client/preferences.js';

import FileCache from '../api/client/filecache.js';
import {weatherIcons} from '../api/weatherIcons.js';
import SunCalc from 'suncalc';

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
//  const lng = Preferences.load("language");

  forecastCursor = WeatherForecasts.find({lang: "en", in_effect: true});
  forecastCursor.observe({
    added: (forecast)=>{refreshSurfaceChart(forecast)}
  });
}

class WeatherButton extends React.Component {

  render(){
    return (
      <div style={{padding: "8px", display: "inline-block"}}>
        <div>
          <img
            src={this.props.icon}
            style={{width: "32px", height: "32px"}}
            onTouchTap={this.props.onTouchTap}
          />
        </div>
        <div style={{"font-size": "10pt", "text-align": "center"}}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

WeatherButton.propTypes = {
  icon: React.PropTypes.string,
  children: React.PropTypes.node,
  onTouchTap: React.PropTypes.func
}

class SmallCard extends React.Component {
  render(){
    return(
      <div style={{"padding-right": "16px", display: "inline-block"}}>
        <img src={this.props.icon} style={{width: "32px", height: "32px"}}/>
        <div style={{"font-size": "10pt"}}>{this.props.text}</div>
      </div>
    );
  }
}

SmallCard.propTypes = {
  icon: React.PropTypes.string,
  text: React.PropTypes.string
}

class WeatherCardHeader extends React.Component {

  render(){
    return (
      <div style={{"padding": "16px", "padding-bottom": "0px"}}>
        <div style={{display: "inline-block"}}>
          <div style={{"padding-bottom": "8px", display: "inline-block", "vertical-align": "top"}}>
            <div style={{"font-size": "14pt"}}>{this.props.title}</div>
            <div style={{"font-size": "10pt"}}>{this.props.subtitle}</div>
          </div>
          <div>
            <SmallCard icon="images/weather/dawn.png" text={this.props.sunrise} />
            <SmallCard icon="images/weather/sunset.png" text={this.props.sunset} />
            <SmallCard icon={getMoonIcon(this.props.moonphase)}
              text={getMoonPhaseName(this.props.moonphase)}
            />
          </div>
        </div>
        <img src={this.props.icon} style={{width: "96px", height: "96px", "display": "inline-block"}}/>
      </div>
    )
  }
}

WeatherCardHeader.propTypes = {
  icon: React.PropTypes.string,
  title: React.PropTypes.string,
  subtitle: React.PropTypes.string,
  sunrise: React.PropTypes.string,
  sunset: React.PropTypes.string,
  moonphase: React.PropTypes.number,
  weatherSymbol: React.PropTypes.string
}

/**
* This page should show the latest weather forecast.
* The latest forecast should be retrieved from the SmartMet product.
*/
export class WeatherPage extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      displayDate: null,
      displayCardMediaTitle: true
    };
  }

  validatePhenomena(){
    return true;
  }

  renderSituation(situation){
    const cardTitle = (<CardTitle title="Situation" subtitle={situation} />);

    return (
      <SwipeableViews expandable={true}>
        {
          [surfaceChartHandler, satelliteImageHandler].map((imageHandler)=>{
            return (
              <CardMedia
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

  toggleDisplayCardMediaTitle(){
    this.setState({displayCardMediaTitle: !this.state.displayCardMediaTitle});
  }

  getForecastsForDisplay(dates, bulletin, district){
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
      const moonIllumination = SunCalc.getMoonIllumination(date);

      return {
        date: date,
        text: forecastText,
        sunrise: sunlightTimes.sunrise,
        sunset: sunlightTimes.sunset,
        moonphase: moonIllumination.phase,
        weatherSymbol: districtForecast.weatherSymbol,
        icon: weatherIcon,
      }

    });
  }

  renderForecast(bulletin){
    const issuedAt = bulletin.issued_at;
    const situation = bulletin.situation;
    const dates = bulletin.listForecastDates();
    const displayDate = this.getDisplayDate(dates);
    const displayDateIndex = displayDate ? dates.indexOf(displayDate) : 0;
    const district = this.props.district;
    const subtitle = this.props.t("district."+district);
    const forecasts = this.getForecastsForDisplay(dates, bulletin, district);

    // The Weather card expands/shrinks when the CardText is tapped.
    return (
      <Card>
        <CardHeader
          title="Weather Forecast"
          showExpandableButton={true}
          subtitle={"Issued at "+this.dateTimeToString(issuedAt)}
        />
        {this.renderSituation(situation)}
        <SwipeableViews index={displayDateIndex}>
          {
            forecasts.map((forecast) => {
              return (
                <div key={this.dateToString(forecast.date)}>
                  <WeatherCardHeader
                    icon={forecast.icon}
                    title={this.dateToString(forecast.date)}
                    titleStyle={{"fontSize": "14pt"}}
                    subtitle={subtitle}
                    sunrise={moment(forecast.sunrise).format("HH:mm")}
                    sunset={moment(forecast.sunset).format("HH:mm")}
                    moonphase={forecast.moonphase}
                    weatherSymbol={forecast.weatherSymbol}
                  />
                  <CardText>{forecast.text}</CardText>
                </div>)
            })
          }
        </SwipeableViews>
        <CardActions>
          {
            forecasts.map((forecast) => (
              <WeatherButton
                key={this.dateToString(forecast.date)}
                style={{"padding": "5px 5px", "border": "none", "background": "none"}}
                icon={forecast.icon}
                onTouchTap={()=>{this.changeDisplayDate(forecast.date)}}
              >
                {this.getDayOfDate(forecast.date)}
              </WeatherButton>
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
  // Convert a date object into string depending on the set language.
  dateToString(date){
    const t = this.props.t;

    const day = t("weekdays."+WeekDays[date.getDay()]);
    const month = t("month."+Months[date.getMonth()]);
    return month+" "+date.getDate()+" ("+day+")";
  }

  dateTimeToString(dateTime){
    return moment(dateTime).format("YYYY-MM-DD hh:mm");
  }

  getDayOfDate(dateTime){
    const day = this.props.t("weekdays."+WeekDays[dateTime.getDay()]);
    return day;
  }
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

function getMoonIcon(moonPhase){
  // moonPhase is a value between 0.0 and 1.0
  // Map the moonPhase to one of 8 files
  console.log("moonPhase = "+moonPhase);
  const fileIndex = Math.round(moonPhase * 8) % 8;
  return "images/moon/moon-phase-"+fileIndex+".svg";
}

const moonPhaseNames = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent"
];

function getMoonPhaseName(moonPhase){
  const index = Math.round(moonPhase * 8) % 8;
  return moonPhaseNames[index];
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
