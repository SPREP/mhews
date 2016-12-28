import React from 'react';
import GoogleMap from './GoogleMapJs.jsx';
import * as GeoUtils from '../api/geoutils.js';
import {Card, CardTitle, CardText} from 'material-ui/Card';

/* i18n */
import { translate } from 'react-i18next';

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

        const radiusKm = GeoUtils.getIntensityCircleRadius(quake.mw, quake.depth);
        this.radius = radiusKm * 1000;
        this.mwColor = this.getMagnitudeColor(quake.mw);

        const diameterKm = radiusKm * 2;
        this.zoom = GeoUtils.getZoomLevel(diameterKm * 1.5) - 2; // -2 is an ugly hack to adjust the zoom leve.

        return(
          <Card>
            <GoogleMap mapCenter={quake.epicenter} zoom={this.zoom} onReady={(map) => {this.handleOnReady(map)}}>
              Loading...
            </GoogleMap>
            <CardTitle title={quake.type+" "+quake.level} subtitle={quake.issued_at.toDateString()}/>
            <CardText>{quake.description_en}</CardText>
          </Card>
        );
      }
      else{
        console.error("The received notification contains invalid phenomena data.");
      }
    }
    return(
      <p>No earthquake / Tsunami warning in effect.</p>
    );
  }

  handleOnReady(map) {
    this.drawEpicenter(map);
  }

  drawEpicenter(map){
//    map.addMarker(this.quake.epicenter, "Earthquake", "Magnitude = "+this.quake.mw);
    map.addMarker(this.quake.epicenter);
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

EarthquakePage.propTypes = {
  phenomena: React.PropTypes.object
}

export default translate(['common'])(EarthquakePage);
