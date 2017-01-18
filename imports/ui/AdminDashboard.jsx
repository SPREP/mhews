import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import Snackbar from 'material-ui/Snackbar';
import MenuItem from 'material-ui/MenuItem';

import { createContainer } from 'meteor/react-meteor-data';

import {MongoWeatherForecasts} from '../api/weather.js';
import {weatherIcons} from '../api/weatherIcons.js';

const style = {
  margin: 12,
};

const iconInactiveStyle = {
  padding: "8px",
  width: "32px",
  height: "32px"
//  filter: "opacity(20%)"
//  opacity: 0.2,
}

const iconActiveStyle = {
  padding: "8px",
  width: "32px",
  height: "32px",
  border: "2px solid blue"
}

// FIXME Word-wrapping does not work as expected ...
const forecastTextStyle = {
  width: "400pt",
  "wordWrap": "break-word"
}

const tableStyle = {
  "tableLayout": "fixed"
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

class WeatherSymbolTable extends React.Component {

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
      const iconImage = "images/weather/"+icons[iconSymbol];
      if( iconSymbol == selectedSymbol ){
        return (
          <td>
            <img src={iconImage}
              title={iconSymbol}
              style={iconActiveStyle}/>
          </td>
        )
      }
      else{
        return (
          <td>
            <img src={iconImage}
              title={iconSymbol}
              style={iconInactiveStyle}
              onClick={()=>{this.props.onClickWeatherSymbol(forecastText, iconSymbol)}}
            />
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

WeatherSymbolTable.propTypes ={
  weatherSymbols: React.PropTypes.object,
  onClickWeatherSymbol: React.PropTypes.func
}

class AdminDashboard extends React.Component {

  constructor(props){
    super(props);
    this.updateForecasts = this.updateForecasts.bind(this);
    this.changeIcon = this.changeIcon.bind(this);

    // Hashmap from the forecast text to weather symbols.
    console.log("AdminDashboard constructor");
    this.weatherSymbols = {};
    this.state = {
      selectedDate: null,
      onClickCount: 0,
      updateSaved: false
    }
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
  }

  changeIcon(forecastText, symbol){
    console.log("symbol "+symbol+" was clicked.");
    this.weatherSymbols[forecastText] = symbol;
    // Count up just to trigger re-rendering
    this.setState({onClickCount: this.state.onClickCount + 1, updateSaved: false});
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

  renderTableAndButton(date){
    this.forecastBulletin = this.props.getForecast(date);

    if( !this.forecastBulletin ){
      console.log("There is no forecast for "+date);
      return "";
    }
    this.fillInWeatherSymbols();
    return (
      <div>
        <WeatherSymbolTable
          weatherSymbols={this.weatherSymbols}
          onClickWeatherSymbol={this.changeIcon}
        />
        <RaisedButton
          label="Update"
          primary={true}
          style={style}
          onTouchTap={this.updateForecasts}
        />
      </div>
    );
  }

  render(){
    console.log("AdminDashboard.render()");

    let selectedDate = this.state.selectedDate;
    if( !selectedDate && this.props.effectiveDates && this.props.effectiveDates.length > 0){
      selectedDate = this.props.effectiveDates[0];
    }

    return (
      <MuiThemeProvider>
        <div>
          <DateDropDownMenu dates={this.props.effectiveDates}
            onChange={(date)=>{
              this.weatherSymbols = {};
              this.setState({selectedDate: date});
            }}
          />
          {
            selectedDate ? this.renderTableAndButton(selectedDate) : ""
          }
          <Snackbar
            open={this.state.updateSaved}
            message="Updated the weather icons"
            autoHideDuration={4000}
            onRequestClose={this.handleSnackbarClose}
          />
        </div>
      </MuiThemeProvider>
    )
  }

  handleSnackbarClose(){
    this.setState({
      updateSaved: false
    })
  }

  // Update the weather forecasts with the selected weather symbols.
  updateForecasts(){
    const bulletin = this.forecastBulletin;
    bulletin.forecasts.forEach((forecast)=>{
      const forecastText = forecast.forecast;
      forecast.weatherSymbol = this.weatherSymbols[forecastText];
    });

    updateForecast(bulletin);
    const bulletinSamoan = findBulletinSamoan(bulletin);
    if( bulletinSamoan ){
      copyWeatherSymbols(bulletin, bulletinSamoan);
      updateForecast(bulletinSamoan);
    }
    else{
      console.warn("There is no Samoan bulletin for "+bulletin.issued_at+" "+bulletin.name);
    }
    this.setState({updateSaved: true});
  }
}

function getHeaderText(weatherSymbol){
  if( weatherSymbol == "heavyRain"){
    return "heavy rain";
  }
  if( weatherSymbol == "partlyCloudy"){
    return "partly cloudy";
  }
  return weatherSymbol;
}

function updateForecast(bulletin){
  MongoWeatherForecasts.update(
    {_id: bulletin._id},
    {"$set": {forecasts: bulletin.forecasts, in_effect: true}}
  );
}

AdminDashboard.propTypes = {
  effectiveDates: React.PropTypes.array,
  getForecast: React.PropTypes.func
};

function findBulletinSamoan(bulletin){

  return MongoWeatherForecasts.findOne(
    {
      name: bulletin.name,
      issued_at: bulletin.issued_at,
      lang: "ws"
    }
  );
}

function copyWeatherSymbols(bulletin, bulletinSamoan){
  const forecastsSamoan = bulletinSamoan.forecasts;
  bulletin.forecasts.forEach((forecast)=>{
    const forecastSamoan = findInArray(forecastsSamoan, (element)=>{
      return (element.district == forecast.district) &&
      (moment(element.date).isSame(forecast.date));
    });
    if( forecastSamoan ){
      forecastSamoan.weatherSymbol = forecast.weatherSymbol;
    }
    else{
      console.warn("There is no forecast for "+forecast.district+" "+forecast.date);
    }
  });

}

function findInArray(array, condition){
  for(let i= 0; i< array.length; i++){
    const element = array[i];
    if( condition(element) ) return element;
  }

  return null;
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

const AdminDashboardContainer = createContainer(()=>{
  const effectiveDates = listLatestForecastDates();
  console.log("effectiveDates = "+JSON.stringify(effectiveDates));

  return {
    effectiveDates,
    getForecast
  };

}, AdminDashboard);

export default AdminDashboardContainer;
