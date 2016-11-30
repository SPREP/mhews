import React from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

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
    const cyclone = {
      name: "Evan",
      category: 3,
      warningLevel: "Warning",
      description: "Very dangerous. Stay at home.",
      district: "Upolu South",
      issuedAt: new Date()
    }

    return cyclone;
  }

  render(){
    const cyclone = this.retrieveCycloneInformation();
    const name = cyclone.name;
    const category = cyclone.category;
    const district = cyclone.district;
    const description = cyclone.description;
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
}

export default translate(['common'])(CyclonePage);
