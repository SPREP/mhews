import React from 'react';
import HazardView from './HazardView.jsx';
import {CycloneBulletins} from '../api/bulletin.js';

/* i18n */
import { translate } from 'react-i18next';

/**
 * If the Cyclone forecast is updated, users should get the notification and be routed to the latest Cyclone forecast.
 * The Cyclone forecast product is published to the SMD web site. So this class just displays it.
 * On top, the warning or watch information is displayed.
 */

class CyclonePage extends React.Component {

  constructor(props){
    super(props);
    if( this.props.phenomena && this.validatePhenomena()){
      this.cyclone = this.props.phenomena;
    }
  }

  validatePhenomena(){
    return true;
  }

  render(){
    const cyclone = this.props.phenomena;
    const name = cyclone.name;
    const district = cyclone.district;
    const title = "Category " + cyclone.category + " " + cyclone.level;
    const bulletin = getBulletin(cyclone.bulletinId);
    const tc_info = bulletin ? bulletin.tc_info : null;
    const description = formatDescription(tc_info);

    const onCancelCallback = this.props.isAdmin ? ()=>{this.props.cancelWarning(cyclone.type, cyclone.bulletinId)} : undefined;

    return(
      <HazardView
        avatar={Meteor.settings.public.notificationConfig.cyclone.icon}
        headerTitle={title}
        headerSubTitle={moment(cyclone.issued_at).format("YYYY-MM-DD HH:mm")}
        overlayTitle={name}
        overlaySubTitle={district}
        description={description}
        onCancel={onCancelCallback}
        onExpandChange={this.props.onExpandChange}
        expanded={this.props.expanded}
        level={cyclone.level}>

        <img src="http://www.samet.gov.ws/TCModule/IDV60001.gif?1477450290515" />
      </HazardView>
    );
  }

}

function getBulletin(bulletinId){
  return CycloneBulletins.findOne({id: bulletinId});
}

function formatDescription(tc_info){
  if( !tc_info ) return "";

  let description = "Tropical Cyclone "+tc_info.name+" was located "+tc_info.center.lat+","+tc_info.center.lng;
  tc_info.neighbour_towns.forEach((town)=>{
    description += " or about "+town.distance_km+"km ("+town.distance_miles+"miles) "
    description += town.direction+" of "+town.name;
  });
  description += ".";

  description += tc_info.situation_en + " " +tc_info.people_impact_en;

  return description;
}

CyclonePage.propTypes = {
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func,
  onExpandChange: React.PropTypes.func,
  expanded: React.PropTypes.bool
}

export default translate(['common'])(CyclonePage);
