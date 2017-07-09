import {Meteor} from 'meteor/meteor';
import ReceptionTracker from '../receptionTracker.js';
import PushClient from './pushclient.js';

/*

Push Client receives push message from the server.
Currently it relies on the Google Firebase Messaging and uses the cordova-plugin-firebase.

*/
export default class PushClientOneSignalWebPush extends PushClient {

  init(callback){

    var OneSignal = window.OneSignal || [];
    OneSignal.push(["init", {
      appId: Meteor.settings.public.oneSignalAppId,
      autoRegister: false, /* Set to true to automatically prompt visitors */
      httpPermissionRequest: {
        modalTitle: 'Thanks for subscribing',
        modalMessage: "You're now subscribed for notifications from Samoa MET. You can unsubscribe at any time.",
        modalButtonText: 'Close',
        enable: true
      },
      notifyButton: {
        enable: true /* Set to false to hide */
      }
    }]);

    this.callback = callback;
  }

  subscribe(topic, value){
    value = value != undefined ? value : "true";
    const OneSignal = window.OneSignal || [];
    OneSignal.push(["sendTag", topic, value])
  }

  unsubscribe(topic){
    const OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
      OneSignal.deleteTag(topic);
    });
  }

  handleNotification(notificationResult){
    const notification = notificationResult.notification;
    const payload = notification.payload;
    const data = payload.additionalData;

    console.log("received Notification additional data = "+JSON.stringify(data));

    this.callback(data);
  }
}
