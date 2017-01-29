import React from 'react';

import {weatherIcons} from '../../api/weatherIcons.js';

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


export class WeatherIcon extends React.Component {

  render(){
    const icons = weatherIcons.dayTime;

    const iconImage = "/images/weather/"+icons[this.props.symbol];

    return (
      <img src={iconImage}
        title={this.props.symbol}
        style={this.props.isSelected ? iconActiveStyle : iconInactiveStyle}
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
