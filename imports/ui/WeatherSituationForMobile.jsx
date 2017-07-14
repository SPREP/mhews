import React from 'react';
import CardMedia from 'material-ui/Card/CardMedia';
import CardTitle from 'material-ui/Card/CardTitle';
import { createContainer } from 'meteor/react-meteor-data';
import SwipeableViews from 'react-swipeable-views';

import FileCache from '/imports/api/client/filecache.js';

import Config from '/imports/config.js';

class WeatherSituationImage extends React.Component {

  constructor(props){
    super(props);
    this.state = {displayCardMediaTitle : true};
  }

  toggleDisplayCardMediaTitle(){
    this.setState({displayCardMediaTitle: !this.state.displayCardMediaTitle});
  }

  render(){
    console.log("WeatherSituationImage.render()");
    return (
      <CardMedia
        overlay={this.state.displayCardMediaTitle ? this.props.cardTitle : undefined}
        expandable={true}
        onTouchTap={()=>{this.toggleDisplayCardMediaTitle()}}>
        {
          this.props.image ? <img src={this.props.image} /> : <p>"Loading ..."</p>
        }
      </CardMedia>
    );
  }
}

WeatherSituationImage.propTypes = {
  cardTitle: React.PropTypes.node,
  image: React.PropTypes.string
}

const WeatherSituationImageContainer = createContainer(({imageHandler})=>{
  return {
    image: imageHandler.getSource()
  }

}, WeatherSituationImage);

export class WeatherSituation extends React.Component {

  constructor(props){
    super(props);
    this.imageUrls = [
      Config.cacheFiles.surfaceChart,
      Config.cacheFiles.satelliteImage
    ]
  }

  getImageHandlers(){
    const handlers = [];
    this.imageUrls.forEach((url)=>{
      const handler = FileCache.get(url);
      if( handler ){
        handlers.push(handler);
      }
      else{
        console.error("No handler for image "+url);
      }
    })
    return handlers;
  }

  render(){
    const t = this.props.t;
    console.log("WeatherSituation.render()");

    const cardTitle = (<CardTitle title={t("Situation")} subtitle={this.props.situation} />);
    let key = 0;

    return (
      <SwipeableViews>
        {
          this.getImageHandlers().map((imageHandler)=>{
            key++;
            console.log("getHandlers().map(): key = "+key);
            return (
              <WeatherSituationImageContainer
                key={key}
                cardTitle={cardTitle}
                imageHandler={imageHandler}
              />);
          })
        }
      </SwipeableViews>
    );
  }

}

WeatherSituation.propTypes = {
  t: React.PropTypes.func,
  situation: React.PropTypes.string
}
