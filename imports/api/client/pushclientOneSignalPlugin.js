import {Meteor} from 'meteor/meteor';
import ReceptionTracker from '../receptionTracker.js';
import PushClient from './pushclient.js';

/*

Push Client receives push message from the server.
Currently it relies on the Google Firebase Messaging and uses the cordova-plugin-firebase.

*/
export default class PushClientOneSignalPlugin extends PushClient {

  init(callback){
    const appId = Meteor.settings.public.oneSignalAppId;
    this.callback = callback;
    this.handleNotification = this.handleNotification.bind(this);

    window.plugins.OneSignal
    .startInit(appId)
    .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
//    .handleNotificationReceived(this.handleNotification)
    .handleNotificationOpened(this.handleNotification)
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

  handleNotification(notificationResult){
    const notification = notificationResult.notification;
    const payload = notification.payload;
    const data = payload.additionalData;

    console.log("received Notification additional data = "+JSON.stringify(data));

    this.callback(data);
  }
}
