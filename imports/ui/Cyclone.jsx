import React from 'react';

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

  }

  render(){
    const style = {'max-width': 100+'%'};

    if( this.cyclone ){
      this.retrieveCycloneInformation();

      return(
        <div style={style}>
          <img style={style} src="http://www.samet.gov.ws/TCModule/IDV60001.gif?1477450290515"/>
        </div>
      );
    }
    else{
      return(
        <div style={style}>
          <img style={style} src="http://www.samet.gov.ws/TCModule/IDV60001.gif?1477450290515"/>
        </div>
      );

    }
  }
}

export default translate(['common'])(CyclonePage);
