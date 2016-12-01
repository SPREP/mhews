import React from 'react';
import GoogleMap from './GoogleMapJs.jsx';

/* i18n */
import { translate } from 'react-i18next';

const Apia = {
  lat: -13.815605,
  lng: -171.780512
};

class HeavyRainPage extends React.Component {

  constructor(props){
    super(props);
    if( this.props.phenomena && this.validatePhenomena()){
      this.heavyRain = this.props.phenomena;
    }
    else{
      // For test
      this.heavyRain = {
        "type": "heavyRain",
        "area": [
          {lat: -13.956028, lng: -171.724296},
          {lat: -14.026653, lng: -171.422172},
          {lat: -13.856050, lng: -171.695457}
        ],
        "level": "warning"
      };
    }
  }

  validatePhenomena(){
    const phenomena = this.props.phenomena;
    if( !phenomena.area ){
      console.error("area is not defined");
      return false;
    }
    if( !phenomena.level ){
      console.error("level is not defined");
      return false;
    }
    return true;
  }

  render(){
    if( this.heavyRain ){
      if( this.heavyRain.area ){
        return(
          <GoogleMap mapCenter={Apia} zoom={3} onReady={(map) => {this.handleOnReady(map)}}/>
        );
      }
      else{
        console.error("epicenter is not defined!!!!!");
      }
    }

    return(
      <GoogleMap mapCenter={Apia} zoom={3} />
    );
  }

  handleOnReady(map) {
    this.drawWarningArea(map);
  }

  getWarningColor() {
    return '#FFFF00';
  }

  drawWarningArea(map){

    map.addPolygon(this.heavyRain.area, this.getWarningColor());
  }
}

export default translate(['common'])(HeavyRainPage);
