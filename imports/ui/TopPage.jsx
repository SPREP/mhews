import React from 'react';
import WarningListContainer from './WarningList.jsx';
//import {WeatherPage, WeatherMenuTile} from './Weather.jsx';
import WeatherPageContainer from './Weather.jsx';
import Subheader from 'material-ui/Subheader';

const TopPage = (props)=> {
  return (
    <div>
      <Subheader>Warnings</Subheader>
      <WarningListContainer {...props} compact={true} />
      <Subheader>Weather forecast</Subheader>
      <WeatherPageContainer {...props} compact={true} />
    </div>

  )
};

export default TopPage;
