import {Meteor} from 'meteor/meteor';
import ReceptionTracker from '../receptionTracker.js';
import PushClient from './pushclient.js';

/*

Push Client receives push message from the server.
Currently it relies on the Google Firebase Messaging and uses the cordova-plugin-firebase.

*/
export default class PushClientOneSignalWebPush extends PushClient {

  init(_callback){

    console.log("oneSignalAppId = "+Meteor.settings.public.oneSignalAppId);

    getScript("https://cdn.onesignal.com/sdks/OneSignalSDK.js", function(){
      var OneSignal = window.OneSignal || [];
      OneSignal.push(["init", {
        appId: Meteor.settings.public.oneSignalAppId,
        autoRegister: false, /* Set to true to automatically prompt visitors */
        httpPermissionRequest: {
          modalTitle: 'Thanks for subscribing',
          modalMessage: "You're now subscribed for notifications from Samoa MET. You can unsubscribe at any time.",
          modalButtonText: 'Close',
          enable: true,
        },
        promptOptions: {
          siteName: 'Samoa Meteorology Division',
          exampleNotificationTitle: 'Notification from Samoa MET',
          exampleNotificationMessage: 'Hazard information and warnings',
        },
        notifyButton: {
          enable: true /* Set to false to hide */
        }

      }])
    })
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
}

function getScript(url, onload){
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.async = true;
  script.onload = onload;
  document.getElementsByTagName('head')[0].appendChild(script);
}
