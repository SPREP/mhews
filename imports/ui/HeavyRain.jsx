import React from 'react';
import HazardMap from './GoogleMapsNew.jsx';
import * as GeoUtils from '../api/geoutils.js';
import * as HazardArea from '../api/hazardArea.js';
import HazardView from './HazardView.jsx';

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

        const onCancelCallback = this.props.isAdmin ? ()=>{this.props.cancelWarning(heavyRain.type, heavyRain.bulletinId)} : undefined;
        const heavyRain = this.heavyRain;
        const hazardAreas = HazardArea.findAreas(heavyRain.area, heavyRain.direction);
        const circles = [];
        const polygons = [];
        const color = this.getWarningColor();

        hazardAreas.forEach((hazardArea) =>{
          if( hazardArea.shape == HazardArea.Shape.polygon ){
            polygons.push({
              path: hazardArea.vertices,
              color: color
            });
          }
          else if( hazardArea.shape == HazardArea.Shape.circle ){
            circles.push({
              center: hazardArea.center,
              radius: hazardArea.radius,
              color: color
            });
          }
        });

        return(
          <HazardView
            avatar={Meteor.settings.public.notificationConfig.heavyRain.icon}
            headerTitle={"Heavy Rain"+" "+heavyRain.level}
            headerSubTitle={moment(heavyRain.issued_at).format("YYYY-MM-DD HH:mm")}
            description={heavyRain.description_en}
            onCancel={onCancelCallback}
            level={heavyRain.level}
            onExpandChange={this.props.onExpandChange}
            expanded={this.props.expanded}
            >
            <HazardMap
              mapCenter={Samoa.center}
              zoom={this.zoom}
              circles={circles}
              polygons={polygons}
              >
            </HazardMap>
          </HazardView>
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

  handleOnReady(map) {
    this.drawWarningArea(map);
  }

  getWarningColor() {
    return '#FF0000';
  }
}

HeavyRainPage.propTypes = {
  t: React.PropTypes.func,
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func,
  onExpandChange: React.PropTypes.func,
  expanded: React.PropTypes.bool

}

export default translate(['common'])(HeavyRainPage);
