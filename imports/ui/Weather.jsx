import React from 'react';
import {Card, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
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
    const subtitle = district + " - " + "issued at "+this.dateToString(issuedAt);

    return (
      <Card>
        {
          compact ? "" : (<CardMedia
            overlay={<CardTitle title="Situation" subtitle={situation} />}
            >
              <img src={surfaceChartUrl} />
            </CardMedia>
          )
        }
        <CardTitle title={this.dateToString(displayDate)} subtitle={subtitle} />
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
  t: React.PropTypes.func,
  compact: React.PropTypes.bool
}

const WeatherPageContainer = createContainer(({t, handles})=>{
  const handle = handles["weatherForecast"];
  if( !handle ){
    console.error("handle for weatherForecast was not given!");
    return;
  }
  const loading = false;
  const district = Preferences.load("district");
  const language = i18n.language;

  return {
    loading,
    t,
    district,
    forecast: loading? null : WeatherForecasts.getLatestForecast(language),
  }
}, WeatherPage);

export default WeatherPageContainer;
