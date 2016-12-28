import React from 'react';
import {Card, CardMedia, CardTitle, CardText} from 'material-ui/Card';
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
        <CardMedia
          overlay={<CardTitle title={title} subtitle={name} />}
          >
          <img src="http://www.samet.gov.ws/TCModule/IDV60001.gif?1477450290515" />
        </CardMedia>
        <CardTitle title={issuedAt.toDateString()} subtitle={district} />
        <CardText>{description}</CardText>
      </Card>
    );
  }

  renderNoCyclone(){

    const title = "No Cylone Warning in effect";
    return(
      <Card>
        <CardMedia
          overlay={<CardTitle title={title} subtitle={name} />}
          >
          <img src="images/samoa-6792.jpg" />
        </CardMedia>
        <CardText>{"Are you prepared for the food and waters?"}</CardText>
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
}

CyclonePage.propTypes = {
  phenomena: React.PropTypes.object
}

export default translate(['common'])(CyclonePage);
