import React from 'react';

import {Card} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';

import {WeatherMap} from '/imports/ui/components/WeatherMap.jsx';

import {getDayOfDate} from '/imports/api/strutils.js';
import {getForecastsForDisplay} from '../api/weatherutils.js';

class Header extends React.Component {

  render(){
    return (
      <div>
        Weather Forecast
      </div>
    )
  }

}

class Situation extends React.Component {

  render(){
    return (
      <div>
        {this.props.text}
      </div>
    )
  }
}

Situation.propTypes = {
  text: React.PropTypes.string
}

/*
  Weather page with a weather map, suitable for PC browsers.
 */
class WeatherPageWithMap extends React.Component {

  constructor(){
    super();
    this.dateIndex = 0;
  }

  render(){
    return (
      <Card>
        <Header />
        <Situation />
        <Tabs>
          {
            this.props.dates.forEach((date, index)=>{
              const label = getDayOfDate(date);

              return (
                <Tab label={label} key={index}>
                  <WeatherMap
                    mapFile={this.props.mapFile}
                    cities={this.props.cities}
                    weathers={}
                    onCitySelected={}
                  />
                </Tab>
              )
            })
          }
        </Tabs>
      </Card>
    )
  }

}

WeatherPageWithMap.propTypes = {

  // Array of forecasted dates
  dates: React.PropTypes.array,

  // Map of language and situation description in the language
  situation: React.PropTypes.object,

  lang: React.PropTypes.string,

  mapFile: React.PropTypes.string,

  forecast: React.PropTypes.object,

  cities: React.PropTypes.array
}

// List of cities with x and y coordinates on the weather map where to put weather icons.
const cities = [
  {name: 'Apia', x: 0, y: 0}
]

const WeatherPageWithMapContainer = createContainer(()=>{

  return {
    mapFile: '/images/weather/WeatherForecastBackground.png',
    cities: cities,
  }
});

export default translate(['common'])(WeatherPageWithMapContainer);
