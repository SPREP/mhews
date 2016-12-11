import { Meteor } from 'meteor/meteor';
import React from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import ListItem from 'material-ui/List/ListItem';
import Avatar from 'material-ui/Avatar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import i18n from 'i18next';
import { createContainer } from 'meteor/react-meteor-data';

import {WeatherForecasts} from '../api/weather.js';
import {Preferences} from '../api/preferences.js';

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const surfaceChartUrl = "http://www.samet.gov.ws/images/081216_PM.png";

/**
* This page should show the latest weather forecast.
* The latest forecast should be retrieved from the SmartMet product.
*/
export class WeatherPage extends React.Component {

  constructor(props){
    super(props);
    this.state = {displayDate: null};
  }

  validatePhenomena(){
    return true;
  }

  renderForecast(forecast){
    const t = this.props.t;

    const issuedAt = forecast.issued_at;
    const situation = forecast.situation;
    const dates = forecast.listForecastDates();
    const displayDate = this.getDisplayDate(dates);
    const district = this.props.district;
    const districtForecast = forecast.getDistrictForecast(district, displayDate);
    let forecastText;
    if( districtForecast ){
      forecastText = districtForecast.forecast;
    }
    else{
      forecastText = "No forecast is available for district = "+district+" on "+displayDate.toDateString();
    }
    const compact = this.props.compact;

    return (
      <Card>
        {
            compact ? "" : (<CardMedia
              overlay={<CardTitle title="Situation" subtitle={situation} />}
              >
              <img src={surfaceChartUrl} />
            </CardMedia>)
        }
        <CardTitle title={this.dateToString(displayDate)} subtitle={district} />
        <CardText>{forecastText}</CardText>
        <CardActions>
          {
            dates.map((date) => (
              <FlatButton
                key={this.getShortDateStr(date)}
                label={this.getShortDateStr(date)}
                onTouchTap={()=>{this.changeDisplayDate(date)}}/>
            ))
          }
        </CardActions>
      </Card>
    );
  }

  changeDisplayDate(date){
    this.setState({displayDate: date});
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
    const forecast = this.props.forecast;

    if( this.props.loading ){
      return (
        <p>{"Loading ..."}</p>
      )
    }
    else if( forecast ){
      return this.renderForecast(forecast);
    }
    else{
      return this.renderNoForecast();
    }
  }
  // Convert a date object into string depending on the set language.
  dateToString(date){
    const lang = i18n.language;
    const t = this.props.t;

    if( lang == "ws"){
      const day = t("weekdays."+WeekDays[date.getDay()]);
      const month = t("month."+Months[date.getMonth()]);
      return day+" "+month+" "+date.getDate()+" "+date.getFullYear();
    }
    else{
      return date.toDateString();
    }
  }

}


WeatherPage.propTypes = {
  loading: React.PropTypes.bool,
  forecast: React.PropTypes.object,
  district: React.PropTypes.string,
  t: React.PropTypes.func
}

export default WeatherPageContainer = createContainer(({t, handles})=>{
  const handle = handles["weatherForecast"];
  if( !handle ){
    console.error("handle for weatherForecast was not given!");
    return;
  }
  const loading = !handle.ready();
  const district = Preferences.load("district");
  const language = i18n.language;

  return {
    loading,
    t,
    district,
    forecast: loading? null : WeatherForecasts.getLatestForecast(language),
  }
}, WeatherPage);

/**
* Usage: <WeatherTile onClick={callback} />
* This GridTile requires two columns to display the latest weather observation.
*/
export class WeatherMenuTile extends React.Component {
  constructor(props){
    super(props);
  }

  retrieveWeatherObservation(){
    // TODO This should be cached to avoid unnecessary server access.
    return {city: 'Apia', weather: 'Sunny', temperature: 25.3};
  }

  generateTitle(observation){
    return observation.city + " " + observation.temperature + "C";
  }

  getImageName(observation){
    return "images/weather/Sunny.png";
  }

  render(){
    const observation = this.retrieveWeatherObservation();

    return (
      <ListItem
        leftAvatar={<Avatar src={this.getImageName(observation)}></Avatar>}
        primaryText={this.generateTitle(observation)}
        onTouchTap={() => this.props.onTouchTap()}
        />
    )
  }
}
