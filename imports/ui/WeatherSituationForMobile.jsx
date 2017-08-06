import React from 'react';
import Card from 'material-ui/Card/Card';
import CardHeader from 'material-ui/Card/CardHeader';
import CardMedia from 'material-ui/Card/CardMedia';
import CardText from 'material-ui/Card/CardText';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

import Config from '/imports/config.js';

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

export class WeatherSituation extends React.Component {

  constructor(props){
    super(props);
    this.imageUrls = [
      Config.cacheFiles.surfaceChart,
      Config.cacheFiles.satelliteImage
    ];
  }

  dateTimeToString(dateTime){
    return moment(dateTime).format("YYYY-MM-DD HH:mm");
  }

  render(){
    const t = this.props.t;

    const settings = {
      dots: true,
      infinite: true,
      arrow: true,
      speed: 500,
      slideToShow: 1,
      slidesToScroll: 1,
      touchMove: true,
      touchThreshold: 10,
      nextArrow: <RightNavButton />,
      prevArrow: <LeftNavButton />
    };

    const slides = this.imageUrls;

    if( slides.length == 0 ){
      return <div></div>;
    }

    return (
      <Card>
        <CardHeader
          title={t("Weather")+" "+t("situation")}
          showExpandableButton={true}
          subtitle={t("Issued_at")+" "+this.dateTimeToString(this.props.issuedAt)}
        />
        <CardText>
          {this.props.situation}
        </CardText>

        <CardMedia expandable={true}>
          <div style={{position: "relative", paddingLeft: "5%", paddingRight: "5%", minWidth: "90%", width: "90%"}}>
            <Slider {...settings}>
              {
                slides.map((slide, key)=>{
                  return (
                    <div key={key} >
                      <img src={slide} style={{width: "100%"}}/>
                    </div>
                  );
                })
              }
            </Slider>
          </div>
        </CardMedia>

      </Card>

      );
    }

  }

WeatherSituation.propTypes = {
  t: React.PropTypes.func,
  situation: React.PropTypes.string
}
