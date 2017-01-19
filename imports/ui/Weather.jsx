import React from 'react';
import {Card, CardHeader, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { createContainer } from 'meteor/react-meteor-data';
import SwipeableViews from 'react-swipeable-views';

import {WeatherForecasts} from '../api/weather.js';
import {Preferences} from '../api/client/preferences.js';
import {TideTableCollection} from '../api/tidetable.js';

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

class TideTableView extends React.Component {

  render(){
    return (
      <table style={{"padding-left": "8px", "font-size": "10pt", display: "inline-block", "vertical-align": "top"}}>
        <th>Tide</th>
        <th>Time</th>
        <th>Height</th>
        {
          this.props.tideTable.map((tide)=>{
            return (
              <tr>
                <td>{tide.tide}</td>
                <td>{tide.time}</td>
                <td>{tide.height+"m"}</td>
              </tr>
            )
          })
        }
      </table>
    )
  }
}

TideTableView.propTypes = {
  tideTable: React.PropTypes.array
}

const TideTableViewContainer = createContainer(({date})=>{
  return {
    tideTable: TideTableCollection.find({
      dateTime: {
        "$gte": moment(date).startOf('day').toDate(),
        "$lte": moment(date).endOf('day').toDate()
      }
    }).fetch()
  }
}, TideTableView);

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
      <div style={{"padding-right": "16px", display: "inline-block", "vertical-align": "top"}}>
        <img src={this.props.icon} style={{width: "32px", height: "32px"}}/>
        <div style={{"font-size": "10pt", width: "34px"}}>{this.props.text}</div>
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
    const adjustedMoonPhase = adjustMoonPhase(this.props.moonphase, this.props.date);

    return (
      <div style={{"padding": "16px", "padding-top": "0px", "padding-bottom": "0px"}}>
        <div style={{display: "inline-block", "vertical-align": "top"}}>
          <div style={{"padding-bottom": "8px", display: "inline-block", "vertical-align": "middle", "width": "60%"}}>
            <div style={{"font-size": "14pt"}}>{this.props.title}</div>
            <div style={{"font-size": "10pt"}}>{this.props.subtitle}</div>
          </div>
          <div style={{"display": "inline-block", "vertical-align": "middle", "width": "40%"}}>
            <img src={this.props.icon}
              style={{width: "64px", height: "64px"}}
            />
          </div>
          <div>
            <SmallCard icon="images/weather/dawn.png" text={this.props.sunrise} />
            <SmallCard icon="images/weather/sunset.png" text={this.props.sunset} />
            <SmallCard icon={getMoonIcon(adjustedMoonPhase)}
              text={getMoonName(adjustedMoonPhase)}
            />
            <TideTableViewContainer date={this.props.date}/>
          </div>
        </div>
      </div>
    )
  }
}

WeatherCardHeader.propTypes = {
  date: React.PropTypes.object,
  icon: React.PropTypes.string,
  title: React.PropTypes.string,
  subtitle: React.PropTypes.string,
  sunrise: React.PropTypes.string,
  sunset: React.PropTypes.string,
  moonphase: React.PropTypes.number,
  weatherSymbol: React.PropTypes.string
}

class WeatherCardText extends React.Component {

  render(){
    return (
      <CardText style={{"padding": "16px", "padding-top": "8px", "padding-bottom": "8px"}}>
        {this.props.children}
      </CardText>
    );
  }
}

WeatherCardText.propTypes = {
  children: React.PropTypes.node
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
                    date={forecast.date}
                    icon={forecast.icon}
                    title={this.dateToString(forecast.date)}
                    titleStyle={{"fontSize": "14pt"}}
                    subtitle={subtitle}
                    sunrise={moment(forecast.sunrise).format("HH:mm")}
                    sunset={moment(forecast.sunset).format("HH:mm")}
                    moonphase={forecast.moonphase}
                    weatherSymbol={forecast.weatherSymbol}
                  />
                  <WeatherCardText>{forecast.text}</WeatherCardText>
                </div>)
            })
          }
        </SwipeableViews>
        <CardActions style={{"padding-top": "0px"}}>
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
    return moment(dateTime).format("YYYY-MM-DD HH:mm");
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

function getMoonIcon(adjustedMoonPhase){

  const fileIndex = adjustedMoonPhase;
  return "images/moon/moon-phase-"+fileIndex+".svg";
}

const moonNames = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent"
];

function adjustMoonPhase(moonPhase, date){
    if( isClosest(moonPhase, 0.0, date)){
    return 0;
  }
  else if( isClosest(moonPhase, 0.25, date)){
    return 2;
  }
  else if( isClosest(moonPhase, 0.5, date)){
    return 4;
  }
  else if( isClosest(moonPhase, 0.75, date)){
    return 6;
  }
  else if( moonPhase > 0.0 && moonPhase < 0.25 ){
    return 1;
  }
  else if( moonPhase > 0.25 && moonPhase < 0.5 ){
    return 3;
  }
  else if( moonPhase > 0.5 && moonPhase < 0.75 ){
    return 5;
  }
  else{
    return 7;
  }
}

function getMoonName(adjustedMoonPhase){

  return moonNames[adjustedMoonPhase];
}

// Check if moonPhase of the given date is closest to the targetPhase,
// compared to the previous and next day of the given day.
function isClosest(moonPhase, targetPhase, date){
  const phasePrevDay = SunCalc.getMoonIllumination(moment(date).subtract(1, 'days')).phase;
  const phaseNextDay = SunCalc.getMoonIllumination(moment(date).add(1, 'days')).phase;

  return phaseDelta(moonPhase, targetPhase) < phaseDelta(phasePrevDay, targetPhase) &&
         phaseDelta(moonPhase, targetPhase) < phaseDelta(phaseNextDay, targetPhase);
}

// This function adjust the modulous
function phaseDelta(phase1, phase2){
  const delta = Math.abs(phase1 - phase2);
  return Math.min(delta, Math.abs(delta - 1.0));
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
