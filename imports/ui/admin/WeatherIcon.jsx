import React from 'react';

import {weatherIcons} from '../../api/weatherIcons.js';

import '../css/Admin.css';

export class WeatherIcon extends React.Component {

  render(){
    const icons = weatherIcons.dayTime;

    const iconImage = "/images/weather/"+icons[this.props.symbol];

    return (
      <img src={iconImage}
        title={this.props.symbol}
        className={this.props.isSelected ? "adminActiveIcon": "adminInactiveIcon"}
        onClick={()=>{this.props.onClick(this.props.symbol)}}
      />

    )
  }
}

WeatherIcon.propTypes = {
  symbol: React.PropTypes.string,
  isSelected: React.PropTypes.bool,
  onClick: React.PropTypes.func
}
