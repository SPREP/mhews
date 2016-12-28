import React from 'react';
import {Card, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import i18n from 'i18next';
import { createContainer } from 'meteor/react-meteor-data';

import {WeatherForecasts} from '../api/weather.js';
import {Preferences} from '../api/preferences.js';

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const surfaceChartUrl = "http://www.samet.gov.ws/images/surface_chart/latest.png";

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
    const cardTitle = (<CardTitle title="" subtitle={"Situation: "+situation} />);

    if( this.props.connected ){
      if( this.state.displayCardMediaTitle ){
        return (
          <CardMedia
            overlay={cardTitle}
            onTouchTap={()=>{this.toggleDisplayCardMediaTitle()}}>
            <img src={surfaceChartUrl} />
          </CardMedia>
        );

      }
      else{
        return (
          <CardMedia
            onTouchTap={()=>{this.toggleDisplayCardMediaTitle()}}>
            <img src={surfaceChartUrl} />
          </CardMedia>
        );

      }
    }
    else{
      return cardTitle;
    }
  }

  toggleDisplayCardMediaTitle(){
    this.setState({displayCardMediaTitle: !this.state.displayCardMediaTitle});
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
    const subtitle = this.props.t("district."+district) + " - " + "Issued at "+this.dateTimeToString(issuedAt);

    return (
      <Card>
        {
          compact ? "" : this.renderSituation(situation)
        }
        <CardTitle
           title={this.dateToString(displayDate)}
           subtitle={subtitle} 
         />
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
    return moment(dateTime).format("YYYY-MM-DD hh:mm:ss");
  }
}

WeatherPage.propTypes = {
  forecast: React.PropTypes.object,
  district: React.PropTypes.string,
  t: React.PropTypes.func,
  compact: React.PropTypes.bool,
  connected: React.PropTypes.bool
}

const WeatherPageContainer = createContainer(({t, handles, compact})=>{
  const handle = handles["weatherForecast"];
  if( !handle ){
    console.error("handle for weatherForecast was not given!");
    return;
  }
  const district = Preferences.load("district");
  const language = i18n.language;

  return {
    t,
    district,
    forecast: WeatherForecasts.getLatestForecast(language),
    compact,
    connected: Meteor.status().connected
  }
}, WeatherPage);

export default WeatherPageContainer;
