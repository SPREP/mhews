import React from 'react';
import {Card, CardHeader, CardMedia, CardTitle, CardText, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import {Warnings} from '../api/warnings.js';

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

    return(
      <Card>
        <CardHeader
          avatar={Meteor.settings.public.notificationConfig.cyclone.icon}
          actAsExpander={true}
          title={issuedAt.toDateString()}
          subtitle={district}
          expandable={true}
        />
        <CardMedia
          overlay={<CardTitle title={title} subtitle={name} />}
          expandable={true}
          >
          <img src="http://www.samet.gov.ws/TCModule/IDV60001.gif?1477450290515" />
        </CardMedia>
        <CardText expandable={true}>{description}</CardText>
        {this.props.isAdmin ? this.renderCancelButton() : ""}
      </Card>
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

  renderCancelButton(){
    const warning = this.props.phenomena;

    return (
      <CardActions expandable={true}>
        <FlatButton label="Cancel" onTouchTap={()=>{this.props.cancelWarning(warning.type, warning.bulletinId)}}/>
      </CardActions>
    )
  }
}

CyclonePage.propTypes = {
  phenomena: React.PropTypes.object,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func
}

export default translate(['common'])(CyclonePage);
