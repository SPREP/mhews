import React from 'react';
import Card from 'material-ui/Card/Card';
import CardHeader from 'material-ui/Card/CardHeader';
import CardActions from 'material-ui/Card/CardActions';

import SwipeableViews from 'react-swipeable-views';
import {Nowcast} from './components/Nowcast.jsx';
import {ExtendedForecast} from './components/ExtendedForecast.jsx';
import {WeatherSituation} from './WeatherSituationForMobile.jsx';

export class WeatherForecastForMobile extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      displayDate: null
    };
  }

  shouldComponentUpdate(nextProps, nextState){
    if( this.state.displayDate != nextState.displayDate ){
      return true;
    }

  }

  render(){

    const dates = this.props.dates;
    const displayDate = this.getDisplayDate(dates);
    const displayDateIndex = displayDate ? dates.indexOf(displayDate) : 0;
    const forecasts = this.props.forecasts;
    const t = this.props.t;

    // The Weather card expands/shrinks when the CardText is tapped.
    return (
      <Card>
        <SwipeableViews index={displayDateIndex}>
          {
            forecasts.map((forecast, index) => {
              return (
                <Nowcast
                  key={index}
                  forecast={forecast}
                  t={this.props.t}
                />
              )
            })
          }
        </SwipeableViews>
        <CardActions style={{"paddingTop": "0px", "paddingLeft": "16px"}}>
          {
            forecasts.map((forecast)=>{
              return (
                <ExtendedForecast
                  forecast={forecast}
                  t={this.props.t}
                  onSelected={(date)=>{this.changeDisplayDate(date)}}
                />
              )
            })
          }
        </CardActions>

        <CardHeader
          title={t("Weather")+" "+t("situation")}
          showExpandableButton={true}
          subtitle={t("Issued_at")+" "+this.dateTimeToString(this.props.issuedAt)}
        />
        <WeatherSituation t={t} expandable={true} situation={this.props.situation} />

      </Card>
    );
  }

  dateTimeToString(dateTime){
    return moment(dateTime).format("YYYY-MM-DD HH:mm");
  }

  changeDisplayDate(date){
    if( this.state.displayDate != date ){
      this.setState({displayDate: date});
    }
  }

  getDisplayDate(dates){
    return this.state.displayDate ? this.state.displayDate : dates[0];
  }
}

WeatherForecastForMobile.propTypes = {
  t: React.PropTypes.func,
  dates: React.PropTypes.array,
  issuedAt: React.PropTypes.object,
  situation: React.PropTypes.string,
  forecasts: React.PropTypes.array,

}
