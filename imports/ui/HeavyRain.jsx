import React from 'react';
import GoogleMap from './GoogleMapJs.jsx';
import * as GeoUtils from '../api/geoutils.js';
import * as HazardArea from '../api/hazardArea.js';
import {Card, CardHeader, CardMedia, CardText, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

/* i18n */
import { translate } from 'react-i18next';

const Samoa = {
  center: {
    lat: -13.814706,
    lng: -172.118862,
  },
  area:[
    {lat: -13.26, lng: -172.89},
    {lat: -14.13, lng: -172.89},
    {lat: -14.13, lng: -171.32},
    {lat: -13.26, lng: -171.32}
  ]
};

class HeavyRainPage extends React.Component {

  validatePhenomena(phenomena){
    if( !phenomena.area ){
      console.error("area is not defined");
      return false;
    }
    if( !phenomena.level ){
      console.error("level is not defined");
      return false;
    }
    return true;
  }

  render(){
    let heavyRain = this.props.phenomena;

    if( heavyRain && this.validatePhenomena(heavyRain)){
      this.heavyRain = heavyRain;
      const longestDiagonal = GeoUtils.getLongestDiagonal(Samoa.area);
      this.zoom = GeoUtils.getZoomLevel(longestDiagonal);
    }

    if( this.heavyRain ){
      if( this.heavyRain.area ){
        console.log("render heavyRain");

        return(
          <Card>
            <CardHeader
              avatar={Meteor.settings.public.notificationConfig.heavyRain.icon}
              actAsExpander={true}
              title={"Heavy Rain"+" "+heavyRain.level}
              subtitle={moment(heavyRain.issued_at).format("YYYY-MM-DD hh:mm")}
            />
            <CardMedia expandable={true}>
              <GoogleMap mapCenter={Samoa.center} zoom={this.zoom} onReady={(map) => {this.handleOnReady(map)}}>
                Loading...
              </GoogleMap>
            </CardMedia>
            <CardText expandable={true}>{heavyRain.description_en}</CardText>
            {this.props.isAdmin ? this.renderCancelButton() : ""}
          </Card>
        );
      }
      else{
        console.error("heavyRain.area is not defined.");
      }
    }

    return(
      <p>{"No heavyRain warning is in effect."}</p>
    );
  }

  renderCancelButton(){
    const warning = this.props.phenomena;

    return (
      <CardActions expandable={true}>
        <FlatButton label="Cancel" onTouchTap={()=>{this.props.cancelWarning(warning.type, warning.bulletinId)}}/>
      </CardActions>
    )
  }

  handleOnReady(map) {
    this.drawWarningArea(map);
  }

  getWarningColor() {
    return '#FF0000';
  }

  drawWarningArea(map){
    const heavyRain = this.heavyRain;
    const hazardAreas = HazardArea.findAreas(heavyRain.area, heavyRain.direction);

    hazardAreas.forEach((hazardArea) =>{
      if( hazardArea.shape == HazardArea.Shape.polygon ){
        map.addPolygon(hazardArea.vertices, this.getWarningColor());
      }
      else if( hazardArea.shape == HazardArea.Shape.circle ){
        map.addCircle(hazardArea.center, hazardArea.radius, this.getWarningColor());
      }
    });
  }
}

HeavyRainPage.propTypes = {
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func
}

export default translate(['common'])(HeavyRainPage);
