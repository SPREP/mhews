import { Meteor } from 'meteor/meteor';
import React from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import ListItem from 'material-ui/List/ListItem';
import Avatar from 'material-ui/Avatar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';


import {WeatherForecasts} from '../api/weather.js';

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
* This page should show the latest weather forecast.
* The latest forecast should be retrieved from the SmartMet product.
*/
export class WeatherPage extends React.Component {

  constructor(props){
    super(props);
    if( this.props.phenomena && this.validatePhenomena()){
      this.weather = this.props.phenomena;
    }
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
    const district = this.getDisplayDistrict();
    const districtForecast = forecast.getDistrictForecast(district, displayDate);
    const forecastText = districtForecast.forecast;

    return (
      <Card>
        <CardMedia
          overlay={<CardTitle title="Situation" subtitle={situation} />}
          >
          <img src="images/samoa-6792.jpg" />
        </CardMedia>
        <CardTitle title={displayDate.toDateString()} subtitle={district} />
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

  /* Get the current language setting */
  getLanguage(){
    return "ws";
  }

  getDisplayDate(dates){
    return this.state.displayDate ? this.state.displayDate : dates[0];
  }

  getDisplayDistrict(){
    return "upolu-north-northwest";
  }

  render(){
    const forecast = WeatherForecasts.getLatestForecast(this.getLanguage());

    return forecast ? this.renderForecast(forecast) : this.renderNoForecast();
  }
}

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
