import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import { createContainer } from 'meteor/react-meteor-data';

import {MongoWeatherForecasts} from '../api/weather.js';
import {weatherIcons} from '../api/weatherIcons.js';

const style = {
  margin: 12,
};

const iconInactiveStyle = {
  width: "32pt",
  height: "32pt",
  filter: "opacity(20%)"
}

const iconActiveStyle = {
  width: "32pt",
  height: "32pt"
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

  renderIcons(forecastText, selectedSymbol){
    const icons = weatherIcons.dayTime;

    return Object.keys(icons).map((iconSymbol)=>{
      const iconImage = "images/weather/"+icons[iconSymbol];
      if( iconSymbol == selectedSymbol ){
        return (
          <TableRowColumn>
            <img src={iconImage}
              title={iconSymbol}
              style={iconActiveStyle}/>
          </TableRowColumn>
        )
      }
      else{
        return (
          <TableRowColumn>
            <img src={iconImage}
              title={iconSymbol}
              style={iconInactiveStyle}
              onClick={()=>{this.props.onClickWeatherSymbol(forecastText, iconSymbol)}}
            />
          </TableRowColumn>
        )
      }
    })
  }

  render(){
    return (
      <Table selectable={false} style={tableStyle}>
        <TableHeader displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn style={forecastTextStyle}>Forecast text</TableHeaderColumn>
            <TableHeaderColumn>Forecast icons</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {Object.keys(this.props.weatherSymbols).map((forecastText)=>{
            const selectedSymbol = this.props.weatherSymbols[forecastText];
            return (
              <TableRow>
                <TableRowColumn style={forecastTextStyle}>{forecastText}</TableRowColumn>
                {this.renderIcons(forecastText, selectedSymbol)}
              </TableRow>
            );

          })}
        </TableBody>
      </Table>

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
      onClickCount: 0
    }
  }

  changeIcon(forecastText, symbol){
    console.log("symbol "+symbol+" was clicked.");
    this.weatherSymbols[forecastText] = symbol;
    // Count up just to trigger re-rendering
    this.setState({onClickCount: this.state.onClickCount + 1});
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
        </div>
      </MuiThemeProvider>
    )
  }

  // Update the weather forecasts with the selected weather symbols.
  updateForecasts(){
    const bulletin = this.forecastBulletin;
    bulletin.forecasts.forEach((forecast)=>{
      const forecastText = forecast.forecast;
      forecast.weatherSymbol = this.weatherSymbols[forecastText];
    });

    console.log("updateForecasts() "+JSON.stringify(bulletin.forecasts));

    // FIXME: Update the Samoan forecast as well.
    return MongoWeatherForecasts.update(
      {_id: bulletin._id},
      {"$set": {forecasts: bulletin.forecasts}}
    );
  }

}

AdminDashboard.propTypes = {
  effectiveDates: React.PropTypes.array,
  getForecast: React.PropTypes.func
};

function listEffectiveDates(){
  return MongoWeatherForecasts.find(
    {
      in_effect: true,
      lang: "en"
    },
    {
      sort: {'issued_at': -1},
      fields: {issued_at: 1, name: 1}
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
  const effectiveDates = listEffectiveDates();
  console.log("effectiveDates = "+JSON.stringify(effectiveDates));

  return {
    effectiveDates,
    getForecast
  };

}, AdminDashboard);

export default AdminDashboardContainer;
