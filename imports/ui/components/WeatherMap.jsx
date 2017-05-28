import React from 'react';
import '/imports/api/weatherIcons';

export class WeatherMap extends React.Component {

  render(){

    return null;

  }
}

/*
  mapFile is the name of the map file. Weather icons are overlayed on the map.
  cities is an array of {city, posX, posY}, where city is a name,
  posX and posY are relative X and Y position (pixcels) of the city in the map.
  weathers is an array of {city, weatherSymbol}.
  onCitySelected is a callback function with arguments of (city) to be called when a user clicks on a city.
 */
WeatherMap.propTypes = {
  mapFile: React.PropTypes.string,
  cities: React.PropTypes.array,
  weathers: React.PropTypes.array,
  onCitySelected: React.PropTypes.func
}
