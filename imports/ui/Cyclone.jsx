import React from 'react';
import {Warnings} from '../api/warnings.js';
import HazardView from './HazardView.jsx';

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

  retrieveCycloneInformation(){
    if( this.cyclone ){
      return this.cyclone;
    }
    else{
      return Warnings.findLatestWarningInEffect("cyclone");
    }
  }

  renderCyclone(cyclone){
    const name = cyclone.name;
    const district = cyclone.district;
    const description = cyclone.description_en;
    const issuedAt = cyclone.issuedAt;
    const title = "Category " + cyclone.category + " " + cyclone.warningLevel;

    const onCancelCallback = this.props.isAdmin ? ()=>{this.props.cancelWarning(cyclone.type, cyclone.bulletinId)} : undefined;

    return(
      <HazardView
        avatar={Meteor.settings.public.notificationConfig.cyclone.icon}
        headerTitle={issuedAt.toDateString()}
        headerSubTitle={district}
        overlayTitle={title}
        overlaySubTitle={name}
        description={description}
        onCancel={onCancelCallback}>
        <img src="http://www.samet.gov.ws/TCModule/IDV60001.gif?1477450290515" />
      </HazardView>
    );
  }

  render(){
    const cyclone = this.retrieveCycloneInformation();
    if( cyclone ){
      return this.renderCyclone();
    }
    else{
      return this.renderNoCyclone();
    }
  }
}

CyclonePage.propTypes = {
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func
}

export default translate(['common'])(CyclonePage);
