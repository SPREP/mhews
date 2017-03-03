import { Meteor } from 'meteor/meteor';

import WarningServer from '../../api/server/warnings.js';
import CycloneBulletinsServer from '../../api/server/bulletin.js';
import WeatherServer from '../../api/server/weather.js';
import TideTableServer from '../../api/server/tidetable.js';
import PushServer from '../../api/server/pushserver.js';
import ReceptionTrackerServer from '../../api/server/receptionTracker.js';
import ServerUtils from '../../api/server/serverutils.js';

/* i18n */
import i18nConfig from '../../api/i18n.js';
import i18n from 'i18next';

Meteor.startup(() => {

  exposeRemoteMethods();

  i18n.init(i18nConfig);

  CycloneBulletinsServer.start();
  WarningServer.start();
  WeatherServer.start();
  TideTableServer.start();
  ReceptionTrackerServer.start();
  PushServer.start();
});

function exposeRemoteMethods(){

  Meteor.methods({
    publishWeatherForecast: adminAccess(WeatherServer.publish),
    updateWeatherForecast: adminAccess(WeatherServer.updateForecast),
    publishWarning: adminAccess(WarningServer.publishWarning),
    cancelWarning: adminAccess(WarningServer.cancelWarning),
    publishBulletin: adminAccess(CycloneBulletinsServer.publishBulletin),
    cancelBulletin: adminAccess(CycloneBulletinsServer.cancelBulletin)
  });
}

function adminAccess(func){
  // Don't use the arrow syntax here. Reference to the this.connection will be lost.
  return function(...args){
    if( !ServerUtils.isClientIpAllowed(this.connection)){
      console.error("Access by "+this.connection.clientAddress+" was rejected.");
      throw Error("Request refused. See the server log.");
    }
    func(...args)
  };
}
