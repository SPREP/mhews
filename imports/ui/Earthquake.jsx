import React from 'react';
import HazardMap from './HazardMap.jsx';
import * as GeoUtils from '../api/geoutils.js';
import HazardView from './HazardView.jsx';
import {Warnings} from '../api/client/warnings.js';
import {Earthquake} from '../api/client/earthquake.js';
import {createContainer} from 'meteor/react-meteor-data';

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

    if( this.props.phenomena ){
      let quake = new Earthquake(this.props.phenomena);
      console.log("quake = "+ quake ? JSON.stringify(quake) : "undefined");

      if(this.validatePhenomena(quake)){

        const radiusKm = GeoUtils.getIntensityCircleRadius(quake.mw, quake.depth);
        this.radius = radiusKm * 1000;
        this.mwColor = this.getMagnitudeColor(quake.mw);

        const diameterKm = radiusKm * 2;
        this.zoom = GeoUtils.getZoomLevel(diameterKm * 1.5) - 2; // -2 is an ugly hack to adjust the zoom leve.

        const onCancelCallback = this.props.isAdmin ? ()=>{this.props.cancelWarning(quake.type, quake.bulletinId)} : undefined;
        const headerTitle = quake.getHeaderTitle(this.props.t);
        const subTitle = quake.getSubTitle(this.props.t);
        const description = quake.getDescription(this.props.t);

        return(
          <HazardView
            avatar={Meteor.settings.public.notificationConfig.earthquake.icon}
            headerTitle={headerTitle}
            headerSubTitle={subTitle}
            description={description}
            onCancel={onCancelCallback}
            onExpandChange={this.props.onExpandChange}
            expanded={this.props.expanded}
            level={quake.level}
            warning={quake}>
            <HazardMap
              mapCenter={quake.epicenter}
              zoom={this.zoom}
              markers={
                [
                  {position: quake.epicenter, color: this.mwColor}
                ]
              }
              circles={
                [
                  {center: quake.epicenter, radius: this.radius, color: this.mwColor}
                ]
              }>
            </HazardMap>
          </HazardView>

        );
      }
      else{
        console.error("The received notification contains invalid phenomena data.");
      }
    }
    return(
      <p>{this.props.t("no_data_to_display")}</p>
    );
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
  t: React.PropTypes.func,
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func,
  onExpandChange: React.PropTypes.func,
  expanded: React.PropTypes.bool

}

const EarthquakePageContainer = createContainer(({params, expanded})=>{
  const id = params.id;
  console.log("Earthquake id = "+id);

  return {
    phenomena: Warnings.findOne({"_id": id}),
    expanded: expanded == undefined ? true : expanded
  }
}, EarthquakePage);

export default translate(['common'])(EarthquakePageContainer);
