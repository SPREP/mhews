import React from 'react';
import GoogleMap from './GoogleMapJs.jsx';
import * as GeoUtils from '../api/geoutils.js';
import * as HazardArea from '../api/hazardArea.js';

/* i18n */
import { translate } from 'react-i18next';

const HeavyRainAreaNames = ["Samoa", "Upolu Island", "Savaii Island", "Manono Island", "Apolima Island"];
const HeavyRainDirection = ["North", "East", "South", "West", "Town Area", "Highlands"];

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

  constructor(props){
    super(props);

    let heavyRain = this.props.phenomena;

    const test = false;
    if( test ){
      heavyRain = {
        "type": "heavyRain",
        "area": "Manono Island",
        "direction": "North",
        "level": "warning"
      };
    }

    if( heavyRain && this.validatePhenomena(heavyRain)){
      this.heavyRain = heavyRain;
      const longestDiagonal = GeoUtils.getLongestDiagonal(Samoa.area);
      this.zoom = GeoUtils.getZoomLevel(longestDiagonal);
    }
  }

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
    if( this.heavyRain ){
      if( this.heavyRain.area ){
        return(
          <GoogleMap mapCenter={Samoa.center} zoom={this.zoom} onReady={(map) => {this.handleOnReady(map)}}/>
        );
      }
      else{
        console.error("epicenter is not defined!!!!!");
      }
    }

    return(
      <GoogleMap mapCenter={Samoa.center} zoom={this.zoom} />
    );
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
    const title = "HeavyRain "+heavyRain.level+" in effect";
    const snippet = "Warning for the people in "+heavyRain.area+" "+heavyRain.direction;
    let infoWindowPosition = Samoa.center;

    hazardAreas.forEach((hazardArea) =>{
      if( hazardArea.shape == HazardArea.Shape.polygon ){
        map.addPolygon(hazardArea.vertices, this.getWarningColor());
        infoWindowPosition = hazardArea.vertices[0];
      }
      else if( hazardArea.shape == HazardArea.Shape.circle ){
        map.addCircle(hazardArea.center, hazardArea.radius, this.getWarningColor());
        infoWindowPosition = hazardArea.center;
      }

    });
    map.addInfoWindow(infoWindowPosition, title, snippet);
  }
}

export default translate(['common'])(HeavyRainPage);
