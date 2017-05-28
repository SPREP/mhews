import React from 'react';

import {Card} from 'material-ui/Card';
import {Nowcast} from './components/Nowcast.jsx';

/*
  Similar to the WeatherPage, but the forecast for all the days in the extended forecast period
  for a designated district is shown in a single page. Suitable for a PC browser.
  */
export class WeatherForecastForPC extends React.Component {

  render(){
    return (
      <div>
        {
          this.props.forecasts.map((forecast, index) => {
            return (
              <Card key={index}>
                <Nowcast
                  forecast={forecast}
                  t={this.props.t}
                />
              </Card>
            )
          })
        }
      </div>
    );
  }
}

WeatherForecastForPC.propTypes = {
  t: React.PropTypes.func,
  dates: React.PropTypes.array,
  issuedAt: React.PropTypes.string,
  situation: React.PropTypes.string,
  forecasts: React.PropTypes.array
}
