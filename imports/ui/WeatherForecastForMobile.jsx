import React from 'react';
import Card from 'material-ui/Card/Card';
import CardActions from 'material-ui/Card/CardActions';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {Nowcast} from './components/Nowcast.jsx';
import {ExtendedForecast} from './components/ExtendedForecast.jsx';
import {WeatherSituation} from './WeatherSituationForMobile.jsx';

class LeftNavButton extends React.Component {
  render(){
    return <LeftArrowIcon {...this.props}/>
  }
}

class RightNavButton extends React.Component {
  render(){
    return <RightArrowIcon {...this.props}/>
  }
}

export class WeatherForecastForMobile extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      displayDate: props.dates ? props.dates[0]: null
    };
  }

  shouldComponentUpdate(nextProps, nextState){
    if( this.state.displayDate != nextState.displayDate ){
      return true;
    }
    return false;
  }

  render(){

    const dates = this.props.dates;
    const displayDate = this.getDisplayDate(dates);
    const displayDateIndex = displayDate ? dates.indexOf(displayDate) : 0;
    const forecasts = this.props.forecasts;
    const t = this.props.t;

    var settings = {
      dots: false,
      infinite: false,
      arrow: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      slickGoTo: displayDateIndex,
      touchMove: true,
      touchThreshold: 10,
      responsive: [
        {breakpoint: 600, settings: {slidesToShow: 1}},
        {breakpoint: 900, settings: {slidesToShow: 2}},
        {breakpoint: 1200, settings: {slidesToShow: 3}},
        {breakpoint: 10000, settings: 'unslick'}
      ],
      nextArrow: <RightNavButton />,
      prevArrow: <LeftNavButton />
    };

    // The Weather card expands/shrinks when the CardText is tapped.
    return (
      <div>
      <Card>
        <div style={{paddingLeft: "3%", paddingRight: "3%", minWidth: "94%", maxWidth: "94%"}}>
          <Slider
//            style={{display: "inline-block", width: "300px"}}
            {...settings}
            index={displayDateIndex}
          >
          {
            forecasts.map((forecast, index) => {
              return (
                <div key={index} style={{display: "inline-block", width: "300px", verticalAlign: "top"}}>
                <Nowcast
                  key={index}
                  forecast={forecast}
                  t={this.props.t}
                />
              </div>
              )
            })
          }
        </Slider>
      </div>
        <CardActions style={{"paddingTop": "0px", "paddingLeft": "16px"}}>
          {
            forecasts.map((forecast, index)=>{
              return (
                <ExtendedForecast
                  key={index}
                  forecast={forecast}
                  t={this.props.t}
                  onSelected={(date)=>{this.changeDisplayDate(date)}}
                />
              )
            })
          }
        </CardActions>

      </Card>
      <WeatherSituation t={t} expandable={true} situation={this.props.situation} />
    </div>
    );
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
