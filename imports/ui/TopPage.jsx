import React from 'react';
import WarningListContainer from './WarningList.jsx';
//import {WeatherPage, WeatherMenuTile} from './Weather.jsx';
import WeatherPageContainer from './Weather.jsx';

const TopPage = (props)=> {
  return (
    <div>
      <WarningListContainer {...props} compact={true} />
      <WeatherPageContainer {...props} compact={true} />
    </div>

  )
};

export default TopPage;
