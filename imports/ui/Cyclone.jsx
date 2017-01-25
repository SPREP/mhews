import React from 'react';
import HazardView from './HazardView.jsx';
import {Warnings} from '../api/client/warnings.js';
import {Cyclone} from '../api/client/cyclone.js';

import {createContainer} from 'meteor/react-meteor-data';
/* i18n */
import { translate } from 'react-i18next';

/**
 * If the Cyclone forecast is updated, users should get the notification and be routed to the latest Cyclone forecast.
 * The Cyclone forecast product is published to the SMD web site. So this class just displays it.
 * On top, the warning or watch information is displayed.
 */


class CyclonePage extends React.Component {

  validatePhenomena(){
    return true;
  }

  render(){
    if( !this.props.phenomena ){
      return <p>{"No cyclone information"}</p>
    }

    const cyclone = new Cyclone(this.props.phenomena);
    const name = cyclone.name;
    const district = cyclone.district;
    const title = cyclone.getHeaderTitle();
    const subTitle = cyclone.getSubTitle();
    const description = cyclone.getDescription();

    const onCancelCallback = this.props.isAdmin ? ()=>{this.props.cancelWarning(cyclone.type, cyclone.bulletinId)} : undefined;

    return(
      <HazardView
        avatar={Meteor.settings.public.notificationConfig.cyclone.icon}
        headerTitle={title}
        headerSubTitle={subTitle}
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

CyclonePage.propTypes = {
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func,
  onExpandChange: React.PropTypes.func,
  expanded: React.PropTypes.bool
}

const CyclonePageContainer = createContainer(({params})=>{
  const id = params.id;

  console.log("cyclonepagecontainer id = "+id);
  return {
    phenomena: Warnings.findOne({"_id": id, "type": "cyclone"}),
    expanded: true
  }
}, CyclonePage);

export default translate(['common'])(CyclonePageContainer);
