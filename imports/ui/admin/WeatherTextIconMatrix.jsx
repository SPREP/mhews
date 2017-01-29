import React from 'react';

import {weatherIcons} from '../../api/weatherIcons.js';
import {WeatherIcon} from './WeatherIcon.jsx';
import {MongoWeatherForecasts} from '../../api/client/weather.js';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';
import RaisedButton from 'material-ui/RaisedButton';

import { createContainer } from 'meteor/react-meteor-data';
import browserHistory from 'react-router/lib/browserHistory';
import {updateForecast, updateForecastSamoan} from '../../api/client/admin/weather.js';

// FIXME Word-wrapping does not work as expected ...
const forecastTextStyle = {
  width: "400pt",
  "wordWrap": "break-word"
}

class DateDropDownMenu extends React.Component {

  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {value: null};
  }

  render(){
    console.log("dates = "+this.props.dates);
    let selectedValue = this.state.value;
    if( !selectedValue && this.props.dates && this.props.dates.length > 0 ){
      selectedValue = this.props.dates[0];
    }
    return (
      <DropDownMenu value={selectedValue} onChange={this.handleChange}>
        {
          this.props.dates.map((date)=>{
            const text = moment(date.issued_at).format("YYYY-MM-DD") + " " + date.name;
            console.log("text = "+text);
            return (
              <MenuItem key={text} value={date} primaryText={text} />
            )
          })
        }
      </DropDownMenu>
    );
  }

  handleChange(_event, _index, value){
    this.setState({value: value});
    this.props.onChange(value);
  }
}

DateDropDownMenu.propTypes = {
  dates: React.PropTypes.array,
  onChange: React.PropTypes.func
}

class WeatherTextIconMatrix extends React.Component {

  constructor(props){
    super(props);
    this.state = {onClickCount: 0};
  }

  renderIconHeaders(){
    const icons = weatherIcons.dayTime;

    return Object.keys(icons).map((iconSymbol)=>{
      return (
        <th style={{width: "64px", "font-size": "10pt", "color": "StaleGrey", "font-weight": "normal"}}>
          {getHeaderText(iconSymbol)}
        </th>
      )
    });
  }

  renderIcons(forecastText, selectedSymbol){
    const icons = weatherIcons.dayTime;

    return Object.keys(icons).map((iconSymbol)=>{
      if( iconSymbol == selectedSymbol ){
        return (
          <td>
            <WeatherIcon symbol={iconSymbol} isSelected={true} />
          </td>
        )
      }
      else{
        return (
          <td>
            <WeatherIcon symbol={iconSymbol} isSelected={false}
              onClick={(symbol)=>{this.props.onClickWeatherSymbol(forecastText, symbol)}} />
          </td>
        )
      }
    })
  }

  render(){
    return (
      <table style={{"font-family": "Roboto, San-serif", "font-size": "12pt"}}>
        <th style={{"font-size": "10pt", "color": "StaleGrey", "font-weight": "normal"}}>{"Forecast text"}</th>
        {this.renderIconHeaders()}
        {Object.keys(this.props.weatherSymbols).map((forecastText)=>{
          const selectedSymbol = this.props.weatherSymbols[forecastText];
          return (
            <tr>
              <td style={forecastTextStyle}>{forecastText}</td>
              {this.renderIcons(forecastText, selectedSymbol)}
            </tr>
          );

        })}

      </table>
    );
  }
}

WeatherTextIconMatrix.propTypes ={
  weatherSymbols: React.PropTypes.object,
  onClickWeatherSymbol: React.PropTypes.func
}

class WeatherTextIconMatrixPage extends React.Component {

  constructor(props){
    super(props);
    this.changeIcon = this.changeIcon.bind(this);
    this.updateForecasts = this.updateForecasts.bind(this);

    this.weatherSymbols = {};
    this.state = {
      selectedDate: null,
      onClickCount: 0
    }

  }

  fillInWeatherSymbols(){
    console.log("fillinWeatherSymbols()");
    console.log(JSON.stringify(this.forecastBulletin.forecasts));

    this.forecastBulletin.forecasts.forEach((forecast)=>{
      if( forecast.forecast != "" ){
        if( !this.weatherSymbols[forecast.forecast] ){
          this.weatherSymbols[forecast.forecast] = forecast.weatherSymbol;
        }
      }
    });

    console.log(JSON.stringify(this.weatherSymbols));
  }

  changeIcon(forecastText, symbol){
    console.log("symbol "+symbol+" was clicked.");
    this.weatherSymbols[forecastText] = symbol;
    // Count up just to trigger re-rendering
    this.setState({onClickCount: this.state.onClickCount + 1});
  }

  renderTableAndButton(date){
    this.forecastBulletin = this.props.getForecast(date);

    if( !this.forecastBulletin ){
      console.log("There is no forecast for "+date);
      return "";
    }
    this.fillInWeatherSymbols();
    return (
      <div>
        <WeatherTextIconMatrix
          weatherSymbols={this.weatherSymbols}
          onClickWeatherSymbol={this.changeIcon}
        />
        <RaisedButton
          label="Next"
          primary={true}
          style={{margin: 12}}
          onTouchTap={()=>{
            this.updateForecasts();
            this.openDayIconMatrixPage(this.forecastBulletin);
          }}
        />
      </div>
    );
  }

  // Update the weather forecasts with the selected weather symbols.
  updateForecasts(){
    const bulletin = this.forecastBulletin;
    const textToWeatherSymbols = this.weatherSymbols;

    bulletin.forecasts.forEach((forecast)=>{
      const forecastText = forecast.forecast;
      const weatherSymbol = textToWeatherSymbols[forecastText];
      // Repeat the same symbol for 4 times (every 6 hours)
      forecast.weatherSymbols = [weatherSymbol, weatherSymbol, weatherSymbol, weatherSymbol];
    });

    updateForecast(bulletin);
    updateForecastSamoan(bulletin);
  }

  openDayIconMatrixPage(bulletin){
    browserHistory.push("/admin/day-weather-matrix/"+bulletin._id);
  }

  render(){
    return (
      <div>
        <DateDropDownMenu dates={this.props.effectiveDates}
          onChange={(date)=>{
            this.weatherSymbols = {};
            this.setState({selectedDate: date});
          }}
        />
        {
          this.state.selectedDate ? this.renderTableAndButton(this.state.selectedDate) : ""
        }
      </div>

    )
  }
}

WeatherTextIconMatrixPage.propTypes = {
  effectiveDates: React.PropTypes.array,
  getForecast: React.PropTypes.func
}

function listLatestForecastDates(){
  return MongoWeatherForecasts.find(
    {
      lang: "en"
    },
    {
      fields: {issued_at: 1, name: 1},
    }

  ).fetch();
}

function getForecast(date){
  return MongoWeatherForecasts.findOne(
    {
      lang: "en",
      issued_at: date.issued_at,
      name: date.name
    }
  );
}

const WeatherTextIconMatrixPageContainer = createContainer(()=>{
  const effectiveDates = listLatestForecastDates();

  return {
    effectiveDates: effectiveDates,
    getForecast
  }

}, WeatherTextIconMatrixPage);

export default WeatherTextIconMatrixPageContainer;

function getHeaderText(weatherSymbol){
  if( weatherSymbol == "heavyRain"){
    return "heavy rain";
  }
  if( weatherSymbol == "partlyCloudy"){
    return "partly cloudy";
  }
  return weatherSymbol;
}
