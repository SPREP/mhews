import {Meteor} from 'meteor/meteor';
import PushClient from './pushclient.js';

/*

Push Client receives push message from the server.
Currently it relies on the Google Firebase Messaging and uses the cordova-plugin-firebase.

*/
export default class PushClientOneSignalPlugin extends PushClient {

  init(callback){
    const appId = Meteor.settings.public.oneSignalAppId;

    window.plugins.OneSignal
    .startInit(appId)
    .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
    .handleNotificationReceived(callback)
    .handleNotificationOpened(callback)
    .endInit();

    window.plugins.OneSignal.getIds(function(ids) {
      console.log('getIds: ' + JSON.stringify(ids));
    });
  }

  subscribe(topic, value){
    value = value != undefined ? value : "true";
    window.plugins.OneSignal.sendTag(topic, value);
  }

  unsubscribe(topic){
    window.plugins.OneSignal.deleteTag(topic);
  }

}
