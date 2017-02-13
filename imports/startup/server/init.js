import { Meteor } from 'meteor/meteor';

import WarningServer from '../../api/server/warnings.js';
import CycloneBulletinsServer from '../../api/server/bulletin.js';
import WeatherServer from '../../api/server/weather.js';
import TideTableServer from '../../api/server/tidetable.js';
import PushServer from '../../api/server/pushserver.js';
import ReceptionTrackerServer from '../../api/server/receptionTracker.js';

Meteor.startup(() => {

  // TODO Move this to the Admin app to prevent access from the Internet.
  exposeRemoteMethods();

  CycloneBulletinsServer.start();
  WarningServer.start();
  WeatherServer.start();
  TideTableServer.start();
  ReceptionTrackerServer.start();
  PushServer.start();
});

function exposeRemoteMethods(){

  Meteor.methods({
    publishWeatherForecast: WeatherServer.publish,
    publishWarning: WarningServer.publishWarning,
    cancelWarning: WarningServer.cancelWarning,
    publishBulletin: CycloneBulletinsServer.publishBulletin,
    cancelBulletin: CycloneBulletinsServer.cancelBulletin
  });
}
