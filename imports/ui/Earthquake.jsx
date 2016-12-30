import React from 'react';
import GoogleMap from './GoogleMapJs.jsx';
import * as GeoUtils from '../api/geoutils.js';
import {Card, CardHeader, CardMedia, CardText, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

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
            <CardHeader
              avatar={Meteor.settings.public.notificationConfig.earthquake.icon}
              actAsExpander={true}
              title={quake.type+" "+quake.level+" (Mw "+quake.mw+")"}
              subtitle={moment(quake.issued_at).format("YYYY-MM-DD hh:mm")}
            />
            <CardMedia expandable={true}>
              <GoogleMap mapCenter={quake.epicenter} zoom={this.zoom} onReady={(map) => {this.handleOnReady(map)}}>
                Loading...
              </GoogleMap>
            </CardMedia>
            <CardText expandable={true}>{quake.description_en}</CardText>
            {this.props.isAdmin ? this.renderCancelButton() : ""}
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


  renderCancelButton(){
    const warning = this.props.phenomena;

    return (
      <CardActions expandable={true}>
        <FlatButton label="Cancel" onTouchTap={()=>{this.props.cancelWarning(warning.type, warning.bulletinId)}}/>
      </CardActions>
    )
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
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func
}

export default translate(['common'])(EarthquakePage);
