import React from 'react';
import HazardMap from './HazardMap.jsx';
import * as GeoUtils from '../api/geoutils.js';
import * as HazardArea from '../api/hazardArea.js';
import HazardView from './HazardView.jsx';
import {Warnings} from '../api/client/warnings.js';
import {HeavyRain} from '../api/client/heavyRain.js';

import {createContainer} from 'meteor/react-meteor-data';

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

    console.log("render heavyRain");
    if( !this.props.phenomena ){
      return(
        <p>{"No heavyRain warning is in effect."}</p>
      );
    }
    else{

      let heavyRain = new HeavyRain(this.props.phenomena);

      if( this.validatePhenomena(heavyRain)){
        const longestDiagonal = GeoUtils.getLongestDiagonal(Samoa.area);
        this.zoom = GeoUtils.getZoomLevel(longestDiagonal);

        const onCancelCallback = this.props.isAdmin ? ()=>{this.props.cancelWarning(heavyRain.type, heavyRain.bulletinId)} : undefined;
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
            warning={heavyRain}>
            <HazardMap
              mapCenter={Samoa.center}
              zoom={this.zoom}
              circles={circles}
              polygons={polygons}>
            </HazardMap>
          </HazardView>
        );
      }
      else{
        console.error("Unexpected heavy rain object "+JSON.stringify(heavyRain));
        // FIXME This case should return as much as heavy rain information as possible.
        return(
          <p>{"No heavyRain warning is in effect."}</p>
        );

      }
    }
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

const HeavyRainPageContainer = createContainer(({params})=>{
  const id = params.id;

  return {
    phenomena: Warnings.findOne({"_id": id, "type": "heavyRain"}),
    expanded: true
  }
}, HeavyRainPage);

export default translate(['common'])(HeavyRainPageContainer);
