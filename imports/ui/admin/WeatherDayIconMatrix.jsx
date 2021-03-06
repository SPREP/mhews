import React from 'react';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import Snackbar from 'material-ui/Snackbar';
import MenuItem from 'material-ui/MenuItem';

import {weatherIcons} from '../../api/weatherIcons.js';
import {WeatherIcon} from './WeatherIcon.jsx';

import { createContainer } from 'meteor/react-meteor-data';
import {WeatherForecasts} from '../../api/weathers.js';
import {updateForecast} from '../../api/client/admin/weather.js';

import '../css/Admin.css';

const lang = "en";

class DistrictDropDownMenu extends React.Component {

  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {value: null};
  }

  shouldComponentUpdate(nextProps, _nextState){
    if( !nextProps.districts ){
      return false;
    }
    return true;
  }

  render(){

    if( !this.props.districts ){
      return <div></div>
    }

    let selectedValue = this.state.value;
    if( !selectedValue && this.props.districts && this.props.districts.length > 0 ){
      selectedValue = this.props.districts[0];
    }
    return (
      <DropDownMenu value={selectedValue} onChange={this.handleChange}>
        {
          this.props.districts.map((district)=>{
            const text = district;
            return (
              <MenuItem key={text} value={district} primaryText={text} />
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

DistrictDropDownMenu.propTypes = {
  districts: React.PropTypes.array,
  onChange: React.PropTypes.func
}

class WeatherDayIconMatrix extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      onClickCount: 0,
      dialogOpen: false,
      selectedForecast: null,
      selectedIndex: -1
    };
  }

  render(){
    const forecasts = this.props.forecasts;

    return (
      <div>
        <table className="weatherTable">
          <tr>
            <th className="adminWeatherTable" style={{width: "100px"}}>Day</th>
            <th className="adminWeatherTable" style={{width: "300px"}}>Forecast</th>
            <th className="adminWeatherTable" style={{width: "64px"}}> 0-6</th>
            <th className="adminWeatherTable" style={{width: "64px"}}> 6-12</th>
            <th className="adminWeatherTable" style={{width: "64px"}}>12-18</th>
            <th className="adminWeatherTable" style={{width: "64px"}}>18-24</th>
          </tr>

          {
            forecasts.map((forecast)=>{
              return (
                <tr>
                  <td>{moment(forecast.date).format("YYYY-MM-DD")}</td>
                  <td>{forecast.forecast}</td>
                  {
                    forecast.weatherSymbols.map((symbol, index)=>{
                      return (
                        <td>
                          <WeatherIcon
                            symbol={symbol}
                            isSelected={false}
                            onClick={(symbol)=>{this.openIconSelector(forecast, index, symbol)}}
                          />
                        </td>

                      )
                    })
                  }
                </tr>
              )
            })
          }
        </table>
        <Dialog open={this.state.dialogOpen}>
          {
            this.renderIcons(this.state.selectedForecast, this.state.selectedIndex)
          }
        </Dialog>
      </div>
    )
  }

  openIconSelector(forecast, index, _symbol){
    this.setState({selectedForecast: forecast, selectedIndex: index, dialogOpen: true});
  }

  renderIconHeaders(){
    const icons = weatherIcons.dayTime;

    return Object.keys(icons).map((iconSymbol)=>{
      return (
        <th className="weatherTable" style={{width: "64px"}}>
          {getHeaderText(iconSymbol)}
        </th>
      )
    });
  }

  renderIcons(forecast, index, selectedSymbol){
    const icons = weatherIcons.dayTime;

    return Object.keys(icons).map((iconSymbol)=>{
      return (
        <td>
          <WeatherIcon
            symbol={iconSymbol}
            isSelected={iconSymbol == selectedSymbol}
            onClick={(symbol)=>{
              this.changeIcon(forecast, index, symbol);
              this.setState({dialogOpen: false})
            }}
          />
        </td>
      )
    });

  }

  changeIcon(forecast, index, symbol){
    forecast.weatherSymbols[index] = symbol;
    this.setState({onClickCount: this.state.onClickCount + 1});
  }
}

WeatherDayIconMatrix.propTypes ={
  forecasts: React.PropTypes.array
}

class WeatherDayIconMatrixPage extends React.Component {

  constructor(props){
    super(props);
    this.state = {updateSaved: false, updateFailed: false};
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);

  }

  render(){
    if( !this.props.bulletin ){
      return <div></div>;
    }
    return (
      <div>
        <DistrictDropDownMenu
          districts={this.props.districts}
          onChange={(district)=>{this.setState({district: district})}}/>
        <WeatherDayIconMatrix
          forecasts={filterByDistrict(this.props.bulletin.forecasts, this.state.district)} />
        <RaisedButton
          label="Update"
          primary={true}
          style={{margin: 12}}
          onTouchTap={()=>{
            this.updateForecasts();
          }}
        />
        <Snackbar
          open={this.state.updateSaved || this.state.updateFailed}
          message={this.state.updateFailed ? "Failed to update the weather icons": "Updated the weather icons"}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose}
        />

      </div>
    )
  }

  handleSnackbarClose(){
    this.setState({
      updateSaved: false,
      updateFailed: false
    })
  }


  updateForecasts(){
    updateForecast(this.props.bulletin, lang, (err)=>{
      if( err ){
        this.setState({
          updateFailed: true
        })
      }
      else{
        this.setState({
          updateSaved: true
        })
      }
    });
  }
}

WeatherDayIconMatrixPage.propTypes ={
  bulletin: React.PropTypes.object,
  districts: React.PropTypes.array
}

function filterByDistrict(forecasts, district){
  const filtered = [];
  if( district ){
    forecasts.forEach((forecast)=>{
      if( forecast.district == district ){
        filtered.push(forecast);
      }
    });
  }
  return filtered;
}

function listDistricts(forecasts){
  const tempMap = {};
  forecasts.forEach((forecast)=>{
    tempMap[forecast.district] = 1;
  })
  return Object.keys(tempMap);
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

const WeatherDayIconMatrixContainer = createContainer(({params})=>{
  const id = params.id;
  const bulletin = WeatherForecasts.findOne({_id: id});

  const districts = bulletin ? listDistricts(bulletin.forecasts) : [];

  return {
    bulletin,
    districts
  }
}, WeatherDayIconMatrixPage);

export default WeatherDayIconMatrixContainer;
