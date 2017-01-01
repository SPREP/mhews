import React from 'react';
import {Card, CardHeader, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { createContainer } from 'meteor/react-meteor-data';
import SwipeableViews from 'react-swipeable-views';

import {WeatherForecasts} from '../api/weather.js';
import {Preferences} from '../api/client/preferences.js';

import FileCache from '../api/client/filecache.js';

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const surfaceChartUrl = "http://www.samet.gov.ws/images/surface_chart/latest_compact.png";

let surfaceChartHandler;

let forecastCursor;

Meteor.startup(()=>{
  surfaceChartHandler = FileCache.add(surfaceChartUrl);
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

    if( this.state.displayCardMediaTitle ){
      return (
        <CardMedia
          overlay={cardTitle}
          expandable={true}
          onTouchTap={()=>{this.toggleDisplayCardMediaTitle()}}>
          <img src={surfaceChartUrl} />
        </CardMedia>
      );

    }
    else{
      return (
        <CardMedia
          expandable={true}
          onTouchTap={()=>{this.toggleDisplayCardMediaTitle()}}>
          <img src={surfaceChartHandler.getSource()} />
        </CardMedia>
      );

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
    const displayDateIndex = displayDate ? dates.indexOf(displayDate) : 0;
    const district = this.props.district;
    const subtitle = this.props.t("district."+district);

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
            dates.map((date) => {
              const districtForecast = forecast.getDistrictForecast(district, date);
              let forecastText;
              if( districtForecast ){
                forecastText = districtForecast.forecast;
              }
              else{
                forecastText = "No forecast is available for district = "+district+" on "+date.toDateString();
              }

              return (
                <div key={this.dateToString(date)}>
                  <CardTitle
                    title={this.dateToString(date)}
                    titleStyle={{"fontSize": "14pt"}}
                    subtitle={subtitle}
                  />
                  <CardText>{forecastText}</CardText>
                </div>)
            })
          }
        </SwipeableViews>
        <CardActions>
          {
            dates.map((date) => (
              <button
                key={this.dateToString(date)}
                style={{"padding": "5px 5px", "border": "none", "background": "none"}}
                onTouchTap={()=>{this.changeDisplayDate(date)}}
              >
                {this.getDayOfDate(date)}
              </button>
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
