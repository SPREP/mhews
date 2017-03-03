import React from 'react';
import HazardView from './components/HazardView.jsx';

import {createWarningContainer} from './components/warningContainer.js';

/* i18n */
import { translate } from 'react-i18next';
import Config from '../config.js';

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
    const t = this.props.t;

    const cyclone = this.props.phenomena;
    const name = cyclone.name;
    const district = cyclone.district;
    const title = cyclone.getHeaderTitle(t);
    const subTitle = cyclone.getSubTitle(t);
    const description = cyclone.getDescription(t);

    const onCancelCallback = this.props.isAdmin ? ()=>{this.props.cancelWarning(cyclone.type, cyclone.bulletinId)} : undefined;

    return(
      <HazardView
        avatar={Config.notificationConfig.cyclone.icon}
        headerTitle={title}
        headerSubTitle={subTitle}
        overlayTitle={name}
        overlaySubTitle={district}
        description={description}
        onCancel={onCancelCallback}
        onExpandChange={this.props.onExpandChange}
        expanded={this.props.expanded}
        level={cyclone.level}
        warning={cyclone}>

        <img src="http://www.samet.gov.ws/TCModule/cyclone_track.gif" />
      </HazardView>
    );
  }

}

CyclonePage.propTypes = {
  t: React.PropTypes.func,
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func,
  onExpandChange: React.PropTypes.func,
  expanded: React.PropTypes.bool
}

const CyclonePageContainer = createWarningContainer(CyclonePage);

export default translate(['common'])(CyclonePageContainer);
