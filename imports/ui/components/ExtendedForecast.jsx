import React from 'react';

import {getWeatherIcon, selectPredominantWeatherSymbol} from '/imports/api/weatherIcons.js';
import {SmallCard} from './SmallCard.jsx';

import {getDayOfDate} from '/imports/api/strutils.js';

export class ExtendedForecast extends React.Component {
  render(){
    const forecast = this.props.forecast;
    const icon = getWeatherIcon(selectPredominantWeatherSymbol(forecast.weatherSymbols), moment().hour(12));

    return (
      <SmallCard
        key={forecast.date.toString()}
        style={{"padding": "5px 5px", "border": "none", "background": "none"}}
        icon={icon}
        text={getDayOfDate(forecast.date, this.props.t)}
        onTouchTap={()=>{this.props.onSelected(forecast.date)}}
      />
    )
  }

}

ExtendedForecast.propTypes = {
  t: React.PropTypes.func,
  forecast: React.PropTypes.object,
  onSelected: React.PropTypes.func
}
