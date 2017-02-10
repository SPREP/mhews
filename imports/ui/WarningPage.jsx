import React from 'react';
import HazardMap from './HazardMap.jsx';
import * as GeoUtils from '../api/geoutils.js';
import * as HazardArea from '../api/hazardArea.js';
import HazardView from './HazardView.jsx';
import {Warnings} from '../api/client/warnings.js';

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

class WarningPage extends React.Component {

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
    const t = this.props.t;

    console.log("render WarningPage");
    if( !this.props.phenomena ){
      return(
        <p>{t("no_data_to_display")}</p>
      );
    }
    else{

      let warning = this.props.phenomena;

      if( this.validatePhenomena(warning)){
        const longestDiagonal = GeoUtils.getLongestDiagonal(Samoa.area);
        this.zoom = GeoUtils.getZoomLevel(longestDiagonal);

        const onCancelCallback = this.props.isAdmin ? ()=>{this.props.cancelWarning(warning.type, warning.bulletinId)} : undefined;
        const hazardAreas = HazardArea.findAreas(warning.area, warning.direction);
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
            headerTitle={warning.getHeaderTitle(t)}
            headerSubTitle={warning.getSubTitle(t)}
            description={warning.getDescription()}
            onCancel={onCancelCallback}
            level={warning.level}
            onExpandChange={this.props.onExpandChange}
            expanded={this.props.expanded}
            warning={warning}>
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
        console.error("Unexpected warning object "+JSON.stringify(warning));
        // FIXME This case should return as much warning information as possible.
        return(
          <p>{t("no_data_to_display")}</p>
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

WarningPage.propTypes = {
  t: React.PropTypes.func,
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func,
  onExpandChange: React.PropTypes.func,
  expanded: React.PropTypes.bool

}

export function createWarningContainer(warningPage){
  return createContainer(({params})=>{
    const id = params.id;

    return {
      phenomena: Warnings.findOne({"_id": id}),
      expanded: true
    }
  }, warningPage);
}

const WarningPageContainer = createWarningContainer(WarningPage);

export default translate(['common'])(WarningPageContainer);
