import { Meteor } from 'meteor/meteor';

import WarningServer from '../../api/server/warnings.js';
import CycloneBulletinsServer from '../../api/server/bulletin.js';
import WeatherServer from '../../api/server/weather.js';
import TideTableServer from '../../api/server/tidetable.js';
import PushServer from '../../api/server/pushserver.js';
import ReceptionTrackerServer from '../../api/server/receptionTracker.js';

/* i18n */
import i18nConfig from '../../api/i18n.js';
import i18n from 'i18next';

Meteor.startup(() => {

  if( Meteor.settings.public.withAdminDashboard ){
    exposeRemoteMethods();
  }

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
    publishWeatherForecast: WeatherServer.publish,
    publishWarning: WarningServer.publishWarning,
    cancelWarning: WarningServer.cancelWarning,
    publishBulletin: CycloneBulletinsServer.publishBulletin,
    cancelBulletin: CycloneBulletinsServer.cancelBulletin
  });
}
