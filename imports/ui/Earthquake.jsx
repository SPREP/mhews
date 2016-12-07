import React from 'react';
import GoogleMap from './GoogleMapJs.jsx';
import * as GeoUtils from '../api/geoutils.js';


/* i18n */
import { translate } from 'react-i18next';

const Apia = {
  lat: -13.815605,
  lng: -171.780512
};

/**
* Return the radius of the circle in which the mmi is greater than 3.
* The unit is km.
*/
function getIntensityCircleRadius(mw, depth){
  let radiusResolution = 100;
  let maximumRadius = 1000;
  let radius = 0;
  for(let sx= radiusResolution; sx<= maximumRadius; sx += radiusResolution){
    let mmi = getMMI(calculatePGV(mw, depth, sx));
    if( mmi < 4 ){
      return radius;
    }
    radius = sx;
  }
  return radius;
}

/**
* According to the table in http://earthquake.usgs.gov/earthquakes/shakemap/background.php#wald99b.
* MMI=2 is skipped.
*/
function getMMI(pgv){
  if( pgv < 0.1 ) return 1;
  else if( pgv < 1.1 ) return 3;
  else if( pgv < 3.4 ) return 4;
  else if( pgv < 8.1 ) return 5;
  else if( pgv < 16  ) return 6;
  else if( pgv < 31  ) return 7;
  else if( pgv < 60  ) return 8;
  else if( pgv < 116 ) return 9;
  else return 10;
}
/**
* Calculate PGV at the surface distance sx from the epicenter.
* According to http://www.data.jma.go.jp/svd/eew/data/nc/katsuyou/reference.pdf
*/
function calculatePGV(mw, depth, sx){
  let l = Math.pow(10, 0.5*mw-1.85);
  let x = Math.max(sx / Math.cos(Math.atan2(depth, sx)) - l * 0.5, 3);
  let pgv600 = Math.pow(10, 0.58*mw+0.0038*depth-1.29-log10(x+0.0028*Math.pow(10,0.5*mw)-0.002*x));
  let pgv700 = pgv600 * 0.9;
  let avs = 600;
  let arv = Math.pow(10, 1.83-0.66*log10(avs));
  let pgv = arv*pgv700;

  return pgv;
}

/**
* Math.log10 seems not yet supported by all devices, so we define it here.
*/
function log10(value){
  return Math.log(value) / Math.log(10);
}

class EarthquakePage extends React.Component {

  validatePhenomena(phenomena){
    if( !phenomena.epicenter.lat ){
      console.error("epicenter.lat is not defined");
      return false;
    }
    if( !phenomena.epicenter.lng ){
      console.error("epicenter.lng is not defined");
      return false;
    }
    if( !phenomena.mw ){
      console.error("mw is not defined");
      return false;
    }
    if( !phenomena.depth ){
      console.error("depth is not defined");
      return false;
    }
    return true;
  }

  render(){
    let quake = this.props.phenomena;
    this.quake = quake;

    if( quake ){
      if(this.validatePhenomena(quake)){

        const radiusKm = getIntensityCircleRadius(quake.mw, quake.depth);
        this.radius = radiusKm * 1000;
        this.mwColor = this.getMagnitudeColor(quake.mw);

        const diameterKm = radiusKm * 2;
        this.zoom = GeoUtils.getZoomLevel(diameterKm * 1.5) - 2; // -2 is an ugly hack to adjust the zoom leve.

        return(
          <GoogleMap mapCenter={quake.epicenter} zoom={this.zoom} onReady={(map) => {this.handleOnReady(map)}}>
            Loading...
          </GoogleMap>
        );
      }
      else{
        console.error("The received notification contains invalid phenomena data.");
      }
    }
    return(
      <GoogleMap mapCenter={Apia} zoom={3} >
        Loading...
      </GoogleMap>
    );
  }

  handleOnReady(map) {
    this.drawEpicenter(map);
  }

  drawEpicenter(map){
    map.addMarker(this.quake.epicenter, "Earthquake", "Magnitude = "+this.quake.mw);
    map.addCircle(this.quake.epicenter, this.radius, this.mwColor);
  }

  /**
   * Vivid red color for a strong magnitude, mild yellow color for a weak magnitude.
   */
  getMagnitudeColor(mw){
    if( mw < 3 ){
      return '#FFFF00';
    }
    else if( mw < 4 ){
      return '#FFCC00';
    }
    else if( mw < 5 ){
      return '#FF9900';
    }
    else if( mw < 6 ){
      return '#FF6600';
    }
    else if( mw < 7 ){
      return '#FF3300';
    }
    return '#FF0000';
  }
}

export default translate(['common'])(EarthquakePage);
