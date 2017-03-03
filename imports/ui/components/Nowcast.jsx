import React from 'react';
import {CardText} from 'material-ui/Card';
import {Moon} from '../../api/moonutils.js';
import DailyTideTableContainer from './TideTable.jsx';
import {SmallCard} from './SmallCard.jsx';

import {getWeatherIcon} from '../../api/weatherIcons.js';
import {dateToString} from '../../api/strutils.js';

import './css/Nowcast.css';

// Nowcast UI shows one day forcast with 6 hours forecast periods
export class Nowcast extends React.Component {

  render(){
    const forecast = this.props.forecast;
    const title = dateToString(forecast.date, this.props.t);
    const subtitle = this.props.t("districts."+forecast.district);
    const weatherSymbols = forecast.weatherSymbols.length > 1 ? forecast.weatherSymbols : [];
    const listInterval = 24 / forecast.weatherSymbols.length;

    return (
      <div className="nowcast_div1">
        <div className="nowcast_div2">
          <div className="nowcast_div3">
            <div className="nowcast_div4">
              <div className="nowcast_title">{title}</div>
              <div className="nowcast_subtitle">{subtitle}</div>
            </div>
            <div>
              {
                weatherSymbols.map((symbol, index)=>{
                  const startHour = index * listInterval;
                  const endHour = (index+1) * listInterval;
                  const referenceHour = (startHour + endHour) / 2;
                  const text = this.formatForecastPeriod(startHour, endHour);
                  return (
                    <NowcastBadge
                      key={index}
                      icon={getWeatherIcon(symbol, moment().hour(referenceHour))}
                      text={text}/>
                  )
                })
              }
            </div>
          </div>
        </div>
        <CardText style={{padding: "0px", paddingTop: "8px", paddingBottom: "16px"}}>
          {forecast.text}
        </CardText>
        <AdditionalInfo t={this.props.t} forecast={forecast} />
      </div>
    )
  }

  formatForecastPeriod(startHour, endHour){
    return startHour + "-" + endHour;
  }

  getWeatherSymbolForNow(weatherSymbols){
    const hoursPerDay = 24;
    const currentHour = moment().hour();
    const interval = hoursPerDay / weatherSymbols.length;
    const index = Math.floor(currentHour / interval);
    return weatherSymbols[index];
  }
}

Nowcast.propTypes = {
  t: React.PropTypes.func,
  forecast: React.PropTypes.object
}

class NowcastBadge extends React.Component {

  render(){
    return (
      <div className="nowcast_badge_div1"
        onTouchTap={this.props.onTouchTap}>
        <img src={this.props.icon} className="nowcast_badge_image"/>
        <div className="nowcast_badge_div2">
          {this.props.text}
        </div>
      </div>

    )
  }
}

NowcastBadge.propTypes = {
  icon: React.PropTypes.string,
  text: React.PropTypes.string,
  onTouchTap: React.PropTypes.func
}


class AdditionalInfo extends React.Component {

  render(){
    const t = this.props.t;
    const forecast = this.props.forecast;
    const moon = new Moon(forecast.date);
    const sunrise = moment(forecast.sunrise).format("HH:mm");
    const sunset = moment(forecast.sunset).format("HH:mm");

    return (
      <div>
        <SmallCard icon="images/weather/dawn.png" text={sunrise} />
        <SmallCard icon="images/weather/sunset.png" text={sunset} />
        <SmallCard icon={moon.getIcon()} text={t("moon_phase."+moon.getName())} />
        <DailyTideTableContainer date={forecast.date}/>
      </div>

    )
  }
}

AdditionalInfo.propTypes = {
  t: React.PropTypes.func,
  forecast: React.PropTypes.object
}
