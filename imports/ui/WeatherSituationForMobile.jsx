import React from 'react';
import Card from 'material-ui/Card/Card';
import CardHeader from 'material-ui/Card/CardHeader';
import CardMedia from 'material-ui/Card/CardMedia';
import CardTitle from 'material-ui/Card/CardTitle';
import CardText from 'material-ui/Card/CardText';
import { createContainer } from 'meteor/react-meteor-data';
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

let FileCache;

export class WeatherSituation extends React.Component {

  constructor(props){
    super(props);
    this.imageUrls = [
      Config.cacheFiles.surfaceChart,
      Config.cacheFiles.satelliteImage
    ];
    this.state = {
      isFileCacheReady: FileCache ? true : false
    }

    if( !FileCache ){
      import('/imports/api/client/filecache.js').then(({default: m})=>{
        console.log("============= import filecache.js");
        FileCache = m;
        this.setState({isFileCacheReady: true});
      })
    }
  }

  getImageHandlers(){
    const handlers = [];
    if( this.state.isFileCacheReady ){
      this.imageUrls.forEach((url)=>{
        const handler = FileCache.get(url);
        if( handler ){
          handlers.push(handler);
        }
        else{
          console.error("No handler for image "+url);
        }
      })
    }
    return handlers;
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

    const slides = this.getImageHandlers();

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
                slides.map((imageHandler, key)=>{
                  return (
                    <div key={key} >
                      <img src={imageHandler.getSource()} style={{width: "100%"}}/>
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
