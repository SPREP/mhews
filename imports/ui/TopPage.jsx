import React from 'react';
import WarningListContainer from './WarningList.jsx';
import WeatherPageContainer from './WeatherPage.jsx';

const TopPage = (props)=> {
  return (
    <div>
      <WarningListContainer {...props} compact={true} />
      <WeatherPageContainer {...props} compact={true} />
    </div>

  )
};

export default TopPage;
